import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, extractErrorMessage } from '../api/client';

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

// Polled so the list reflects status changes the admin makes without the
// customer needing to manually refresh the page.
const POLL_INTERVAL_MS = 15000;

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = () => {
      api
        .get('/orders/mine')
        .then((res) => setOrders(res.data.orders))
        .catch((err) => setError(extractErrorMessage(err)));
    };
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container section-block">
      <h1 className="page-title">Meus Pedidos</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {orders.map((order) => (
        <Link key={order.id} to={`/pedido/${order.id}`} className="panel" style={{ display: 'block', marginBottom: 14 }}>
          <strong>{order.order_number}</strong>
          <div className="helper-text">
            {formatPrice(order.total)} · {STATUS_LABELS[order.status] || order.status}
          </div>
        </Link>
      ))}
      {orders.length === 0 && !error && <p className="helper-text">Você ainda não fez nenhum pedido.</p>}
    </div>
  );
}
