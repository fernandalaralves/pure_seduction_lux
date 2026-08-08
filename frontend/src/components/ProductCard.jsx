import { Link } from 'react-router-dom';
import './ProductCard.css';

function formatPrice(value) {
  return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProductCard({ product }) {
  const image = product.cover_image_url || product.images?.[0]?.url;
  const outOfStock = product.stock <= 0;

  return (
    <div className="product-card">
      <Link to={`/produto/${product.slug}`} className="product-card-image-wrap">
        {image ? (
          <img src={image} alt={product.name} />
        ) : (
          <div className="product-card-placeholder">Sem imagem</div>
        )}
        <button className="product-card-wishlist" aria-label="Favoritar" onClick={(e) => e.preventDefault()}>
          ♡
        </button>
        {outOfStock && <span className="product-card-soldout">Esgotado</span>}
      </Link>
      <Link to={`/produto/${product.slug}`} className="product-card-name">
        {product.name}
      </Link>
      <div className="product-card-price">{formatPrice(product.price)}</div>
      <Link to={`/produto/${product.slug}`} className="btn btn-gold btn-sm product-card-cta">
        Comprar
      </Link>
    </div>
  );
}
