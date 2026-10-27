import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { imageUrl, DEFAULT_PRODUCT_IMAGE, DEFAULT_EQUIPMENT_IMAGE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './DetailPages.css';

const Photo = ({ src, alt, type = 'product' }) => {
  const [hasError, setHasError] = useState(false);
  const fallback = type === 'equipment' ? DEFAULT_EQUIPMENT_IMAGE : DEFAULT_PRODUCT_IMAGE;

  if (!src && hasError) {
    return (
      <div className="detail-photo detail-photo-empty">
        <span style={{ fontSize: '4.5rem' }}>{type === 'equipment' ? '🚜' : '🌾'}</span>
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
          {type === 'equipment' ? 'Agricultural Machinery' : 'Farm Fresh Harvest'}
        </span>
      </div>
    );
  }

  return (
    <img
      className="detail-photo"
      src={imageUrl(src, fallback)}
      alt={alt}
      onError={(e) => {
        if (!hasError) {
          setHasError(true);
          e.currentTarget.src = fallback;
        }
      }}
    />
  );
};

export function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`).then((response) => setProduct(response.data));
  }, [id]);

  if (!product) {
    return (
      <main className="detail-page-wrapper">
        <div className="container py-5 text-center">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-3 text-muted">Loading product details...</p>
        </div>
      </main>
    );
  }

  const addToCart = () => {
    if (user && user.role !== 'buyer') {
      alert('Only Buyer accounts can purchase produce. Please log in with a Buyer account.');
      return;
    }
    const cart = JSON.parse(localStorage.cart || '[]');
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      existing.cartQuantity = (existing.cartQuantity || 50) + 10;
    } else {
      cart.push({ ...product, cartQuantity: 50 });
    }
    localStorage.cart = JSON.stringify(cart);
    window.dispatchEvent(new Event('cartUpdated'));
    alert(`Added 50 kg of "${product.productName}" to your cart (Minimum order is 50 kg)`);
  };

  return (
    <main className="detail-page-wrapper">
      <div className="container-fluid px-3 px-md-4 py-4">
        <div className="mb-4">
          <Link className="detail-back-btn" to="/products">
            ← Back to Marketplace
          </Link>
        </div>

        <div className="detail-card-container">
          <div className="row g-4 align-items-start">
            <div className="col-lg-6">
              <div className="detail-image-box">
                <Photo src={product.image} alt={product.productName} />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="detail-info-pane">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                  <span className="detail-category-tag">{product.category || 'Agricultural Produce'}</span>
                  <span className="detail-location-tag">Stock: {product.quantity} units available</span>
                </div>

                <h1 className="detail-title">{product.productName}</h1>

                <div className="detail-price-banner">
                  <div className="detail-price-val">Rs. {product.price}</div>
                  <span className="detail-price-unit">/ unit</span>
                </div>

                {product.description && (
                  <div className="detail-desc-box">
                    <h4 className="detail-subhead">Produce Description</h4>
                    <p className="detail-description">{product.description}</p>
                  </div>
                )}

                <div className="detail-contact-card">
                  <div className="detail-contact-header">
                    <span className="detail-avatar-icon">🌾</span>
                    <div>
                      <small className="detail-contact-label">Farmer / Seller</small>
                      <h4 className="detail-contact-name">{product.farmer?.name || 'Verified Farmer'}</h4>
                    </div>
                  </div>
                  {product.farmer?.location && (
                    <div className="mb-2 text-success fw-semibold small">
                      📍 Farm Location: {product.farmer.location}
                    </div>
                  )}
                  {product.farmer?.phone && (
                    <a className="detail-phone-link" href={`tel:${product.farmer.phone}`}>
                      📞 Contact: {product.farmer.phone}
                    </a>
                  )}
                </div>

                {user?.role === 'buyer' && (
                  <button className="btn btn-success py-2 px-4 fw-bold detail-submit-btn" onClick={addToCart}>
                    🛒 Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function EquipmentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState(null);
  const [acres, setAcres] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api.get(`/equipment/${id}`).then((response) => setEquipment(response.data));
  }, [id]);

  if (!equipment) {
    return (
      <main className="detail-page-wrapper">
        <div className="container py-5 text-center">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-3 text-muted">Loading machinery details...</p>
        </div>
      </main>
    );
  }

  const requestRental = async (event) => {
    event.preventDefault();
    try {
      await api.post('/rentals', { equipment: equipment._id, acres });
      setAcres('');
      setNotice('Rental request sent. The equipment owner can now review it in their dashboard.');
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to send rental request.');
    }
  };

  return (
    <main className="detail-page-wrapper">
      <div className="container py-4">
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <Link className="detail-back-btn" to="/equipment">
            ← Back to Equipment Catalog
          </Link>
          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold">
            🚜 AgriConnect Machinery Rental
          </span>
        </div>

        <div className="detail-card-container">
          <div className="row g-4 align-items-start">
            {/* Left Column: Photo & Attachments */}
            <div className="col-lg-6">
              <div className="detail-image-box">
                <Photo src={equipment.image} alt={equipment.equipmentName} />
                <span className={`detail-status-pill ${equipment.availability ? 'available' : 'unavailable'}`}>
                  {equipment.availability ? '● Available for Rent' : '● Currently Booked'}
                </span>
              </div>

              {equipment.attachments?.length > 0 && (
                <section className="detail-attachments-box mt-4">
                  <h3 className="detail-section-title">Included Tractor Implements / Attachments</h3>
                  <div className="row g-2 mt-2">
                    {equipment.attachments.map((attachment, index) => (
                      <div className="col-sm-6" key={`${attachment.name}-${index}`}>
                        <div className="detail-attachment-item">
                          <b>{attachment.name}</b>
                          {attachment.image && (
                            <img
                              className="detail-attachment-img mt-2"
                              src={imageUrl(attachment.image)}
                              alt={attachment.name}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Information & Booking */}
            <div className="col-lg-6">
              <div className="detail-info-pane">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                  <span className="detail-category-tag">{equipment.category || 'Agricultural Machinery'}</span>
                  <span className="detail-location-tag">📍 {equipment.location}</span>
                </div>

                <h1 className="detail-title">{equipment.equipmentName}</h1>

                <div className="detail-price-banner">
                  <div className="detail-price-val">Rs. {equipment.rentalPrice}</div>
                  <span className="detail-price-unit">/ hour</span>
                </div>

                {equipment.description && (
                  <div className="detail-desc-box">
                    <h4 className="detail-subhead">Machinery Description</h4>
                    <p className="detail-description">{equipment.description}</p>
                  </div>
                )}

                {/* Owner Card */}
                <div className="detail-contact-card">
                  <div className="detail-contact-header">
                    <span className="detail-avatar-icon">👤</span>
                    <div>
                      <small className="detail-contact-label">Equipment Owner</small>
                      <h4 className="detail-contact-name">{equipment.owner?.name || 'Verified Owner'}</h4>
                    </div>
                  </div>
                  {equipment.owner?.location && (
                    <div className="mb-2 text-success fw-semibold small">
                      📍 Owner Base: {equipment.owner.location}
                    </div>
                  )}
                  {equipment.owner?.phone ? (
                    <a className="detail-phone-link" href={`tel:${equipment.owner.phone}`}>
                      📞 Call Owner: {equipment.owner.phone}
                    </a>
                  ) : (
                    <span className="text-muted small">Phone not publicly provided</span>
                  )}
                </div>

                {/* Booking Request Box */}
                {user?.role === 'farmer' && (
                  <form className="detail-booking-card" onSubmit={requestRental}>
                    <h3 className="detail-booking-title">🚜 Book this machinery</h3>
                    <p className="detail-booking-desc">
                      Enter the required farm area to send a rental request directly to the owner.
                    </p>
                    <label className="form-label fw-bold small text-success">Farm area (acres)</label>
                    <div className="input-group mb-2">
                      <input
                        className="form-control"
                        required
                        min="0.01"
                        step="0.01"
                        type="number"
                        placeholder="e.g. 2.5"
                        value={acres}
                        onChange={(event) => setAcres(event.target.value)}
                      />
                      <span className="input-group-text bg-white text-muted">acres</span>
                    </div>
                    <small className="text-muted d-block mb-3">
                      The owner will be notified in their dashboard to confirm your request.
                    </small>

                    <button
                      className="btn btn-success w-100 py-2 fw-bold detail-submit-btn"
                      disabled={!equipment.availability}
                    >
                      {equipment.availability ? 'Send Booking Request →' : 'Currently Unavailable'}
                    </button>
                    {!equipment.availability && (
                      <small className="text-danger d-block mt-2 text-center">
                        This machinery is marked unavailable right now.
                      </small>
                    )}
                  </form>
                )}

                {user && user.role !== 'farmer' && (
                  <div className="alert alert-light border mt-3 text-muted small" style={{ borderRadius: 12 }}>
                    ℹ️ You are signed in as a {user.role}. Sign in as a farmer to request equipment rentals.
                  </div>
                )}

                {!user && (
                  <div className="alert alert-light border mt-3 text-muted small" style={{ borderRadius: 12 }}>
                    Please <Link to="/login" className="text-success fw-bold">Sign In</Link> as a farmer to book this equipment.
                  </div>
                )}

                {notice && (
                  <div
                    className={notice.startsWith('Rental request sent') ? 'alert alert-success mt-3' : 'alert alert-danger mt-3'}
                    style={{ borderRadius: 12 }}
                  >
                    {notice}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
