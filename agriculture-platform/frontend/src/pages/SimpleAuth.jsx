import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TAMIL_NADU_DISTRICTS } from '../constants/tamilNaduLocations';
import InterferenceRibbons from '../components/InterferenceRibbons';
import './SimpleAuth.css';

const roles = [
  { value: 'farmer', label: 'Farmer', icon: '🌾', desc: 'Sell produce & rent' },
  { value: 'buyer', label: 'Buyer', icon: '🛒', desc: 'Purchase fresh crops' },
  { value: 'rentalOwner', label: 'Equipment Owner', icon: '🚜', desc: 'Rent out machinery' },
];

export default function SimpleAuth({ mode }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', password: '', role: 'farmer' });
  const [customLocation, setCustomLocation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const registering = mode === 'register';

  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (registering) {
        if (form.location === 'Other') {
          payload.location = customLocation.trim() || 'Other';
        }
        if (!payload.location) {
          setError('Please select or enter your location / district');
          setLoading(false);
          return;
        }
      }
      const response = await api.post(`/auth/${mode}`, payload);
      login(response.data);
      navigate(response.data.user.role === 'buyer' ? '/products' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      {/* Dynamic Animated Interference Ribbons Background - Exact Aurora Configuration */}
      <InterferenceRibbons
        colors={['#6B3CFF', '#D46BFF']}
        backgroundColor="#0A0A0A"
        wires={64}
        lineWidth={1.6}
        ribbonWidth={0.24}
        amplitude={0.60}
        waveLength={1.00}
        angle={42}
        twist={1.60}
        curl={0.25}
        depth={0.65}
        stripes={2.2}
        colorFlow={0}
        glow={0.45}
        intensity={1.00}
        speed={0.70}
        spin={0.22}
        pulseSpeed={0.85}
        pulseStrength={1.00}
        interactive={true}
      />

      {/* 1. Left Side: Yellow Logo + "Login" + 2-line statement */}
      <section className="auth-left-section">
        <div className="auth-logo-wrap">
          <Link className="auth-logo d-inline-flex align-items-center" to="/">
            <img src="/logo.png" alt="AgriConnect" className="brand-logo-img me-2" style={{ width: 42, height: 42 }} />
            <span>
              <span className="auth-logo-yellow">Agri</span><span className="auth-logo-white">Connect</span>
            </span>
          </Link>
        </div>

        <div className="auth-left-copy">
          <h1 className="auth-left-title">{registering ? 'Register' : 'Login'}</h1>
          <p className="auth-left-statement">
            {registering
              ? 'Join Tamil Nadu\'s trusted agricultural network to trade produce, rent verified machinery, and collaborate with farmers.'
              : 'Access your personalized agricultural dashboard to manage farm crops, track customer orders, and rent equipment.'}
          </p>
        </div>

        <div className="auth-left-spacer" />
      </section>

      {/* 2. Right Side: Centered Auth Form Card */}
      <section className="auth-form-area">
        <div className="auth-form-card">
          <div className="auth-heading">
            <h2>{registering ? 'Create your account' : 'Welcome back'}</h2>
            <p>
              {registering
                ? 'Select how you want to join and enter your details.'
                : 'Enter your email and password to access your dashboard.'}
            </p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13, borderRadius: 10 }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} className="auth-form-body">
            {registering && (
              <>
                <div className="mb-3">
                  <label className="auth-form-label">I am joining as a...</label>
                  <div className="role-options">
                    {roles.map((role) => (
                      <button
                        type="button"
                        key={role.value}
                        className={`role-option-btn ${form.role === role.value ? 'selected' : ''}`}
                        onClick={() => setForm({ ...form, role: role.value })}
                      >
                        <span className="role-btn-icon">{role.icon}</span>
                        <b className="role-btn-label">{role.label}</b>
                        <small className="role-btn-sub">{role.desc}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="auth-form-label">Full name</label>
                  <input
                    className="auth-input-control"
                    required
                    placeholder="e.g. Kumar Selvam"
                    value={form.name}
                    onChange={set('name')}
                  />
                </div>

                <div className="mb-3">
                  <label className="auth-form-label">Phone number</label>
                  <input
                    className="auth-input-control"
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={set('phone')}
                  />
                </div>

                <div className="mb-3">
                  <label className="auth-form-label">
                    District / Location {form.role === 'farmer' ? '(Farm location)' : form.role === 'rentalOwner' ? '(Machinery base)' : '(Delivery district)'}
                  </label>
                  <select
                    className="auth-input-control"
                    required
                    value={form.location}
                    onChange={set('location')}
                  >
                    <option value="" disabled>Select your Tamil Nadu district</option>
                    {TAMIL_NADU_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        📍 {dist}
                      </option>
                    ))}
                    <option value="Other">Other (Custom Location)</option>
                  </select>
                  {form.location === 'Other' && (
                    <input
                      className="auth-input-control mt-2"
                      required
                      placeholder="Type your town or district"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                    />
                  )}
                </div>
              </>
            )}

            <div className="mb-3">
              <label className="auth-form-label">Email address</label>
              <input
                className="auth-input-control"
                type="email"
                required
                placeholder="name@example.com"
                value={form.email}
                onChange={set('email')}
              />
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="auth-form-label mb-0">Password</label>
              </div>
              <div className="auth-password-wrapper">
                <input
                  className="auth-input-control auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={set('password')}
                />
                <button
                  type="button"
                  className="auth-password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    /* Eye Slash Icon (Hide password) */
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    /* Eye Icon (Show password) */
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {registering && (
              <p className="auth-help-note">
                Your phone number is shared only with the other verified party in orders or rental requests.
              </p>
            )}

            <button className="auth-submit-btn" type="submit" disabled={loading}>
              <span>{loading ? 'Processing...' : registering ? 'Create Account' : 'Sign In'}</span>
              <span style={{ fontSize: 16 }}>→</span>
            </button>
          </form>

          <div className="auth-switch-text">
            {registering ? (
              <span>
                Already have an account? <Link to="/login">Sign in</Link>
              </span>
            ) : (
              <span>
                New to AgriConnect? <Link to="/register">Create an account</Link>
              </span>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
