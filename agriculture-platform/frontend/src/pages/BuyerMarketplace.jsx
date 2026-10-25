import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { imageUrl, DEFAULT_PRODUCT_IMAGE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './BuyerMarketplace.css';

const CATEGORIES = [
  { id: 'all', labelEn: 'All Produce', labelTa: 'அனைத்தும்', icon: '🌟' },
  { id: 'Vegetables', labelEn: 'Vegetables', labelTa: 'காய்கறிகள்', icon: '🥦' },
  { id: 'Fruits', labelEn: 'Fruits', labelTa: 'பழங்கள்', icon: '🍎' },
  { id: 'Grains & Cereals', labelEn: 'Grains & Cereals', labelTa: 'தானியங்கள்', icon: '🌾' },
  { id: 'Spices', labelEn: 'Spices', labelTa: 'மசாலாப் பொருட்கள்', icon: '🌿' },
  { id: 'Other', labelEn: 'Other', labelTa: 'மற்றவை', icon: '📦' }
];

// Agricultural Vocabulary Dictionary for instant fallback
const TAMIL_NAME_MAP = {
  'tomato': 'தக்காளி',
  'tomatoes': 'தக்காளி',
  'country tomatoes': 'நாட்டு தக்காளி',
  'potato': 'உருளைக்கிழங்கு',
  'potatoes': 'உருளைக்கிழங்கு',
  'onion': 'வெங்காயம்',
  'shallot': 'சின்ன வெங்காயம்',
  'shallots': 'சின்ன வெங்காயம்',
  'sambar onion': 'சின்ன வெங்காயம்',
  'garlic': 'பூண்டு',
  'ginger': 'இஞ்சி',
  'chilli': 'மிளகாய்',
  'green chilli': 'பச்சை மிளகாய்',
  'carrot': 'கேரட்',
  'carrots': 'கேரட்',
  'beetroot': 'பீட்ரூட்',
  'radish': 'முள்ளங்கி',
  'cabbage': 'முட்டைக்கோஸ்',
  'cauliflower': 'காலிஃபிளவர்',
  'brinjal': 'கத்தரிக்காய்',
  'eggplant': 'கத்தரிக்காய்',
  'okra': 'வெண்டைக்காய்',
  'lady finger': 'வெண்டைக்காய்',
  'drumstick': 'முருங்கைக்காய்',
  'moringa': 'முருங்கைக்காய்',
  'bitter gourd': 'பாகற்காய்',
  'bottle gourd': 'சுரைக்காய்',
  'pumpkin': 'பரங்கிக்காய்',
  'cucumber': 'வெள்ளரிக்காய்',
  'beans': 'பீன்ஸ்',
  'peas': 'பட்டாணி',
  'spinach': 'கீரை',
  'mushroom': 'காளான்',
  'banana': 'வாழைப்பழம்',
  'plantain': 'வாழைக்காய்',
  'mango': 'மாம்பழம்',
  'mangoes': 'மாம்பழம்',
  'apple': 'ஆப்பிள்',
  'orange': 'ஆரஞ்சு',
  'lemon': 'எலுமிச்சை',
  'pomegranate': 'மாதுளை',
  'guava': 'கொய்யா',
  'papaya': 'பப்பாளி',
  'watermelon': 'தர்பூசணி',
  'grapes': 'திராட்சை',
  'coconut': 'தேங்காய்',
  'rice': 'அரிசி',
  'ponni rice': 'பொன்னி அரிசி',
  'wheat': 'கோதுமை',
  'ragi': 'கேழ்வரகு',
  'millet': 'சிறுநவதானியங்கள்',
  'corn': 'மக்காச்சோளம்',
  'toor dal': 'துவரம் பருப்பு',
  'urad dal': 'உளுத்தம் பருப்பு',
  'moong dal': 'பாசிப்பருப்பு',
  'chana dal': 'கடலைப் பருப்பு',
  'groundnut': 'நிலக்கடலை',
  'peanut': 'நிலக்கடலை',
  'turmeric': 'மஞ்சள்',
  'pepper': 'மிளகு',
  'black pepper': 'கருப்பு மிளகு',
  'coriander': 'கொத்தமல்லி',
  'mint': 'புதினா',
  'curry leaves': 'கறிவேப்பிலை',
  'mustard': 'கடுகு',
  'cumin': 'சீரகம்',
  'sugarcane': 'கரும்பு',
  'cotton': 'பருத்தி',
  'honey': 'தேன்'
};

// Strips any bracketed text completely e.g. "Carrots (கேரட்)" -> "Carrots"
const cleanName = (str) => {
  if (!str) return '';
  return str.replace(/\s*\([^)]*\)/g, '').trim();
};

