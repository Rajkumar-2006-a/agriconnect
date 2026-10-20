import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { imageUrl, DEFAULT_PRODUCT_IMAGE } from '../services/api';
import './CartPage.css';

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCart = () => {
    try {
      const items = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(items);
    } catch {
      setCart([]);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (index, delta) => {
    const updated = [...cart];
    const current = updated[index].cartQuantity || 1;
    const nextVal = current + delta;

    if (nextVal <= 0) {
      removeFromCart(index);
    } else {
      updated[index].cartQuantity = nextVal;
      saveCart(updated);
    }
  };

  const removeFromCart = (index) => {
    const updated = cart.filter((_, i) => i !== index);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.cartQuantity || 1),
    0
  );

  const handleCheckout = async () => {
    if (!cart.length) return;
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/orders', {
        products: cart.map((item) => ({
          product: item._id,
          productName: item.productName,
          quantity: item.cartQuantity || 1,
          price: item.price
        })),
        totalAmount
      });

      // Clear cart
      saveCart([]);
      setSuccess('Your order has been placed successfully! Redirecting to your purchases...');
      setTimeout(() => {
        navigate('/purchases');
      }, 1500);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to place order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-page-wrapper py-4">
      <div className="container-fluid px-3 px-md-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h1 className="cart-title mb-1">🛒 Shopping Cart</h1>
            <p className="text-muted mb-0">Review your farm produce before placing the order.</p>
          </div>
          <Link to="/products" className="btn btn-outline-success px-4 py-2 rounded-pill fw-bold">
            ← Continue Shopping
          </Link>
        </div>

        {error && <div className="alert alert-danger mb-4">⚠️ {error}</div>}
        {success && <div className="alert alert-success mb-4">🎉 {success}</div>}

        {cart.length > 0 ? (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="cart-items-box">
                <div className="d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
                  <span className="fw-bold text-dark">Item Details</span>
                  <button
                    className="btn btn-sm btn-link text-danger p-0 text-decoration-none fw-semibold"
                    onClick={clearCart}
                  >
                    Clear All
                  </button>
                </div>

                {cart.map((item, index) => (
                  <div className="cart-item-card" key={item._id || index}>
                    <img
                      src={imageUrl(item.image, DEFAULT_PRODUCT_IMAGE)}
                      alt={item.productName}
                      className="cart-item-thumb"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                    />

                    <div className="cart-item-info">
                      <span className="cart-item-category">{item.category || 'Produce'}</span>
                      <h4 className="cart-item-name">{item.productName}</h4>
                      <p className="cart-item-farmer">
                        🧑‍🌾 {item.farmer?.name || 'Local Farmer'}
                      </p>
                      <div className="cart-item-unit-price">₹{item.price} per unit</div>
                    </div>

                    <div className="cart-qty-wrapper">
                      <button
                        type="button"
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(index, -1)}
                      >
                        −
                      </button>
                      <span className="cart-qty-val">{item.cartQuantity || 1}</span>
                      <button
                        type="button"
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(index, 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-subtotal">
                      ₹{(item.price || 0) * (item.cartQuantity || 1)}
                    </div>

                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(index)}
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="cart-summary-box">
                <h3 className="cart-summary-title">Order Summary</h3>

                <div className="cart-summary-row">
                  <span>Produce Subtotal ({cart.length} items):</span>
                  <span>₹{totalAmount}</span>
                </div>

                <div className="cart-summary-row">
                  <span>Farm Dispatch Fee:</span>
                  <span className="text-success fw-bold">FREE</span>
                </div>

                <div className="cart-summary-total">
                  <span>Total Amount:</span>
                  <span className="cart-total-val">₹{totalAmount}</span>
                </div>

                <button
                  className="btn btn-success w-100 py-3 fw-bold rounded-pill mt-3 cart-checkout-btn"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order →'}
                </button>

                <p className="cart-guarantee-note">
                  🛡️ Direct farmer order. Payment handled directly upon delivery or confirmation.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="cart-empty-state">
            <div className="cart-empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p className="text-muted">
              You haven't added any fresh farm produce to your cart yet.
            </p>
            <Link to="/products" className="btn btn-success px-4 py-2 rounded-pill fw-bold mt-2">
              Browse Farm Produce →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
