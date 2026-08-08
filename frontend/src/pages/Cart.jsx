import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

function formatPrice(value) {
  return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container section-block text-center">
        <h1 className="page-title">Sua sacola está vazia</h1>
        <Link to="/loja" className="btn btn-gold">
          Ver coleções
        </Link>
      </div>
    );
  }

  return (
    <div className="container section-block">
      <h1 className="page-title">Sua Sacola</h1>

      <div className="panel">
        {items.map((item) => (
          <div key={`${item.productId}-${item.selectedSize}`} className="cart-line">
            <div className="cart-line-image">
              {item.image ? <img src={item.image} alt={item.name} /> : <div className="product-card-placeholder">—</div>}
            </div>
            <div className="cart-line-info">
              <div className="cart-line-name">{item.name}</div>
              {item.variantDescription && <div className="helper-text">{item.variantDescription}</div>}
              {item.selectedSize && <div className="helper-text">Tamanho: {item.selectedSize}</div>}
            </div>
            <div className="cart-line-price">{formatPrice(item.price)}</div>
            <div className="quantity-stepper">
              <button onClick={() => updateQuantity(item, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item, item.quantity + 1)}>+</button>
            </div>
            <button className="icon-btn danger" onClick={() => removeItem(item)} aria-label="Remover">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 6.75h15m-11.25 0V4.875c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V6.75m3 0v11.25c0 .621-.504 1.125-1.125 1.125H7.875a1.125 1.125 0 0 1-1.125-1.125V6.75m8.25 0h-9" />
                <path d="M10.125 10.5v5.25M13.875 10.5v5.25" />
              </svg>
            </button>
          </div>
        ))}

        <div className="cart-summary-row">
          <span>Subtotal</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <p className="helper-text">A taxa de entrega (se aplicável) é calculada na finalização.</p>

        <button className="btn btn-gold" style={{ width: '100%', marginTop: 12 }} onClick={() => navigate('/checkout')}>
          Finalizar compra
        </button>
      </div>
    </div>
  );
}
