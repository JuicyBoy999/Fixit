export const ESEWA_CONFIG = {
  productCode: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
  secretKey:   process.env.ESEWA_SECRET_KEY   || '8gBm/:&EnhH.1/q',
  formUrl:     process.env.ESEWA_FORM_URL     || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
  statusUrl:   process.env.ESEWA_STATUS_URL   || 'https://rc.esewa.com.np/api/epay/transaction/status/',
};