const getDisplayName = (product, isTa) => {
  if (!product) return '';
  if (isTa) {
    // 1. Direct from MongoDB (stored from farmer input or auto-translated by backend)
    if (product.productNameTa && product.productNameTa.trim()) {
      return cleanName(product.productNameTa);
    }

    // 2. If farmer typed product name directly in Tamil script
    if (/[\u0B80-\u0BFF]/.test(product.productName)) {
      return cleanName(product.productName);
    }

    // 3. If there were old bracketed translations
    const match = product.productName?.match(/\(([^)]+)\)/);
    if (match && /[\u0B80-\u0BFF]/.test(match[1])) return match[1].trim();

    // 4. Substring & word match in comprehensive agricultural dictionary
    const cleanLower = cleanName(product.productName).toLowerCase();
    if (TAMIL_NAME_MAP[cleanLower]) return TAMIL_NAME_MAP[cleanLower];
    for (const [en, ta] of Object.entries(TAMIL_NAME_MAP)) {
      if (cleanLower.includes(en)) return ta;
    }
  }

  // English: clean name without brackets
  return cleanName(product.productName);
};

export default function BuyerMarketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [language, setLanguage] = useState(() => localStorage.getItem('marketplace_lang') || 'en');
  const isTa = language === 'ta';

  const toggleLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('marketplace_lang', lang);
  };

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

  // Filter & Sort Logic (supports both English and Tamil search)
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

    // Search query filter (matches English, Tamil, descriptions, categories)
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter((p) => {
        const enClean = cleanName(p.productName).toLowerCase();
        const taClean = (p.productNameTa || getDisplayName(p, true) || '').toLowerCase();
        const rawName = (p.productName || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const catObj = CATEGORIES.find((c) => c.id.toLowerCase() === cat);
        const catTa = catObj?.labelTa.toLowerCase() || '';
        const farmerName = (p.farmer?.name || '').toLowerCase();
        const farmerLocation = (p.farmer?.location || '').toLowerCase();

        return (
          enClean.includes(query) ||
          taClean.includes(query) ||
          rawName.includes(query) ||
          desc.includes(query) ||
          cat.includes(query) ||
          catTa.includes(query) ||
          farmerName.includes(query) ||
          farmerLocation.includes(query)
        );
      });
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

      const displayName = getDisplayName(product, isTa);
      showToast(
        isTa
          ? `🛒 "${displayName}" கூடையில் சேர்க்கப்பட்டது!`
          : `🛒 "${displayName}" added to your cart!`
      );
    } catch {
      showToast(isTa ? 'கூடையில் சேர்க்க முடியவில்லை.' : 'Could not add to cart.', 'error');
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
        {/* Sleek Page Header with Language Switch */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h1 className="h4 fw-bold text-dark mb-1">
              {isTa ? '🛒 உழவர் சந்தை' : '🛒 Fresh Agricultural Marketplace'}
            </h1>
            <p className="text-muted small mb-0">
              {isTa
                ? 'நேரடியாக விவசாயிகளிடமிருந்து புதிய விளைபொருட்கள்'
                : 'Direct farm-fresh produce directly from verified farmers'}
            </p>
          </div>

          {/* Language Switch Option */}
          <div className="buyer-lang-box">
            <span className="buyer-lang-title">🌐 {isTa ? 'மொழி' : 'Language'}:</span>
            <div className="lang-switch-box">
              <button
                type="button"
                className={`lang-switch-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => toggleLanguage('en')}
              >
                English
              </button>
              <button
                type="button"
                className={`lang-switch-btn ${language === 'ta' ? 'active' : ''}`}
                onClick={() => toggleLanguage('ta')}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="buyer-controls-panel">
          <div className="row g-3 align-items-center mb-2">
            <div className="col-lg-8 col-md-7">
              <div className="buyer-search-input-wrap">
                <span className="buyer-search-icon">🔍</span>
                <input
                  type="text"
                  className="buyer-search-input"
                  placeholder={
                    isTa
                      ? 'தேடுங்கள்: தக்காளி, அரிசி, கேரட், மஞ்சள், மாம்பழம்...'
                      : 'Search organic rice, country tomatoes, carrots, turmeric...'
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="buyer-search-clear"
                    onClick={() => setSearch('')}
                    title={isTa ? 'அழி' : 'Clear search'}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="col-lg-4 col-md-5 d-flex justify-content-md-end align-items-center gap-2">
              <label className="text-muted small fw-bold text-nowrap mb-0">
                {isTa ? 'வரிசைப்படுத்து:' : 'Sort By:'}
              </label>
              <select
                className="form-select form-select-sm buyer-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">{isTa ? '✨ பரிந்துரைக்கப்பட்டவை' : '✨ Recommended'}</option>
                <option value="price-low">{isTa ? '💰 விலை: குறைந்தது முதல்' : '💰 Price: Low to High'}</option>
                <option value="price-high">{isTa ? '💎 விலை: அதிகம் முதல்' : '💎 Price: High to Low'}</option>
                <option value="stock">{isTa ? '📦 அதிக கையிருப்பு' : '📦 Highest Stock Available'}</option>
              </select>
            </div>
          </div>

          {/* Quick Search Suggestion Chips */}
          <div className="buyer-search-suggestions">
            <span className="buyer-suggestion-label">{isTa ? 'விரைவு தேடல்:' : 'Popular:'}</span>
            {(isTa
              ? ['தக்காளி', 'அரிசி', 'கேரட்', 'மஞ்சள்', 'மாம்பழம்', 'வெங்காயம்', 'மிளகு']
              : ['Tomatoes', 'Rice', 'Carrots', 'Turmeric', 'Mangoes', 'Shallots', 'Black Pepper']
            ).map((chip) => (
              <button
                key={chip}
                type="button"
                className="buyer-suggestion-chip"
                onClick={() => setSearch(chip)}
              >
                {chip}
              </button>
            ))}
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
                  <span>{isTa ? cat.labelTa : cat.labelEn}</span>
                  <span className="buyer-cat-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Meta Info */}
        <div className="buyer-results-row">
          <span className="buyer-results-count">
            {isTa ? (
              <>
                காண்பிக்கப்படுகிறது: <b>{filteredProducts.length}</b> விளைபொருட்கள்
                {selectedCategory !== 'all' && ` ("${CATEGORIES.find((c) => c.id === selectedCategory)?.labelTa || selectedCategory}")`}
                {search && ` ("${search}" உடன் பொருந்தும்)`}
              </>
            ) : (
              <>
                Showing <b>{filteredProducts.length}</b> fresh farm items
                {selectedCategory !== 'all' && ` in "${selectedCategory}"`}
                {search && ` matching "${search}"`}
              </>
            )}
          </span>

          {(selectedCategory !== 'all' || search) && (
            <button
              className="btn btn-sm btn-link text-success p-0 fw-bold text-decoration-none"
              onClick={() => {
                setSelectedCategory('all');
                setSearch('');
              }}
            >
              {isTa ? '↺ மீட்டமை' : '↺ Reset Filters'}
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status" />
            <p className="mt-3 text-muted fw-semibold">
              {isTa ? 'விளைபொருட்கள் ஏற்றப்படுகின்றன...' : 'Gathering farm-fresh produce...'}
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center my-3">
            <span>⚠️ {error}</span>
            <button className="btn btn-sm btn-outline-danger" onClick={loadProducts}>
              {isTa ? 'மீண்டும் முயற்சிக்கவும்' : 'Retry'}
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="buyer-products-grid">
            {filteredProducts.map((product) => {
              const isAdded = addedIds.has(product._id);
              const isLowStock = product.quantity <= 15;
              const displayName = getDisplayName(product, isTa);

              return (
                <article className="buyer-product-card" key={product._id}>
                  {/* Card Image */}
                  <div className="buyer-card-img-wrap">
                    <img
                      src={imageUrl(product.image, DEFAULT_PRODUCT_IMAGE)}
                      alt={displayName}
                      className="buyer-card-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                    />
                    <span className="buyer-card-cat-pill">
                      {isTa
                        ? CATEGORIES.find((c) => c.id.toLowerCase() === (product.category || '').toLowerCase())?.labelTa || product.category || 'பொருட்கள்'
                        : product.category || 'Produce'}
                    </span>
                    <span
                      className={`buyer-card-stock-pill ${isLowStock ? 'low-stock' : ''}`}
                    >
                      {product.quantity > 0
                        ? `${product.quantity} ${isTa ? 'கையிருப்பு' : 'units left'}`
                        : (isTa ? 'கையிருப்பு இல்லை' : 'Out of Stock')}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="buyer-card-body">
                    {/* Farmer Attribution */}
                    <div className="buyer-farmer-chip">
                      <span className="farmer-icon">🧑‍🌾</span>
                      <span>{isTa ? 'விவசாயி:' : 'By'} {product.farmer?.name || (isTa ? 'சரிபார்க்கப்பட்ட விவசாயி' : 'Verified Farmer')}</span>
                      {product.farmer?.location && (
                        <span className="badge text-bg-light border text-success fw-semibold ms-1" style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px' }}>
                          📍 {product.farmer.location}
                        </span>
                      )}
                      {product.farmer?.phone && (
                        <a
                          href={`tel:${product.farmer.phone}`}
                          className="buyer-farmer-phone-link"
                          title={isTa ? 'விவசாயியை அழைக்கவும்' : 'Call Farmer'}
                          onClick={(e) => e.stopPropagation()}
                        >
                          📞 {isTa ? 'அழைக்க' : 'Call'}
                        </a>
                      )}
                    </div>

                    <h3 className="buyer-card-title" title={displayName}>
                      {displayName}
                    </h3>

                    <p className="buyer-card-desc" title={product.description}>
                      {product.description || (isTa ? 'பண்ணையிலிருந்து நேரடியாக புதிய அறுவடை.' : 'Direct farm harvest packed fresh for delivery.')}
                    </p>

                    {/* Price Row */}
                    <div className="buyer-card-price-row">
                      <span className="buyer-card-price">₹{product.price}</span>
                      <span className="buyer-card-unit">/ {isTa ? 'கிலோ அல்லது அலகு' : 'kg or unit'}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="buyer-card-actions">
                      <button
                        type="button"
                        className={`buyer-btn-cart ${isAdded ? 'added' : ''}`}
                        onClick={() => handleAddToCart(product)}
                        disabled={product.quantity === 0}
                      >
                        {isAdded
                          ? (isTa ? '✓ சேர்க்கப்பட்டது' : '✓ Added')
                          : (isTa ? '🛒 சேர்' : '🛒 Add')}
                      </button>

                      <button
                        type="button"
                        className="buyer-btn-buy"
                        onClick={() => handleOpenBuyModal(product)}
                        disabled={product.quantity === 0}
                      >
                        {isTa ? '⚡ உடனே வாங்கு' : '⚡ Buy Now'}
                      </button>

                      <Link
                        to={`/products/${product._id}`}
                        className="buyer-btn-details"
                        title={isTa ? 'முழு விவரங்கள்' : 'View Full Details'}
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
                    alt={getDisplayName(buyModalItem, isTa)}
                    className="buyer-modal-thumb"
                  />
                  <div className="buyer-modal-info">
                    <h4>{getDisplayName(buyModalItem, isTa)}</h4>
                    <p className="text-success fw-bold">₹{buyModalItem.price} / {isTa ? 'அலகு' : 'unit'}</p>
                    <p>🧑‍🌾 {isTa ? 'விவசாயி' : 'Farmer'}: {buyModalItem.farmer?.name || (isTa ? 'உள்ளூர் விவசாயி' : 'Local Farmer')}</p>
                  </div>
                </div>

                <form onSubmit={handleConfirmDirectBuy}>
                  <label className="form-label fw-bold text-dark small mb-1">
                    {isTa
                      ? `அளவைத் தேர்ந்தெடுக்கவும் (அதிகபட்சம்: ${buyModalItem.quantity})`
                      : `Select Quantity (Max: ${buyModalItem.quantity} units)`}
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
                    <span className="text-muted small fw-semibold">
                      {isTa ? 'அளவுகள் / கிலோ' : 'units / kg'}
                    </span>
                  </div>

                  <div className="buyer-modal-total-row">
                    <span className="buyer-modal-total-label">
                      {isTa ? 'மொத்த தொகை:' : 'Total Payable:'}
                    </span>
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
                      {isTa ? 'ரத்து' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success w-50 py-2 fw-bold rounded-pill"
                      disabled={isSubmittingOrder}
                    >
                      {isSubmittingOrder
                        ? (isTa ? 'ஆர்டர் செய்யப்படுகிறது...' : 'Placing Order...')
                        : (isTa ? 'ஆர்டரை உறுதிசெய் →' : 'Confirm Order →')}
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
