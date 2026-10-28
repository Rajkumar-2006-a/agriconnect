import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { TAMIL_NADU_DISTRICTS } from '../constants/tamilNaduLocations';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState('');

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('');
  const [doctorLocationFilter, setDoctorLocationFilter] = useState('');
  const [doctorSearchFilter, setDoctorSearchFilter] = useState('');
  const [schemeSearch, setSchemeSearch] = useState('');
  const [schemeDeptFilter, setSchemeDeptFilter] = useState('');

  // Forms
  const [doctor, setDoctor] = useState({ name: '', phone: '', location: '' });
  const [newScheme, setNewScheme] = useState({
    schemeCode: '',
    title: '',
    titleTa: '',
    description: '',
    department: 'Central',
    category: 'Income Support',
    subsidyRate: '',
    maxBenefit: '',
    officialPortalUrl: '',
    helpline: ''
  });

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [userData, productData, doctorData, schemeData] = await Promise.all([
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/admin/products').catch(() => ({ data: [] })),
        api.get('/agri-doctors').catch(() => ({ data: [] })),
        api.get('/schemes').catch(() => ({ data: [] }))
      ]);
      setUsers(userData.data || []);
      setProducts(productData.data || []);
      setDoctors(doctorData.data || []);
      setSchemes(schemeData.data || []);
      if (isManual) setNotice('Platform data successfully synchronized with database.');
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to load administration data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const remove = async (path, id, label) => {
    if (!window.confirm(`Are you sure you want to remove this ${label}? This cannot be undone.`)) return;
    try {
      await api.delete(`${path}/${id}`);
      setNotice(`✅ ${label.charAt(0).toUpperCase() + label.slice(1)} removed successfully.`);
      loadData();
    } catch (error) {
      setNotice(error.response?.data?.message || `Unable to remove ${label}.`);
    }
  };

  const addDoctor = async (event) => {
    event.preventDefault();
    try {
      await api.post('/admin/agri-doctors', doctor);
      setDoctor({ name: '', phone: '', location: '' });
      setNotice('✅ Agricultural specialist registered successfully.');
      loadData();
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to register specialist.');
    }
  };

  const addScheme = async (event) => {
    event.preventDefault();
    try {
      await api.post('/schemes', newScheme);
      setNewScheme({
        schemeCode: '',
        title: '',
        titleTa: '',
        description: '',
        department: 'Central',
        category: 'Income Support',
        subsidyRate: '',
        maxBenefit: '',
        officialPortalUrl: '',
        helpline: ''
      });
      setNotice('✅ Government scheme published successfully.');
      loadData();
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to publish scheme.');
    }
  };

  // Filtered lists
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.location && u.location.toLowerCase().includes(q));
      const matchRole = !userRoleFilter || u.role === userRoleFilter;
      return matchSearch && matchRole;
    });
  }, [users, userSearch, userRoleFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = productSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p.productName && p.productName.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.farmer?.name && p.farmer.name.toLowerCase().includes(q)) ||
        (p.farmer?.location && p.farmer.location.toLowerCase().includes(q));
      const matchStatus =
        !productStatusFilter ||
        (productStatusFilter === 'sold' ? p.isSold : !p.isSold);
      return matchSearch && matchStatus;
    });
  }, [products, productSearch, productStatusFilter]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchLoc =
        !doctorLocationFilter ||
        (doc.location && doc.location.toLowerCase().includes(doctorLocationFilter.toLowerCase()));
      const matchSearch =
        !doctorSearchFilter ||
        (doc.name && doc.name.toLowerCase().includes(doctorSearchFilter.toLowerCase())) ||
        (doc.location && doc.location.toLowerCase().includes(doctorSearchFilter.toLowerCase())) ||
        (doc.phone && doc.phone.includes(doctorSearchFilter));
      return matchLoc && matchSearch;
    });
  }, [doctors, doctorLocationFilter, doctorSearchFilter]);

  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      const q = schemeSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.schemeCode && s.schemeCode.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q));
      const matchDept = !schemeDeptFilter || s.department === schemeDeptFilter;
      return matchSearch && matchDept;
    });
  }, [schemes, schemeSearch, schemeDeptFilter]);

  // Statistics breakdown
  const userCounts = useMemo(() => {
    const farmers = users.filter((u) => u.role === 'farmer').length;
    const buyers = users.filter((u) => u.role === 'buyer').length;
    const owners = users.filter((u) => u.role === 'rentalOwner').length;
    return { farmers, buyers, owners, total: users.length };
  }, [users]);

  const activeProduceCount = useMemo(() => {
    return products.filter((p) => !p.isSold).length;
  }, [products]);

  return (
    <div className="admin-dashboard-page">
      <main className="container py-4 py-lg-5">
        {/* Executive Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <div className="admin-header-badge">
              <span>🛡️ Platform Governance</span>
              <span>•</span>
              <span>Root Administrator</span>
            </div>
            <h1 className="admin-dashboard-title">Administrator Control Center</h1>
            <p className="admin-dashboard-subtitle mb-0">
              Manage verified users, agricultural produce listings, specialist directory, and government subsidies across Tamil Nadu.
            </p>
          </div>
          <button
            className="btn btn-outline-success d-inline-flex align-items-center gap-2"
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{ borderRadius: '12px', fontWeight: 600, padding: '9px 18px', borderColor: 'rgba(52, 211, 153, 0.4)' }}
          >
            <span style={{ display: 'inline-block', transform: refreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s' }}>
              🔄
            </span>
            <span>{refreshing ? 'Syncing...' : 'Sync Live Data'}</span>
          </button>
        </div>

        {/* Global Notice / Toast */}
        {notice && (
          <div className="admin-toast-notice">
            <div className="d-flex align-items-center gap-2">
              <span>📢</span>
              <span>{notice}</span>
            </div>
            <button
              className="btn-close btn-close-white"
              onClick={() => setNotice('')}
              style={{ fontSize: '11px', opacity: 0.8 }}
            />
          </div>
        )}

        {/* Top KPI Stat Cards */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon-wrap admin-stat-icon-users">👥</div>
            <div className="admin-stat-meta">
              <span className="admin-stat-value">{userCounts.total}</span>
              <span className="admin-stat-label">Total Registered Users</span>
              <span className="admin-stat-sub">
                {userCounts.farmers} Farmers • {userCounts.buyers} Buyers • {userCounts.owners} Owners
              </span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon-wrap admin-stat-icon-products">🌾</div>
            <div className="admin-stat-meta">
              <span className="admin-stat-value">{products.length}</span>
              <span className="admin-stat-label">Marketplace Produce</span>
              <span className="admin-stat-sub">
                {activeProduceCount} Available • {products.length - activeProduceCount} Sold
              </span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon-wrap admin-stat-icon-doctors">🩺</div>
            <div className="admin-stat-meta">
              <span className="admin-stat-value">{doctors.length}</span>
              <span className="admin-stat-label">Verified Agri Doctors</span>
              <span className="admin-stat-sub">Spanning Tamil Nadu Districts</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon-wrap admin-stat-icon-schemes">🏛️</div>
            <div className="admin-stat-meta">
              <span className="admin-stat-value">{schemes.length}</span>
              <span className="admin-stat-label">Active Govt Schemes</span>
              <span className="admin-stat-sub">Central &amp; Tamil Nadu State</span>
            </div>
          </div>
        </section>

        {/* Segmented Navigation Tab Bar */}
        <nav className="admin-tabs-nav" aria-label="Administration Sections">
          <button
            className={`admin-tab-btn ${tab === 'users' ? 'active' : ''}`}
            onClick={() => setTab('users')}
          >
            <span>👥 Users</span>
            <span className="admin-tab-counter">{filteredUsers.length}</span>
          </button>
          <button
            className={`admin-tab-btn ${tab === 'products' ? 'active' : ''}`}
            onClick={() => setTab('products')}
          >
            <span>🌾 Produce Listings</span>
            <span className="admin-tab-counter">{filteredProducts.length}</span>
          </button>
          <button
            className={`admin-tab-btn ${tab === 'doctors' ? 'active' : ''}`}
            onClick={() => setTab('doctors')}
          >
            <span>🩺 Agri Doctors</span>
            <span className="admin-tab-counter">{filteredDoctors.length}</span>
          </button>
          <button
            className={`admin-tab-btn ${tab === 'schemes' ? 'active' : ''}`}
            onClick={() => setTab('schemes')}
          >
            <span>🏛️ Govt Schemes</span>
            <span className="admin-tab-counter">{filteredSchemes.length}</span>
          </button>
        </nav>

        {/* TAB 1: USERS MANAGEMENT */}
        {tab === 'users' && (
          <section className="admin-card-panel">
            <div className="admin-panel-header">
              <h2 className="admin-panel-title">
                <span>All Registered Users</span>
                <span className="badge text-bg-secondary" style={{ fontSize: '12px' }}>
                  {filteredUsers.length} of {users.length}
                </span>
              </h2>
            </div>

            {/* Toolbar: Search + Role Filter */}
            <div className="admin-toolbar-row">
              <input
                className="admin-search-input"
                placeholder="🔍 Search user by name, email, phone, or district..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <select
                className="admin-filter-select"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="farmer">🌾 Farmers Only</option>
                <option value="buyer">🛒 Buyers Only</option>
                <option value="rentalOwner">🚜 Equipment Owners Only</option>
                <option value="admin">🛡️ Admins Only</option>
              </select>
              {(userSearch || userRoleFilter) && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary text-muted"
                  onClick={() => {
                    setUserSearch('');
                    setUserRoleFilter('');
                  }}
                  style={{ borderRadius: '8px' }}
                >
                  ✕ Clear
                </button>
              )}
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Contact Info</th>
                    <th>District / Location</th>
                    <th>Joined</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length ? (
                    filteredUsers.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className={`admin-user-avatar avatar-${item.role}`}>
                              {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <b style={{ color: '#FFFFFF', fontSize: '14px' }}>{item.name}</b>
                              {item.role === 'admin' && (
                                <span className="ms-2 badge text-bg-warning" style={{ fontSize: '10px' }}>Root</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`admin-badge-role badge-${item.role}`}>
                            {item.role === 'farmer' && '🌾 Farmer'}
                            {item.role === 'buyer' && '🛒 Buyer'}
                            {item.role === 'rentalOwner' && '🚜 Equipment Owner'}
                            {item.role === 'admin' && '🛡️ Administrator'}
                          </span>
                        </td>
                        <td>
                          <div>
                            <a href={`mailto:${item.email}`} style={{ color: '#E2E8F0', textDecoration: 'none' }}>
                              {item.email}
                            </a>
                          </div>
                          {item.phone && (
                            <small>
                              <a href={`tel:${item.phone}`} style={{ color: '#34D399', textDecoration: 'none' }}>
                                📞 {item.phone}
                              </a>
                            </small>
                          )}
                        </td>
                        <td>
                          {item.location ? (
                            <span className="admin-badge-location">📍 {item.location}</span>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                        <td>
                          <span style={{ color: '#94A3B8', fontSize: '12px' }}>
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                          </span>
                        </td>
                        <td className="text-end">
                          {item.role !== 'admin' ? (
                            <button
                              className="admin-action-btn-danger"
                              onClick={() => remove('/admin/users', item._id, 'user account')}
                            >
                              Remove
                            </button>
                          ) : (
                            <span className="badge text-bg-dark border border-secondary" style={{ fontSize: '11px' }}>
                              Protected
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="admin-empty-state">
                        <span className="admin-empty-icon">👥</span>
                        <p className="admin-empty-text">No registered users matched your search filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 2: PRODUCE LISTINGS MODERATION */}
        {tab === 'products' && (
          <section className="admin-card-panel">
            <div className="admin-panel-header">
              <h2 className="admin-panel-title">
                <span>All Crop &amp; Produce Listings</span>
                <span className="badge text-bg-secondary" style={{ fontSize: '12px' }}>
                  {filteredProducts.length} listings
                </span>
              </h2>
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar-row">
              <input
                className="admin-search-input"
                placeholder="🔍 Search by produce name, category, farmer name, or district..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              <select
                className="admin-filter-select"
                value={productStatusFilter}
                onChange={(e) => setProductStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="available">🟢 Available Only</option>
                <option value="sold">🔴 Sold Only</option>
              </select>
              {(productSearch || productStatusFilter) && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary text-muted"
                  onClick={() => {
                    setProductSearch('');
                    setProductStatusFilter('');
                  }}
                  style={{ borderRadius: '8px' }}
                >
                  ✕ Clear
                </button>
              )}
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Produce Item</th>
                    <th>Category</th>
                    <th>Farmer &amp; District</th>
                    <th>Price</th>
                    <th>Stock / Qty</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length ? (
                    filteredProducts.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ fontSize: '20px' }}>📦</span>
                            <div>
                              <b style={{ color: '#FFFFFF', fontSize: '14px' }}>{item.productName}</b>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge text-bg-dark border border-secondary">
                            {item.category || 'General'}
                          </span>
                        </td>
                        <td>
                          <div>{item.farmer?.name || 'Farmer Account'}</div>
                          {item.farmer?.location && (
                            <small className="text-muted d-block">📍 {item.farmer.location}</small>
                          )}
                        </td>
                        <td>
                          <span style={{ color: '#34D399', fontWeight: 700 }}>
                            ₹{item.price} <small className="text-muted">/ {item.unit || 'kg'}</small>
                          </span>
                        </td>
                        <td>
                          <span style={{ color: '#E2E8F0', fontWeight: 600 }}>
                            {item.quantity ? `${item.quantity} ${item.unit || 'kg'}` : 'In Stock'}
                          </span>
                        </td>
                        <td>
                          {item.isSold ? (
                            <span className="badge text-bg-secondary">Sold Out</span>
                          ) : (
                            <span className="badge text-bg-success">Available</span>
                          )}
                        </td>
                        <td className="text-end">
                          <button
                            className="admin-action-btn-danger"
                            onClick={() => remove('/admin/products', item._id, 'produce listing')}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="admin-empty-state">
                        <span className="admin-empty-icon">🌾</span>
                        <p className="admin-empty-text">No crop listings matched the current filter.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: AGRI DOCTORS DIRECTORY */}
        {tab === 'doctors' && (
          <div className="row g-4">
            {/* Left: Add Doctor Form */}
            <div className="col-lg-5">
              <form className="admin-form-card" onSubmit={addDoctor}>
                <h2 className="h5 text-white mb-2">Register Agri Doctor</h2>
                <p className="text-muted small mb-4">
                  Add a certified agronomist or pest specialist to Tamil Nadu's platform directory.
                </p>

                <label className="admin-form-label">Doctor / Specialist Name</label>
                <input
                  className="admin-form-control"
                  required
                  placeholder="e.g., Dr. S. Murugan (Agronomist)"
                  value={doctor.name}
                  onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
                />

                <label className="admin-form-label">Contact Phone Number</label>
                <input
                  className="admin-form-control"
                  required
                  type="tel"
                  placeholder="e.g., 9443123456"
                  value={doctor.phone}
                  onChange={(e) => setDoctor({ ...doctor, phone: e.target.value })}
                />

                <label className="admin-form-label">Location / District (Tamil Nadu)</label>
                <input
                  className="admin-form-control"
                  required
                  list="tn-districts-list"
                  placeholder="Select or enter district (e.g., Coimbatore)"
                  value={doctor.location}
                  onChange={(e) => setDoctor({ ...doctor, location: e.target.value })}
                />
                <datalist id="tn-districts-list">
                  {TAMIL_NADU_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist} />
                  ))}
                </datalist>

                <button className="admin-submit-btn mt-2">
                  ➕ Add Specialist
                </button>
              </form>
            </div>

            {/* Right: Doctor Directory List */}
            <div className="col-lg-7">
              <section className="admin-card-panel">
                <div className="admin-panel-header">
                  <h2 className="admin-panel-title">
                    <span>Verified Doctors ({filteredDoctors.length})</span>
                  </h2>
                </div>

                {/* Filters */}
                <div className="admin-toolbar-row">
                  <select
                    className="admin-filter-select"
                    value={doctorLocationFilter}
                    onChange={(e) => setDoctorLocationFilter(e.target.value)}
                  >
                    <option value="">All Districts</option>
                    {TAMIL_NADU_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                  <input
                    className="admin-search-input"
                    placeholder="🔍 Search doctor name or phone..."
                    value={doctorSearchFilter}
                    onChange={(e) => setDoctorSearchFilter(e.target.value)}
                  />
                  {(doctorLocationFilter || doctorSearchFilter) && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary text-muted"
                      onClick={() => {
                        setDoctorLocationFilter('');
                        setDoctorSearchFilter('');
                      }}
                      style={{ borderRadius: '8px' }}
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>

                {filteredDoctors.length ? (
                  <div className="d-flex flex-column gap-2">
                    {filteredDoctors.map((item) => (
                      <div className="admin-list-item" key={item._id}>
                        <div>
                          <h3 className="admin-doctor-title">{item.name}</h3>
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <span className="admin-badge-location">📍 {item.location}</span>
                            <a className="admin-contact-phone" href={`tel:${item.phone}`}>
                              📞 {item.phone}
                            </a>
                          </div>
                        </div>
                        <button
                          className="admin-action-btn-danger"
                          onClick={() => remove('/admin/agri-doctors', item._id, 'doctor entry')}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-empty-state">
                    <span className="admin-empty-icon">🩺</span>
                    <p className="admin-empty-text">No agricultural doctors matched your query.</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* TAB 4: GOVERNMENT SCHEMES GOVERNANCE */}
        {tab === 'schemes' && (
          <div className="row g-4">
            {/* Left: Add Government Scheme Form */}
            <div className="col-lg-5">
              <form className="admin-form-card" onSubmit={addScheme}>
                <h2 className="h5 text-white mb-2">Publish Government Scheme</h2>
                <p className="text-muted small mb-4">
                  Add a verified subsidy or welfare scheme for Tamil Nadu farmers.
                </p>

                <label className="admin-form-label">Scheme Code (Unique)</label>
                <input
                  className="admin-form-control"
                  required
                  placeholder="e.g., PM-KISAN, PMKSY-DRIP"
                  value={newScheme.schemeCode}
                  onChange={(e) => setNewScheme({ ...newScheme, schemeCode: e.target.value })}
                />

                <label className="admin-form-label">Scheme Title (English)</label>
                <input
                  className="admin-form-control"
                  required
                  placeholder="e.g., Pradhan Mantri Kisan Samman Nidhi"
                  value={newScheme.title}
                  onChange={(e) => setNewScheme({ ...newScheme, title: e.target.value })}
                />

                <label className="admin-form-label">Scheme Title (Tamil தமிழ்)</label>
                <input
                  className="admin-form-control"
                  placeholder="e.g., பிரதம மந்திரி கிசான் சம்மான் நிதி"
                  value={newScheme.titleTa}
                  onChange={(e) => setNewScheme({ ...newScheme, titleTa: e.target.value })}
                />

                <div className="row g-2">
                  <div className="col-6">
                    <label className="admin-form-label">Department</label>
                    <select
                      className="admin-form-control"
                      value={newScheme.department}
                      onChange={(e) => setNewScheme({ ...newScheme, department: e.target.value })}
                    >
                      <option value="Central">Central</option>
                      <option value="State - Tamil Nadu">Tamil Nadu State</option>
                      <option value="Central & State">Central &amp; State</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="admin-form-label">Category</label>
                    <select
                      className="admin-form-control"
                      value={newScheme.category}
                      onChange={(e) => setNewScheme({ ...newScheme, category: e.target.value })}
                    >
                      <option value="Income Support">Income Support</option>
                      <option value="Irrigation">Irrigation</option>
                      <option value="Machinery">Machinery</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Solar & Energy">Solar &amp; Energy</option>
                      <option value="Credit & Finance">Credit &amp; Finance</option>
                    </select>
                  </div>
                </div>

                <label className="admin-form-label">Subsidy Rate / Benefit</label>
                <input
                  className="admin-form-control"
                  required
                  placeholder="e.g., ₹6,000 / Year or 100% Subsidy"
                  value={newScheme.subsidyRate}
                  onChange={(e) => setNewScheme({ ...newScheme, subsidyRate: e.target.value })}
                />

                <label className="admin-form-label">Official Portal URL</label>
                <input
                  className="admin-form-control"
                  type="url"
                  required
                  placeholder="https://pmkisan.gov.in"
                  value={newScheme.officialPortalUrl}
                  onChange={(e) => setNewScheme({ ...newScheme, officialPortalUrl: e.target.value })}
                />

                <label className="admin-form-label">Helpline Number</label>
                <input
                  className="admin-form-control"
                  placeholder="e.g., 155261 or 1800-180-1551"
                  value={newScheme.helpline}
                  onChange={(e) => setNewScheme({ ...newScheme, helpline: e.target.value })}
                />

                <label className="admin-form-label">Description</label>
                <textarea
                  className="admin-form-control"
                  rows="3"
                  required
                  placeholder="Key eligibility and benefit description..."
                  value={newScheme.description}
                  onChange={(e) => setNewScheme({ ...newScheme, description: e.target.value })}
                />

                <button className="admin-submit-btn">
                  🚀 Save &amp; Publish Scheme
                </button>
              </form>
            </div>

            {/* Right: Schemes List */}
            <div className="col-lg-7">
              <section className="admin-card-panel">
                <div className="admin-panel-header">
                  <h2 className="admin-panel-title">
                    <span>Active Schemes ({filteredSchemes.length})</span>
                  </h2>
                </div>

                {/* Filters */}
                <div className="admin-toolbar-row">
                  <input
                    className="admin-search-input"
                    placeholder="🔍 Search scheme title, code, or description..."
                    value={schemeSearch}
                    onChange={(e) => setSchemeSearch(e.target.value)}
                  />
                  <select
                    className="admin-filter-select"
                    value={schemeDeptFilter}
                    onChange={(e) => setSchemeDeptFilter(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    <option value="Central">🇮🇳 Central</option>
                    <option value="State - Tamil Nadu">🏛️ Tamil Nadu State</option>
                  </select>
                </div>

                {filteredSchemes.length ? (
                  <div className="d-flex flex-column gap-3">
                    {filteredSchemes.map((item) => (
                      <div className="admin-list-item" key={item._id || item.schemeCode}>
                        <div style={{ flex: 1, paddingRight: 12 }}>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="badge text-bg-success">{item.schemeCode}</span>
                            <span className="admin-badge-location">
                              {item.department === 'Central' ? '🇮🇳 Central' : '🏛️ Tamil Nadu'}
                            </span>
                            <span className="badge text-bg-dark border border-secondary">{item.category}</span>
                          </div>
                          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', margin: '4px 0' }}>
                            {item.title}
                          </h3>
                          {item.titleTa && (
                            <p style={{ color: '#94A3B8', fontSize: '12px', margin: '2px 0 6px 0' }}>
                              {item.titleTa}
                            </p>
                          )}
                          <div className="d-flex align-items-center gap-3">
                            <span style={{ color: '#34D399', fontWeight: 700, fontSize: '13px' }}>
                              🎁 {item.subsidyRate}
                            </span>
                            {item.officialPortalUrl && (
                              <a
                                href={item.officialPortalUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#60A5FA', fontSize: '12px', textDecoration: 'none' }}
                              >
                                🔗 Official Portal ↗
                              </a>
                            )}
                          </div>
                        </div>
                        {item._id && (
                          <button
                            className="admin-action-btn-danger"
                            onClick={() => remove('/schemes', item._id, 'government scheme')}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-empty-state">
                    <span className="admin-empty-icon">🏛️</span>
                    <p className="admin-empty-text">No government schemes registered in database.</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
