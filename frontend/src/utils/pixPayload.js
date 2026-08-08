// Builds a standard PIX "Copia e Cola" payload (EMV / BR Code format) so the
// QR code shown at checkout is a real, scannable PIX charge with the store's
// key and the exact order amount already filled in - not just a picture of
// the key. Any banking app can scan this like a normal PIX QR code.
//
// Reference: Banco Central do Brasil - Manual de Padrões para Iniciação do PIX.

function tlv(id, value) {
  const length = String(value.length).padStart(2, '0');
  return `${id}${length}${value}`;
}

// Strips everything the BR Code spec doesn't allow / keeps fields within
// their max length, so a long store name or city never breaks the payload.
function sanitize(text, maxLength) {
  const clean = (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim();
  return (clean || 'NA').slice(0, maxLength).toUpperCase();
}

// CRC16-CCITT (polynomial 0x1021, initial value 0xFFFF) - required as the
// final field of every PIX payload.
function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * @param {object} opts
 * @param {string} opts.pixKey - the store's PIX key (CPF/CNPJ/e-mail/telefone/aleatória)
 * @param {string} opts.merchantName - store name (max 25 chars, no accents)
 * @param {string} opts.merchantCity - store city (max 15 chars, no accents)
 * @param {number} opts.amount - order total, e.g. 129.9
 * @param {string} opts.txid - short reference id (e.g. the order number), alphanumeric only
 * @returns {string} the full "Pix Copia e Cola" payload string
 */
function buildPixPayload({ pixKey, merchantName, merchantCity, amount, txid }) {
  const merchantAccountInfo = tlv('00', 'br.gov.bcb.pix') + tlv('01', pixKey);
  const txidClean = (txid || '***').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***';

  const fields = [
    tlv('00', '01'), // Payload Format Indicator
    tlv('26', merchantAccountInfo), // Merchant Account Information (PIX)
    tlv('52', '0000'), // Merchant Category Code
    tlv('53', '986'), // Transaction Currency (BRL)
    tlv('54', amount.toFixed(2)), // Transaction Amount
    tlv('58', 'BR'), // Country Code
    tlv('59', sanitize(merchantName, 25)), // Merchant Name
    tlv('60', sanitize(merchantCity, 15)), // Merchant City
    tlv('62', tlv('05', txidClean)), // Additional Data Field (reference label)
  ].join('');

  const withCrcPlaceholder = `${fields}6304`;
  const crc = crc16(withCrcPlaceholder);
  return `${withCrcPlaceholder}${crc}`;
}

export { buildPixPayload };
