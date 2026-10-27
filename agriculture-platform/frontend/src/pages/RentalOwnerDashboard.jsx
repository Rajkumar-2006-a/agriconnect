import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { imageUrl, DEFAULT_EQUIPMENT_IMAGE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TAMIL_NADU_DISTRICTS } from '../constants/tamilNaduLocations';
import BinaryOrbits from '../components/BinaryOrbits';
import './RentalOwnerDashboard.css';

const blank = {
  equipmentName: '',
  category: '',
  description: '',
  rentalPrice: '',
  location: '',
  ownerPhone: '',
  availability: true,
  image: null,
  existingImage: null,
  attachments: []
};

export default function RentalOwnerDashboard() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('overview');
  const [equipment, setEquipment] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [form, setForm] = useState({ ...blank, ownerPhone: user?.phone || '' });
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      const [items, requests] = await Promise.all([
        api.get('/equipment'),
        api.get('/rentals')
      ]);
      setEquipment(items.data.filter((item) => item.owner?._id === user?.id || item.owner === user?.id));
      setRentals(requests.data || []);
    } catch {
      setNotice('Unable to load your equipment dashboard.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const change = (key) => (event) => {
    setForm({
      ...form,
      [key]: key === 'availability' ? event.target.checked : event.target.value
    });
  };

  const handleAddNew = () => {
    setEditingId(null);
    setForm({ ...blank, ownerPhone: user?.phone || '' });
    setSection('add');
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      equipmentName: item.equipmentName || '',
      category: item.category || '',
      description: item.description || '',
      rentalPrice: item.rentalPrice !== undefined ? String(item.rentalPrice) : '',
      location: item.location || '',
      ownerPhone: item.ownerPhone || user?.phone || '',
      availability: item.availability !== false,
      image: null,
      existingImage: item.image,
      attachments: item.attachments || []
    });
    setSection('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...blank, ownerPhone: user?.phone || '' });
    setSection('equipment');
  };

  const publish = async (event) => {
    event.preventDefault();
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (!['attachments', 'image', 'existingImage'].includes(key) && value !== null && value !== '') {
          data.append(key, value);
        }
      });
      if (form.image) {
        data.append('image', form.image);
      }
      const attachments = (form.attachments || []).filter((item) => item.name && item.name.trim());
      data.append('attachmentNames', JSON.stringify(attachments.map((item) => item.name.trim())));
      attachments.forEach((item) => {
        if (item.image && typeof item.image !== 'string') {
          data.append('attachmentImages', item.image);
        }
      });

      if (editingId) {
        await api.put(`/equipment/${editingId}`, data);
        setNotice('Equipment listing updated successfully.');
      } else {
        await api.post('/equipment', data);
        setNotice('Equipment published successfully.');
      }

      const profile = await api.get('/auth/me');
      setUser(profile.data.user);
      localStorage.user = JSON.stringify(profile.data.user);
      setForm({ ...blank, ownerPhone: profile.data.user.phone || '' });
      setEditingId(null);
      setSection('equipment');
      load();
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to save equipment.');
    }
  };

  const remove = async (id) => {
    if (window.confirm('Delete this equipment listing?')) {
      await api.delete(`/equipment/${id}`);
      setNotice('Equipment removed.');
      load();
    }
  };

  const updateRequest = async (id, requestStatus) => {
    try {
      await api.put(`/rentals/${id}/status`, { requestStatus });
      setNotice(`Request ${requestStatus}. The farmer will see the updated status.`);
      load();
    } catch {
      setNotice('Unable to update request.');
    }
  };

  const titles = {
    overview: 'Equipment owner dashboard',
    equipment: 'My equipment',
    add: editingId ? 'Edit equipment' : 'Add equipment',
    requests: 'Rental requests'
  };

  return (
    <main className="owner-dashboard">
      <BinaryOrbits className="binary-orbits-fixed-bg" />
      <aside className="owner-sidebar">
        <div className="owner-brand auth-logo d-inline-flex align-items-center">
          <img src="/logo.png" alt="AgriConnect" className="brand-logo-img me-2" style={{ width: 34, height: 34 }} />
          <span>
            <span className="auth-logo-yellow">Agri</span>
            <span className="auth-logo-white">Connect</span>
          </span>
        </div>
        <div className="owner-identity">
          <span>EO</span>
          <div>
            <b>{user?.name}</b>
            <small>Equipment owner</small>
            {user?.location && (
              <small className="text-white-50 d-block" style={{ fontSize: '11px' }}>📍 {user.location}</small>
            )}
          </div>
        </div>
        {[
          ['overview', '📊 Overview'],
          ['equipment', '🚜 My Equipment'],
          ['add', editingId ? '✏️ Edit Equipment' : '➕ Add Equipment'],
          ['requests', '📋 Rental Requests']
        ].map(([key, label]) => (
          <button
            key={key}
            className={`owner-nav-btn ${section === key ? 'active' : ''}`}
            onClick={() => {
              if (key === 'add' && !editingId) {
                setForm({ ...blank, ownerPhone: user?.phone || '' });
              }
              setSection(key);
            }}
          >
            <span>{label}</span>
            {key === 'requests' && rentals.filter((r) => r.requestStatus === 'pending').length > 0 && (
              <span className="owner-badge-count">
                {rentals.filter((r) => r.requestStatus === 'pending').length}
              </span>
            )}
          </button>
        ))}
        <button
          className="owner-logout"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          🚪 Log out
        </button>
      </aside>

      <section className="owner-content">
        <header className="owner-header">
          <div>
            <p className="owner-eyebrow">EQUIPMENT RENTAL CENTER</p>
            <h1>{titles[section]}</h1>
          </div>
          {section !== 'add' && (
            <button className="btn btn-success d-inline-flex align-items-center gap-2" onClick={handleAddNew}>
              <span>+</span> Add new equipment
            </button>
          )}
        </header>

        {notice && (
          <div className="alert alert-success owner-notice">
            <span>{notice}</span>
            <button className="btn-close" onClick={() => setNotice('')} />
          </div>
        )}

        {section === 'overview' && (
          <div className="owner-overview-stack">
            <div className="owner-welcome-banner d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h2 className="mb-1">Welcome back, {user?.name} 👋</h2>
                <p className="text-muted mb-0 small">
                  Manage your machinery listings, track rental requests, and monitor your rental business in Tamil Nadu.
                </p>
              </div>
              <button className="btn btn-success d-inline-flex align-items-center gap-2" onClick={handleAddNew}>
                <span>+</span> Add new equipment
              </button>
            </div>

            <div className="owner-stats">
              <Metric label="My equipment" value={equipment.length} icon="🚜" />
              <Metric label="Available for rent" value={equipment.filter((item) => item.availability).length} icon="✅" />
              <Metric label="Rental requests" value={rentals.length} icon="📋" />
            </div>

            <div className="owner-overview-grid">
              {/* Left Column: Recent Machinery Listings */}
              <div className="owner-panel owner-overview-panel">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="h5 mb-1 fw-bold text-dark">Recent Equipment Listings</h3>
                    <small className="text-muted">Your active machinery catalog</small>
                  </div>
                  {equipment.length > 0 && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => setSection('equipment')}
                    >
                      View all ({equipment.length}) →
                    </button>
                  )}
                </div>

                <div className="owner-equipment-grid">
                  {equipment.slice(0, 4).map((item) => (
                    <article className="owner-equipment-card" key={item._id}>
                      <div className="owner-equipment-image">
                        {item.image ? (
                          <img
                            src={imageUrl(item.image, DEFAULT_EQUIPMENT_IMAGE)}
                            alt={item.equipmentName}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_EQUIPMENT_IMAGE;
                            }}
                          />
                        ) : (
                          <div className="owner-equipment-placeholder">
                            <span>🚜</span>
                          </div>
                        )}
                        <div className="owner-card-badges">
                          {item.category && (
                            <span className="owner-cat-tag">{item.category}</span>
                          )}
                          <span className={`owner-status-tag ${item.availability ? 'available' : 'unavailable'}`}>
                            <span className="status-dot"></span>
                            {item.availability ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                      <div className="owner-equipment-body">
                        <div className="owner-card-top-info">
                          <h3 className="owner-equipment-title" title={item.equipmentName}>
                            {item.equipmentName}
                          </h3>
                          <span className="owner-location-badge">
                            📍 {item.location || 'Tamil Nadu'}
                          </span>
                        </div>
                        {item.description && (
                          <p className="owner-equipment-desc" title={item.description}>
                            {item.description}
                          </p>
                        )}
                        <div className="owner-card-footer">
                          <div className="owner-price-box">
                            <span className="price-currency">₹</span>
                            <span className="price-val">{item.rentalPrice}</span>
                            <span className="price-period">/ hour</span>
                          </div>
                          <div className="owner-card-btn-group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              onClick={() => startEdit(item)}
                            >
                              ✏️ Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}

                  {/* Add Equipment Quick Tile when owner has fewer items */}
                  {equipment.length < 3 && (
                    <div
                      className="owner-equipment-add-tile"
                      onClick={handleAddNew}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="owner-add-tile-icon">+</div>
                      <b>Add More Equipment</b>
                      <small>List another tractor, tiller, or harvester to increase rental income</small>
                      <span className="btn btn-sm btn-outline-success mt-2">+ Add listing</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Rental Requests & Booking Activity */}
              <div className="owner-panel owner-overview-panel">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="h5 mb-1 fw-bold text-dark">Rental Requests</h3>
                    <small className="text-muted">Farmer booking requests</small>
                  </div>
                  {rentals.length > 0 && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => setSection('requests')}
                    >
                      View all ({rentals.length}) →
                    </button>
                  )}
                </div>

                {rentals.length > 0 ? (
                  <div className="owner-recent-requests">
                    {rentals.slice(0, 4).map((item) => (
                      <div className="order-row mb-2" key={item._id}>
                        <div>
                          <b>{item.equipment?.equipmentName}</b>
                          <small>
                            Farmer: {item.farmer?.name || 'Local Farmer'} · {item.farmer?.phone || 'Phone not provided'}
                            {item.farmer?.location && (
                              <span className="ms-1 text-success fw-semibold">· 📍 {item.farmer.location}</span>
                            )}
                          </small>
                          <small>Farm area: {item.acres} acres</small>
                        </div>
                        {item.requestStatus === 'pending' ? (
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => updateRequest(item._id, 'accepted')}
                            >
                              Accept
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => updateRequest(item._id, 'rejected')}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`status-pill ${item.requestStatus}`}>
                            {item.requestStatus}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="owner-overview-empty-requests">
                    <span className="empty-requests-icon">📋</span>
                    <b>No pending rental requests</b>
                    <p>When farmers in Tamil Nadu book your machinery, their requests will appear here for you to accept or decline.</p>
                    <div className="owner-listing-status-card">
                      <span className="status-dot-pulse"></span>
                      <span>Your machinery is live & visible to farmers</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {section === 'add' && (
          <EquipmentForm
            form={form}
            change={change}
            publish={publish}
            editingId={editingId}
            cancelEdit={cancelEdit}
          />
        )}

        {section === 'equipment' && (
          <div className="owner-panel">
            <div className="owner-section-intro mb-4">
              <h2 className="mb-1">My Equipment Listings</h2>
              <small className="text-muted">
                Showing {equipment.length} machinery listing{equipment.length === 1 ? '' : 's'} in Tamil Nadu
              </small>
            </div>

            <div className="owner-equipment-grid">
              {equipment.length ? (
                <>
                  {equipment.map((item) => (
                  <article className="owner-equipment-card" key={item._id}>
                    <div className="owner-equipment-image">
                      {item.image ? (
                        <img
                          src={imageUrl(item.image, DEFAULT_EQUIPMENT_IMAGE)}
                          alt={item.equipmentName}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_EQUIPMENT_IMAGE;
                          }}
                        />
                      ) : (
                        <div className="owner-equipment-placeholder">
                          <span>🚜</span>
                        </div>
                      )}
                      
                      <div className="owner-card-badges">
                        {item.category && (
                          <span className="owner-cat-tag">
                            {item.category}
                          </span>
                        )}
                        <span className={`owner-status-tag ${item.availability ? 'available' : 'unavailable'}`}>
                          <span className="status-dot"></span>
                          {item.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>

                    <div className="owner-equipment-body">
                      <div className="owner-card-top-info">
                        <h3 className="owner-equipment-title" title={item.equipmentName}>
                          {item.equipmentName}
                        </h3>
                        <span className="owner-location-badge">
                          📍 {item.location || 'Tamil Nadu'}
                        </span>
                      </div>

                      {item.description ? (
                        <p className="owner-equipment-desc" title={item.description}>
                          {item.description}
                        </p>
                      ) : (
                        <p className="owner-equipment-desc text-muted fst-italic">
                          No description provided for this machinery.
                        </p>
                      )}

                      <div className="owner-card-footer">
                        <div className="owner-price-box">
                          <span className="price-currency">₹</span>
                          <span className="price-val">{item.rentalPrice}</span>
                          <span className="price-period">/ hour</span>
                        </div>

                        <div className="owner-card-btn-group">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
                            onClick={() => startEdit(item)}
                            title="Edit listing details"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                            onClick={() => remove(item._id)}
                            title="Delete this listing"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}

                <div
                  className="owner-equipment-add-tile"
                  onClick={handleAddNew}
                  role="button"
                  tabIndex={0}
                >
                  <div className="owner-add-tile-icon">+</div>
                  <b>Add Another Equipment</b>
                  <small>List more machinery to grow your rental business</small>
                  <span className="btn btn-sm btn-outline-success mt-2">+ Add new listing</span>
                </div>
              </>
              ) : (
                <div className="owner-empty-box">
                  <div className="owner-empty-icon">🚜</div>
                  <h3>No machinery listings yet</h3>
                  <p>Publish your tractors, power tillers, or harvesters to start receiving rental requests from farmers across Tamil Nadu.</p>
                  <button className="btn btn-success mt-2" onClick={handleAddNew}>
                    + Add your first equipment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {section === 'requests' && (
          <div className="owner-panel">
            <h2>Rental requests</h2>
            {rentals.length ? (
              rentals.map((item) => (
                <div className="order-row" key={item._id}>
                  <div>
                    <b>{item.equipment?.equipmentName}</b>
                    <small>
                      Farmer: {item.farmer?.name} · {item.farmer?.phone || 'Phone not provided'}
                      {item.farmer?.location && (
                        <span className="ms-1 text-success fw-semibold">· 📍 {item.farmer.location}</span>
                      )}
                    </small>
                    <small>Farm area: {item.acres} acres</small>
                  </div>
                  {item.requestStatus === 'pending' ? (
                    <div>
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => updateRequest(item._id, 'accepted')}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => updateRequest(item._id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="status-pill">{item.requestStatus}</span>
                  )}
                </div>
              ))
            ) : (
              <p className="owner-empty">No rental requests yet.</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function EquipmentForm({ form, change, publish, editingId, cancelEdit }) {
  const tractor = (form.equipmentName || '').trim().toLowerCase().includes('tractor');
  const setAttachments = (attachments) => change('attachments')({ target: { value: attachments } });
  const addAttachment = () => setAttachments([...(form.attachments || []), { name: '', image: null }]);
  const updateAttachment = (index, key, value) =>
    setAttachments(
      (form.attachments || []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );

  return (
    <form className="owner-panel owner-form" onSubmit={publish}>
      <h2>{editingId ? 'Edit equipment listing' : 'Create an equipment listing'}</h2>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Equipment name</label>
          <input
            className="form-control"
            required
            placeholder="Example: Mahindra Tractor 575 DI"
            value={form.equipmentName}
            onChange={change('equipmentName')}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Category</label>
          <input
            className="form-control"
            required
            placeholder="Tractor, Harvester, Tiller, Power Weeder..."
            value={form.category}
            onChange={change('category')}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Rental price per hour (₹)</label>
          <input
            className="form-control"
            required
            min="0"
            type="number"
            value={form.rentalPrice}
            onChange={change('rentalPrice')}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Owner phone number</label>
          <input
            className="form-control"
            required
            value={form.ownerPhone}
            onChange={change('ownerPhone')}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Location (District)</label>
          <input
            className="form-control"
            required
            list="tn-districts-equip"
            placeholder="e.g. Coimbatore, Thanjavur..."
            value={form.location}
            onChange={change('location')}
          />
          <datalist id="tn-districts-equip">
            {TAMIL_NADU_DISTRICTS.map((dist) => (
              <option key={dist} value={dist} />
            ))}
          </datalist>
        </div>
        <div className="col-md-6">
          <label className="form-label">
            {editingId ? 'Change equipment image (optional)' : 'Equipment image'}
          </label>
          <input
            className="form-control"
            type="file"
            accept="image/*"
            onChange={(event) =>
              change('image')({ target: { value: event.target.files[0] || null } })
            }
          />
          {editingId && form.existingImage && !form.image && (
            <small className="text-muted d-block mt-1">
              Current image saved. Uploading a new file will replace it.
            </small>
          )}
        </div>
        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            required
            rows="4"
            placeholder="Describe the machinery specs, HP, condition, implements included..."
            value={form.description}
            onChange={change('description')}
          />
        </div>

        {tractor && (
          <div className="col-12">
            <div className="border rounded p-3 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <b>Tractor attachments / implements</b>
                  <small className="d-block text-muted">
                    Add each implement name and optional image manually.
                  </small>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={addAttachment}
                >
                  + Add attachment
                </button>
              </div>
              {(form.attachments || []).map((attachment, index) => (
                <div className="row g-2 align-items-end mb-2" key={index}>
                  <div className="col-md-5">
                    <label className="form-label">Attachment name</label>
                    <input
                      className="form-control"
                      placeholder="Rotavator, Plough, Trailer..."
                      value={attachment.name}
                      onChange={(event) =>
                        updateAttachment(index, 'name', event.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label">Attachment image</label>
                    <input
                      className="form-control"
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        updateAttachment(index, 'image', event.target.files[0] || null)
                      }
                    />
                  </div>
                  <div className="col-md-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger w-100"
                      onClick={() =>
                        setAttachments(
                          (form.attachments || []).filter((_, itemIndex) => itemIndex !== index)
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="col-12">
          <label className="owner-checkbox">
            <input
              type="checkbox"
              checked={form.availability}
              onChange={change('availability')}
            />{' '}
            Available for rent
          </label>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 mt-4">
        <button type="submit" className="btn btn-success">
          {editingId ? 'Save changes' : 'Publish equipment'}
        </button>
        {editingId && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={cancelEdit}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Metric({ label, value, icon }) {
  return (
    <div className="owner-metric">
      {icon && <span className="owner-metric-icon">{icon}</span>}
      <div>
        <small>{label}</small>
        <b>{value}</b>
      </div>
    </div>
  );
}
