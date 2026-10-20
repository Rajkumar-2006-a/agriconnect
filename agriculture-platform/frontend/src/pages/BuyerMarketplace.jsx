import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { imageUrl, DEFAULT_PRODUCT_IMAGE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './BuyerMarketplace.css';

const CATEGORIES = [
  { id: 'all', label: 'All Produce', icon: '🌟' },
  { id: 'Vegetables', label: 'Vegetables', icon: '🥦' },
  { id: 'Fruits', label: 'Fruits', icon: '🍎' },
  { id: 'Grains & Cereals', label: 'Grains & Cereals', icon: '🌾' },
  { id: 'Spices', label: 'Spices', icon: '🌿' },
  { id: 'Other', label: 'Other', icon: '📦' }
];

export default function BuyerMarketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Interactive feedback
  const [addedIds, setAddedIds] = useState(new Set());
  const [toast, setToast] = useState(null); // { message, type }

  // Quick Direct Buy Modal State
  const [buyModalItem, setBuyModalItem] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/products');
      setProducts(response.data || []);
    } catch (requestError) {
      setProducts([]);
      setError(
        requestError.response?.data?.message || 'Unable to load produce. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(
        (p) =>
          p.category &&
          p.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
      );
    }

    // Search query filter
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.productName && p.productName.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.category && p.category.toLowerCase().includes(query)) ||
          (p.farmer?.name && p.farmer.name.toLowerCase().includes(query))
      );
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'stock') {
      result.sort((a, b) => b.quantity - a.quantity);
    }

    return result;
  }, [products, selectedCategory, search, sortBy]);

  // Category Counts
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    products.forEach((p) => {
      const cat = p.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Add to cart with feedback & notification
  const handleAddToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const item = cart.find((cartItem) => cartItem._id === product._id);

      if (item) {
        item.cartQuantity = (item.cartQuantity || 1) + 1;
      } else {
        cart.push({ ...product, cartQuantity: 1 });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));

      // Micro-animation state
      setAddedIds((prev) => new Set(prev).add(product._id));
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(product._id);
          return next;
        });
      }, 1500);

      showToast(`🛒 "${product.productName}" added to your cart!`);
    } catch {
      showToast('Could not add to cart.', 'error');
    }
  };

  // Open Direct Buy Modal
  const handleOpenBuyModal = (product) => {
    setBuyModalItem(product);
    setBuyQuantity(1);
  };

  // Confirm Direct Buy
  const handleConfirmDirectBuy = async (e) => {
    e.preventDefault();
    if (!buyModalItem) return;

    setIsSubmittingOrder(true);
    try {
      const totalAmount = buyModalItem.price * buyQuantity;
      await api.post('/orders', {
        products: [
          {
            product: buyModalItem._id,
            productName: buyModalItem.productName,
            quantity: buyQuantity,
            price: buyModalItem.price
          }
        ],
        totalAmount
      });

      showToast(`🎉 Order placed successfully! The farmer has been notified.`);
      setBuyModalItem(null);
      // Refresh to update quantities
      loadProducts();
    } catch (requestError) {
      showToast(
        requestError.response?.data?.message || 'Unable to place order. Please try again.',
        'error'
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="buyer-marketplace-page">
      <div className="container-fluid px-3 px-md-4 pt-3">
        {/* Sleek Page Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div>
            <h1 className="h4 fw-bold text-dark mb-1">🛒 Fresh Agricultural Marketplace</h1>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="buyer-controls-panel">
          <div className="row g-3 align-items-center mb-3">
            <div className="col-lg-8 col-md-7">
              <div className="buyer-search-input-wrap">
                <span className="buyer-search-icon">🔍</span>
                <input
                  type="text"
                  className="buyer-search-input"
                  placeholder="Search organic rice, country tomatoes, coconuts, turmeric..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="buyer-search-clear"
                    onClick={() => setSearch('')}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="col-lg-4 col-md-5 d-flex justify-content-md-end align-items-center gap-2">
              <label className="text-muted small fw-bold text-nowrap mb-0">Sort By:</label>
              <select
                className="form-select form-select-sm buyer-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">✨ Recommended</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💎 Price: High to Low</option>
                <option value="stock">📦 Highest Stock Available</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="buyer-category-scroll">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`buyer-cat-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="buyer-cat-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Meta Info */}
        <div className="buyer-results-row">
          <span className="buyer-results-count">
            Showing <b>{filteredProducts.length}</b> fresh farm items
            {selectedCategory !== 'all' && ` in "${selectedCategory}"`}
            {search && ` matching "${search}"`}
          </span>

          {(selectedCategory !== 'all' || search) && (
            <button
              className="btn btn-sm btn-link text-success p-0 fw-bold text-decoration-none"
              onClick={() => {
                setSelectedCategory('all');
                setSearch('');
              }}
            >
              ↺ Reset Filters
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status" />
            <p className="mt-3 text-muted fw-semibold">Gathering farm-fresh produce...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center my-3">
            <span>⚠️ {error}</span>
            <button className="btn btn-sm btn-outline-danger" onClick={loadProducts}>
              Retry
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="buyer-products-grid">
            {filteredProducts.map((product) => {
              const isAdded = addedIds.has(product._id);
              const isLowStock = product.quantity <= 15;

              return (
                <article className="buyer-product-card" key={product._id}>
                  {/* Card Image */}
                  <div className="buyer-card-img-wrap">
                    <img
                      src={imageUrl(product.image, DEFAULT_PRODUCT_IMAGE)}
                      alt={product.productName}
                      className="buyer-card-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                    />
                    <span className="buyer-card-cat-pill">
                      {product.category || 'Produce'}
                    </span>
                    <span
                      className={`buyer-card-stock-pill ${isLowStock ? 'low-stock' : ''}`}
                    >
                      {product.quantity > 0
                        ? `${product.quantity} units left`
                        : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="buyer-card-body">
                    {/* Farmer Attribution */}
                    <div className="buyer-farmer-chip">
                      <span className="farmer-icon">🧑‍🌾</span>
                      <span>By {product.farmer?.name || 'Verified Farmer'}</span>
                      {product.farmer?.phone && (
                        <a
                          href={`tel:${product.farmer.phone}`}
                          className="buyer-farmer-phone-link"
                          title="Call Farmer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📞 Call
                        </a>
                      )}
                    </div>

                    <h3 className="buyer-card-title" title={product.productName}>
                      {product.productName}
                    </h3>

                    <p className="buyer-card-desc" title={product.description}>
                      {product.description || 'Direct farm harvest packed fresh for delivery.'}
                    </p>

                    {/* Price Row */}
                    <div className="buyer-card-price-row">
                      <span className="buyer-card-price">₹{product.price}</span>
                      <span className="buyer-card-unit">/ kg or unit</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="buyer-card-actions">
                      <button
                        type="button"
                        className={`buyer-btn-cart ${isAdded ? 'added' : ''}`}
                        onClick={() => handleAddToCart(product)}
                        disabled={product.quantity === 0}
                      >
                        {isAdded ? '✓ Added' : '🛒 Add'}
                      </button>

                      <button
                        type="button"
                        className="buyer-btn-buy"
                        onClick={() => handleOpenBuyModal(product)}
                        disabled={product.quantity === 0}
                      >
                        ⚡ Buy Now
                      </button>

                      <Link
                        to={`/products/${product._id}`}
                        className="buyer-btn-details"
                        title="View Full Details"
                      >
                        👁️
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="buyer-empty-state">
            <div className="buyer-empty-icon">🌾</div>
            <h3 className="buyer-empty-title">No farm produce found</h3>
            <p className="buyer-empty-subtitle">
              {search || selectedCategory !== 'all'
                ? 'Try broadening your search term or switching to another category.'
                : 'No fresh harvests have been listed by farmers at the moment. Please check back shortly!'}
            </p>
            {(search || selectedCategory !== 'all') && (
              <button
                type="button"
                className="btn btn-success px-4 py-2 rounded-pill fw-bold"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                }}
              >
                View All Fresh Produce
              </button>
            )}
          </div>
        )}

        {/* Quick Direct Buy Modal */}
        {buyModalItem && (
          <div
            className="buyer-modal-backdrop"
            onClick={() => setBuyModalItem(null)}
          >
            <div
              className="buyer-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="buyer-modal-header">
                <h3 className="buyer-modal-title">⚡ Instant Farm Order</h3>
                <button
                  className="buyer-modal-close"
                  onClick={() => setBuyModalItem(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="buyer-modal-body">
                <div className="buyer-modal-product-summary">
                  <img
                    src={imageUrl(buyModalItem.image, DEFAULT_PRODUCT_IMAGE)}
                    alt={buyModalItem.productName}
                    className="buyer-modal-thumb"
                  />
                  <div className="buyer-modal-info">
                    <h4>{buyModalItem.productName}</h4>
                    <p className="text-success fw-bold">₹{buyModalItem.price} / unit</p>
                    <p>🧑‍🌾 Farmer: {buyModalItem.farmer?.name || 'Local Farmer'}</p>
                  </div>
                </div>

                <form onSubmit={handleConfirmDirectBuy}>
                  <label className="form-label fw-bold text-dark small mb-1">
                    Select Quantity (Max: {buyModalItem.quantity} units)
                  </label>
                  <div className="buyer-qty-controls">
                    <button
                      type="button"
                      className="buyer-qty-btn"
                      onClick={() => setBuyQuantity((q) => Math.max(1, q - 1))}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="buyer-qty-input"
                      min="1"
                      max={buyModalItem.quantity}
                      value={buyQuantity}
                      onChange={(e) =>
                        setBuyQuantity(
                          Math.max(
                            1,
                            Math.min(buyModalItem.quantity, Number(e.target.value) || 1)
                          )
                        )
                      }
                    />
                    <button
                      type="button"
                      className="buyer-qty-btn"
                      onClick={() =>
                        setBuyQuantity((q) => Math.min(buyModalItem.quantity, q + 1))
                      }
                    >
                      +
                    </button>
                    <span className="text-muted small fw-semibold">units / kg</span>
                  </div>

                  <div className="buyer-modal-total-row">
                    <span className="buyer-modal-total-label">Total Payable:</span>
                    <span className="buyer-modal-total-val">
                      ₹{buyModalItem.price * buyQuantity}
                    </span>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-50 py-2 fw-semibold rounded-pill"
                      onClick={() => setBuyModalItem(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success w-50 py-2 fw-bold rounded-pill"
                      disabled={isSubmittingOrder}
                    >
                      {isSubmittingOrder ? 'Placing Order...' : 'Confirm Order →'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Floating Toast Notification */}
        {toast && (
          <div className="buyer-toast-container">
            <div className={`buyer-toast ${toast.type}`}>
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
