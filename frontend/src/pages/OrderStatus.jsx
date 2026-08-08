import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, extractErrorMessage } from '../api/client';
import './OrderStatus.css';

function formatPrice(value) {
  return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const STATUS_LABELS = {
  pending_payment: 'Aguardando pagamento',
  paid: 'Pagamento aprovado',
  preparing: 'Em preparação',
  ready_for_pickup: 'Pronto para retirada',
  out_for_delivery: 'Saiu para entrega',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

// The steps a normal order goes through, used to draw a simple progress
// tracker so the customer can see at a glance where their order is - this
// updates whenever the admin moves the order forward.
const PROGRESS_STEPS = ['preparing', 'ready_for_pickup_or_out_for_delivery', 'completed'];

function progressStepIndex(status) {
  if (status === 'preparing' || status === 'paid' || status === 'pending_payment') return 0;
  if (status === 'ready_for_pickup' || status === 'out_for_delivery') return 1;
  if (status === 'completed') return 2;
  return -1; // cancelled or unknown - no progress bar
}

// Polling keeps this page live: if the customer leaves it open after the
// admin marks the order as "saiu para entrega" or "concluído", they'll see
// it update on its own within a few seconds, no refresh needed.
const POLL_INTERVAL_MS = 10000;

export default function OrderStatus() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    const load = () => {
      api
        .get(`/orders/${id}`)
        .then((res) => setOrder(res.data.order))
        .catch((err) => setError(extractErrorMessage(err, 'Pedido não encontrado.')));
    };
    load();
    pollRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [id]);

  const paymentStatusHint = searchParams.get('status');

  if (error) {
    return (
      <div className="container section-block">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="container text-center" style={{ padding: 80 }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className="container section-block order-status">
      <h1 className="page-title">Pedido {order.order_number}</h1>

      {paymentStatusHint === 'failure' && (
        <div className="alert alert-error">O pagamento não foi concluído. Você pode tentar novamente.</div>
      )}
      {paymentStatusHint === 'pending' && (
        <div className="alert alert-success">Estamos aguardando a confirmação do seu pagamento.</div>
      )}

      <div className="panel">
        <div className="order-status-badge">{STATUS_LABELS[order.status] || order.status}</div>

        {progressStepIndex(order.status) >= 0 && (
          <div className="order-progress">
            {['Em preparação', order.fulfillment_type === 'delivery' ? 'Saiu para entrega' : 'Pronto para retirada', 'Concluído'].map(
              (label, i) => (
                <div key={label} className={`order-progress-step ${i <= progressStepIndex(order.status) ? 'done' : ''}`}>
                  <span className="order-progress-dot" />
                  <span className="order-progress-label">{label}</span>
                </div>
              )
            )}
          </div>
        )}

        <p className="helper-text">
          {order.fulfillment_type === 'delivery' ? 'Entrega' : 'Retirada na loja'} · Pagamento:{' '}
          {order.payment_method === 'pix' ? 'PIX' : order.payment_method === 'cartao' ? 'Cartão' : 'Dinheiro'}
          {order.payment_method === 'dinheiro' &&
            (order.change_for ? ` (troco para ${formatPrice(order.change_for)})` : ' (sem troco)')}
        </p>

        {order.items.map((item) => (
          <div key={item.id} className="order-status-item">
            <span>
              {item.quantity}x {item.product_name_snapshot}
              {item.selected_size ? ` (${item.selected_size})` : ''}
            </span>
            <span>{formatPrice(item.line_total)}</span>
          </div>
        ))}

        <div className="checkout-totals">
          <div>
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div>
            <span>Entrega</span>
            <span>{formatPrice(order.delivery_fee)}</span>
          </div>
          <div className="checkout-total-final">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <p className="helper-text text-center" style={{ marginTop: 20 }}>
        Salve esta página nos favoritos para acompanhar as atualizações do seu pedido.
      </p>

      <div className="text-center" style={{ marginTop: 12 }}>
        <Link to="/loja" className="btn btn-outline-gold">
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}
