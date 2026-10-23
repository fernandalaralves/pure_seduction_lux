import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import StorefrontLayout from './components/StorefrontLayout';
import { api } from './api/client';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderStatus from './pages/OrderStatus';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import About from './pages/About';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  const [isLocked, setIsLocked] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        setIsLocked(res.data.settings.is_store_locked);
      })
      .catch(() => {
         setIsLocked(false);
      })
      .finally(() => setIsChecking(false));
  }, []);

  
  if (isChecking) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a0505', color: '#d4af37', fontFamily: 'sans-serif' }}>
        Carregando...
      </div>
    );
  }

    // TELA DE BLOQUEIO (bloqueia TUDO, inclusive o admin)
  if (isLocked) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#1a0505', 
        color: '#d4af37', 
        textAlign: 'center', 
        padding: '20px', 
        fontFamily: 'sans-serif' 
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Loja Temporariamente Indisponível
        </h1>
        
        {/* MENSAGEM PERSONALIZADA AQUI */}
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem', maxWidth: '600px' }}>
          Estamos realizando uma atualização importante em nosso sistema para melhor atendê-la.
        </p>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
          Em breve voltaremos com novidades. Obrigado pela compreensão!
        </p>
        
      </div>
    );
  }
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Storefront (public) */}
              <Route element={<StorefrontLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/loja" element={<Shop />} />
                <Route path="/produto/:slug" element={<ProductDetail />} />
                <Route path="/carrinho" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/pedido/:id" element={<OrderStatus />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registrar" element={<Register />} />
                <Route path="/meus-pedidos" element={<MyOrders />} />
                <Route path="/sobre" element={<About />} />
              </Route>

              {/* Admin (restricted) */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }
              >
                <Route path="produtos" element={<AdminProducts />} />
                <Route path="produtos/novo" element={<AdminProductForm />} />
                <Route path="produtos/:id" element={<AdminProductForm />} />
                <Route path="pedidos" element={<AdminOrders />} />
                <Route path="pedidos/:id" element={<AdminOrderDetail />} />
                <Route path="configuracoes" element={<AdminSettings />} />
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
