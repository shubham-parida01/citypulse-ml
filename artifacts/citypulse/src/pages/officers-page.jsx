import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Search, 
  UserCheck, 
  Wrench, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Users,
  Award,
  Sparkles,
  PhoneCall,
  Navigation,
  ArrowUpRight,
  TrendingUp,
  CircleDot
} from 'lucide-react';
import { INDIA_CITIES } from '../lib/india-cities.js';
import { getCityOfficers } from '../lib/india-officers.js';

export function OfficersPage({ activeCityId }) {
  const [selectedCity, setSelectedCity] = useState(activeCityId || 'mumbai');
  const [dutyFilter, setDutyFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const cityObj = INDIA_CITIES[selectedCity] || INDIA_CITIES.mumbai;
  const officersList = getCityOfficers(selectedCity);

  const filteredOfficers = officersList.filter(off => {
    const matchesSearch = off.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          off.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          off.ward.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDuty = dutyFilter === 'All' || off.status === dutyFilter;
    return matchesSearch && matchesDuty;
  });

  return (
    <div className="officers-page-container">
      {/* Header */}
      <header className="officers-header">
        <div className="officers-header-wrap">
          <div>
            <div className="officers-title-row">
              <span className="city-pill">{cityObj.body}</span>
              <h1>{cityObj.name} Field Officers Directory</h1>
            </div>
            <p>Municipal field inspectors, lead engineers, and sanitation crew dispatch roster</p>
          </div>

          <div className="header-controls">
            {/* City Switcher */}
            <div className="analytics-city-switcher">
              <Building2 size={16} />
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                {Object.values(INDIA_CITIES).map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.shortBody})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="officers-main-wrap">
        {/* KPI Strip */}
        <div className="officers-kpis-strip">
          <div className="officer-kpi-box">
            <div className="kpi-top">
              <span>Total Officers in {cityObj.shortBody}</span>
              <Users size={18} className="kpi-ico" />
            </div>
            <strong>{officersList.length} Officers</strong>
            <small>Assigned across {cityObj.totalWards} Wards</small>
          </div>

          <div className="officer-kpi-box highlight">
            <div className="kpi-top">
              <span>On-Duty & Active</span>
              <CircleDot size={18} className="kpi-ico green-pulse" />
            </div>
            <strong>{officersList.filter(o => o.status === 'ON_DUTY').length} Active</strong>
            <small>Available for immediate dispatch</small>
          </div>

          <div className="officer-kpi-box">
            <div className="kpi-top">
              <span>Off-Duty Shift Ended</span>
              <Clock size={18} className="kpi-ico" />
            </div>
            <strong>{officersList.filter(o => o.status === 'OFF_DUTY').length} Offline</strong>
            <small>Shift paused or completed</small>
          </div>

          <div className="officer-kpi-box">
            <div className="kpi-top">
              <span>Avg Resolution SLA</span>
              <Clock size={18} className="kpi-ico" />
            </div>
            <strong>9.4 Hours</strong>
            <small>Charter Target: 24.0h</small>
          </div>
        </div>

        {/* Tools & Search Bar */}
        <div className="officers-tools-bar">
          <div className="search-input-wrap">
            <Search size={15} />
            <input 
              type="text" 
              placeholder={`Search ${cityObj.name} officer name, ward, or department...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="duty-filter-chips">
            {[
              { id: 'All', label: 'All Officers' },
              { id: 'ON_DUTY', label: '🟢 On Duty' },
              { id: 'OFF_DUTY', label: '⚪ Off Duty' }
            ].map(f => (
              <button 
                key={f.id}
                className={`duty-chip ${dutyFilter === f.id ? 'active' : ''}`}
                onClick={() => setDutyFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Officers Grid */}
        <div className="officers-cards-grid">
          {filteredOfficers.map(officer => (
            <div key={officer.badgeId} className="officer-profile-card">
              {/* Profile Card Header */}
              <div className="card-top-row">
                <div className="avatar-wrapper">
                  <div className="officer-avatar">
                    {officer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {officer.status === 'ON_DUTY' && <span className="online-dot-badge" title="On Duty" />}
                </div>

                <div className="officer-title-meta">
                  <div className="badge-row">
                    <span className="badge-tag">{officer.badgeId}</span>
                    <span className="corp-tag">{cityObj.shortBody}</span>
                  </div>
                  <h3>{officer.name}</h3>
                  <span className="designation-text">{officer.designation}</span>
                </div>

                <span className={`duty-badge ${officer.status.toLowerCase()}`}>
                  {officer.status === 'ON_DUTY' ? '🟢 On Duty' : '⚪ Off Duty'}
                </span>
              </div>

              {/* Department & Ward Info */}
              <div className="card-body-details">
                <div className="detail-row">
                  <Building2 size={14} className="detail-icon" />
                  <span>{officer.department}</span>
                </div>

                <div className="detail-row">
                  <MapPin size={14} className="detail-icon" />
                  <span>{officer.ward} ({officer.city})</span>
                </div>

                <div className="detail-row">
                  <Phone size={14} className="detail-icon" />
                  <a href={`tel:${officer.phone}`}>{officer.phone}</a>
                </div>

                <div className="detail-row">
                  <Mail size={14} className="detail-icon" />
                  <a href={`mailto:${officer.email}`}>{officer.email}</a>
                </div>
              </div>

              {/* Active Worklist & Performance SLA */}
              <div className="card-worklist-box">
                <div className="worklist-head">
                  <span>Active Assigned Ticket</span>
                  <strong>{officer.activeTickets.length ? officer.activeTickets.join(', ') : 'None (Available)'}</strong>
                </div>

                <div className="officer-metrics-row">
                  <div>
                    <label>Resolved:</label>
                    <strong>{officer.resolvedCount} Tickets</strong>
                  </div>
                  <div>
                    <label>Avg SLA:</label>
                    <strong>{officer.avgHours}</strong>
                  </div>
                  <div>
                    <label>Rating:</label>
                    <strong className="star-rating">{officer.rating}</strong>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="card-footer-actions">
                <a href={`tel:${officer.phone}`} className="contact-btn">
                  <PhoneCall size={13} /> Call Officer
                </a>
                <button 
                  className="dispatch-action-btn"
                  onClick={() => alert(`Initiated dispatch call to ${officer.name} for ${cityObj.name} Ward.`)}
                >
                  <Wrench size={13} /> Dispatch Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
