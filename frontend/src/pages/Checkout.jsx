import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api, extractErrorMessage } from '../api/client';
import PixPaymentPanel from '../components/PixPaymentPanel';
import './Checkout.css';

function formatPrice(value) {
  return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Payment always happens in person - on delivery or at pickup - never through
// an online checkout. PIX is paid via the QR code/key shown in person, card
// is charged on the card machine brought along, and cash may need change.
const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX', helper: 'Pague o PIX na hora, com a chave ou QR Code mostrado na entrega/retirada.' },
  { value: 'dinheiro', label: 'Dinheiro', helper: 'Pague em espécie na entrega ou retirada.' },
  { value: 'cartao', label: 'Cartão de Crédito/Débito', helper: 'Quem levar o pedido traz a maquininha (ou pague na loja, na retirada).' },
];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [fulfillmentType, setFulfillmentType] = useState('delivery');
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [needsChange, setNeedsChange] = useState(false);
  const [changeFor, setChangeFor] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pixOrder, setPixOrder] = useState(null);

  useEffect(() => {
    // Skip this redirect once the PIX panel is showing - the cart is
    // intentionally emptied right after the order is placed, but we still
    // want the customer to see the QR Code/timer instead of being bounced
    // back to an (now empty) cart page.
    if (items.length === 0 && !pixOrder) navigate('/carrinho');
  }, [items, navigate, pixOrder]);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        setSettings(res.data.settings);
        setCity(res.data.settings.municipality_city);
        setState(res.data.settings.municipality_state);
      })
      .catch(() => {});
  }, []);

  const deliveryFee = fulfillmentType === 'delivery' ? parseFloat(settings?.delivery_fee || 0) : 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim() || !whatsapp.trim()) {
      setError('Preencha seu nome e WhatsApp.');
      return;
    }
    if (fulfillmentType === 'delivery' && (!street.trim() || !number.trim() || !neighborhood.trim() || !city.trim() || !state.trim())) {
      setError('Preencha o endereço completo para entrega.');
      return;
    }
    if (paymentMethod === 'dinheiro' && needsChange) {
      const changeValue = parseFloat(changeFor.replace(',', '.'));
      if (!changeFor || Number.isNaN(changeValue) || changeValue <= total) {
        setError('Informe um valor de troco maior que o total do pedido.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          selectedSize: i.selectedSize,
          selectedColor: i.color,
        })),
        fulfillmentType,
        customerName,
        customerPhone: whatsapp,
        paymentMethod,
        changeFor: paymentMethod === 'dinheiro' && needsChange ? parseFloat(changeFor.replace(',', '.')) : null,
        address:
          fulfillmentType === 'delivery'
            ? { street, number, neighborhood, complement, city, state }
            : undefined,
      };

      const res = await api.post('/orders', payload);
      const { order, payment } = res.data;
      clearCart();

      if (payment?.initPoint) {
        window.location.href = payment.initPoint;
      } else if (paymentMethod === 'pix') {
        // Show the QR Code/chave PIX + 5-minute timer before moving on to
        // the order status page, instead of navigating away immediately.
        setPixOrder(order);
      } else {
        navigate(`/pedido/${order.id}`);
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível finalizar o pedido.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (pixOrder) {
    return (
      <div className="silk-bg checkout-page">
        <div className="container">
          <h1 className="page-title">Finalizar Compra</h1>
          <PixPaymentPanel
            order={pixOrder}
            pixKey={settings?.pix_key || ''}
            merchantName={settings?.store_name}
            merchantCity={settings?.municipality_city}
            onConfirm={() => navigate(`/pedido/${pixOrder.id}`)}
          />
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="silk-bg checkout-page">
      <div className="container">
        <h1 className="page-title">Finalizar Compra</h1>
        <p className="helper-text" style={{ marginBottom: 32 }}>
          Revise os itens do pedido e preencha seus dados para concluir
        </p>

        <form className="panel checkout-panel" onSubmit={handleSubmit}>
          <h2 className="section-title align-left">Seu pedido</h2>
          {items.map((item) => (
            <div key={`${item.productId}-${item.selectedSize}`} className="checkout-item">
              <div className="cart-line-image">
                {item.image ? <img src={item.image} alt={item.name} /> : <div className="product-card-placeholder">—</div>}
              </div>
              <div className="cart-line-info">
                <div className="cart-line-name">{item.name}</div>
                {item.variantDescription && <div className="helper-text">{item.variantDescription}</div>}
                <div className="helper-text">
                  {item.selectedSize && <>Tamanho: {item.selectedSize} </>}
                  {item.color && <>· Cor: {item.color}</>}
                </div>
              </div>
              <div className="cart-line-price">{formatPrice(item.price)}</div>
              <div className="helper-text checkout-item-qty">Qtd: {item.quantity}</div>
            </div>
          ))}

          <div className="checkout-totals">
            <div>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {fulfillmentType === 'delivery' && (
              <div>
                <span>Entrega</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
            )}
            <div className="checkout-total-final">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <h2 className="section-title align-left">Entrega ou retirada</h2>
          <label className={`option-card ${fulfillmentType === 'delivery' ? 'selected' : ''}`}>
            <div>
              <strong>Entrega no meu endereço</strong>
              <div className="helper-text">
                Entregamos apenas em {settings?.municipality_city || '...'} - {settings?.municipality_state || ''}
              </div>
            </div>
            <input
              type="radio"
              name="fulfillment"
              checked={fulfillmentType === 'delivery'}
              onChange={() => setFulfillmentType('delivery')}
            />
          </label>
          <label className={`option-card ${fulfillmentType === 'pickup' ? 'selected' : ''}`}>
            <div>
              <strong>Retirar na loja</strong>
              <div className="helper-text">Sem taxa de entrega</div>
            </div>
            <input
              type="radio"
              name="fulfillment"
              checked={fulfillmentType === 'pickup'}
              onChange={() => setFulfillmentType('pickup')}
            />
          </label>

          <h2 className="section-title align-left">Dados pessoais</h2>
          <div className="field">
            <label>Nome completo</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Digite seu nome" />
          </div>
          <div className="field">
            <label>WhatsApp</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(88) 99999-9999" />
          </div>

          {fulfillmentType === 'delivery' && (
            <>
              <div className="field">
                <label>Endereço</label>
                <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Rua" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Bairro</label>
                  <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro" />
                </div>
                <div className="field">
                  <label>N°</label>
                  <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="N°" />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Cidade</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="field">
                  <label>Estado</label>
                  <input value={state} onChange={(e) => setState(e.target.value.toUpperCase())} maxLength={2} />
                </div>
              </div>
              <div className="field">
                <label>Complemento/Ponto de referência</label>
                <input value={complement} onChange={(e) => setComplement(e.target.value)} />
              </div>
            </>
          )}

          <h2 className="section-title align-left">Pagamento</h2>
          <p className="helper-text" style={{ marginTop: -8, marginBottom: 14 }}>
            O pagamento é sempre presencial, {fulfillmentType === 'delivery' ? 'feito na entrega' : 'feito na retirada na loja'}.
          </p>
          {PAYMENT_METHODS.map((pm) => (
            <label key={pm.value} className={`option-card ${paymentMethod === pm.value ? 'selected' : ''}`}>
              <div>
                <strong>{pm.label}</strong>
                <div className="helper-text">{pm.helper}</div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === pm.value}
                onChange={() => {
                  setPaymentMethod(pm.value);
                  if (pm.value !== 'dinheiro') {
                    setNeedsChange(false);
                    setChangeFor('');
                  }
                }}
              />
            </label>
          ))}

          {paymentMethod === 'dinheiro' && (
            <div className="change-panel">
              <label className="change-toggle">
                <input
                  type="checkbox"
                  checked={needsChange}
                  onChange={(e) => {
                    setNeedsChange(e.target.checked);
                    if (!e.target.checked) setChangeFor('');
                  }}
                />
                Precisa de troco?
              </label>
              {needsChange && (
                <div className="field" style={{ marginTop: 10 }}>
                  <label>Troco para quanto?</label>
                  <input
                    inputMode="decimal"
                    value={changeFor}
                    onChange={(e) => setChangeFor(e.target.value)}
                    placeholder={`Ex: ${formatPrice(Math.ceil(total / 10) * 10)}`}
                  />
                </div>
              )}
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <button className="btn btn-gold" type="submit" disabled={submitting} style={{ width: '100%', marginTop: 12 }}>
            {submitting ? <span className="spinner" /> : 'Finalizar pedido'}
          </button>
          <p className="helper-text text-center" style={{ marginTop: 12 }}>
            Ao finalizar, você concorda com nossos Termos de Uso e{' '}
            <Link to="/politica-de-privacidade" target="_blank" rel="noreferrer">
              Política de Privacidade
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
