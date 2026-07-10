import crypto from 'crypto';
import { ESEWA_CONFIG } from '../config/esewa.js';

export function generateSignature(totalAmount, transactionUuid, productCode) {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto.createHmac('sha256', ESEWA_CONFIG.secretKey).update(message).digest('base64');
}

export function buildEsewaFormFields({ amount, transactionUuid, successUrl, failureUrl }) {
  const totalAmount = amount;
  const signature = generateSignature(totalAmount, transactionUuid, ESEWA_CONFIG.productCode);

  return {
    amount,
    tax_amount: 0,
    total_amount: totalAmount,
    transaction_uuid: transactionUuid,
    product_code: ESEWA_CONFIG.productCode,
    product_service_charge: 0,
    product_delivery_charge: 0,
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
    signature,
  };
}

export async function verifyEsewaTransaction({ productCode, totalAmount, transactionUuid }) {
  const url = `${ESEWA_CONFIG.statusUrl}?product_code=${encodeURIComponent(productCode)}&total_amount=${encodeURIComponent(totalAmount)}&transaction_uuid=${encodeURIComponent(transactionUuid)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`eSewa status check failed: ${res.status}`);
  return res.json();
}
