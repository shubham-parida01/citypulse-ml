import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Building2, 
  Camera, 
  UserCheck, 
  ShieldCheck, 
  Gauge, 
  Users, 
  Wrench, 
  LogIn, 
  ClipboardList, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet,
  Zap,
  PhoneCall
} from 'lucide-react';
import { INDIA_CITIES } from '../lib/india-cities.js';

export function HomePage() {
  const [selectedCity, setSelectedCity] = useState('mumbai');
  const cityObj = INDIA_CITIES[selectedCity] || INDIA_CITIES.mumbai;

  useEffect(() => {
    const handleScrollToHash = () => {
      const hash = window.location.hash || (window.location.href.includes('#') ? '#' + window.location.href.split('#')[1] : '');
      if (hash) {
        const targetId = hash.replace('#', '');
        const elem = document.getElementById(targetId);
        if (elem) {
          setTimeout(() => {
            elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
      }
    };

    handleScrollToHash();
    window.addEventListener('hashchange', handleScrollToHash);
    return () => window.removeEventListener('hashchange', handleScrollToHash);
  }, []);

  const isCitizenAuth = typeof window !== 'undefined' && localStorage.getItem('cp_citizen_auth') === 'true';

  return (
    <div className="home-portal-container">
      {/* Top Main Navigation Bar */}
      <header className="home-main-nav">
        <div className="nav-container">
          <Link href="/" className="brand-logo">
            <span className="brand-dot" />
            <span>CityPulse 🇮🇳</span>
          </Link>

          {/* Navigation Links */}
          <nav className="nav-links-wrap">
            <Link href="/" className="nav-link active">Home</Link>
            <Link href={isCitizenAuth ? "/portal" : "/login"} className="nav-link">User Portal</Link>
            <Link href={isCitizenAuth ? "/report" : "/login"} className="nav-link">File Report</Link>
            <Link href={isCitizenAuth ? "/incidents" : "/login"} className="nav-link">My Reports</Link>
            <a href="/#how-it-works" className="nav-link">How it works</a>
            <a href="/#city-teams" className="nav-link">For city teams</a>
          </nav>

          {/* City Selector & Login Action */}
          <div className="nav-right-actions">
            <div className="nav-city-badge">
              <Building2 size={15} />
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                {Object.values(INDIA_CITIES).map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.shortBody})</option>
                ))}
              </select>
            </div>

            <Link href="/login" className="login-pill-btn">
              <LogIn size={15} /> {isCitizenAuth ? "Logged In (Citizen)" : "Login Portal"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="home-hero-section">
        <div className="hero-content-wrap">
          <span className="hero-eyebrow">
            <Sparkles size={14} /> AI-Powered Municipal Infrastructure Governance Platform
          </span>
          <h1>Every civic issue has a reference. Every reference has a next step.</h1>
          <p>
            Connected to <strong>{cityObj.body}</strong> across {cityObj.totalWards} Wards. Report potholes, garbage, streetlights, and drainage issues with instant AI Gemini vision detection.
          </p>

          <div className="hero-buttons-row">
            <Link href={isCitizenAuth ? "/report" : "/login"} className="primary-hero-btn">
              <Camera size={18} /> File a Civic Report Now <ArrowRight size={16} />
            </Link>
            <Link href={isCitizenAuth ? "/portal" : "/login"} className="secondary-hero-btn">
              <UserCheck size={18} /> Citizen User Portal
            </Link>
          </div>

          {/* Emergency Helpline Strip */}
          <div className="emergency-helpline-strip">
            <span><PhoneCall size={14} /> 24x7 Control Room Helpline:</span>
            <strong>{cityObj.shortBody} Control Room — Call {cityObj.helpline}</strong>
          </div>
        </div>
      </section>

      {/* Main Redirection Portal Cards Grid */}
      <section className="home-portals-section">
        <div className="section-title-wrap">
          <span className="section-eyebrow">Public Services & Restricted Command Portals</span>
          <h2>Explore CityPulse Applications & Portal Access</h2>
          <p>Public citizen services require Citizen Login. Municipal operator tools require Operator Login.</p>
        </div>

        <div className="portals-cards-grid">
          {/* Card 1: Citizen Report */}
          <Link href={isCitizenAuth ? "/report" : "/login"} className="portal-card highlight-card">
            <div className="portal-card-icon"><Camera size={24} /></div>
            <div className="portal-card-body">
              <span className="card-badge">Citizen Action</span>
              <h3>File New Civic Complaint</h3>
              <p>Upload photo evidence with automated GPS location tagging and Google AI Gemini classification.</p>
              <span className="card-link-arrow">{isCitizenAuth ? "File Complaint" : "Citizen Login Required"} <ArrowRight size={14} /></span>
            </div>
          </Link>

          {/* Card 2: User Portal */}
          <Link href={isCitizenAuth ? "/portal" : "/login"} className="portal-card">
            <div className="portal-card-icon"><UserCheck size={24} /></div>
            <div className="portal-card-body">
              <span className="card-badge">Citizen Dashboard</span>
              <h3>Citizen User Portal</h3>
              <p>Track your active reports, view live step-by-step progress, and download official municipal receipts.</p>
              <span className="card-link-arrow">{isCitizenAuth ? "Open Portal" : "Citizen Login Required"} <ArrowRight size={14} /></span>
            </div>
          </Link>

          {/* Card 3: Admin Command Center (Requires Operator Authentication) */}
          <Link href="/login" className="portal-card">
            <div className="portal-card-icon"><ShieldCheck size={24} /></div>
            <div className="portal-card-body">
              <span className="card-badge">Command Center (Restricted)</span>
              <h3>Municipal Admin Dashboard</h3>
              <p>Triage incoming complaints, review Before/After evidence, dispatch field crews, and export Excel reports.</p>
              <span className="card-link-arrow">Operator Login Required <ArrowRight size={14} /></span>
            </div>
          </Link>

          {/* Card 4: Municipal Analytics */}
          <Link href="/login" className="portal-card">
            <div className="portal-card-icon"><Gauge size={24} /></div>
            <div className="portal-card-body">
              <span className="card-badge">Analytics (Restricted)</span>
              <h3>Municipal Analytics Dashboard</h3>
              <p>Daily complaint volume bar charts, category progress meters, ward SLA breakdown, and department efficiency.</p>
              <span className="card-link-arrow">Operator Login Required <ArrowRight size={14} /></span>
            </div>
          </Link>

          {/* Card 5: Field Officers Directory */}
          <Link href="/login" className="portal-card">
            <div className="portal-card-icon"><Users size={24} /></div>
            <div className="portal-card-body">
              <span className="card-badge">Directory (Restricted)</span>
              <h3>Field Officers Directory</h3>
              <p>Inspect officer profiles, contact phone numbers, assigned wards, active worklists, and duty status per city.</p>
              <span className="card-link-arrow">Operator Login Required <ArrowRight size={14} /></span>
            </div>
          </Link>

          {/* Card 6: Field Crew Terminal */}
          <Link href="/login" className="portal-card">
            <div className="portal-card-icon"><Wrench size={24} /></div>
            <div className="portal-card-body">
              <span className="card-badge">Field Crew Mobile (Restricted)</span>
              <h3>Field Officer Worklist Terminal</h3>
              <p>Mobile-optimized worklist for field repair crews to navigate to location and record after-repair evidence.</p>
              <span className="card-link-arrow">Field Officer Login <ArrowRight size={14} /></span>
            </div>
          </Link>

          {/* Card 7: Multi-Role Login Portal */}
          <Link href="/login" className="portal-card">
            <div className="portal-card-icon"><LogIn size={24} /></div>
            <div className="portal-card-body">
              <span className="card-badge">Authentication</span>
              <h3>Multi-Role Login Portal</h3>
              <p>One-click authentication for Citizens, Command Center Operators, and Field Crew Officers with quick demo buttons.</p>
              <span className="card-link-arrow">Go to Login <ArrowRight size={14} /></span>
            </div>
          </Link>

          {/* Card 8: My Reports Trail */}
          <Link href={isCitizenAuth ? "/incidents" : "/login"} className="portal-card">
            <div className="portal-card-icon"><ClipboardList size={24} /></div>
            <div className="portal-card-body">
              <span className="card-badge">Civic Trail</span>
              <h3>My Reports History</h3>
              <p>View historical civic reports, reference numbers, timeline updates, and status resolution logs.</p>
              <span className="card-link-arrow">{isCitizenAuth ? "View History" : "Citizen Login Required"} <ArrowRight size={14} /></span>
            </div>
          </Link>
        </div>
      </section>

      {/* 5-City Support Hub */}
      <section className="home-cities-hub">
        <div className="cities-hub-wrap">
          <div>
            <h3>Integrated Across 5 Major Indian Municipal Bodies</h3>
            <p>Switch city context anytime to view local ward data, active complaint queues, and municipal officer contacts.</p>
          </div>

          <div className="cities-chips-grid">
            {Object.values(INDIA_CITIES).map(c => (
              <button 
                key={c.id} 
                className={`city-chip-btn ${selectedCity === c.id ? 'active' : ''}`}
                onClick={() => setSelectedCity(c.id)}
              >
                <strong>{c.name}</strong>
                <span>{c.shortBody} · {c.totalWards} Wards</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="home-how-it-works">
        <div className="section-title-wrap">
          <span className="section-eyebrow">End-to-End Governance Lifecycle</span>
          <h2>How CityPulse Solves Civic Issues in 5 Steps</h2>
          <p>From citizen detection to verified repair, see how AI and municipal teams close the loop.</p>
        </div>

        <div className="steps-cards-grid five-steps">
          <div className="step-card">
            <div className="step-top-line">
              <span className="step-num">01</span>
              <span className="step-icon-badge"><Camera size={18} /></span>
            </div>
            <h4>Citizen Photo & GPS Capture</h4>
            <p>Citizen snaps a photo of a pothole, garbage dump, or streetlight. High-precision GPS location (`19.0760° N, 72.8777° E`) and municipal ward are logged automatically.</p>
          </div>

          <div className="step-card highlight-step">
            <div className="step-top-line">
              <span className="step-num">02</span>
              <span className="step-icon-badge"><Sparkles size={18} /></span>
            </div>
            <h4>Google AI Gemini Analysis</h4>
            <p>Google AI Studio Gemini 1.5 Vision detects category (`POTHOLE`), assigns AI severity score (`8.7 / 10.0`), flags priority (`CRITICAL`), and routes to the right municipal department.</p>
          </div>

          <div className="step-card">
            <div className="step-top-line">
              <span className="step-num">03</span>
              <span className="step-icon-badge"><ShieldCheck size={18} /></span>
            </div>
            <h4>Command Center Triage</h4>
            <p>Operator reviews the AI signal on the Command Center Dashboard, assigns a field crew inspector (e.g. *Suresh Patil — BMC Crew #14*), and updates ticket status to `ASSIGNED`.</p>
          </div>

          <div className="step-card">
            <div className="step-top-line">
              <span className="step-num">04</span>
              <span className="step-icon-badge"><Wrench size={18} /></span>
            </div>
            <h4>On-Site Repair & After Photo</h4>
            <p>Field officer arrives at location, starts work timer, completes repair, and captures an **After Evidence Photo** using the mobile repair terminal.</p>
          </div>

          <div className="step-card">
            <div className="step-top-line">
              <span className="step-num">05</span>
              <span className="step-icon-badge"><CheckCircle2 size={18} /></span>
            </div>
            <h4>Citizen Verification & Audit</h4>
            <p>Citizen receives live progress update, verifies completion, downloads official municipal receipt, and system compiles Before/After Excel audit reports.</p>
          </div>
        </div>
      </section>

      {/* For City Teams Section */}
      <section id="city-teams" className="home-city-teams-section">
        <div className="city-teams-container">
          <div className="section-title-wrap text-left">
            <span className="section-eyebrow">Built for Indian Municipal Corporations</span>
            <h2>Integrated Governance for City Operations Teams</h2>
            <p>Tailored tools for <strong>BMC Mumbai</strong>, <strong>BBMP Bengaluru</strong>, <strong>MCD New Delhi</strong>, <strong>PMC Pune</strong>, and <strong>GCC Chennai</strong>.</p>
          </div>

          <div className="city-teams-features-grid">
            <div className="team-feature-card">
              <div className="feature-icon"><ShieldCheck size={24} /></div>
              <h3>Municipal Command Center</h3>
              <p>Calm, high-visibility incident queue with Ward-level triage, AI category overrides, side-by-side Before/After evidence drawer, and Excel audit export.</p>
              <ul className="feature-list">
                <li><CheckCircle2 size={14}/> Ward SLA compliance tracking</li>
                <li><CheckCircle2 size={14}/> AI severity & priority signals</li>
                <li><CheckCircle2 size={14}/> Before vs After visual verification</li>
              </ul>
              <Link href="/login" className="feature-action-link">Command Center Login ➔</Link>
            </div>

            <div className="team-feature-card">
              <div className="feature-icon"><Wrench size={24} /></div>
              <h3>Field Crew Mobile Operations</h3>
              <p>On-site terminal for field inspectors featuring Officer Badge authentication, On-Duty / Off-Duty shift security, GPS navigation, and camera evidence upload.</p>
              <ul className="feature-list">
                <li><CheckCircle2 size={14}/> Badge ID & Passcode shift login</li>
                <li><CheckCircle2 size={14}/> Live GPS navigation to site</li>
                <li><CheckCircle2 size={14}/> After repair evidence photo capture</li>
              </ul>
              <Link href="/login" className="feature-action-link">Field Terminal Login ➔</Link>
            </div>

            <div className="team-feature-card">
              <div className="feature-icon"><Gauge size={24} /></div>
              <h3>Executive Analytics & Reports</h3>
              <p>Data-driven decision suite with 7-day daily complaint inflow bar charts, category progress meters, ward SLA breakdown, and department efficiency ratings.</p>
              <ul className="feature-list">
                <li><CheckCircle2 size={14}/> 7-Day daily volume bar charts</li>
                <li><CheckCircle2 size={14}/> Category distribution percentage</li>
                <li><CheckCircle2 size={14}/> Department resolution SLA ranking</li>
              </ul>
              <Link href="/login" className="feature-action-link">View Analytics ➔</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-wrap">
          <span>© 2026 CityPulse Municipal Governance Platform 🇮🇳</span>
          <div className="footer-links">
            <Link href="/portal">User Portal</Link>
            <Link href="/report">File Report</Link>
            <Link href="/incidents">My Reports</Link>
            <Link href="/login">Login Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
