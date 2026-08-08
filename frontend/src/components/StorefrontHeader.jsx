import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './StorefrontHeader.css';

const NAV_LINKS = [
  { to: '/', end: true, label: 'início' },
  { to: '/loja', label: 'coleções' },
  // "destaques" only scrolls the current home page down to a section, so it
  // stays visually static (no hover/active highlight) unlike the real routes.
  { to: '/#destaques', label: 'destaques', className: 'nav-static' },
  { to: '/sobre', label: 'sobre nós' },
];

export default function StorefrontHeader() {
  const { totalQuantity } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="storefront-header">
      <div className="container storefront-header-inner">
        <button className="storefront-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <nav className="storefront-nav">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={link.className}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/carrinho" className="storefront-cart-icon" aria-label="Carrinho">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          {totalQuantity > 0 && <span className="cart-badge">{totalQuantity}</span>}
        </Link>
      </div>

      {menuOpen && (
        <div className="storefront-mobile-overlay" onClick={() => setMenuOpen(false)}>
          <nav className="storefront-mobile-menu" onClick={(e) => e.stopPropagation()}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={link.className}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
