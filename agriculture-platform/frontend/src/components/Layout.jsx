import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitch from './LanguageSwitch';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const closeMenu = () => setMenuOpen(false);
  const leave = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  // Keep cart counter synced with localStorage
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((total, item) => total + (item.cartQuantity || 1), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  // Never render global navbar or footer on login, register, or internal dashboards (farmer & rentalOwner have full internal navigation)
  const isAuthOrInternalDashboard =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    ((user?.role === 'farmer' || user?.role === 'rentalOwner') && location.pathname.startsWith('/dashboard'));

  if (isAuthOrInternalDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="app-layout-wrapper">
      <nav className="navbar navbar-expand-lg navbar-dark agro-nav">
        <div className="container-fluid px-3 px-md-4">
          <Link
            className="navbar-brand auth-logo"
            to={user?.role === 'buyer' ? '/products' : '/'}
            onClick={closeMenu}
          >
            <img src="/logo.png" alt="AgriConnect" className="brand-logo-img me-2" />
            <span>
              <span className="auth-logo-yellow">Agri</span>
              <span className="auth-logo-white">Connect</span>
            </span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
            <div className="navbar-nav ms-auto align-items-lg-center">
              {/* Global Bilingual Language Switcher */}
              <LanguageSwitch className="my-2 my-lg-0" />

              {/* Buyer Navigation Links */}
              {user?.role === 'buyer' ? (
                <>
                  <NavLink className="nav-link nav-link-custom" to="/products" onClick={closeMenu}>
                    <span className="me-1">🛒</span> {t('freshMarketplace', 'Fresh Marketplace')}
                  </NavLink>
                  <NavLink className="nav-link nav-link-custom" to="/purchases" onClick={closeMenu}>
                    <span className="me-1">📦</span> {t('myPurchases', 'My Purchases')}
                  </NavLink>
                  <NavLink className="nav-link nav-link-custom nav-link-cart" to="/cart" onClick={closeMenu}>
                    <span className="me-1">🛍️</span> {t('cart', 'Cart')}
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  </NavLink>
                  <div className="nav-user-pill">
                    <span className="user-avatar-circle">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'B'}
                    </span>
                    <span className="user-name-text">{user.name}</span>
                    {user.location && (
                      <span className="badge text-bg-light border text-success fw-normal me-1" style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '10px' }}>
                        📍 {user.location}
                      </span>
                    )}
                    <span className="user-role-badge">{t('buyer', 'Buyer')}</span>
                  </div>
                  <button className="btn btn-sm btn-logout-nav ms-lg-2" onClick={leave}>
                    {t('logout', 'Log out')}
                  </button>
                </>
              ) : user?.role === 'rentalOwner' ? (
                /* Rental Owner Navigation */
                <>
                  <NavLink className="nav-link nav-link-custom" to="/dashboard" onClick={closeMenu}>
                    🚜 {t('machineryDashboard', 'Machinery Dashboard')}
                  </NavLink>
                  <div className="nav-user-pill">
                    <span className="user-avatar-circle">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'O'}
                    </span>
                    <span className="user-name-text">{user.name}</span>
                    {user.location && (
                      <span className="badge text-bg-light border text-success fw-normal me-1" style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '10px' }}>
                        📍 {user.location}
                      </span>
                    )}
                    <span className="user-role-badge">{t('rentalOwner', 'Rental Owner')}</span>
                  </div>
                  <button className="btn btn-sm btn-logout-nav ms-lg-2" onClick={leave}>
                    {t('logout', 'Log out')}
                  </button>
                </>
              ) : user?.role === 'admin' ? (
                /* Admin Navigation */
                <>
                  <NavLink className="nav-link nav-link-custom" to="/admin" onClick={closeMenu}>
                    🛡️ {t('adminPanel', 'Admin Panel')}
                  </NavLink>
                  <NavLink className="nav-link nav-link-custom" to="/products" onClick={closeMenu}>
                    🌾 {t('marketplace', 'Marketplace')}
                  </NavLink>
                  <div className="nav-user-pill">
                    <span className="user-avatar-circle">A</span>
                    <span className="user-name-text">{user.name}</span>
                    {user.location && (
                      <span className="badge text-bg-light border text-success fw-normal me-1" style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '10px' }}>
                        📍 {user.location}
                      </span>
                    )}
                    <span className="user-role-badge">{t('admin', 'Admin')}</span>
                  </div>
                  <button className="btn btn-sm btn-logout-nav ms-lg-2" onClick={leave}>
                    {t('logout', 'Log out')}
                  </button>
                </>
              ) : user ? (
                /* Farmer or other logged in user */
                <>
                  <NavLink className="nav-link nav-link-custom" to="/dashboard" onClick={closeMenu}>
                    🌱 {t('farmerDashboard', 'Farmer Dashboard')}
                  </NavLink>
                  <div className="nav-user-pill">
                    <span className="user-avatar-circle">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <span className="user-name-text">{user.name}</span>
                    {user.location && (
                      <span className="badge text-bg-light border text-success fw-normal me-1" style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '10px' }}>
                        📍 {user.location}
                      </span>
                    )}
                  </div>
                  <button className="btn btn-sm btn-logout-nav ms-lg-2" onClick={leave}>
                    {t('logout', 'Log out')}
                  </button>
                </>
              ) : (
                /* Non-logged in public visitor */
                <>
                  <NavLink className="nav-link nav-link-custom" to="/products" onClick={closeMenu}>
                    🌾 {t('marketplace', 'Marketplace')}
                  </NavLink>
                  <NavLink className="nav-link nav-link-custom" to="/login" onClick={closeMenu}>
                    {t('signIn', 'Sign in')}
                  </NavLink>
                  <NavLink className="btn btn-sm btn-warning ms-lg-2 fw-bold" to="/register" onClick={closeMenu}>
                    {t('getStarted', 'Get started')}
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="app-main-content">
        {children}
      </main>

      <footer className="app-footer">
        <div className="container-fluid px-3 px-md-4">
          <div className="app-footer-brand d-inline-flex align-items-center gap-2">
            <img src="/logo.png" alt="AgriConnect" className="brand-logo-img" style={{ width: 26, height: 26 }} />
            <span>
              <span className="auth-logo-yellow">Agri</span>Connect
            </span>
          </div>
          <div className="app-footer-tagline">
            {t('tagline', 'Empowering Farmers & Buyers across Tamil Nadu with Direct Fair-Price Agriculture')}
          </div>
          <p className="app-footer-copy">
            &copy; {new Date().getFullYear()} AgriConnect Platform. {t('rights', 'All rights reserved.')}
          </p>
        </div>
      </footer>
    </div>
  );
}
