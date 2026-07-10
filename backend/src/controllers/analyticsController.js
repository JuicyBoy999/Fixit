import pool from '../config/db.js';

const CUSTOMER_ROLE = 'user';

// Fixit doesn't have a separate payments ledger table — payment fields
// (amount, payment_status, transaction_uuid) live directly on repair_requests.
const PLATFORM_FEE_RATE = 0.15;

export const getOverview = async (_req, res) => {
  try {
    const [bookings, users, technicians, revenue, statusBreakdown] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM repair_requests'),
      pool.query('SELECT COUNT(*) AS count FROM users WHERE role = $1', [CUSTOMER_ROLE]),
      pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'technician'"),
      pool.query("SELECT COALESCE(SUM(amount),0) AS total FROM repair_requests WHERE payment_status = 'paid'"),
      pool.query('SELECT status, COUNT(*) AS count FROM repair_requests GROUP BY status'),
    ]);

    res.json({
      total_bookings:    Number(bookings.rows[0].count),
      total_customers:   Number(users.rows[0].count),
      total_technicians: Number(technicians.rows[0].count),
      total_revenue:     Number(revenue.rows[0].total),
      status_breakdown:  statusBreakdown.rows.map(r => ({
        status: r.status,
        count: Number(r.count),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookingsOverTime = async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days) || 30, 365);

    const { rows } = await pool.query(`
      SELECT
        d.day::date AS date,
        COUNT(rr.id) AS count
      FROM generate_series(
        CURRENT_DATE - ($1::int - 1) * INTERVAL '1 day',
        CURRENT_DATE,
        INTERVAL '1 day'
      ) AS d(day)
      LEFT JOIN repair_requests rr
        ON rr.created_at::date = d.day::date
      GROUP BY d.day
      ORDER BY d.day ASC
    `, [days]);

    res.json({
      series: rows.map(r => ({
        date: r.date.toISOString().split('T')[0],
        count: Number(r.count),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserGrowth = async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days) || 30, 365);

    const { rows } = await pool.query(`
      SELECT
        d.day::date AS date,
        COUNT(u.id) AS new_users
      FROM generate_series(
        CURRENT_DATE - ($1::int - 1) * INTERVAL '1 day',
        CURRENT_DATE,
        INTERVAL '1 day'
      ) AS d(day)
      LEFT JOIN users u ON u.created_at::date = d.day::date
      GROUP BY d.day
      ORDER BY d.day ASC
    `, [days]);

    let running = 0;
    const series = rows.map(r => {
      running += Number(r.new_users);
      return {
        date: r.date.toISOString().split('T')[0],
        new_users: Number(r.new_users),
        total_users: running,
      };
    });

    res.json({ series });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const revenueQuery = `
  SELECT
    rr.id,
    rr.transaction_uuid,
    rr.amount,
    rr.created_at,
    u.first_name AS tech_first,
    u.last_name  AS tech_last
  FROM repair_requests rr
  LEFT JOIN users u ON u.id = rr.technician_id
  WHERE rr.payment_status = 'paid'
    AND rr.created_at >= $1 AND rr.created_at < ($2::date + INTERVAL '1 day')
  ORDER BY rr.created_at DESC
`;

function parseRange(req) {
  const to = req.query.to || new Date().toISOString().split('T')[0];
  const from = req.query.from ||
    new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  return [from, to];
}

function withPayout(row) {
  const gross = Number(row.amount);
  const platformFee = gross * PLATFORM_FEE_RATE;
  return {
    id: row.id,
    transaction_code: row.transaction_uuid || `RR-${row.id}`,
    technician: [row.tech_first, row.tech_last].filter(Boolean).join(' ') || 'Unassigned',
    gross_amount: gross,
    platform_fee: platformFee,
    technician_payout: gross - platformFee,
    payout_status: 'paid',
    paid_at: row.created_at,
  };
}

export const getRevenueReport = async (req, res) => {
  try {
    const [from, to] = parseRange(req);
    const { rows } = await pool.query(revenueQuery, [from, to]);
    const payments = rows.map(withPayout);

    const totals = payments.reduce((acc, p) => ({
      gross:  acc.gross  + p.gross_amount,
      fee:    acc.fee    + p.platform_fee,
      payout: acc.payout + p.technician_payout,
    }), { gross: 0, fee: 0, payout: 0 });

    res.json({
      from, to,
      totals: {
        gross_revenue:      Number(totals.gross.toFixed(2)),
        platform_fee:       Number(totals.fee.toFixed(2)),
        technician_payouts: Number(totals.payout.toFixed(2)),
      },
      payments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const exportRevenueCsv = async (req, res) => {
  try {
    const [from, to] = parseRange(req);
    const { rows } = await pool.query(revenueQuery, [from, to]);
    const payments = rows.map(withPayout);

    const escape = (val) => {
      const s = String(val ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const header = 'Transaction,Technician,Gross,Platform Fee,Technician Payout,Payout Status,Paid At';
    const lines = payments.map(p => [
      p.transaction_code,
      p.technician,
      p.gross_amount,
      p.platform_fee,
      p.technician_payout,
      p.payout_status,
      p.paid_at?.toISOString?.() || p.paid_at,
    ].map(escape).join(','));

    const csv = [header, ...lines].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="revenue-${from}-to-${to}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
