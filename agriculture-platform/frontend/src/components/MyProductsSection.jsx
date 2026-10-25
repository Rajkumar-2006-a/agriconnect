import React, { useState, useEffect, useMemo, useRef } from 'react';
import api, { imageUrl } from '../services/api';
import {
  LeafIcon,
  PlusIcon,
  SearchIcon,
  BoxIcon,
  LayersIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  UploadCloudIcon,
  CloseIcon,
  CheckIcon,
  MoreVerticalIcon,
  SproutIcon,
  FlaskIcon,
  ZapIcon,
  ChevronRightIcon,
  ClipboardIcon,
  TractorIcon,
  UsersIcon,
  FarmerBannerIllustration,
  FertilizerIcon
} from './FarmerIcons';

const CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Seeds',
  'Fertilizer',
  'Pesticide',
  'Grains',
  'Other'
];

const emptyFormData = {
  productName: '',
  productNameTa: '',
  category: 'Fruits',
  description: '',
  price: '',
  quantity: '',
  sellerPhone: '',
  image: null,
  imagePreview: null
};

// Animated Number Counter (~800ms ease-out)
function AnimatedCount({ end, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = Number(end) || 0;
    if (target === 0) {
      setCount(0);
      return;
    }
    const duration = 800;
    const startTime = performance.now();
    let frameId;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [end]);

  return <>{prefix}{count.toLocaleString('en-IN')}{suffix}</>;
}

// Fallback Category Icon for Products without image
function CategoryFallbackIcon({ category }) {
  const cat = (category || '').toLowerCase();
  let className = 'product-cat-fallback cat-default';
  let IconComponent = LeafIcon;

  if (cat.includes('fruit')) {
    className = 'product-cat-fallback cat-fruits';
    IconComponent = LeafIcon;
  } else if (cat.includes('seed')) {
    className = 'product-cat-fallback cat-seeds';
    IconComponent = SproutIcon;
  } else if (cat.includes('fertilizer') || cat.includes('compost')) {
    className = 'product-cat-fallback cat-fertilizer';
    IconComponent = BoxIcon;
  } else if (cat.includes('pesticide')) {
    className = 'product-cat-fallback cat-pesticide';
    IconComponent = FlaskIcon;
  } else if (cat.includes('veg')) {
    className = 'product-cat-fallback cat-vegetables';
    IconComponent = LeafIcon;
  }

  return (
    <div className={className}>
      <IconComponent size={32} />
    </div>
  );
}

// Unit helper
function getProductUnit(product) {
  if (product.unit) return product.unit;
  const name = (product.productName || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();
  if (name.includes('fertilizer') || name.includes('compost') || cat.includes('fertilizer')) return 'bag';
  if (name.includes('pesticide') || cat.includes('pesticide')) return 'bottle';
  if (name.includes('seed') || cat.includes('seed')) return '10kg';
  if (cat.includes('fruit') || cat.includes('vegetable')) return 'kg';
  return 'kg';
}

// Category Pill Class
function getCategoryPillClass(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('fruit')) return 'flipkart-category-pill pill-fruits';
  if (cat.includes('seed')) return 'flipkart-category-pill pill-seeds';
  if (cat.includes('fertilizer') || cat.includes('compost')) return 'flipkart-category-pill pill-fertilizer';
  if (cat.includes('pesticide')) return 'flipkart-category-pill pill-pesticide';
  if (cat.includes('veg')) return 'flipkart-category-pill pill-vegetables';
  return 'flipkart-category-pill pill-default';
}

