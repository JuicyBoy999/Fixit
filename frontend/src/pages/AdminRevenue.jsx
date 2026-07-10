import { useCallback, useEffect, useState } from 'react';
import AdminShell, { AdminEmpty, AdminIcon, AdminNotice } from '../components/admin/AdminShell';
import { adminFetch, downloadAdminCsv } from '../components/admin/adminApi';

const isoDate = value => value.toISOString().split('T')[0];
const money = value => `NPR ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const TODAY = isoDate(new Date());
const DEFAULT_FROM = isoDate(new Date(new Date().getTime() - 30 * 86400000));

export default function AdminRevenue() {
  const [from, setFrom] = useState(DEFAULT_FROM);
  const [to, setTo] = useState(TODAY);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setReport(await adminFetch(`/api/analytics/revenue?from=${from}&to=${to}`));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    const initial = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(initial);
  }, [load]);

  const totals = report?.totals || {};
  const payments = report?.payments || [];

  return (
    <AdminShell
      eyebrow="Financial operations"
      title="Revenue report"
      description="Trace money from customer payment to platform fee and technician payout. Every export respects the selected reporting period."
      actions={<button className="adm-btn adm-btn-primary" disabled={!payments.length} onClick={() => downloadAdminCsv(`/api/analytics/revenue/export?from=${from}&to=${to}`, `revenue-${from}-to-${to}.csv`)}><AdminIcon name="download" />Export CSV</button>}
    >
      {error && <AdminNotice>{error}</AdminNotice>}

      <section className="adm-card" style={{ marginBottom: 18 }}>
        <div className="adm-toolbar">
          <div className="adm-date-filters">
            <div className="adm-field"><label htmlFor="revenue-from">From</label><input id="revenue-from" className="adm-input" type="date" value={from} max={to} onChange={event => setFrom(event.target.value)} /></div>
            <div className="adm-field"><label htmlFor="revenue-to">To</label><input id="revenue-to" className="adm-input" type="date" value={to} min={from} max={TODAY} onChange={event => setTo(event.target.value)} /></div>
            <button className="adm-btn adm-btn-secondary" onClick={load}><AdminIcon name="refresh" />Run report</button>
          </div>
          <span className="adm-muted" style={{ marginLeft: 'auto' }}>{payments.length} payment records</span>
        </div>
      </section>

      <section className="adm-stats">
        <RevenueStat label="Gross revenue" value={money(totals.gross_revenue)} note="Total customer payments" />
        <RevenueStat label="Platform fee" value={money(totals.platform_fee)} note="Fixit marketplace share" />
        <RevenueStat label="Technician payouts" value={money(totals.technician_payouts)} note="Net payable to technicians" />
        <RevenueStat label="Effective fee" value={`${totals.gross_revenue ? ((totals.platform_fee / totals.gross_revenue) * 100).toFixed(1) : '0.0'}%`} note="Fee as a share of gross" />
      </section>

      <section className="adm-card">
        <div className="adm-card-head"><div><h2>Payment ledger</h2><p>Auditable transaction-level breakdown</p></div><span className="adm-badge adm-badge-active">{from} — {to}</span></div>
        {loading ? <div className="adm-loading">Building revenue report…</div> : payments.length === 0 ? (
          <AdminEmpty title="No payments in this period" description="Choose a wider date range or return after completed payments are recorded." />
        ) : (
          <div className="adm-table-wrap"><table className="adm-table">
            <thead><tr><th>Transaction</th><th>Technician</th><th>Paid</th><th>Gross</th><th>Platform fee</th><th>Technician payout</th><th>Status</th></tr></thead>
            <tbody>{payments.map(payment => <tr key={payment.id}>
              <td><span className="adm-cell-title">{payment.transaction_code || `Payment #${payment.id}`}</span><span className="adm-cell-sub">Internal ID {payment.id}</span></td>
              <td>{payment.technician}</td>
              <td>{new Date(payment.paid_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
              <td>{money(payment.gross_amount)}</td>
              <td>{money(payment.platform_fee)}</td>
              <td><strong>{money(payment.technician_payout)}</strong></td>
              <td><span className={`adm-badge adm-badge-${payment.payout_status === 'paid' ? 'active' : 'pending'}`}>{payment.payout_status}</span></td>
            </tr>)}</tbody>
          </table></div>
        )}
      </section>
    </AdminShell>
  );
}

function RevenueStat({ label, value, note }) {
  return <div className="adm-stat"><div className="adm-stat-top"><span>{label}</span><span className="adm-stat-icon"><AdminIcon name="chart" /></span></div><strong style={{ fontSize: 22 }}>{value}</strong><small>{note}</small></div>;
}
