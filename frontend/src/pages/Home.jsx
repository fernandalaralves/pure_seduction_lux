import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, extractErrorMessage } from '../api/client';
import ProductCard from '../components/ProductCard';
import Logo from '../components/Logo';
import './Home.css';

// Sempre aparece por último, apontando pra loja sem filtro nenhum - não é
// uma categoria de verdade, então não vem da API.
const ALL_ITEM = { slug: '', label: 'todos', image_url: null };

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/products/featured')
      .then((res) => setFeatured(res.data.products))
      .catch((err) => setError(extractErrorMessage(err)));

    api
      .get('/categories')
      .then((res) => setCollections(res.data.categories))
      .catch(() => {}); // sem coleções cadastradas ainda - a seção some sozinha (ver abaixo)
  }, []);

  return (
    <div>
      <section className="silk-bg hero">
        <div className="hero-logo">
          <Logo size={92} />
        </div>
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>SEU MOMENTO</h1>
            <p className="hero-script">Sua essência</p>
            <p className="hero-sub">Lingeries que valorizam quem você é</p>
            <div className="hero-divider" />
          </div>
        </div>
      </section>

      {collections.length > 0 && (
        <section className="container section-block">
          <h2 className="section-title">Nossas coleções</h2>
          <div className="collections-grid">
            {[...collections, ALL_ITEM].map((c) => (
              <div key={c.slug || 'todos'} className="collection-item">
                <div
                  className="collection-circle"
                  style={c.image_url ? { backgroundImage: `url(${c.image_url})` } : undefined}
                />
                <div className="collection-label">{c.label || c.name}</div>
                <Link to={c.slug ? `/loja?categoria=${c.slug}` : '/loja'} className="btn btn-outline-gold btn-sm">
                  Ver coleção
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container section-block destaques-section" id="destaques">
        <h2 className="destaques-title">Destaques</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="featured-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {!error && featured.length === 0 && (
          <p className="helper-text text-center">Nenhum produto em destaque no momento.</p>
        )}
      </section>
    </div>
  );
}
