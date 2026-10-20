import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './BuyerOrders.css';

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/orders');
      setOrders(response.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to load purchases. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Accepted by Farmer ✓',
          className: 'buyer-badge-confirmed'
        };
      case 'cancelled':
        return {
          label: 'Cancelled / Rejected ✕',
          className: 'buyer-badge-cancelled'
        };
      default:
        return {
          label: 'Pending Farmer Approval ⏳',
          className: 'buyer-badge-pending'
        };
    }
  };

  return (
    <div className="buyer-orders-page py-4">
      <div className="container-fluid px-3 px-md-4">
        {/* Page Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h1 className="buyer-orders-title mb-1">📦 My Purchases &amp; Orders</h1>
            <p className="text-muted mb-0">
              Track the approval and fulfillment status of your farm produce orders.
            </p>
          </div>
          <Link to="/products" className="btn btn-outline-success px-4 py-2 rounded-pill fw-bold">
            ← Continue Shopping
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status" />
            <p className="mt-3 text-muted fw-semibold">Loading your purchases...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4">
            <span>⚠️ {error}</span>
            <button className="btn btn-sm btn-outline-danger" onClick={loadOrders}>
              Retry
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="buyer-orders-list">
            {orders.map((order) => {
              const badge = getStatusBadge(order.orderStatus);
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <article className="buyer-order-card" key={order._id}>
                  <div className="buyer-order-header">
                    <div>
                      <span className="buyer-order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                      <span className="buyer-order-date">📅 Placed on {orderDate}</span>
                    </div>
                    <span className={`buyer-status-pill ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="buyer-order-body">
                    <div className="buyer-order-items">
                      {order.products.map((item, idx) => (
                        <div className="buyer-order-item-row" key={idx}>
                          <div className="buyer-order-item-icon">🌾</div>
                          <div className="buyer-order-item-details">
                            <span className="buyer-order-item-name">{item.productName}</span>
                            <span className="buyer-order-item-qty">
                              Quantity: {item.quantity} units · ₹{item.price}/unit
                            </span>
                          </div>
                          <div className="buyer-order-item-price">
                            ₹{item.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="buyer-order-footer">
                      <div className="buyer-order-total">
                        <span>Total Paid:</span>
                        <b>₹{order.totalAmount}</b>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Link
                          to="/products"
                          className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                        >
                          Reorder
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="buyer-orders-empty">
            <div className="empty-icon">🛍️</div>
            <h3>No purchases yet</h3>
            <p className="text-muted">
              You haven't placed any farm produce orders yet. Explore our direct farm marketplace to get fresh harvests delivered!
            </p>
            <Link to="/products" className="btn btn-success px-4 py-2 rounded-pill fw-bold mt-2">
              Explore Farm Marketplace →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
