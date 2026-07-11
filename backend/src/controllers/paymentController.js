import pool from '../config/db.js';
import { addNotification } from '../models/notificationModel.js';
import { ESEWA_CONFIG } from '../config/esewa.js';
import { buildEsewaFormFields, verifyEsewaTransaction, generateSignature } from '../services/esewaService.js';
import { notifyTechniciansOfNewRequest } from './repairRequestController.js';
import { sendPaymentConfirmationEmail } from '../services/notificationService.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL  = process.env.BACKEND_URL  || 'http://localhost:5000';

export const initiateEsewaPayment = async (req, res) => {
  try {
    const { repairRequestId, amount } = req.body;
    const numericAmount = Number(amount);

    if (!repairRequestId || !numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'repairRequestId and a positive amount are required' });
    }

    const { rows } = await pool.query('SELECT id FROM repair_requests WHERE id = $1', [repairRequestId]);
    if (!rows.length) return res.status(404).json({ error: 'Repair request not found' });

    const transactionUuid = `RRQ-${repairRequestId}-${Date.now()}`;

    await pool.query(
      `UPDATE repair_requests SET amount = $1, transaction_uuid = $2, payment_status = 'pending' WHERE id = $3`,
      [numericAmount, transactionUuid, repairRequestId]
    );

    const fields = buildEsewaFormFields({
      amount: numericAmount,
      transactionUuid,
      successUrl: `${BACKEND_URL}/api/payments/esewa/success`,
      failureUrl: `${BACKEND_URL}/api/payments/esewa/failure`,
    });

    res.json({ formUrl: ESEWA_CONFIG.formUrl, fields });
  } catch (err) {
    console.error('[ESEWA INITIATE] error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const handleEsewaSuccess = async (req, res) => {
  try {
    const dataB64 = req.query.data;
    if (!dataB64) return res.redirect(`${FRONTEND_URL}/payment/failure`);

    const decoded = JSON.parse(Buffer.from(dataB64, 'base64').toString('utf-8'));
    const { status, total_amount, transaction_uuid, product_code, signature } = decoded;

    const expectedSignature = generateSignature(total_amount, transaction_uuid, product_code);
    if (expectedSignature !== signature || status !== 'COMPLETE') {
      console.error('[ESEWA SUCCESS] signature mismatch or non-complete status:', status);
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    const statusCheck = await verifyEsewaTransaction({ productCode: product_code, totalAmount: total_amount, transactionUuid: transaction_uuid });
    if (statusCheck.status !== 'COMPLETE') {
      console.error('[ESEWA SUCCESS] status check did not confirm COMPLETE:', statusCheck.status);
      return res.redirect(`${FRONTEND_URL}/payment/failure`);
    }

    const { rows } = await pool.query(
      `UPDATE repair_requests SET payment_status = 'paid' WHERE transaction_uuid = $1 RETURNING *`,
      [transaction_uuid]
    );
    const booking = rows[0];
    if (!booking) return res.redirect(`${FRONTEND_URL}/payment/failure`);

    if (booking.customer_id) {
      await addNotification(
        booking.customer_id,
        'Payment received',
        `Your payment for the ${booking.device_type} repair has been confirmed. A technician will be in touch shortly.`,
        'info'
      );

      try {
        const { rows: customerRows } = await pool.query('SELECT email, first_name FROM users WHERE id = $1', [booking.customer_id]);
        const customer = customerRows[0];
        if (customer?.email) {
          sendPaymentConfirmationEmail(customer.email, customer.first_name, {
            id: booking.id,
            device_name: booking.device_type,
            cost: Number(booking.amount) || 0,
          }).catch(() => {});
        }
      } catch { /* email is best-effort */ }
    }
    if (!booking.technician_id) {
      await notifyTechniciansOfNewRequest(booking);
    }

    res.redirect(`${FRONTEND_URL}/payment/success?bookingId=${booking.id}`);
  } catch (err) {
    console.error('[ESEWA SUCCESS] error:', err.message);
    res.redirect(`${FRONTEND_URL}/payment/failure`);
  }
};

export const handleEsewaFailure = async (req, res) => {
  try {
    const dataB64 = req.query.data;
    if (dataB64) {
      const decoded = JSON.parse(Buffer.from(dataB64, 'base64').toString('utf-8'));
      if (decoded.transaction_uuid) {
        await pool.query(
          `UPDATE repair_requests SET payment_status = 'failed' WHERE transaction_uuid = $1`,
          [decoded.transaction_uuid]
        );
      }
    }
  } catch (err) {
    console.error('[ESEWA FAILURE] error:', err.message);
  }
  res.redirect(`${FRONTEND_URL}/payment/failure`);
};
