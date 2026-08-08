import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminApi, extractErrorMessage } from '../../api/client';
import './admin.css';

function formatPrice(value) {
  return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    adminApi
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch((err) => setError(extractErrorMessage(err)));
  };

  useEffect(load, [id]);

  const markPaymentApproved = async () => {
    try {
      await adminApi.patch(`/orders/${id}/payment-status`, { paymentStatus: 'approved' });
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!order) return <span className="spinner" />;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Pedido {order.order_number}</h1>
          <p>{order.customer_name} · {order.customer_phone}</p>
        </div>
      </div>

      <div className="panel">
        <h2 className="section-title align-left">Itens</h2>
        {order.items.map((item) => (
          <div key={item.id} className="order-status-item">
            <span>
              {item.quantity}x {item.product_name_snapshot}
              {item.selected_size ? ` (${item.selected_size})` : ''}
              {item.selected_color ? ` - ${item.selected_color}` : ''}
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

        <h2 className="section-title align-left" style={{ marginTop: 24 }}>
          {order.fulfillment_type === 'delivery' ? 'Endereço de entrega' : 'Retirada na loja'}
        </h2>
        {order.deliveryAddress ? (
          <p className="helper-text">
            {order.deliveryAddress.street}, {order.deliveryAddress.number} - {order.deliveryAddress.neighborhood}
            <br />
            {order.deliveryAddress.city} - {order.deliveryAddress.state}
            {order.deliveryAddress.complement && (
              <>
                <br />
                {order.deliveryAddress.complement}
              </>
            )}
          </p>
        ) : (
          <p className="helper-text">Cliente irá retirar na loja.</p>
        )}

        <h2 className="section-title align-left" style={{ marginTop: 24 }}>
          Pagamento
        </h2>
        <p className="helper-text">
          Forma: {order.payment_method === 'pix' ? 'PIX' : order.payment_method === 'cartao' ? 'Cartão' : 'Dinheiro'} · Status:{' '}
          {order.payment_status}
        </p>
        {order.payment_method === 'dinheiro' && (
          <p className="helper-text">
            {order.change_for
              ? `Precisa de troco para ${formatPrice(order.change_for)}`
              : 'Não precisa de troco'}
          </p>
        )}
        {order.payment_status !== 'approved' && (
          <button className="btn btn-outline-gold btn-sm" onClick={markPaymentApproved}>
            Marcar como pago
          </button>
        )}

        {order.customer_notes && (
          <>
            <h2 className="section-title align-left" style={{ marginTop: 24 }}>
              Observações
            </h2>
            <p className="helper-text">{order.customer_notes}</p>
          </>
        )}
      </div>
    </div>
  );
}
