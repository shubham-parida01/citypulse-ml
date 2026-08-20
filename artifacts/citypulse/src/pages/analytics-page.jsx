import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Download, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Users, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { INDIA_CITIES, getCityAnalytics } from '../lib/india-cities.js';

export function AnalyticsPage({ activeCityId }) {
  const [selectedCity, setSelectedCity] = useState(activeCityId || 'mumbai');
  const [timeRange, setTimeRange] = useState('7d'); // '7d' | '30d' | '90d'

  const cityObj = INDIA_CITIES[selectedCity] || INDIA_CITIES.mumbai;
  const analyticsData = getCityAnalytics(selectedCity);

  const exportReportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `City,${cityObj.name}\n`
      + `Municipal Body,${cityObj.body}\n`
      + `Total Complaints,${analyticsData.totalComplaints}\n`
      + `Open Complaints,${analyticsData.openComplaints}\n`
      + `SLA Compliance,${analyticsData.slaCompliance}\n`
      + `Avg Resolution Time,${analyticsData.avgResolutionHours}h\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${cityObj.id}_municipal_analytics_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="analytics-page-container">
      {/* Header */}
      <header className="analytics-header">
        <div className="analytics-header-wrap">
          <div>
            <div className="analytics-title-row">
              <span className="city-pill">{cityObj.body}</span>
              <h1>{cityObj.name} Municipal Analytics</h1>
            </div>
            <p>Real-time civic complaint analytics, ward-level SLAs, and department crew performance</p>
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

            {/* Time Range */}
            <div className="time-range-picker">
              <button className={timeRange === '7d' ? 'active' : ''} onClick={() => setTimeRange('7d')}>7 Days</button>
              <button className={timeRange === '30d' ? 'active' : ''} onClick={() => setTimeRange('30d')}>30 Days</button>
              <button className={timeRange === '90d' ? 'active' : ''} onClick={() => setTimeRange('90d')}>90 Days</button>
            </div>

            <button onClick={exportReportCSV} className="export-csv-btn">
              <Download size={15} /> Export {cityObj.shortBody} CSV Report
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="analytics-main-wrap">
        {/* KPI Cards Grid */}
        <div className="analytics-kpi-grid">
          <div className="kpi-metric-card">
            <div className="kpi-card-header">
              <span>Total Complaints Received</span>
              <BarChart3 size={18} className="kpi-icon" />
            </div>
            <strong>{analyticsData.totalComplaints}</strong>
            <small className="trend-up"><TrendingUp size={12} /> +14.2% from last month in {cityObj.shortBody}</small>
          </div>

          <div className="kpi-metric-card highlight-card">
            <div className="kpi-card-header">
              <span>Active Open Queue</span>
              <AlertCircle size={18} className="kpi-icon alert-icon" />
            </div>
            <strong>{analyticsData.openComplaints}</strong>
            <small>Active in {cityObj.name} Wards</small>
          </div>

          <div className="kpi-metric-card">
            <div className="kpi-card-header">
              <span>SLA Resolution Rate</span>
              <ShieldCheck size={18} className="kpi-icon" />
            </div>
            <strong>{analyticsData.slaCompliance}</strong>
            <small className="trend-up"><CheckCircle2 size={12} /> Meets {cityObj.shortBody} Charter Target</small>
          </div>

          <div className="kpi-metric-card">
            <div className="kpi-card-header">
              <span>Avg. Resolution Time</span>
              <Clock size={18} className="kpi-icon" />
            </div>
            <strong>{analyticsData.avgResolutionHours}h</strong>
            <small>Down 2.4h across {cityObj.name} Wards</small>
          </div>
        </div>

        {/* Charts & Breakdown Grid */}
        <div className="analytics-charts-grid">
          {/* Daily Inflow Bar Chart */}
          <div className="chart-box-card">
            <div className="box-card-header">
              <div>
                <h2>{cityObj.name} Daily Inflow & Resolution</h2>
                <p>Comparison of received complaints vs {cityObj.shortBody} field crew resolutions</p>
              </div>
              <span className="live-status-pill">● Synchronized with {cityObj.shortBody} Server</span>
            </div>

            <div className="bar-chart-visual">
              {analyticsData.dailyVolume.map((item, idx) => (
                <div key={idx} className="chart-column">
                  <div className="bars-pair">
                    <div className="barReceived" style={{ height: `${(item.count / 110) * 180}px` }} title={`Received: ${item.count}`} />
                    <div className="barResolved" style={{ height: `${(item.resolved / 110) * 180}px` }} title={`Resolved: ${item.resolved}`} />
                  </div>
                  <span className="col-label">{item.day}</span>
                </div>
              ))}
            </div>

            <div className="chart-legend">
              <span><i className="legend-box legend-received" /> Received ({cityObj.name})</span>
              <span><i className="legend-box legend-resolved" /> Field Resolved ({cityObj.shortBody})</span>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="chart-box-card">
            <div className="box-card-header">
              <div>
                <h2>{cityObj.name} Complaint Categories</h2>
                <p>Distribution by municipal civic issue type</p>
              </div>
            </div>

            <div className="categories-list">
              {analyticsData.categories.map((cat, idx) => (
                <div key={idx} className="category-item-row">
                  <div className="cat-info-head">
                    <span>{cat.icon} {cat.name}</span>
                    <strong>{cat.count} ({cat.percentage}%)</strong>
                  </div>
                  <div className="cat-progress-track">
                    <div className="cat-progress-fill" style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ward Breakdown & Department SLA Performance Grid */}
        <div className="analytics-table-grid">
          {/* Ward Breakdown */}
          <div className="table-box-card">
            <div className="box-card-header">
              <h2>{cityObj.shortBody} Ward-wise Complaint Breakdown</h2>
            </div>
            <table className="analytics-data-table">
              <thead>
                <tr>
                  <th>Municipal Ward</th>
                  <th>Total Filed</th>
                  <th>Active Open</th>
                  <th>SLA Compliance</th>
                </tr>
              </thead>
              <tbody>
                {cityObj.wards.slice(0, 5).map((wardName, idx) => (
                  <tr key={idx}>
                    <td><strong>{wardName}</strong></td>
                    <td>{80 + (idx * 15)}</td>
                    <td><span className="open-tag">{4 + idx}</span></td>
                    <td><span className="sla-tag">{95 + idx * 0.8}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Department Performance */}
          <div className="table-box-card">
            <div className="box-card-header">
              <h2>{cityObj.shortBody} Department Resolution Efficiency</h2>
            </div>
            <table className="analytics-data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Head Officer</th>
                  <th>Helpline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cityObj.departments.map((dept, idx) => (
                  <tr key={idx}>
                    <td><strong>{dept.name}</strong></td>
                    <td>{dept.head}</td>
                    <td>{dept.phone}</td>
                    <td><span className="rating-badge">Active ●</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
