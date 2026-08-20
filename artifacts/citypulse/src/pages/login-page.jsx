import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { User, Shield, Wrench, ArrowRight, Building2, CheckCircle2, KeyRound, Phone, MapPin } from 'lucide-react';
import { INDIA_CITIES } from '../lib/india-cities.js';

export function LoginPage() {
  const [, setLocation] = useLocation();
  const [role, setRole] = useState('citizen'); // 'citizen' | 'operator' | 'officer'
  const [city, setCity] = useState('mumbai');
  const [phone, setPhone] = useState('');
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedCity = INDIA_CITIES[city] || INDIA_CITIES.mumbai;

  const handleLogin = (e) => {
    e.preventDefault();
    setSuccess(true);
    if (role === 'operator') {
      localStorage.setItem('cp_operator_auth', 'true');
    } else if (role === 'citizen') {
      localStorage.setItem('cp_citizen_auth', 'true');
    }
    setTimeout(() => {
      if (role === 'operator') {
        setLocation('/admin');
      } else if (role === 'officer') {
        setLocation('/officer');
      } else {
        setLocation('/portal');
      }
    }, 600);
  };

  const handleQuickDemo = (demoRole) => {
    setRole(demoRole);
    setSuccess(true);
    if (demoRole === 'operator') {
      localStorage.setItem('cp_operator_auth', 'true');
    } else if (demoRole === 'citizen') {
      localStorage.setItem('cp_citizen_auth', 'true');
    }
    setTimeout(() => {
      if (demoRole === 'operator') {
        setLocation('/admin');
      } else if (demoRole === 'officer') {
        setLocation('/officer');
      } else {
        setLocation('/portal');
      }
    }, 400);
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <Link href="/" className="login-brand">
            <span className="brand-mark"><span /></span>
            <span>CityPulse 🇮🇳</span>
          </Link>
          <h2>Municipal Access Portal</h2>
          <p>Select your city & role to access Indian civic services</p>
        </div>

        {/* City Selector */}
        <div className="login-city-selector">
          <label className="city-label">
            <Building2 size={16} /> Select Municipal Corporation:
          </label>
          <select 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            className="city-dropdown"
          >
            {Object.values(INDIA_CITIES).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.shortBody} ({c.body})
              </option>
            ))}
          </select>
        </div>

        {/* Role Tabs */}
        <div className="login-role-tabs">
          <button 
            type="button"
            className={`role-tab ${role === 'citizen' ? 'active' : ''}`}
            onClick={() => setRole('citizen')}
          >
            <User size={16} />
            <span>Citizen</span>
          </button>

          <button 
            type="button"
            className={`role-tab ${role === 'operator' ? 'active' : ''}`}
            onClick={() => setRole('operator')}
          >
            <Shield size={16} />
            <span>Command Center</span>
          </button>

          <button 
            type="button"
            className={`role-tab ${role === 'officer' ? 'active' : ''}`}
            onClick={() => setRole('officer')}
          >
            <Wrench size={16} />
            <span>Field Officer</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="login-form">
          {role === 'citizen' && (
            <div className="form-group">
              <label>Mobile Number (for OTP verification)</label>
              <div className="input-with-icon">
                <Phone size={16} />
                <input 
                  type="tel" 
                  placeholder="+91 98765 43210" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <small className="field-hint">Used for SMS status updates from {selectedCity.shortBody}</small>
            </div>
          )}

          {(role === 'operator' || role === 'officer') && (
            <>
              <div className="form-group">
                <label>{role === 'operator' ? 'Operator Employee ID' : 'Officer ID / Badge Number'}</label>
                <div className="input-with-icon">
                  <User size={16} />
                  <input 
                    type="text" 
                    placeholder={role === 'operator' ? 'BMC-EMP-9042' : 'BBMP-OFF-4109'} 
                    value={staffId} 
                    onChange={(e) => setStaffId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Municipal Secure Password</label>
                <div className="input-with-icon">
                  <KeyRound size={16} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="login-submit-btn">
            {success ? (
              <span><CheckCircle2 size={18} /> Authenticating...</span>
            ) : (
              <span>Login to {selectedCity.shortBody} {role === 'citizen' ? 'User Portal' : role === 'operator' ? 'Command Center' : 'Field Worklist'} <ArrowRight size={16} /></span>
            )}
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="quick-demo-section">
          <span>Quick Demo One-Click Access:</span>
          <div className="quick-demo-buttons">
            <button onClick={() => handleQuickDemo('citizen')} className="demo-chip">
              Demo Citizen
            </button>
            <button onClick={() => handleQuickDemo('operator')} className="demo-chip">
              Demo Operator ({selectedCity.shortBody})
            </button>
            <button onClick={() => handleQuickDemo('officer')} className="demo-chip">
              Demo Field Officer
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="login-footer">
          <MapPin size={14} />
          <span>Active in {selectedCity.name}: Helpline {selectedCity.helpline}</span>
        </div>
      </div>
    </div>
  );
}
