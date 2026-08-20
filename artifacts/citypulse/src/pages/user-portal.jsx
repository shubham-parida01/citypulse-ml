import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Camera, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  ArrowLeft, 
  Search, 
  Download, 
  ShieldCheck, 
  Share2, 
  UserCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { INDIA_CITIES } from '../lib/india-cities.js';

export function UserPortal() {
  const [selectedCity, setSelectedCity] = useState('mumbai');
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'resolved' | 'helplines'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const cityObj = INDIA_CITIES[selectedCity] || INDIA_CITIES.mumbai;

  // Mock Citizen Tickets for Indian Cities
  const userTickets = [
    {
      id: 'CP-MUM-2026-8901',
      category: 'Pothole & Road Damage',
      city: 'mumbai',
      location: 'Bandra West, Ward H-West (Near Linking Road)',
      reportedAt: '2026-08-19 14:30',
      status: 'IN_PROGRESS',
      department: 'BMC Public Works Dept (Roads)',
      officer: 'Suresh Patil (Crew #14)',
      priority: 'HIGH',
      description: 'Dangerous 2ft deep pothole right before the traffic signal causing severe congestion.',
      timeline: [
        { title: 'Report Filed by Citizen', time: '19 Aug 14:30', done: true },
        { title: 'AI AI Gemini Auto-Classified Signal', time: '19 Aug 14:31', done: true },
        { title: 'BMC Command Center Approved & Dispatched', time: '19 Aug 15:10', done: true },
        { title: 'Field Crew On-Site Repair in Motion', time: '20 Aug 10:15', done: true },
        { title: 'Citizen Final Verification Pending', time: 'Estimated Today 18:00', done: false },
      ]
    },
    {
      id: 'CP-BLR-2026-4412',
      category: 'Garbage & Solid Waste',
      city: 'bengaluru',
      location: 'Indiranagar 100ft Road (Near Metro Station)',
      reportedAt: '2026-08-18 09:15',
      status: 'RESOLVED',
      department: 'BBMP Solid Waste Management',
      officer: 'Harish Kumar (Zone 8)',
      priority: 'MEDIUM',
      description: 'Overflowing commercial waste bin blocking pedestrian footpath.',
      resolutionPhoto: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=60',
      timeline: [
        { title: 'Report Filed', time: '18 Aug 09:15', done: true },
        { title: 'BBMP SWM Crew Dispatched', time: '18 Aug 10:00', done: true },
        { title: 'Site Cleaned & Verified', time: '18 Aug 13:45', done: true },
      ]
    },
    {
      id: 'CP-DEL-2026-1029',
      category: 'Streetlight Failure',
      city: 'delhi',
      location: 'Central Delhi, Connaught Place Outer Circle',
      reportedAt: '2026-08-17 21:00',
      status: 'RESOLVED',
      department: 'MCD Electrical Cell / BSES',
      officer: 'Praveen Gupta',
      priority: 'HIGH',
      description: 'Entire row of 4 streetlights dark creating safety hazard for commuters.',
      timeline: [
        { title: 'Report Filed', time: '17 Aug 21:00', done: true },
        { title: 'MCD Electrical Crew Replaced Transformer Fuse', time: '18 Aug 02:30', done: true },
      ]
    }
  ];

  const filteredTickets = userTickets.filter(t => {
    const matchesCity = t.city === selectedCity;
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.location.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'active') return matchesCity && matchesSearch && t.status !== 'RESOLVED';
    if (activeTab === 'resolved') return matchesCity && matchesSearch && t.status === 'RESOLVED';
    return matchesCity && matchesSearch;
  });

  return (
    <div className="user-portal-page">
      {/* Top Navbar */}
      <header className="portal-navbar">
        <div className="portal-nav-container">
          <Link href="/" className="brand-logo">
            <span className="brand-mark"><span /></span>
            <span>CityPulse 🇮🇳</span>
          </Link>

          {/* City Switcher */}
          <div className="city-switcher-badge">
            <Building2 size={16} />
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
              {Object.values(INDIA_CITIES).map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.shortBody})</option>
              ))}
            </select>
          </div>

          <div className="user-profile-chip">
            <UserCheck size={16} />
            <span>Citizen User Portal</span>
            <Link href="/login" className="logout-btn">Switch Role</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="portal-main">
        {/* Welcome Header */}
        <div className="portal-hero-banner">
          <div>
            <span className="city-tag">{cityObj.body}</span>
            <h1>My Civic Reports & Direct Tracking</h1>
            <p>Track every report filed in {cityObj.name}. Verified directly by municipal field crews.</p>
          </div>
          <Link href="/report" className="pill-button pill-button-large">
            <Camera size={18} /> Report New Issue in {cityObj.shortBody}
          </Link>
        </div>

        {/* Emergency Helpline Strip */}
        <div className="emergency-strip">
          <div className="emergency-item">
            <Phone size={18} className="phone-icon" />
            <div>
              <strong>{cityObj.shortBody} 24x7 Control Room Helpline:</strong>
              <span>Dial <strong>{cityObj.helpline}</strong> for immediate emergency assistance</span>
            </div>
          </div>
          <a href={`tel:${cityObj.helpline}`} className="call-now-btn">Call {cityObj.helpline}</a>
        </div>

        {/* Tab Filters */}
        <div className="portal-tabs-bar">
          <div className="tabs-list">
            <button 
              className={`portal-tab ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active In-Progress ({userTickets.filter(t => t.city === selectedCity && t.status !== 'RESOLVED').length})
            </button>
            <button 
              className={`portal-tab ${activeTab === 'resolved' ? 'active' : ''}`}
              onClick={() => setActiveTab('resolved')}
            >
              Resolved & Verified ({userTickets.filter(t => t.city === selectedCity && t.status === 'RESOLVED').length})
            </button>
            <button 
              className={`portal-tab ${activeTab === 'helplines' ? 'active' : ''}`}
              onClick={() => setActiveTab('helplines')}
            >
              Municipal Departments & Contacts
            </button>
          </div>

          <div className="portal-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search ticket ID or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'helplines' ? (
          <div className="department-grid-section">
            <h2>{cityObj.body} Department Directory</h2>
            <div className="dept-cards">
              {cityObj.departments.map(dept => (
                <div key={dept.id} className="dept-card">
                  <h3>{dept.name}</h3>
                  <p><strong>Department Head:</strong> {dept.head}</p>
                  <p><strong>Direct Helpline:</strong> {dept.phone}</p>
                  <a href={`tel:${dept.phone}`} className="dept-call-btn">
                    <Phone size={14} /> Call Department
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="tickets-list-container">
            {filteredTickets.length === 0 ? (
              <div className="empty-tickets-card">
                <AlertTriangle size={32} />
                <h3>No tickets found for {cityObj.name}</h3>
                <p>You have no {activeTab} tickets filed under {cityObj.shortBody}. Click below to file your first report!</p>
                <Link href="/report" className="pill-button">
                  <Camera size={16} /> File A Report
                </Link>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div key={ticket.id} className="ticket-card-item">
                  <div className="ticket-card-header">
                    <div>
                      <span className="ticket-id-tag">{ticket.id}</span>
                      <h3>{ticket.category}</h3>
                      <p className="location-line"><MapPin size={14} /> {ticket.location}</p>
                    </div>
                    <div className="ticket-meta-right">
                      <span className={`status-pill ${ticket.status.toLowerCase()}`}>
                        {ticket.status === 'RESOLVED' ? 'Resolved & Verified' : 'In Progress (Crew On-Site)'}
                      </span>
                      <span className="date-line"><Calendar size={13} /> {ticket.reportedAt}</span>
                    </div>
                  </div>

                  <p className="ticket-description">{ticket.description}</p>

                  <div className="ticket-department-info">
                    <span><strong>Assigned Department:</strong> {ticket.department}</span>
                    <span><strong>Lead Officer:</strong> {ticket.officer}</span>
                  </div>

                  {/* Progress Timeline */}
                  <div className="ticket-timeline-stepper">
                    {ticket.timeline.map((step, idx) => (
                      <div key={idx} className={`timeline-step ${step.done ? 'completed' : ''}`}>
                        <div className="step-bullet">
                          {step.done ? <CheckCircle2 size={14} /> : idx + 1}
                        </div>
                        <div className="step-info">
                          <strong>{step.title}</strong>
                          <small>{step.time}</small>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="ticket-card-footer">
                    <button 
                      onClick={() => setSelectedTicket(ticket)} 
                      className="receipt-btn"
                    >
                      <Download size={14} /> Official Municipal Ticket Receipt
                    </button>

                    <button 
                      onClick={() => alert(`Shared ticket ${ticket.id} reference.`)} 
                      className="share-btn"
                    >
                      <Share2 size={14} /> Share Update
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Ticket Receipt Modal */}
      {selectedTicket && (
        <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
          <div className="modal-receipt-card" onClick={e => e.stopPropagation()}>
            <div className="receipt-header">
              <ShieldCheck size={28} />
              <h2>Official Civic Receipt</h2>
              <span className="receipt-city">{cityObj.body}</span>
            </div>

            <div className="receipt-body">
              <div className="receipt-row">
                <span>Ticket Reference:</span>
                <strong>{selectedTicket.id}</strong>
              </div>
              <div className="receipt-row">
                <span>Issue Category:</span>
                <strong>{selectedTicket.category}</strong>
              </div>
              <div className="receipt-row">
                <span>Ward & Location:</span>
                <strong>{selectedTicket.location}</strong>
              </div>
              <div className="receipt-row">
                <span>Department Assigned:</span>
                <strong>{selectedTicket.department}</strong>
              </div>
              <div className="receipt-row">
                <span>Current Status:</span>
                <strong className="status-highlight">{selectedTicket.status}</strong>
              </div>
              <div className="receipt-row">
                <span>Filing Timestamp:</span>
                <strong>{selectedTicket.reportedAt}</strong>
              </div>
            </div>

            <div className="receipt-footer">
              <button onClick={() => window.print()} className="pill-button">
                <Download size={14} /> Print / Save PDF Receipt
              </button>
              <button onClick={() => setSelectedTicket(null)} className="close-modal-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
