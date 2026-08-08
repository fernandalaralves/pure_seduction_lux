import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './admin.css';

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell silk-bg">
      <header className="admin-topbar">
        <button className="admin-icon-btn" onClick={() => setDrawerOpen(true)} aria-label="Menu">
          ☰
        </button>
        <div className="admin-brand">
          <Logo size={56} />
          <h1>PURE SEDUCTION LUX</h1>
          <p>Painel Administrativo</p>
        </div>
        <div className="admin-icon-btn-spacer" aria-hidden="true" />
      </header>

      {drawerOpen && (
        <div className="admin-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <nav className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <Link to="/admin/produtos" onClick={() => setDrawerOpen(false)}>
              Produtos
            </Link>
            <Link to="/admin/colecoes" onClick={() => setDrawerOpen(false)}>
              Coleções
            </Link>
            <Link to="/admin/pedidos" onClick={() => setDrawerOpen(false)}>
              Pedidos
            </Link>
            <Link to="/admin/configuracoes" onClick={() => setDrawerOpen(false)}>
              Configurações
            </Link>
            <button onClick={handleLogout}>Sair</button>
          </nav>
        </div>
      )}

      <main className="admin-content">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <nav className="admin-bottom-nav">
        <NavLink to="/admin/produtos" className="admin-bottom-nav-item">
          <span>👜</span>
          Produtos
        </NavLink>
        <NavLink to="/admin/produtos/novo" className="admin-bottom-nav-item">
          <span>➕</span>
          Adicionar
        </NavLink>
        <NavLink to="/admin/configuracoes" className="admin-bottom-nav-item">
          <span>⚙</span>
          Configurações
        </NavLink>
      </nav>
    </div>
  );
}
