import crypto from 'crypto';

const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
const ESEWA_SECRET_KEY   = process.env.ESEWA_SECRET_KEY   || '8gBm/:&EnhH.1/q';
const ESEWA_FORM_URL     = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

function generateSignature(total_amount, transaction_uuid, product_code) {
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  return crypto
    .createHmac('sha256', ESEWA_SECRET_KEY)
    .update(message)
    .digest('base64');
}

export const initiateEsewaPayment = (req, res) => {
  try {
    const { amount, transaction_uuid } = req.body;

    if (!amount || !transaction_uuid) {
      return res.status(400).json({ error: 'amount and transaction_uuid are required' });
    }

    const total_amount = String(amount);
    const product_code = ESEWA_PRODUCT_CODE;
    const signature = generateSignature(total_amount, transaction_uuid, product_code);

    res.json({
      action: ESEWA_FORM_URL,
      fields: {
        amount: total_amount,
        tax_amount: '0',
        total_amount,
        transaction_uuid,
        product_code,
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`,
        failure_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failure`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyEsewaPayment = (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Missing payment data' });

    const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));

    const message = `transaction_code=${decoded.transaction_code},status=${decoded.status},total_amount=${decoded.total_amount},transaction_uuid=${decoded.transaction_uuid},product_code=${decoded.product_code},signed_field_names=${decoded.signed_field_names}`;
    const expectedSignature = crypto
      .createHmac('sha256', ESEWA_SECRET_KEY)
      .update(message)
      .digest('base64');

    if (expectedSignature !== decoded.signature) {
      return res.status(400).json({ verified: false, error: 'Signature mismatch' });
    }

    if (decoded.status !== 'COMPLETE') {
      return res.status(400).json({ verified: false, status: decoded.status });
    }

    res.json({
      verified: true,
      status: decoded.status,
      transaction_code: decoded.transaction_code,
      total_amount: decoded.total_amount,
      transaction_uuid: decoded.transaction_uuid,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};