export default function MyProductsSection({
  products,
  orders,
  user,
  onProductChange,
  setUser,
  onNavigateSection
}) {
  // Search and filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' by default

  // Slide-over panel states
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState('add');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    ...emptyFormData,
    sellerPhone: user?.phone || ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View details modal
  const [viewProduct, setViewProduct] = useState(null);

  // Animation helpers
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isPanelOpen) closePanel();
        if (viewProduct) setViewProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, viewProduct]);

  const safeProducts = Array.isArray(products) ? products : [];

  // Derived Statistics
  const totalProducts = safeProducts.length;
  const totalStock = useMemo(() => {
    return safeProducts.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
  }, [safeProducts]);
  const totalOrders = orders?.length || 0;

  // Filtered Products List
  const filteredProducts = useMemo(() => {
    return safeProducts.filter((item) => {
      const matchesSearch = !search.trim() ||
        (item.productName && item.productName.toLowerCase().includes(search.toLowerCase().trim()));

      const matchesCat = selectedCategory === 'All' ||
        (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());

      const qty = Number(item.quantity) || 0;
      const isSold = item.isSold === true;
      let status = 'Available';
      if (isSold || qty === 0) status = 'Out of Stock';
      else if (qty <= 5) status = 'Low Stock';

      const matchesStock = selectedStockStatus === 'All' || status === selectedStockStatus;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [safeProducts, search, selectedCategory, selectedStockStatus]);

  // Handlers for Add/Edit
  const handleOpenAdd = () => {
    setPanelMode('add');
    setEditingId(null);
    setFormData({
      ...emptyFormData,
      sellerPhone: user?.phone || ''
    });
    setFormErrors({});
    setIsPanelOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setPanelMode('edit');
    setEditingId(prod._id);
    setFormData({
      productName: prod.productName || '',
      productNameTa: prod.productNameTa || '',
      category: prod.category || 'Fruits',
      description: prod.description || '',
      price: prod.price !== undefined ? String(prod.price) : '',
      quantity: prod.quantity !== undefined ? String(prod.quantity) : '',
      sellerPhone: prod.sellerPhone || prod.farmer?.phone || user?.phone || '',
      image: null,
      imagePreview: prod.image ? imageUrl(prod.image) : null
    });
    setFormErrors({});
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setFormData({
      ...emptyFormData,
      sellerPhone: user?.phone || ''
    });
    setFormErrors({});
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|jpg|webp)$/)) {
      setFormErrors((prev) => ({
        ...prev,
        image: 'Please upload a valid JPG or PNG image.'
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        image: 'File size exceeds 5MB limit.'
      }));
      return;
    }

    setFormErrors((prev) => {
      const copy = { ...prev };
      delete copy.image;
      return copy;
    });

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      image: file,
      imagePreview: previewUrl
    }));
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.productName.trim()) {
      errs.productName = 'Product name is required.';
    }
    if (!formData.category) {
      errs.category = 'Please select a category.';
    }
    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      errs.price = 'Enter a valid price (>= 0).';
    }
    if (formData.quantity === '' || isNaN(formData.quantity) || Number(formData.quantity) < 0) {
      errs.quantity = 'Enter a valid quantity (>= 0).';
    }
    if (!formData.sellerPhone.trim()) {
      errs.sellerPhone = 'Seller phone number is required.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('productName', formData.productName.trim());
      if (formData.productNameTa?.trim()) {
        payload.append('productNameTa', formData.productNameTa.trim());
      }
      payload.append('category', formData.category);
      payload.append('description', formData.description.trim());
      payload.append('price', formData.price);
      payload.append('quantity', formData.quantity);
      payload.append('sellerPhone', formData.sellerPhone.trim());

      if (formData.image instanceof File) {
        payload.append('image', formData.image);
      }

      if (panelMode === 'add') {
        await api.post('/products', payload);
        showToast('Product listed');
      } else {
        await api.put(`/products/${editingId}`, payload);
        showToast('Changes saved');
      }

      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data?.user && setUser) {
          setUser(meRes.data.user);
          localStorage.user = JSON.stringify(meRes.data.user);
        }
      } catch {
        // profile sync
      }

      closePanel();
      if (onProductChange) await onProductChange();
    } catch (err) {
      setFormErrors({
        submit: err.response?.data?.message || 'Unable to save product. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmed) return;

    try {
      await api.delete(`/products/${id}`);
      showToast('Product deleted');
      if (onProductChange) await onProductChange();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="farmer-marketplace-wrapper">
      {/* 1. Header Row */}
      <div className="farmer-content-header-row">
        <div className="header-left-title-box">
          <div className="header-leaf-emblem">
            <LeafIcon size={26} />
          </div>
          <div>
            <h1>My Products</h1>
            <p>Manage your products and grow your business</p>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary-green"
          onClick={handleOpenAdd}
        >
          <PlusIcon size={17} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* 2. Top 3 Stat Cards */}
      <div className="marketplace-stat-cards">
        {/* Total Products */}
        <div className="marketplace-stat-card">
          <div className="stat-card-left">
            <div className="stat-icon-circle stat-icon-green">
              <BoxIcon size={24} />
            </div>
            <div className="stat-card-text">
              <span className="stat-card-title">Total Products</span>
              <span className="stat-card-value">
                <AnimatedCount end={totalProducts} />
              </span>
            </div>
          </div>
          <span className="stat-card-arrow">›</span>
        </div>

        {/* Total Stock */}
        <div className="marketplace-stat-card">
          <div className="stat-card-left">
            <div className="stat-icon-circle stat-icon-blue">
              <LayersIcon size={24} />
            </div>
            <div className="stat-card-text">
              <span className="stat-card-title">Total Stock</span>
              <span className="stat-card-value">
                <AnimatedCount end={totalStock} />
              </span>
            </div>
          </div>
          <span className="stat-card-arrow">›</span>
        </div>

        {/* Total Orders */}
        <div className="marketplace-stat-card">
          <div className="stat-card-left">
            <div className="stat-icon-circle stat-icon-orange">
              <ClipboardIcon size={24} />
            </div>
            <div className="stat-card-text">
              <span className="stat-card-title">Total Orders</span>
              <span className="stat-card-value">
                <AnimatedCount end={totalOrders} />
              </span>
            </div>
          </div>
          <span className="stat-card-arrow">›</span>
        </div>
      </div>

      {/* 3. Main Two-Column Grid */}
      <div className="marketplace-content-grid">
        {/* Left Column: Product Listings */}
        <div className="marketplace-products-column">
          <div className="products-column-head">
            <h2>My Listed Products</h2>
            <span className="products-column-count">
              Showing {filteredProducts.length} of {products.length} {products.length === 1 ? 'product' : 'products'}
            </span>
          </div>

          {/* Filter Bar */}
          <div className="marketplace-filter-row">
            <div className="search-filter-box">
              <SearchIcon size={16} className="search-filter-icon" />
              <input
                type="text"
                className="search-filter-input"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="search-filter-clear"
                  onClick={() => setSearch('')}
                >
                  ×
                </button>
              )}
            </div>

            <div className="select-filter-box">
              <select
                className="select-filter-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-filter-box">
              <select
                className="select-filter-input"
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
              >
                <option value="All">All Stock Status</option>
                <option value="Available">Available</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div className="view-mode-toggle-group">
              <button
                type="button"
                className={`btn-view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
                aria-label="Grid View"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                <span>Grid</span>
              </button>
              <button
                type="button"
                className={`btn-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
                aria-label="List View"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                <span>List</span>
              </button>
            </div>
          </div>

          {/* Product Cards: Responsive Grid or List */}
          {filteredProducts.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="marketplace-card-grid">
                {filteredProducts.map((item) => {
                  const qty = Number(item.quantity) || 0;
                  const isSold = item.isSold === true;
                  let status = 'Available';
                  let dotClass = 'status-pill-dot dot-available';
                  let statusTextClass = 'text-status-available';

                  if (isSold || qty === 0) {
                    status = 'Out of Stock';
                    dotClass = 'status-pill-dot dot-out-of-stock';
                    statusTextClass = 'text-status-out-of-stock';
                  } else if (qty <= 5) {
                    status = 'Low Stock';
                    dotClass = 'status-pill-dot dot-low-stock';
                    statusTextClass = 'text-status-low-stock';
                  }

                  const displayLocation = item.location || user?.location || 'Tamil Nadu';
                  const displayPhone = item.sellerPhone || item.farmer?.phone || user?.phone || '6380532229';
                  const unit = getProductUnit(item);

                  return (
                    <div key={item._id} className="product-grid-card">
                      <div className="grid-card-thumb-wrap">
                        {item.image ? (
                          <img
                            src={imageUrl(item.image)}
                            alt={item.productName}
                            className="grid-card-thumb-img"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <CategoryFallbackIcon category={item.category} />
                        )}
                        <span className="grid-card-cat-badge">
                          <LeafIcon size={11} />
                          <span>{item.category || 'Vegetables'}</span>
                        </span>
                        <span className={`grid-card-status-badge ${statusTextClass}`}>
                          <span className={dotClass} />
                          <span>{status}</span>
                        </span>
                      </div>

                      <div className="grid-card-body">
                        <div className="grid-card-title-line">
                          <h3 className="grid-card-title" title={item.productName}>
                            {item.productName}
                          </h3>
                          <button
                            type="button"
                            className="card-more-menu-btn"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit product"
                          >
                            <MoreVerticalIcon size={16} />
                          </button>
                        </div>

                        <div className="grid-card-price-line">
                          <span className="grid-price-amount">
                            ₹ {Number(item.price).toLocaleString('en-IN')}
                          </span>
                          <span className="grid-price-unit">/ {unit}</span>
                        </div>

                        <div className="grid-card-meta-box">
                          <div className="grid-meta-row">
                            <BoxIcon size={13} className="meta-icon" />
                            <span>Stock: <b>{item.quantity}</b></span>
                          </div>
                          <div className="grid-meta-row">
                            <MapPinIcon size={13} className="meta-icon" />
                            <span className="text-truncate">{displayLocation}</span>
                          </div>
                          <div className="grid-meta-row">
                            <PhoneIcon size={13} className="meta-icon" />
                            <span>{displayPhone}</span>
                          </div>
                        </div>

                        <div className="grid-card-actions">
                          <button
                            type="button"
                            className="btn-fk-action btn-fk-view"
                            onClick={() => setViewProduct(item)}
                          >
                            <EyeIcon size={13} />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            className="btn-fk-action btn-fk-edit"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <EditIcon size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="btn-fk-action btn-fk-delete"
                            onClick={() => handleDeleteProduct(item._id, item.productName)}
                          >
                            <TrashIcon size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="marketplace-card-list">
                {filteredProducts.map((item) => {
                  const qty = Number(item.quantity) || 0;
                  const isSold = item.isSold === true;
                  let status = 'Available';
                  let dotClass = 'status-pill-dot dot-available';
                  let statusTextClass = 'text-status-available';

                  if (isSold || qty === 0) {
                    status = 'Out of Stock';
                    dotClass = 'status-pill-dot dot-out-of-stock';
                    statusTextClass = 'text-status-out-of-stock';
                  } else if (qty <= 5) {
                    status = 'Low Stock';
                    dotClass = 'status-pill-dot dot-low-stock';
                    statusTextClass = 'text-status-low-stock';
                  }

                  const displayLocation = item.location || user?.location || 'Tamil Nadu';
                  const displayPhone = item.sellerPhone || item.farmer?.phone || user?.phone || '6380532229';
                  const unit = getProductUnit(item);

                  return (
                    <div key={item._id} className="flipkart-product-card">
                      <div className="flipkart-card-thumb-wrap">
                        {item.image ? (
                          <img
                            src={imageUrl(item.image)}
                            alt={item.productName}
                            className="flipkart-card-thumb-img"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <CategoryFallbackIcon category={item.category} />
                        )}
                      </div>

                      <div className="flipkart-card-body">
                        <div>
                          <div className="card-title-line">
                            <h3 className="flipkart-card-title">{item.productName}</h3>
                            <button
                              type="button"
                              className="card-more-menu-btn"
                              onClick={() => handleOpenEdit(item)}
                              title="Edit product"
                            >
                              <MoreVerticalIcon size={16} />
                            </button>
                          </div>

                          <div className={getCategoryPillClass(item.category)}>
                            <LeafIcon size={12} />
                            <span>{item.category || 'Fruits'}</span>
                          </div>

                          <div className="flipkart-price-line">
                            ₹ {Number(item.price).toLocaleString('en-IN')}{' '}
                            <span className="flipkart-price-unit">/ {unit}</span>
                          </div>

                          <div className="flipkart-meta-row">
                            <span className="meta-item">
                              <BoxIcon size={13} className="meta-icon" />
                              <span>Stock: {item.quantity}</span>
                            </span>

                            <span className="meta-item">
                              <span className={dotClass} />
                              <span className={statusTextClass}>{status}</span>
                            </span>

                            <span className="meta-item">
                              <MapPinIcon size={13} className="meta-icon" />
                              <span>{displayLocation}</span>
                            </span>

                            <span className="meta-item">
                              <PhoneIcon size={13} className="meta-icon" />
                              <span>{displayPhone}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flipkart-action-row">
                          <button
                            type="button"
                            className="btn-fk-action btn-fk-view"
                            onClick={() => setViewProduct(item)}
                          >
                            <EyeIcon size={13} />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            className="btn-fk-action btn-fk-edit"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <EditIcon size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            className="btn-fk-action btn-fk-delete"
                            onClick={() => handleDeleteProduct(item._id, item.productName)}
                          >
                            <TrashIcon size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
              <div className="marketplace-empty-box">
                <div className="empty-icon-wrap">
                  <LeafIcon size={26} />
                </div>
                {search || selectedCategory !== 'All' || selectedStockStatus !== 'All' ? (
                  <>
                    <h3>No products match your search</h3>
                    <p>Try clearing your filters to view all products.</p>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success px-3"
                      onClick={() => {
                        setSearch('');
                        setSelectedCategory('All');
                        setSelectedStockStatus('All');
                      }}
                    >
                      Clear Filters
                    </button>
                  </>
                ) : (
                  <>
                    <h3>No products listed yet</h3>
                    <p>Click "Add New Product" to list your fresh crops and farm products.</p>
                    <button
                      type="button"
                      className="btn-primary-green"
                      style={{ margin: '0 auto' }}
                      onClick={handleOpenAdd}
                    >
                      <PlusIcon size={16} />
                      <span>Add New Product</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

        {/* Right Column: Quick Actions & Promo Banner */}
        <div className="marketplace-sidebar-column">
          {/* Quick Actions Card */}
          <div className="quick-actions-card">
            <h3 className="quick-actions-card-title">
              <ZapIcon size={18} />
              <span>Quick Actions</span>
            </h3>

            <div className="quick-action-list">
              <button
                type="button"
                className="quick-action-primary-btn"
                onClick={handleOpenAdd}
              >
                <span>+ Add New Product</span>
                <ChevronRightIcon size={16} />
              </button>

              <button
                type="button"
                className="quick-action-item-btn"
                onClick={() => onNavigateSection && onNavigateSection('orders')}
              >
                <div className="action-btn-left">
                  <ClipboardIcon size={16} />
                  <span>Manage Orders</span>
                </div>
                <ChevronRightIcon size={16} />
              </button>

              <button
                type="button"
                className="quick-action-item-btn"
                onClick={() => onNavigateSection && onNavigateSection('equipment')}
              >
                <div className="action-btn-left">
                  <TractorIcon size={16} />
                  <span>Rent Equipment</span>
                </div>
                <ChevronRightIcon size={16} />
              </button>

              <button
                type="button"
                className="quick-action-item-btn"
                onClick={() => onNavigateSection && onNavigateSection('collaboration')}
              >
                <div className="action-btn-left">
                  <UsersIcon size={16} />
                  <span>Find Collaboration</span>
                </div>
                <ChevronRightIcon size={16} />
              </button>

              <button
                type="button"
                className="quick-action-item-btn"
                style={{ background: '#f0fdf4', borderColor: '#86efac' }}
                onClick={() => onNavigateSection && onNavigateSection('fertilizers')}
              >
                <div className="action-btn-left">
                  <FertilizerIcon size={16} />
                  <span style={{ fontWeight: 700, color: '#166534' }}>Fertilizer Prices</span>
                </div>
                <ChevronRightIcon size={16} />
              </button>
            </div>
          </div>

          {/* "Better Farming Better Tomorrow" Promo Banner */}
          <div className="farming-promo-banner-card">
            <div className="promo-banner-text-box">
              <h4 className="promo-banner-title">
                Better Farming<br />Better Tomorrow
              </h4>
              <p className="promo-banner-sub">Connect · Trade · Grow</p>
            </div>
            <FarmerBannerIllustration />
          </div>
        </div>
      </div>

      {/* Slide-Over Add / Edit Panel */}
      {isPanelOpen && (
        <>
          <div className="slideover-scrim" onClick={closePanel} />
          <aside
            className="slideover-panel"
            role="dialog"
            aria-modal="true"
            aria-label={panelMode === 'add' ? 'Add New Product' : 'Edit Product'}
          >
            <div className="slideover-header">
              <h2>{panelMode === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
              <button
                type="button"
                className="slideover-close-btn"
                onClick={closePanel}
                aria-label="Close"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <form className="slideover-body" onSubmit={handleSubmitForm}>
              {formErrors.submit && (
                <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: 13 }}>
                  {formErrors.submit}
                </div>
              )}

              <div className="form-field-group">
                <label className="form-field-label">
                  Product Name<span className="label-req">*</span>
                </label>
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="Enter product name (e.g. Fresh Tomatoes)"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  required
                />
                {formErrors.productName && (
                  <p className="form-field-error">{formErrors.productName}</p>
                )}
              </div>

              <div className="form-field-group">
                <label className="form-field-label">
                  Tamil Name (தமிழ் பெயர்) <span className="text-muted small fw-normal">(Optional / விருப்பத்தேர்வு)</span>
                </label>
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="உதா: நாட்டு தக்காளி (Leave empty to auto-translate)"
                  value={formData.productNameTa}
                  onChange={(e) => setFormData({ ...formData, productNameTa: e.target.value })}
                />
                <span className="small text-muted">
                  💡 Automatic: If left blank, AgriConnect will auto-translate it to Tamil for buyers!
                </span>
              </div>

              <div className="form-field-group">
                <label className="form-field-label">
                  Category<span className="label-req">*</span>
                </label>
                <select
                  className="form-select-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="form-field-error">{formErrors.category}</p>
                )}
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter product description and quality details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-field-group form-2col-row">
                <div>
                  <label className="form-field-label">
                    Price (₹)<span className="label-req">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="form-input-text"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                  {formErrors.price && (
                    <p className="form-field-error">{formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="form-field-label">
                    Quantity<span className="label-req">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-input-text"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                  {formErrors.quantity && (
                    <p className="form-field-error">{formErrors.quantity}</p>
                  )}
                </div>
              </div>

              <div className="form-field-group">
                <label className="form-field-label">
                  Seller Phone Number<span className="label-req">*</span>
                </label>
                <input
                  type="tel"
                  className="form-input-text"
                  placeholder="Enter contact phone number"
                  value={formData.sellerPhone}
                  onChange={(e) => setFormData({ ...formData, sellerPhone: e.target.value })}
                  required
                />
                {formErrors.sellerPhone && (
                  <p className="form-field-error">{formErrors.sellerPhone}</p>
                )}
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Product Photo</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                <div
                  className="image-upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  {formData.imagePreview ? (
                    <div className="dropzone-preview-wrap">
                      <img
                        src={formData.imagePreview}
                        alt="Product preview"
                        className="dropzone-preview-img"
                      />
                      <div className="dropzone-change-overlay">
                        Click to change photo
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ color: '#16803C', marginBottom: 6 }}>
                        <UploadCloudIcon size={32} />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#173B2A', margin: 0 }}>
                        Click to upload or drag and drop
                      </p>
                      <p style={{ fontSize: 11, color: '#6B7C72', margin: 0 }}>
                        JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>
                {formErrors.image && (
                  <p className="form-field-error">{formErrors.image}</p>
                )}
              </div>

              <div className="slideover-footer">
                <button
                  type="button"
                  className="btn-slideover-cancel"
                  onClick={closePanel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-slideover-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Saving...'
                    : panelMode === 'add'
                    ? 'List Product'
                    : 'Save Changes'}
                </button>
              </div>
            </form>
          </aside>
        </>
      )}

      {/* View Details Modal */}
      {viewProduct && (
        <div
          className="details-modal-scrim"
          onClick={() => setViewProduct(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="details-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="details-modal-image-wrap">
              {viewProduct.image ? (
                <img
                  src={imageUrl(viewProduct.image)}
                  alt={viewProduct.productName}
                  className="details-modal-img"
                />
              ) : (
                <CategoryFallbackIcon category={viewProduct.category} />
              )}
              <button
                type="button"
                className="details-modal-close-btn"
                onClick={() => setViewProduct(null)}
                aria-label="Close"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="details-modal-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className={getCategoryPillClass(viewProduct.category)}>
                  🍃 {viewProduct.category}
                </span>
                <span className="badge bg-success-subtle text-success border border-success-subtle">
                  {viewProduct.quantity > 5 ? 'Available' : viewProduct.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                </span>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '8px 0 4px', color: '#173B2A' }}>
                {viewProduct.productName}
              </h2>

              <p style={{ fontSize: 20, fontWeight: 700, color: '#16803C', margin: '4px 0 14px' }}>
                ₹ {Number(viewProduct.price).toLocaleString('en-IN')}{' '}
                <span style={{ fontSize: 12.5, color: '#6B7C72', fontWeight: 500 }}>
                  / {getProductUnit(viewProduct)}
                </span>
              </p>

              <div className="details-meta-grid">
                <div className="details-meta-item">
                  <small>Available Stock</small>
                  <b>{viewProduct.quantity} units</b>
                </div>
                <div className="details-meta-item">
                  <small>Location</small>
                  <b>{viewProduct.location || user?.location || 'Tamil Nadu'}</b>
                </div>
                <div className="details-meta-item">
                  <small>Seller Phone</small>
                  <b>{viewProduct.sellerPhone || viewProduct.farmer?.phone || user?.phone}</b>
                </div>
                <div className="details-meta-item">
                  <small>Listed Farmer</small>
                  <b>{viewProduct.farmer?.name || user?.name}</b>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#6B7C72', fontWeight: 600, marginBottom: 5 }}>
                  Description
                </h4>
                <p style={{ fontSize: 13.5, color: '#173B2A', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {viewProduct.description || 'No detailed description provided.'}
                </p>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-3"
                  onClick={() => setViewProduct(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-sm px-3"
                  onClick={() => {
                    const p = viewProduct;
                    setViewProduct(null);
                    handleOpenEdit(p);
                  }}
                >
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Springy Toast Notification */}
      {toastMessage && (
        <div className="agri-spring-toast" role="status" aria-live="polite">
          <CheckIcon size={17} className="toast-check-icon" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
