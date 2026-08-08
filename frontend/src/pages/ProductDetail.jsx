import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, extractErrorMessage } from '../api/client';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

function formatPrice(value) {
  return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setAdded(false);
    api
      .get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data.product);
        setSelectedSize(res.data.product.available_sizes?.[0] || null);
      })
      .catch((err) => setError(extractErrorMessage(err, 'Produto não encontrado.')));
  }, [slug]);

  if (error) {
    return (
      <div className="container section-block">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="container text-center" style={{ padding: 80 }}>
        <span className="spinner" />
      </div>
    );
  }

  const images = product.images?.length ? product.images : product.cover_image_url ? [{ url: product.cover_image_url }] : [];
  const outOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    addItem(product, { quantity, selectedSize });
    setAdded(true);
  };

  return (
    <div className="container section-block product-detail">
      <div className="product-detail-gallery">
        <div className="product-detail-main-image">
          {images[activeImage] ? (
            <img src={images[activeImage].url} alt={product.name} />
          ) : (
            <div className="product-card-placeholder">Sem imagem</div>
          )}
        </div>
        {images.length > 1 && (
          <div className="product-detail-thumbs">
            {images.map((img, i) => (
              <button
                key={img.id || i}
                className={i === activeImage ? 'active' : ''}
                onClick={() => setActiveImage(i)}
              >
                <img src={img.url} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product-detail-info">
        <h1>{product.name}</h1>
        {product.variant_description && <p className="product-detail-variant">{product.variant_description}</p>}
        <div className="product-detail-price">{formatPrice(product.price)}</div>

        {product.color && (
          <p className="helper-text">
            <strong>Cor:</strong> {product.color}
          </p>
        )}

        {product.available_sizes?.length > 0 && (
          <div className="field">
            <label>Tamanho</label>
            <div className="size-selector">
              {product.available_sizes.map((size) => (
                <button
                  key={size}
                  className={size === selectedSize ? 'active' : ''}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <label>Quantidade</label>
          <div className="quantity-stepper">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
          </div>
        </div>

        {outOfStock ? (
          <div className="alert alert-error">Produto esgotado no momento.</div>
        ) : (
          <button className="btn btn-gold" onClick={handleAddToCart} style={{ width: '100%' }}>
            Adicionar à sacola
          </button>
        )}

        {added && (
          <div className="alert alert-success" style={{ marginTop: 14 }}>
            Adicionado à sacola!{' '}
            <button className="btn btn-outline-gold btn-sm" onClick={() => navigate('/carrinho')}>
              Ver carrinho
            </button>
          </div>
        )}

        {product.description && <p className="product-detail-description">{product.description}</p>}
      </div>
    </div>
  );
}
