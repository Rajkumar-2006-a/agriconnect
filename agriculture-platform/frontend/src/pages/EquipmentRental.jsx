import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TAMIL_NADU_DISTRICTS } from '../constants/tamilNaduLocations';
import './EquipmentRental.css';

const fallbackImage = 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=900&q=80';
const origin = api.defaults.baseURL.replace(/\/api\/?$/, '');
const imageUrl = (image) => !image ? fallbackImage : /^https?:\/\//i.test(image) ? image : `${origin}/${image.replace(/^[/\\]+/, '').replace(/\\/g, '/')}`;

export default function EquipmentRental() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ equipment: '', acres: '' });
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (location.trim()) params.location = location.trim();
      const response = await api.get('/equipment', { params });
      let data = response.data;
      if (location.trim()) {
        data = data.filter((item) =>
          item.location && item.location.toLowerCase().includes(location.trim().toLowerCase())
        );
      }
      setEquipment(data);
    } catch {
      setNotice('Unable to load equipment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, location]);

  const choose = (item) => {
    setSelected(item);
    setForm({ ...form, equipment: item._id });
    document.getElementById('rental-request')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/rentals', form);
      setNotice('Rental request sent successfully.');
      setForm({ equipment: '', acres: '' });
      setSelected(null);
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to send rental request.');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setLocation('');
  };

  return (
    <main className="equipment-rental-page">
      <section className="equipment-intro">
        <div className="container">
          <span>AGRICULTURAL EQUIPMENT</span>
          <h1>Find the right equipment for your farm</h1>
          <p>Browse reliable machinery from verified local equipment owners across districts, view details, and request a booking in minutes.</p>
        </div>
      </section>

      <section className="container py-5">
        {notice && (
          <div className="alert alert-success d-flex justify-content-between align-items-center mb-4">
            <span>{notice}</span>
            <button className="btn-close" onClick={() => setNotice('')} aria-label="Dismiss message" />
          </div>
        )}

        <div className="equipment-page-head">
          <div>
            <h2>Available equipment</h2>
            <p>
              {location
                ? `Showing equipment in ${location}`
                : 'Choose from equipment available for rental.'}
            </p>
          </div>
        </div>

        {/* Location & Search Filter Bar */}
        <div className="equipment-filter-card mb-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label filter-label">📍 Filter by District</label>
              <select
                className="form-select tn-location-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">All Districts</option>
                {TAMIL_NADU_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label filter-label">🔍 Search Equipment / Machinery</label>
              <div className="equipment-search-input-wrap">
                <input
                  className="form-control"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tractor, harvester, tiller, or town..."
                />
                {search && (
                  <button
                    type="button"
                    className="btn-clear-search"
                    onClick={() => setSearch('')}
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right-aligned Clear Button */}
          {(location || search) && (
            <div className="d-flex justify-content-end align-items-center mt-3 pt-2 border-top">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary px-3 py-1"
                onClick={clearFilters}
              >
                ✕ Clear Filters
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="equipment-loading">Loading available equipment...</div>
        ) : (
          <div className="rental-layout">
            <div className="equipment-card-grid">
              {equipment.length ? (
                equipment.map((item) => (
                  <article
                    className={`rental-equipment-card ${selected?._id === item._id ? 'selected' : ''}`}
                    key={item._id}
                  >
                    <div className="rental-image-wrap">
                      <img
                        src={imageUrl(item.image)}
                        alt={item.equipmentName}
                        onError={(event) => { event.currentTarget.src = fallbackImage; }}
                      />
                      <span className={item.availability ? 'equipment-status available' : 'equipment-status unavailable'}>
                        {item.availability ? 'Available now' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="rental-card-content">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <p className="rental-category mb-0">{item.category}</p>
                        <span className="location-badge">📍 {item.location}</span>
                      </div>
                      <h3>{item.equipmentName}</h3>
                      <p className="rental-meta">
                        <span>Owner: {item.owner?.name || 'Equipment owner'}</span>
                        {item.owner?.phone && (
                          <a className="rental-phone" href={`tel:${item.owner.phone}`}>
                            Phone: {item.owner.phone}
                          </a>
                        )}
                      </p>
                      <div className="rental-price">
                        <b>Rs. {item.rentalPrice}</b>
                        <span>per hour</span>
                      </div>
                      <Link
                        className="btn btn-success w-100"
                        to={`/equipment/${item._id}`}
                      >
                        {item.availability ? 'View details & book' : 'View details'}
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="equipment-empty">
                  <h3>No equipment found {location ? `in ${location}` : ''}</h3>
                  <p>
                    {location || search
                      ? 'Try selecting a different district or clear your search filters.'
                      : 'No equipment listed yet.'}
                  </p>
                  {(location || search) && (
                    <button
                      type="button"
                      className="btn btn-outline-success mt-2"
                      onClick={clearFilters}
                    >
                      Show All Equipment
                    </button>
                  )}
                </div>
              )}
            </div>

            <aside className="rental-request-panel" id="rental-request">
              <h2>Request equipment</h2>
              {selected ? (
                <div className="selected-equipment">
                  <img
                    src={imageUrl(selected.image)}
                    alt=""
                    onError={(event) => { event.currentTarget.src = fallbackImage; }}
                  />
                  <div>
                    <b>{selected.equipmentName}</b>
                    <small>Rs. {selected.rentalPrice} per hour · {selected.location}</small>
                  </div>
                  <button
                    onClick={() => { setSelected(null); setForm({ ...form, equipment: '' }); }}
                    aria-label="Remove selected equipment"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <p className="text-muted">Select available equipment to start your request.</p>
              )}
              <form onSubmit={submit}>
                <label className="form-label">Equipment</label>
                <select
                  className="form-select mb-3"
                  required
                  value={form.equipment}
                  onChange={(event) => {
                    const item = equipment.find((entry) => entry._id === event.target.value);
                    setForm({ ...form, equipment: event.target.value });
                    setSelected(item || null);
                  }}
                >
                  <option value="">Choose equipment</option>
                  {equipment.filter((item) => item.availability).map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.equipmentName} ({item.location}) - Rs. {item.rentalPrice}/hour
                    </option>
                  ))}
                </select>
                <label className="form-label">Farm area (acres)</label>
                <input
                  className="form-control mb-3"
                  required
                  min="0.01"
                  step="0.01"
                  type="number"
                  placeholder="Example: 2.5"
                  value={form.acres}
                  onChange={(event) => setForm({ ...form, acres: event.target.value })}
                />
                <button
                  className="btn btn-success w-100"
                  disabled={!form.equipment || user?.role !== 'farmer'}
                >
                  Send rental request
                </button>
              </form>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
