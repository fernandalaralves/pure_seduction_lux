import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, extractErrorMessage } from '../../api/client';
import './admin.css';

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

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('todos');
  const [fulfillmentType, setFulfillmentType] = useState('todos');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi
      .get('/orders', { params: { search, status, fulfillmentType } })
      .then((res) => setOrders(res.data.orders))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, fulfillmentType]);

  const updateStatus = async (order, newStatus) => {
    try {
      await adminApi.patch(`/orders/${order.id}/status`, { status: newStatus });
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Pedidos</h1>
          <p>Acompanhe os pedidos feitos pelos clientes</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Buscar por número, nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select value={fulfillmentType} onChange={(e) => setFulfillmentType(e.target.value)}>
          <option value="todos">Entrega e retirada</option>
          <option value="delivery">Somente entrega</option>
          <option value="pickup">Somente retirada</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="text-center" style={{ padding: 60 }}>
          <span className="spinner" />
        </div>
      ) : (
        <>
          {orders.map((order) => (
            <div key={order.id} className="admin-order-row">
              <div className="admin-order-row-header">
                <div>
                  <div className="admin-order-number">{order.order_number}</div>
                  <div className="admin-product-meta">
                    {order.customer_name} · {order.customer_phone}
                  </div>
                  <div className="admin-product-meta">
                    {order.fulfillment_type === 'delivery' ? 'Entrega' : 'Retirada na loja'} ·{' '}
                    {order.payment_method === 'pix' ? 'PIX' : order.payment_method === 'cartao' ? 'Cartão' : 'Dinheiro'} ·{' '}
                    {formatPrice(order.total)}
                    {order.payment_method === 'dinheiro' && order.change_for && (
                      <> · Troco p/ {formatPrice(order.change_for)}</>
                    )}
                  </div>
                </div>
                <select value={order.status} onChange={(e) => updateStatus(order, e.target.value)}>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <Link to={`/admin/pedidos/${order.id}`} className="btn btn-outline-gold btn-sm">
                  Detalhes
                </Link>
              </div>
            </div>
          ))}
          {orders.length === 0 && !error && <p className="helper-text">Nenhum pedido encontrado.</p>}
        </>
      )}
    </div>
  );
}
