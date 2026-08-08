import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { buildPixPayload } from '../utils/pixPayload';
import './PixPaymentPanel.css';

function formatPrice(value) {
  return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const TOTAL_SECONDS = 5 * 60;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Shown right after an order is placed with PIX as the payment method.
// Generates a real "Pix Copia e Cola" QR code (store key + exact order
// amount already filled in) and runs a 5-minute countdown for the customer
// to complete the payment; if it runs out, shows an error with a retry
// option that simply restarts the timer (the order itself is not cancelled -
// this is just a UX nudge, since payment confirmation is manual/in person).
export default function PixPaymentPanel({ order, pixKey, merchantName, merchantCity, onConfirm }) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [expired, setExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleRetry = () => {
    setExpired(false);
    setSecondsLeft(TOTAL_SECONDS);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const total = parseFloat(order.total);
  const payload = buildPixPayload({
    pixKey,
    merchantName: merchantName || 'Pure Seduction Lux',
    merchantCity: merchantCity || 'Boa Viagem',
    amount: total,
    txid: order.order_number,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable (e.g. insecure context) - the key
      // is still selectable/visible on screen either way.
    }
  };

  return (
    <div className="panel pix-panel">
      <h2 className="section-title align-left">Pagamento via PIX</h2>
      <p className="helper-text" style={{ marginBottom: 18 }}>
        Pedido {order.order_number} · Valor a pagar: <strong>{formatPrice(total)}</strong>
      </p>

      {!expired ? (
        <>
          <div className="pix-qr-wrap">
            <QRCodeSVG value={payload} size={200} includeMargin />
          </div>

          <div className="pix-timer">
            <span className="pix-timer-value">{formatTime(secondsLeft)}</span>
            <span className="pix-timer-label">para concluir o pagamento</span>
          </div>

          <div className="pix-key-row">
            <div>
              <div className="pix-key-label">Chave PIX da loja</div>
              <div className="pix-key-value">{pixKey}</div>
            </div>
            <button type="button" className="btn btn-outline-gold" onClick={handleCopy}>
              {copied ? 'Copiado!' : 'Copiar chave'}
            </button>
          </div>

          <p className="helper-text" style={{ marginTop: 14 }}>
            Escaneie o QR Code com o app do seu banco (ele já vem com o valor preenchido) ou copie a
            chave acima e pague manualmente.
          </p>

          <button className="btn btn-gold" style={{ width: '100%', marginTop: 16 }} onClick={onConfirm}>
            Já efetuei o pagamento
          </button>
        </>
      ) : (
        <div className="pix-expired">
          <div className="alert alert-error">
            Tempo esgotado para o pagamento. O pagamento não foi identificado dentro do prazo de 5
            minutos.
          </div>
          <button className="btn btn-gold" style={{ width: '100%', marginTop: 12 }} onClick={handleRetry}>
            Tentar novamente
          </button>
          <button className="btn btn-outline-gold" style={{ width: '100%', marginTop: 10 }} onClick={onConfirm}>
            Já efetuei o pagamento
          </button>
        </div>
      )}
    </div>
  );
}
