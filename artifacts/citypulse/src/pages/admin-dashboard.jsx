import React, { useState, useRef } from 'react';
import { Link } from 'wouter';
import { 
  ClipboardList, 
  CircleAlert, 
  Zap, 
  Gauge, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Building2, 
  Wrench, 
  MoreHorizontal, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  FileSpreadsheet,
  Upload,
  Download,
  Image,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock4
} from 'lucide-react';
import { INDIA_CITIES, getCityComplaints, getCityAnalytics } from '../lib/india-cities.js';
import { generateBeforeAfterExcelReport, parseExcelCSVImport } from '../lib/excel-reports.js';
import { AnalyticsPage } from './analytics-page.jsx';
import { OfficersPage } from './officers-page.jsx';

export function AdminDashboard() {
  const [selectedCity, setSelectedCity] = useState('mumbai');
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'analytics' | 'officers'
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  
  const fileInputRef = useRef(null);

  const cityObj = INDIA_CITIES[selectedCity] || INDIA_CITIES.mumbai;
  const initialComplaints = getCityComplaints(selectedCity);
  const [complaintsList, setComplaintsList] = useState(initialComplaints);
  const cityAnalytics = getCityAnalytics(selectedCity);

  // Sync state when city changes
  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    setComplaintsList(getCityComplaints(newCity));
  };

  const filteredComplaints = complaintsList.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.ward.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter.toUpperCase();
    return matchesSearch && matchesPriority;
  });

  const handleExportExcel = () => {
    generateBeforeAfterExcelReport(complaintsList, cityObj);
  };

  const handleExcelImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const imported = parseExcelCSVImport(text);
      if (imported.length > 0) {
        setComplaintsList(prev => [...imported, ...prev]);
        alert(`Successfully imported ${imported.length} complaint rows from Excel sheet!`);
      } else {
        alert("Unable to parse Excel file format. Please upload a valid .csv file.");
      }
    };
    reader.readAsText(file);
  };

  const handleAssignCrew = (id, newOfficer) => {
    setComplaintsList(prev => prev.map(c => c.id === id ? { ...c, status: 'ASSIGNED', officer: newOfficer } : c));
    alert(`Dispatched crew "${newOfficer}" to complaint ${id} in ${cityObj.shortBody}`);
  };

  const handleUpdateStatus = (id, newStatus) => {
    setComplaintsList(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Hidden File Input for Excel Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".csv, .xlsx" 
        style={{ display: 'none' }} 
      />

      {/* Top Operations Navbar */}
      <header className="admin-ops-navbar">
        <div className="admin-nav-left">
          <Link href="/" className="admin-brand">
            <span className="brand-mark"><span /></span>
            <span>CityPulse Municipal Command 🇮🇳</span>
          </Link>
          <span className="nav-divider">|</span>
          <span className="admin-role-badge">{cityObj.body} Operator Portal</span>
        </div>

        <div className="admin-nav-right">
          {/* City Selector */}
          <div className="admin-city-badge">
            <Building2 size={16} />
            <select value={selectedCity} onChange={(e) => handleCityChange(e.target.value)}>
              {Object.values(INDIA_CITIES).map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.shortBody})</option>
              ))}
            </select>
          </div>

          <div className="operator-profile">
            <span className="avatar-small">AS</span>
            <span>Operator: Aarav Shah ({cityObj.shortBody})</span>
          </div>

          <Link href="/login" className="logout-link">Exit Operator Mode</Link>
        </div>
      </header>

      {/* Main Admin Page */}
      <main className="admin-main-wrap">
        {/* Welcome Header & Excel Actions */}
        <div className="admin-welcome-bar">
          <div>
            <span className="eyebrow-text">{cityObj.body} · Live Control Room</span>
            <h1>{cityObj.name} Municipal Command Center</h1>
            <p>Triage complaints, track Before vs After completion evidence, and generate Excel audit reports.</p>
          </div>

          <div className="welcome-right-actions">
            {/* Excel Export Button */}
            <button onClick={handleExportExcel} className="excel-action-btn export">
              <FileSpreadsheet size={16} /> Export Excel Audit Report
            </button>

            {/* Excel Import Button */}
            <button onClick={handleExcelImportClick} className="excel-action-btn import">
              <Upload size={16} /> Import Excel Complaints
            </button>

            <button onClick={() => setActiveTab(activeTab === 'queue' ? 'analytics' : 'queue')} className="analytics-btn">
              <Gauge size={16} /> {activeTab === 'queue' ? 'Open City Analytics' : 'Return to Complaint Queue'}
            </button>
          </div>
        </div>

        {/* Dynamic KPI Cards per City */}
        <div className="admin-kpis-grid">
          <div className="admin-kpi-card">
            <div className="kpi-icon-wrapper"><ClipboardList size={18} /></div>
            <div>
              <span>{cityObj.shortBody} Complaints Filed</span>
              <strong>{complaintsList.length}</strong>
              <small>+12.8% this month in {cityObj.name}</small>
            </div>
          </div>

          <div className="admin-kpi-card highlight-kpi">
            <div className="kpi-icon-wrapper alert"><CheckCircle2 size={18} /></div>
            <div>
              <span>Completed / Resolved</span>
              <strong>{complaintsList.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length}</strong>
              <small>Verified with After Repair photos</small>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon-wrapper"><Clock4 size={18} /></div>
            <div>
              <span>In-Progress / Dispatched</span>
              <strong>{complaintsList.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length}</strong>
              <small>Field crew active on-site</small>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon-wrapper"><AlertTriangle size={18} /></div>
            <div>
              <span>Not Complete / Pending</span>
              <strong>{complaintsList.filter(c => c.status === 'AWAITING_REVIEW').length}</strong>
              <small>Awaiting human triage</small>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="admin-tabs-nav">
          <div className="tabs-list">
            <button 
              className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
              onClick={() => setActiveTab('queue')}
            >
              {cityObj.shortBody} Live Complaint Queue ({filteredComplaints.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              {cityObj.name} Analytics & Ward Metrics
            </button>
            <button 
              className={`tab-btn ${activeTab === 'officers' ? 'active' : ''}`}
              onClick={() => setActiveTab('officers')}
            >
              {cityObj.shortBody} Field Officers Directory
            </button>
          </div>

          {activeTab === 'queue' && (
            <div className="queue-search-filter">
              <div className="search-input-wrap">
                <Search size={15} />
                <input 
                  type="text" 
                  placeholder={`Search ${cityObj.shortBody} complaint ID or ward...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-chips">
                {['All', 'Critical', 'High', 'Medium', 'Low'].map(p => (
                  <button 
                    key={p} 
                    className={`filter-chip ${priorityFilter === p ? 'active' : ''}`}
                    onClick={() => setPriorityFilter(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        {activeTab === 'analytics' ? (
          <AnalyticsPage activeCityId={selectedCity} />
        ) : activeTab === 'officers' ? (
          <OfficersPage activeCityId={selectedCity} />
        ) : (
          <div className="queue-and-map-grid">
            {/* Live Queue Table */}
            <div className="complaints-queue-card">
              <div className="queue-card-header">
                <div>
                  <h2>{cityObj.name} Complaints Queue & Completion Status</h2>
                  <span>Inspect Before vs After repair evidence for every ticket</span>
                </div>

                <button onClick={handleExportExcel} className="export-link-btn">
                  <Download size={14} /> Download Excel Report
                </button>
              </div>

              <div className="complaints-table-wrapper">
                <table className="complaints-table">
                  <thead>
                    <tr>
                      <th>Complaint Reference ID</th>
                      <th>Ward & Coordinates</th>
                      <th>Category & Priority</th>
                      <th>Completion Status</th>
                      <th>Assigned Department</th>
                      <th>Before / After Evidence</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map(item => {
                      const isComplete = item.status === 'RESOLVED' || item.status === 'CLOSED';
                      const isInProgress = item.status === 'IN_PROGRESS' || item.status === 'ASSIGNED';
                      
                      return (
                        <tr key={item.id} className={item.priority === 'CRITICAL' ? 'critical-row' : ''}>
                          <td>
                            <div className="complaint-id-col">
                              <strong>{item.id}</strong>
                              <small>{item.reportedAt}</small>
                            </div>
                          </td>
                          <td>
                            <div className="location-cell">
                              <MapPin size={13} />
                              <span>{item.ward}</span>
                            </div>
                          </td>
                          <td>
                            <div className="category-priority-cell">
                              <strong>{item.categoryLabel}</strong>
                              <span className={`priority-tag ${item.priority.toLowerCase()}`}>
                                {item.priority}
                              </span>
                            </div>
                          </td>
                          <td>
                            {/* Explicit Completion Status Badge */}
                            {isComplete ? (
                              <span className="status-badge-complete">
                                <CheckCircle size={12} /> COMPLETE
                              </span>
                            ) : isInProgress ? (
                              <span className="status-badge-inprogress">
                                <Clock4 size={12} /> IN PROGRESS
                              </span>
                            ) : (
                              <span className="status-badge-notcomplete">
                                <AlertTriangle size={12} /> NOT COMPLETE
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="officer-name-cell">{item.department}</span>
                          </td>
                          <td>
                            <div className="evidence-badge-cell">
                              <span className="evidence-tag before">📷 BEFORE</span>
                              {isComplete && <span className="evidence-tag after">✅ AFTER</span>}
                            </div>
                          </td>
                          <td>
                            <button 
                              className="triage-btn"
                              onClick={() => setSelectedComplaint(item)}
                            >
                              Inspect Before / After
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive City Faux Map Card */}
            <div className="admin-map-card">
              <div className="map-card-header">
                <h3><MapPin size={16} /> {cityObj.name} Live Incident Map</h3>
                <small>{cityObj.body} · {cityObj.totalWards} Wards</small>
              </div>

              <div className="interactive-map-area">
                <div className="map-grid-overlay" />
                {filteredComplaints.slice(0, 4).map((c, i) => (
                  <div 
                    key={c.id} 
                    className={`map-pin-marker pin-pos-${i + 1}`}
                    onClick={() => setSelectedComplaint(c)}
                    title={`${c.id}: ${c.ward} — ${c.categoryLabel}`}
                  >
                    <span>{i + 1}</span>
                  </div>
                ))}
              </div>

              <div className="city-ward-labels-bar">
                <span>📍 {cityObj.mapLabels.join(' • ')}</span>
              </div>

              <div className="map-legend-strip">
                <span>🟢 COMPLETE</span>
                <span>🟠 IN PROGRESS</span>
                <span>🔴 NOT COMPLETE</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Before vs After Detailed Inspection Drawer Modal */}
      {selectedComplaint && (
        <div className="modal-backdrop" onClick={() => setSelectedComplaint(null)}>
          <div className="drawer-triage-card wide-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="drawer-id">{selectedComplaint.id} ({cityObj.shortBody})</span>
                <h2>{selectedComplaint.categoryLabel} — Detailed Inspection Report</h2>
                <p><MapPin size={14} /> {selectedComplaint.ward} — {selectedComplaint.location}</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedComplaint(null)}>✕</button>
            </div>

            <div className="drawer-body">
              {/* Before vs After Side-by-Side Photo Comparison */}
              <div className="before-after-comparison-grid">
                {/* BEFORE Repair Box */}
                <div className="comparison-box before-box">
                  <div className="box-tag before"><Image size={14} /> BEFORE REPAIR EVIDENCE</div>
                  <div className="comparison-img-wrapper">
                    <img 
                      src={selectedComplaint.beforePhoto || "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=600&q=80"} 
                      alt="Before Repair" 
                    />
                  </div>
                  <div className="box-meta">
                    <strong>Reported: {selectedComplaint.reportedAt}</strong>
                    <p>AI Vision Severity: <strong>{selectedComplaint.severity || 8.7} / 10.0</strong></p>
                    <p>"{selectedComplaint.description}"</p>
                  </div>
                </div>

                <div className="comparison-arrow">
                  <ArrowRight size={24} />
                </div>

                {/* AFTER Repair Box */}
                <div className="comparison-box after-box">
                  <div className="box-tag after"><CheckCircle size={14} /> AFTER COMPLETION EVIDENCE</div>
                  <div className="comparison-img-wrapper">
                    {selectedComplaint.status === 'RESOLVED' || selectedComplaint.status === 'CLOSED' ? (
                      <img 
                        src={selectedComplaint.afterPhoto || "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80"} 
                        alt="After Repair" 
                      />
                    ) : (
                      <div className="no-after-img">
                        <Clock4 size={32} />
                        <span>Work In-Progress or Pending</span>
                        <small>Field crew photo evidence will appear once marked COMPLETE</small>
                      </div>
                    )}
                  </div>
                  <div className="box-meta">
                    <strong>
                      Completion Status: {selectedComplaint.status === 'RESOLVED' ? 'COMPLETE ✅' : 'IN-PROGRESS 🚧'}
                    </strong>
                    <p>Assigned Officer: <strong>{selectedComplaint.officer || selectedComplaint.department}</strong></p>
                    <p>SLA Resolution Target: <strong>24.0 Hours</strong></p>
                  </div>
                </div>
              </div>

              {/* Status Update & Crew Actions */}
              <div className="drawer-actions-panel">
                <h3>Update Complaint Status & Field Crew</h3>
                <div className="dispatch-controls">
                  <div className="control-group">
                    <label>Assign {cityObj.shortBody} Department Crew:</label>
                    <select 
                      value={selectedComplaint.officer}
                      onChange={(e) => handleAssignCrew(selectedComplaint.id, e.target.value)}
                    >
                      {cityObj.departments.map(dept => (
                        <option key={dept.id} value={`${dept.head} (${dept.name})`}>
                          {dept.name} — {dept.head} ({dept.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="control-group">
                    <label>Set Current Status:</label>
                    <div className="status-button-group">
                      <button 
                        className={`status-opt-btn ${selectedComplaint.status === 'AWAITING_REVIEW' ? 'active' : ''}`}
                        onClick={() => handleUpdateStatus(selectedComplaint.id, 'AWAITING_REVIEW')}
                      >
                        Set NOT COMPLETE
                      </button>
                      <button 
                        className={`status-opt-btn ${selectedComplaint.status === 'IN_PROGRESS' ? 'active' : ''}`}
                        onClick={() => handleUpdateStatus(selectedComplaint.id, 'IN_PROGRESS')}
                      >
                        Set IN-PROGRESS
                      </button>
                      <button 
                        className={`status-opt-btn resolve ${selectedComplaint.status === 'RESOLVED' ? 'active' : ''}`}
                        onClick={() => handleUpdateStatus(selectedComplaint.id, 'RESOLVED')}
                      >
                        Mark COMPLETE & Attach Evidence
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
