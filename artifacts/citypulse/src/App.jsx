import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Route, Switch, Link, useLocation, useParams, Router as WouterRouter } from 'wouter';
import { ArrowLeft, ArrowRight, Bell, Camera, Check, CircleAlert, ClipboardList, Clock3, Droplets, FileText, Filter, Gauge, ImagePlus, LayoutDashboard, LocateFixed, MapPin, Menu, MoreHorizontal, Navigation, Plus, Search, ShieldCheck, Sparkles, Target, Trash2, TreePine, UserRound, Users, Wrench, X, Zap, } from 'lucide-react';
import { getGetAdminIncidentQueryKey, getListAdminIncidentsQueryKey, useAssignIncident, useCreateIncident, useGetAdminIncident, useGetAnalyticsCategories, useGetAnalyticsOverview, useGetIncident, useListAdminIncidents, useListMyIncidents, useListOfficerIncidents, useOverrideIncidentCategory, useOverrideIncidentPriority, useStartIncidentWork, useVerifyIncident, } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { HomePage } from '@/pages/home-page';
import { LoginPage } from '@/pages/login-page';
import { UserPortal } from '@/pages/user-portal';
import { AnalyticsPage } from '@/pages/analytics-page';
import { AdminDashboard } from '@/pages/admin-dashboard';
import { OfficersPage } from '@/pages/officers-page';
import { INDIA_CITIES } from '@/lib/india-cities';
import { Building2, LogIn, LogOut, UserCheck } from 'lucide-react';
const queryClient = new QueryClient();
const seeded = [
    { incidentId: 'CP-24081', category: 'POTHOLE', status: 'IN_PROGRESS', priority: 'HIGH', severity: 4, aiConfidence: .94, description: 'Deep pothole near the south gate, affecting two-wheelers after rain.', location: { latitude: 19.076, longitude: 72.877, accuracy: 14 }, reportedAt: '2024-06-18T09:42:00Z', latestUpdate: 'Crew dispatched 2 hours ago', department: 'Public Works', division: 'Roads', team: 'Ward 14 Roads' },
    { incidentId: 'CP-24077', category: 'GARBAGE', status: 'ASSIGNED', priority: 'MEDIUM', severity: 3, aiConfidence: .89, description: 'Overflowing collection point behind the community hall.', location: { latitude: 19.088, longitude: 72.889, accuracy: 9 }, reportedAt: '2024-06-18T07:20:00Z', latestUpdate: 'Assigned to sanitation team', department: 'Solid Waste', division: 'Collections', team: 'North Zone A' },
    { incidentId: 'CP-24073', category: 'BROKEN_STREETLIGHT', status: 'AWAITING_REVIEW', priority: 'LOW', severity: 2, aiConfidence: .81, description: 'Streetlight has been out for three nights on lane 6.', location: { latitude: 19.062, longitude: 72.866, accuracy: 22 }, reportedAt: '2024-06-17T21:04:00Z', latestUpdate: 'AI analysis complete', department: 'Electrical', division: 'Street Lighting', team: 'Ward 9 Electrical' },
    { incidentId: 'CP-24068', category: 'WATERLOGGING', status: 'RESOLVED', priority: 'CRITICAL', severity: 5, aiConfidence: .97, description: 'Water gathered across the school entrance after a blocked drain.', location: { latitude: 19.102, longitude: 72.894, accuracy: 11 }, reportedAt: '2024-06-17T12:15:00Z', latestUpdate: 'Resolution posted yesterday', department: 'Storm Water', division: 'Drainage', team: 'Monsoon Response' },
    { incidentId: 'CP-24062', category: 'FALLEN_TREE', status: 'SUBMITTED', priority: 'HIGH', severity: 4, aiConfidence: .92, description: 'Tree branch across the cycle lane near the library.', location: { latitude: 19.053, longitude: 72.851, accuracy: 16 }, reportedAt: '2024-06-16T15:33:00Z', latestUpdate: 'Received 18 hours ago', department: 'Gardens', division: 'Tree Authority', team: 'Central Green Team' },
];
const statusLabels = { SUBMITTED: 'Received', AI_ANALYSIS: 'Reviewing', AWAITING_REVIEW: 'Needs review', MANUAL_REVIEW: 'Manual review', ASSIGNED: 'Assigned', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved', CITIZEN_VERIFICATION: 'Verify resolution', CLOSED: 'Closed', REOPENED: 'Reopened' };
const categoryLabels = { POTHOLE: 'Pothole', WATERLOGGING: 'Waterlogging', GARBAGE: 'Garbage', ILLEGAL_DUMPING: 'Illegal dumping', BROKEN_STREETLIGHT: 'Streetlight', SEWAGE_OVERFLOW: 'Sewage overflow', DAMAGED_SIDEWALK: 'Sidewalk', FALLEN_TREE: 'Fallen tree', OTHER: 'Other' };
const priorityLabels = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical' };
function formatDate(value) {
    if (!value)
        return 'Just now';
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}
function useFallback(data, fallback) { return data ?? fallback; }
function statusClass(status) { return `status status-${status.toLowerCase()}`; }
function priorityClass(priority) { return `priority priority-${priority.toLowerCase()}`; }
function Brand({ compact = false }) {
    return <Link href="/" className={`brand ${compact ? 'brand-compact' : ''}`} data-testid="link-brand"><span className="brand-mark"><span /></span><span>citypulse</span></Link>;
}
function Notice() {
    return null;
}
function PublicNav() {
    const [open, setOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState('mumbai');
    const [, setLocation] = useLocation();

    const isCitizenAuth = typeof window !== 'undefined' && localStorage.getItem('cp_citizen_auth') === 'true';

    const handleCitizenLink = (e, targetPath) => {
      e.preventDefault();
      if (isCitizenAuth) {
        setLocation(targetPath);
      } else {
        setLocation('/login');
      }
    };

    const scrollToSection = (sectionId) => {
      setLocation('/');
      setTimeout(() => {
        const elem = document.getElementById(sectionId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.location.hash = sectionId;
        }
      }, 100);
    };

    return <><header className="public-nav cp-wrap">
      <Brand />
      <div className="nav-city-badge">
        <Building2 size={15} />
        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} aria-label="Select City">
          {Object.values(INDIA_CITIES).map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.shortBody})</option>
          ))}
        </select>
      </div>
      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="/portal" onClick={(e) => handleCitizenLink(e, '/portal')} data-testid="link-nav-portal">User Portal</a>
        <a href="/incidents" onClick={(e) => handleCitizenLink(e, '/incidents')} data-testid="link-nav-incidents">My reports</a>
        <a href="/#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }} data-testid="link-nav-how">How it works</a>
        <a href="/#city-teams" onClick={(e) => { e.preventDefault(); scrollToSection('city-teams'); }} data-testid="link-nav-roles">For city teams</a>
      </nav>
      <div className="nav-actions">
        {isCitizenAuth ? (
          <button 
            className="nav-signin nav-login-link" 
            onClick={() => {
              localStorage.removeItem('cp_citizen_auth');
              localStorage.removeItem('cp_operator_auth');
              setLocation('/login');
            }}
            style={{ cursor: 'pointer', background: '#f3f4f6', color: '#dc2626', border: '1px solid #fca5a5' }}
          >
            <LogOut size={14} /> Sign Out (Citizen)
          </button>
        ) : (
          <Link href="/login" className="nav-signin nav-login-link" data-testid="link-nav-login">
            <LogIn size={14} /> Login / Portal
          </Link>
        )}
        <a href="/report" onClick={(e) => handleCitizenLink(e, '/report')} className="pill-button" data-testid="button-nav-report">Report an issue</a>
      </div>
      <button className="icon-button mobile-menu" onClick={() => setOpen(!open)} aria-label="Open menu" data-testid="button-mobile-menu">
        {open ? <X size={20}/> : <Menu size={20}/>}
      </button>
    </header>{open && <div className="mobile-nav cp-wrap"><a href="/portal" onClick={(e) => { setOpen(false); handleCitizenLink(e, '/portal'); }} data-testid="link-mobile-portal">User Portal</a><Link href="/login" data-testid="link-mobile-login">Login Portal</Link><a href="/incidents" onClick={(e) => { setOpen(false); handleCitizenLink(e, '/incidents'); }} data-testid="link-mobile-incidents">My reports</a><a href="/#how-it-works" onClick={(e) => { e.preventDefault(); setOpen(false); scrollToSection('how-it-works'); }} data-testid="link-mobile-how">How it works</a><a href="/#city-teams" onClick={(e) => { e.preventDefault(); setOpen(false); scrollToSection('city-teams'); }}>For city teams</a><a href="/report" onClick={(e) => { setOpen(false); handleCitizenLink(e, '/report'); }} className="pill-button" data-testid="link-mobile-report">Report an issue</a></div>}</>;
}
function OpsNav({ role }) {
    const [open, setOpen] = useState(false);
    const base = role === 'operator' ? '/admin' : '/officer';
    return <header className="ops-nav"><div className="ops-brand"><Brand compact/><span className="role-mark">{role === 'operator' ? 'Operations' : 'Field work'}</span></div><nav className="ops-links"><Link href={base} className="active" data-testid={`link-${role}-home`}>{role === 'operator' ? <LayoutDashboard size={16}/> : <ClipboardList size={16}/>}<span>{role === 'operator' ? 'Command center' : 'My worklist'}</span></Link>{role === 'operator' && <><Link href="/admin" data-testid="link-admin-analytics"><Gauge size={16}/>Analytics</Link><Link href="/incidents" data-testid="link-admin-citizen"><Users size={16}/>Citizen view</Link></>}</nav><div className="ops-actions"><button className="icon-button" aria-label="Notifications" data-testid="button-notifications"><Bell size={17}/><i /></button><span className="avatar">AS</span><span className="operator-name">{role === 'operator' ? 'Aarav Shah' : 'Riya Nair'}</span><button className="icon-button mobile-menu" onClick={() => setOpen(!open)} aria-label="Open operations menu" data-testid="button-ops-menu"><Menu size={18}/></button></div>{open && <div className="ops-mobile-menu">{<Link href={base} data-testid="link-ops-mobile-home">Overview</Link>}<Link href="/incidents" data-testid="link-ops-mobile-citizen">Citizen view</Link></div>}</header>;
}
function SectionRule({ label }) { return <div className="section-rule"><span>{label}</span></div>; }
function IconDisc({ children }) { return <span className="icon-disc">{children}</span>; }
function EmptyState({ title = 'Nothing here yet', body = 'New activity will appear here.' }) { return <div className="empty-state"><IconDisc><FileText size={18}/></IconDisc><p className="empty-title">{title}</p><p>{body}</p></div>; }
function LoadingRows() { return <div className="loading-stack">{[1, 2, 3].map((n) => <div className="skeleton-row" key={n}><span /><div><i /><i /></div></div>)}</div>; }
function ErrorState({ onRetry }) { return <div className="error-state"><CircleAlert size={20}/><p>We couldn't connect to the city service.</p>{onRetry && <button className="text-button" onClick={onRetry} data-testid="button-retry">Try again</button>}</div>; }
function Home() {
    return <div className="public-page"><PublicNav /><main>
    <section className="hero cp-wrap"><div className="hero-grid cp-grid-bg"/><div className="hero-copy cp-rise"><p className="eyebrow"><span className="eyebrow-dot"/> Mumbai civic companion</p><h1>Make your city<br />count.</h1><p className="hero-sub">Report what needs attention. Follow every handoff. Help your neighbourhood move forward.</p><div className="hero-actions"><Link href="/report" className="pill-button pill-button-large" data-testid="button-hero-report"><Camera size={17}/>Report an issue</Link><Link href="/incidents" className="ghost-link" data-testid="link-hero-track">Track your reports <ArrowRight size={15}/></Link></div></div><div className="hero-meta"><span>Built for the people who notice</span><span>Live in 24 wards <span className="live-dot"/></span></div></section>
    <section className="cp-wrap preview-section cp-rise cp-delay-1"><SectionRule label="The loop, made visible"/><div className="preview-card cp-shadow"><div className="preview-top"><div><span className="small-label">TODAY IN MUMBAI</span><h2>What needs us now</h2></div><span className="preview-date">18 Jun 2024</span></div><div className="preview-stats"><div><strong>184</strong><span>reports received</span></div><div><strong>61</strong><span>crews in motion</span></div><div><strong>23<span className="tiny-up"> +8</span></strong><span>resolved today</span></div></div><div className="preview-map"><div className="map-road road-1"/><div className="map-road road-2"/><div className="map-road road-3"/><span className="map-pin pin-1"><MapPin size={17}/></span><span className="map-pin pin-2"><MapPin size={17}/></span><span className="map-pin pin-3"><MapPin size={17}/></span><div className="map-caption"><span className="live-dot"/> Live incident map</div></div></div></section>
    <section id="how-it-works" className="cp-wrap section-block cp-rise cp-delay-2"><SectionRule label="From seen to solved"/><div className="steps"><div className="step"><span className="step-num">01</span><IconDisc><Camera size={18}/></IconDisc><h3>Show us what you see</h3><p>A photo and precise location give the right team a head start.</p></div><div className="step"><span className="step-num">02</span><IconDisc><Sparkles size={18}/></IconDisc><h3>We find the right route</h3><p>CityPulse reads the signal, then puts it in front of a human operator.</p></div><div className="step"><span className="step-num">03</span><IconDisc><ShieldCheck size={18}/></IconDisc><h3>You see the outcome</h3><p>Get updates as work moves from desk to street, and verify the finish.</p></div></div></section>
    <section id="roles" className="cp-wrap section-block"><SectionRule label="One city, three views"/><div className="role-grid"><Link href="/report" className="role-card role-citizen" data-testid="card-role-citizen"><div className="role-card-top"><IconDisc><UserRound size={18}/></IconDisc><ArrowUpRightIcon /></div><h3>For citizens</h3><p>Your report should never disappear into a black box. Keep the receipt, see the route, confirm the fix.</p><span className="ghost-link">Start a report <ArrowRight size={14}/></span></Link><Link href="/admin" className="role-card" data-testid="card-role-operator"><div className="role-card-top"><IconDisc><Gauge size={18}/></IconDisc><ArrowUpRightIcon /></div><h3>For operators</h3><p>A calm queue for the urgent, the overdue, and everything that needs a careful human call.</p><span className="ghost-link">Open command center <ArrowRight size={14}/></span></Link><Link href="/officer" className="role-card" data-testid="card-role-officer"><div className="role-card-top"><IconDisc><Wrench size={18}/></IconDisc><ArrowUpRightIcon /></div><h3>For field officers</h3><p>A worklist that travels well. Know the place, the priority, and what done looks like.</p><span className="ghost-link">View field work <ArrowRight size={14}/></span></Link></div></section>
    <section className="closing-quote"><p>“A city gets better<br />when seeing becomes<br /><span>doing.</span>”</p><Link href="/report" className="pill-button" data-testid="button-closing-report">Make a report <ArrowRight size={15}/></Link></section>
  </main><footer className="footer cp-wrap"><Brand /><span>© 2024 CityPulse civic systems</span><Link href="/admin" data-testid="link-footer-operators">Operator access</Link></footer></div>;
}
function ArrowUpRightIcon() { return <span className="arrow-up"><ArrowRight size={15}/></span>; }
function ReportPage() {
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState('POTHOLE');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(false);
    const [sent, setSent] = useState(false);
    const create = useCreateIncident();
    const submit = () => {
        create.mutate({ data: { imageUrl: 'citypulse-camera-capture', latitude: 19.076, longitude: 72.877, accuracy: 14, category: category, description } }, { onSuccess: () => setSent(true), onError: () => setSent(true) });
    };
    if (sent)
        return <div className="public-page"><PublicNav /><main className="success-screen cp-wrap cp-fade"><div className="success-mark"><Check size={34}/></div><p className="eyebrow">Report received</p><h1>You're part of<br /><span>the fix.</span></h1><p className="success-copy">We've sent your report to the city team best placed to help. Keep this reference nearby.</p><div className="reference-card cp-card"><span className="small-label">YOUR REFERENCE</span><strong>CP-24082</strong><span>We’ll keep you posted as it moves.</span></div><div className="success-actions"><Link href="/incidents/CP-24082" className="pill-button" data-testid="button-view-submitted">Follow this report <ArrowRight size={15}/></Link><Link href="/incidents" className="ghost-link" data-testid="link-all-reports">See all my reports</Link></div></main></div>;
    return <div className="public-page"><PublicNav /><main className="report-page cp-wrap"><div className="report-head"><Link href="/" className="back-link" data-testid="link-report-back"><ArrowLeft size={15}/> Back</Link><span className="report-timer"><Clock3 size={14}/> under 60 seconds</span></div><div className="report-layout"><aside className="report-aside"><p className="eyebrow">A quick note to the city</p><h1>What needs<br /><span>attention?</span></h1><p>Share one thing you noticed. We’ll handle the routing.</p><div className="progress-rail"><span className={step >= 1 ? 'on' : ''}/><span className={step >= 2 ? 'on' : ''}/><span className={step >= 3 ? 'on' : ''}/></div></aside><section className="report-form cp-card cp-shadow">
    {step === 1 && <div className="form-step cp-fade"><div className="form-step-title"><span>01 / 03</span><h2>Show us the spot</h2><p>A clear photo helps the right crew arrive prepared.</p></div><button className="upload-box" onClick={() => setStep(2)} data-testid="button-add-photo"><div className="upload-art"><ImagePlus size={22}/></div><strong>Add a photo</strong><span>Tap to use your camera or choose from photos</span></button><button className="location-row" onClick={() => setLocation(!location)} data-testid="button-use-location"><IconDisc><LocateFixed size={17}/></IconDisc><span><strong>{location ? 'Location pinned' : 'Use my location'}</strong><small>{location ? '19.0760° N, 72.8777° E · ±14 m' : 'We only use this to send help to the right place'}</small></span><span className={`toggle ${location ? 'toggle-on' : ''}`}><i /></span></button><button className="form-next pill-button" onClick={() => setStep(2)} data-testid="button-report-next-1">Continue <ArrowRight size={15}/></button></div>}
    {step === 2 && <div className="form-step cp-fade"><button className="form-back" onClick={() => setStep(1)} data-testid="button-report-back-2"><ArrowLeft size={15}/> Back</button><div className="form-step-title"><span>02 / 03</span><h2>Help us understand</h2><p>Choose the closest match. You can add context in your own words.</p></div><div className="category-grid">{[['POTHOLE', 'Pothole', Wrench], ['WATERLOGGING', 'Waterlogging', Droplets], ['GARBAGE', 'Garbage', Trash2], ['BROKEN_STREETLIGHT', 'Streetlight', Zap], ['FALLEN_TREE', 'Fallen tree', TreePine], ['OTHER', 'Something else', MoreHorizontal]].map(([value, label, I]) => <button key={value} className={`category-option ${category === value ? 'selected' : ''}`} onClick={() => setCategory(value)} data-testid={`button-category-${value}`}><span><I size={17}/></span>{label}{category === value && <Check size={14}/>}</button>)}</div><label className="field-label" htmlFor="report-description">Anything else to add? <span>optional</span></label><textarea id="report-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="For example: it gets worse after rain..." data-testid="input-report-description"/><button className="form-next pill-button" onClick={() => setStep(3)} data-testid="button-report-next-2">Continue <ArrowRight size={15}/></button></div>}
    {step === 3 && <div className="form-step cp-fade"><button className="form-back" onClick={() => setStep(2)} data-testid="button-report-back-3"><ArrowLeft size={15}/> Back</button><div className="form-step-title"><span>03 / 03</span><h2>Ready to send?</h2><p>We’ll use your photo and location only to route this report.</p></div><div className="review-card"><div className="review-photo"><Camera size={20}/><span>Photo attached</span></div><div className="review-line"><span>Issue</span><strong>{categoryLabels[category]}</strong></div><div className="review-line"><span>Location</span><strong>{location ? 'Pinned to your location' : 'Mumbai, Maharashtra'}</strong></div><div className="review-line"><span>Details</span><strong>{description || 'No extra details'}</strong></div></div><button className="form-next pill-button" onClick={submit} disabled={create.isPending} data-testid="button-submit-report">{create.isPending ? 'Sending report…' : 'Send report'} <ArrowRight size={15}/></button><p className="privacy-note"><ShieldCheck size={13}/> Your report is visible to you and the city team.</p></div>}
  </section></div></main></div>;
}
function IncidentRow({ incident, officer = false }) {
    return <Link href={`${officer ? '/officer/incidents/' : '/incidents/'}${incident.incidentId}`} className="incident-row" data-testid={`link-incident-${incident.incidentId}`}><span className={`incident-thumb thumb-${incident.category.toLowerCase()}`}><MapPin size={18}/></span><span className="incident-main"><strong>{categoryLabels[incident.category] || incident.category}</strong><span>{incident.description || 'No description provided'}</span><small>{incident.incidentId} · {formatDate(incident.reportedAt)}</small></span><span className="incident-side"><span className={priorityClass(incident.priority)}>{priorityLabels[incident.priority]}</span><span className={statusClass(incident.status)}>{statusLabels[incident.status]}</span></span><ArrowRight size={15} className="row-arrow"/></Link>;
}
function IncidentsPage() {
    const query = useListMyIncidents();
    const data = useFallback(query.data, seeded.slice(0, 4));
    const [filter, setFilter] = useState('All reports');
    const shown = filter === 'All reports' ? data : data.filter((x) => filter === 'Open' ? !['RESOLVED', 'CLOSED'].includes(x.status) : x.status === 'RESOLVED');
    return <div className="public-page"><PublicNav /><main className="cp-wrap list-page"><div className="list-head"><div><p className="eyebrow">Your civic trail</p><h1>My reports</h1><p>Every report has a reference. Every reference has a next step.</p></div><Link href="/report" className="pill-button" data-testid="button-list-new-report"><Plus size={16}/>New report</Link></div><div className="list-tabs">{['All reports', 'Open', 'Resolved'].map((x) => <button key={x} className={filter === x ? 'selected' : ''} onClick={() => setFilter(x)} data-testid={`button-filter-${x.toLowerCase().replace(' ', '-')}`}>{x}<span>{x === 'All reports' ? data.length : shown.filter((i) => x === 'Open' ? !['RESOLVED', 'CLOSED'].includes(i.status) : i.status === 'RESOLVED').length}</span></button>)}</div>{query.isLoading ? <LoadingRows /> : query.isError && !query.data ? <ErrorState onRetry={() => query.refetch()}/> : shown.length ? <div className="incident-list">{shown.map((incident) => <IncidentRow key={incident.incidentId} incident={incident}/>)}</div> : <EmptyState title="No reports match this view" body="Try another filter or make a new report."/>}</main></div>;
}
function Timeline({ detail }) {
    const events = detail.timeline?.length ? detail.timeline : [{ status: 'SUBMITTED', at: detail.reportedAt, note: 'Report received by CityPulse' }, { status: 'AI_ANALYSIS', at: detail.latestUpdate || detail.reportedAt, note: 'Photo and location reviewed' }, ...(detail.status === 'IN_PROGRESS' ? [{ status: 'IN_PROGRESS', at: new Date().toISOString(), note: 'Field crew is on the way' }] : [])];
    return <div className="timeline">{events.map((event, i) => <div className={`timeline-item ${i === events.length - 1 ? 'last' : ''}`} key={`${event.status}-${event.at}`}><span className="timeline-dot">{i < events.length - 1 ? <Check size={12}/> : <span />}</span><div><strong>{statusLabels[event.status] || event.status}</strong><span>{formatDate(event.at)}</span>{event.note && <p>{event.note}</p>}</div></div>)}</div>;
}
function IncidentDetailPage({ operator = false }) {
    const { id = 'CP-24081' } = useParams();
    const query = operator ? useGetAdminIncident(id) : useGetIncident(id);
    const fallback = seeded.find((x) => x.incidentId === id) || seeded[0];
    const incident = useFallback(query.data, { ...fallback, aiAnalysis: { category: fallback.category, confidence: fallback.aiConfidence || .92, severity: fallback.severity, severityLabel: fallback.severity > 3 ? 'Needs attention' : 'Routine', modelVersion: 'CP Vision 2.4', detectedFeatures: ['Road surface', 'Vehicle lane', 'Standing water'] }, assignment: { department: fallback.department, division: fallback.division, team: fallback.team, assignedAt: fallback.reportedAt }, timeline: undefined });
    const verify = useVerifyIncident();
    const [feedback, setFeedback] = useState('');
    const [toast, setToast] = useState('');
    const doVerify = (outcome) => { verify.mutate({ incidentId: id, data: { outcome } }, { onSuccess: () => setToast(outcome === 'CONFIRMED' ? 'Thanks for confirming the resolution.' : 'We’ll reopen this report for another look.'), onError: () => setToast(outcome === 'CONFIRMED' ? 'Confirmation recorded for this preview.' : 'Reopen request recorded for this preview.') }); };
    return <div className={operator ? 'ops-page' : 'public-page'}>{operator ? <OpsNav role="operator"/> : <PublicNav />}<main className={`detail-page cp-wrap ${operator ? 'operator-detail' : ''}`}><div className="detail-head"><Link href={operator ? '/admin' : '/incidents'} className="back-link" data-testid="link-detail-back"><ArrowLeft size={15}/> {operator ? 'Back to queue' : 'Back to reports'}</Link><span className="detail-ref">{incident.incidentId}</span></div><div className="detail-layout"><section><div className="detail-hero"><div className={`detail-visual thumb-${incident.category.toLowerCase()}`}><MapPin size={40}/><span>Report location</span><small>19.0760° N · 72.8777° E</small></div><div className="detail-title"><div className="detail-tags"><span className={priorityClass(incident.priority)}>{priorityLabels[incident.priority]} priority</span><span className={statusClass(incident.status)}>{statusLabels[incident.status]}</span></div><p className="eyebrow">{categoryLabels[incident.category]}</p><h1>{incident.description || 'Civic issue report'}</h1><p className="detail-sub">Reported {formatDate(incident.reportedAt)} · {incident.department || 'City services'}</p></div></div>{operator && <AiPanel incident={incident} id={id} onToast={setToast}/>}{!operator && <div className="citizen-progress cp-card"><div className="progress-header"><div><span className="small-label">LIVE STATUS</span><h2>{statusLabels[incident.status]}</h2></div><span className="progress-percent">{incident.status === 'RESOLVED' ? '100%' : incident.status === 'IN_PROGRESS' ? '72%' : '28%'}</span></div><div className="progress-line"><i style={{ width: incident.status === 'RESOLVED' ? '100%' : incident.status === 'IN_PROGRESS' ? '72%' : '28%' }}/></div><p>{incident.latestUpdate || 'Your report is in the city team queue.'}</p></div>}<div className="detail-panels"><div className="cp-card detail-panel"><div className="panel-heading"><span>Journey so far</span><Clock3 size={16}/></div><Timeline detail={incident}/></div><div className="cp-card detail-panel"><div className="panel-heading"><span>Where it goes next</span><Navigation size={16}/></div><div className="assignment"><IconDisc><Users size={17}/></IconDisc><div><span className="small-label">ROUTED TEAM</span><strong>{incident.assignment?.team || incident.team || 'Awaiting assignment'}</strong><p>{incident.assignment?.division || incident.division || 'The city team will be assigned after review.'}</p></div></div></div></div></section><aside className="detail-aside"><div className="cp-card aside-card"><span className="small-label">REPORT DETAILS</span><div className="aside-stat"><span>Reference</span><strong>{incident.incidentId}</strong></div><div className="aside-stat"><span>Category</span><strong>{categoryLabels[incident.category]}</strong></div><div className="aside-stat"><span>Reported</span><strong>{formatDate(incident.reportedAt)}</strong></div><div className="aside-stat"><span>Location accuracy</span><strong>±{incident.location.accuracy || 14} m</strong></div></div>{!operator && (incident.status === 'RESOLVED' || incident.status === 'CITIZEN_VERIFICATION') && <div className="verify-card"><span className="small-label">YOUR TURN</span><h3>Did the city fix this?</h3><p>Your confirmation closes the loop for everyone.</p><div className="verify-actions"><button className="pill-button" onClick={() => doVerify('CONFIRMED')} data-testid="button-confirm-resolution"><Check size={15}/> Yes, resolved</button><button className="outline-button" onClick={() => doVerify('REJECTED')} data-testid="button-reopen-resolution">Not yet</button></div>{toast && <p className="toast-inline">{toast}</p>}</div>}{!operator && incident.status !== 'RESOLVED' && <div className="tip-card"><Sparkles size={18}/><p><strong>Keep an eye on this space.</strong><br />We’ll add a note whenever the team updates your report.</p></div>}</aside></div>{toast && operator && <div className="floating-toast" role="status">{toast}<button onClick={() => setToast('')} aria-label="Dismiss notification" data-testid="button-dismiss-toast"><X size={14}/></button></div>}</main></div>;
}
function AiPanel({ incident, id, onToast }) {
    const qc = useQueryClient();
    const category = useOverrideIncidentCategory();
    const priority = useOverrideIncidentPriority();
    const [editing, setEditing] = useState(false);
    const [newCategory, setNewCategory] = useState(incident.category);
    const [newPriority, setNewPriority] = useState(incident.priority);
    const save = () => { category.mutate({ incidentId: id, data: { category: newCategory, reason: 'Operator review' } }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetAdminIncidentQueryKey(id) }); qc.invalidateQueries({ queryKey: getListAdminIncidentsQueryKey() }); onToast('Category override saved.'); }, onError: () => onToast('Category override saved for this preview.') }); priority.mutate({ incidentId: id, data: { priority: newPriority, reason: 'Operator review' } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getGetAdminIncidentQueryKey(id) }), onError: () => undefined }); setEditing(false); };
    return <div className="ai-panel cp-card"><div className="panel-heading"><span><Sparkles size={15}/> AI analysis</span><span className="model-tag">{incident.aiAnalysis?.modelVersion || 'CP Vision 2.4'}</span></div><div className="ai-grid"><div><span className="small-label">CATEGORY</span><strong>{categoryLabels[incident.aiAnalysis?.category || incident.category]}</strong><span className="confidence">{Math.round((incident.aiAnalysis?.confidence || .92) * 100)}% confidence</span></div><div><span className="small-label">SEVERITY</span><strong>{incident.aiAnalysis?.severityLabel || 'Needs attention'}</strong><span className="confidence">{incident.aiAnalysis?.severity || incident.severity} / 5 signal</span></div><div className="detected"><span className="small-label">DETECTED FEATURES</span><div>{(incident.aiAnalysis?.detectedFeatures || ['Road surface', 'Public access']).map((x) => <span key={x}>{x}</span>)}</div></div></div>{editing ? <div className="override-form"><label>Category<select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} data-testid="select-override-category">{Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label><label>Priority<select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} data-testid="select-override-priority">{Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label><button className="pill-button" onClick={save} data-testid="button-save-overrides">Save overrides</button><button className="text-button" onClick={() => setEditing(false)} data-testid="button-cancel-overrides">Cancel</button></div> : <button className="text-button ai-edit" onClick={() => setEditing(true)} data-testid="button-edit-ai">Review and override <ArrowRight size={14}/></button>}</div>;
}
function KpiCard({ label, value, detail, icon, tone = '' }) { return <div className={`kpi-card cp-card ${tone}`}><IconDisc>{icon}</IconDisc><span className="kpi-label">{label}</span><strong>{value}</strong><span className="kpi-detail">{detail}</span></div>; }
function FauxMap({ items }) { return <div className="faux-map"><div className="map-grid"/><div className="map-water"/><div className="map-road r-a"/><div className="map-road r-b"/><div className="map-road r-c"/><div className="map-road r-d"/>{items.map((item, i) => <Link href={`/admin/incidents/${item.incidentId}`} key={item.incidentId} className={`admin-pin p-${i + 1}`} data-testid={`link-map-pin-${item.incidentId}`}><span>{i + 1}</span></Link>)}<div className="map-legend"><span><i className="legend-critical"/> Critical</span><span><i className="legend-open"/> Open</span></div><span className="map-label label-bandra">Bandra West</span><span className="map-label label-dadar">Dadar</span><span className="map-label label-fort">Fort</span></div>; }
function AdminPage() {
    const query = useListAdminIncidents();
    const analytics = useGetAnalyticsOverview();
    const cats = useGetAnalyticsCategories();
    const items = useFallback(query.data, seeded);
    const overview = useFallback(analytics.data, { totalIncidents: 184, openIncidents: 126, criticalIncidents: 12, overdueIncidents: 9, avgResolutionHours: 31.4 });
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('Queue');
    const visible = items.filter((i) => (filter === 'All' || i.priority === filter.toUpperCase() || (filter === 'Open' && !['RESOLVED', 'CLOSED'].includes(i.status))) && `${i.incidentId} ${i.description} ${categoryLabels[i.category]}`.toLowerCase().includes(search.toLowerCase()));
    return <div className="ops-page"><OpsNav role="operator"/><main className="admin-page"><div className="admin-wrap"><div className="admin-head"><div><p className="eyebrow">Wednesday · 18 June 2024</p><h1>Good morning, Aarav.</h1><p>Here’s what needs a city team’s attention today.</p></div><button className="outline-button" onClick={() => query.refetch()} data-testid="button-refresh-queue"><Clock3 size={15}/>Updated just now</button></div><div className="kpi-grid"><KpiCard label="Reports this week" value={overview.totalIncidents} detail="+12.8% from last week" icon={<ClipboardList size={17}/>}/><KpiCard label="Open incidents" value={overview.openIncidents} detail="41 need assignment" icon={<CircleAlert size={17}/>} tone="kpi-warm"/><KpiCard label="Critical signals" value={overview.criticalIncidents} detail="3 are overdue" icon={<Zap size={17}/>}/><KpiCard label="Avg. resolution" value={`${overview.avgResolutionHours}h`} detail="Down 4.6h this month" icon={<Gauge size={17}/>}/></div><div className="admin-tabs">{['Queue', 'Analytics'].map((x) => <button key={x} className={activeTab === x ? 'selected' : ''} onClick={() => setActiveTab(x)} data-testid={`button-admin-tab-${x.toLowerCase()}`}>{x}</button>)}<span className="tab-spacer"/><button className="icon-button" aria-label="More dashboard options" data-testid="button-dashboard-options"><MoreHorizontal size={18}/></button></div>{activeTab === 'Queue' ? <div className="admin-grid"><section className="queue-card cp-card"><div className="queue-head"><div><span className="small-label">LIVE QUEUE</span><h2>Needs your call <span>{visible.length}</span></h2></div><button className="text-button" onClick={() => { setFilter('All'); setSearch(''); }} data-testid="button-clear-filters">Clear filters</button></div><div className="queue-tools"><div className="search-box"><Search size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reference or issue" aria-label="Search incidents" data-testid="input-admin-search"/></div><div className="filter-scroll">{['All', 'Open', 'Critical', 'High', 'Medium'].map((x) => <button key={x} className={filter === x ? 'selected' : ''} onClick={() => setFilter(x)} data-testid={`button-admin-filter-${x.toLowerCase()}`}><Filter size={13}/>{x}</button>)}</div></div>{query.isLoading ? <LoadingRows /> : query.isError && !query.data ? <ErrorState onRetry={() => query.refetch()}/> : visible.length ? <div className="admin-queue">{visible.map((i) => <IncidentRow key={i.incidentId} incident={i}/>)}</div> : <EmptyState title="The queue is clear" body="No incidents match these filters."/>}</section><section className="map-card cp-card"><div className="panel-heading"><span><MapPin size={16}/> Incident map</span><span className="small-label">MUMBAI · 24 WARDS</span></div><FauxMap items={items.slice(0, 5)}/><div className="map-foot"><span><i className="live-dot"/> Live</span><span>Last synced 2 min ago</span></div></section></div> : <AnalyticsPanel overview={overview} categories={cats.data}/>}</div></main></div>;
}
function AnalyticsPanel({ overview, categories }) {
    const catData = categories || { POTHOLE: 48, GARBAGE: 37, WATERLOGGING: 29, BROKEN_STREETLIGHT: 25, FALLEN_TREE: 18 };
    return <div className="analytics-grid"><section className="cp-card chart-card"><div className="panel-heading"><div><span className="small-label">VOLUME</span><h2>Reports over the last 7 days</h2></div><span className="chart-total">{overview.totalIncidents} total</span></div><div className="bar-chart">{[41, 58, 46, 76, 61, 88, 71].map((v, i) => <div className="bar-col" key={i}><span style={{ height: `${v}%` }}/><small>{['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'][i]}</small></div>)}</div></section><section className="cp-card chart-card"><div className="panel-heading"><div><span className="small-label">CATEGORIES</span><h2>What citizens are seeing</h2></div></div><div className="category-bars">{Object.entries(catData).slice(0, 5).map(([key, value]) => <div key={key}><div><span>{categoryLabels[key] || key}</span><strong>{value}</strong></div><div className="category-track"><i style={{ width: `${Math.max(12, (value / Math.max(...Object.values(catData))) * 100)}%` }}/></div></div>)}</div></section></div>;
}
function OfficerPage() {
    const query = useListOfficerIncidents();
    const items = useFallback(query.data, seeded.filter((x) => x.status !== 'RESOLVED'));
    const [filter, setFilter] = useState('Today');
    const [dutyState, setDutyState] = useState('ON_DUTY'); // 'ON_DUTY' | 'OFF_DUTY'
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [badgeInput, setBadgeInput] = useState('OFF-BMC-104');
    const [passwordInput, setPasswordInput] = useState('');
    const [authError, setAuthError] = useState('');
    const cityObj = INDIA_CITIES.mumbai;

    const handleDutyChangeRequest = (targetState) => {
      if (targetState === 'ON_DUTY' && dutyState === 'OFF_DUTY') {
        // Require Officer Authentication Modal
        setShowAuthModal(true);
        setAuthError('');
        setPasswordInput('');
      } else {
        setDutyState(targetState);
      }
    };

    const handleAuthenticateSubmit = (e) => {
      e.preventDefault();
      if (!badgeInput.trim()) {
        setAuthError('Please enter your official Officer Badge ID.');
        return;
      }
      if (!passwordInput.trim()) {
        setAuthError('Please enter your Officer Security Passcode.');
        return;
      }

      // Success authentication
      setDutyState('ON_DUTY');
      setShowAuthModal(false);
      setAuthError('');
    };

    return <div className="ops-page officer-terminal-page">
      <OpsNav role="officer"/>
      <main className="officer-main-wrap cp-wrap">
        {/* Officer Shift Header & Interactive Duty Toggle */}
        <div className="officer-shift-hero">
          <div className="shift-profile-info">
            <span className="badge-pill">OFF-BMC-104 · {cityObj.shortBody} Field Operations</span>
            <h1>Field Officer Route Worklist</h1>
            <p><MapPin size={14}/> Assigned to {cityObj.name} · Ward H-West (Bandra West)</p>
          </div>

          <div className="shift-right-profile">
            {/* Interactive Duty Status Switcher */}
            <div className="duty-toggle-switch">
              <button 
                className={`duty-switch-btn ${dutyState === 'ON_DUTY' ? 'active-onduty' : ''}`}
                onClick={() => handleDutyChangeRequest('ON_DUTY')}
              >
                <span className="pulse-green"/> 🟢 ON DUTY
              </button>
              <button 
                className={`duty-switch-btn ${dutyState === 'OFF_DUTY' ? 'active-offduty' : ''}`}
                onClick={() => handleDutyChangeRequest('OFF_DUTY')}
              >
                ⚪ OFF DUTY
              </button>
            </div>

            <div className="officer-id-badge">
              <span className="avatar-lg">SP</span>
              <div>
                <strong>Suresh Patil</strong>
                <small>Senior Road Inspector · {dutyState === 'OFF_DUTY' ? 'Shift Ended (Offline)' : 'Active On-Site'}</small>
              </div>
            </div>
          </div>
        </div>

        {/* Off Duty Info Banner */}
        {dutyState === 'OFF_DUTY' && (
          <div className="off-duty-banner">
            <CircleAlert size={18} />
            <div>
              <strong>⚪ SHIFT ENDED / OFF DUTY MODE</strong>
              <p>You are currently set to Off Duty. Authentication is required to resume On-Duty status.</p>
            </div>
            <button className="resume-duty-btn" onClick={() => handleDutyChangeRequest('ON_DUTY')}>
              🔐 Authenticate & Start On-Duty Shift
            </button>
          </div>
        )}

        {/* Officer Shift Authentication Modal */}
        {showAuthModal && (
          <div className="officer-auth-backdrop">
            <div className="officer-auth-modal">
              <div className="auth-modal-header">
                <div className="auth-icon-wrap">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2>Field Officer Shift Authentication</h2>
                  <p>Authentication required to switch from Off Duty to On Duty mode for {cityObj.name} ({cityObj.shortBody}).</p>
                </div>
              </div>

              <form onSubmit={handleAuthenticateSubmit} className="auth-modal-form">
                {authError && <div className="auth-error-box"><CircleAlert size={15}/> {authError}</div>}

                <div className="auth-field-group">
                  <label>Officer Badge / User ID:</label>
                  <input 
                    type="text" 
                    value={badgeInput} 
                    onChange={(e) => setBadgeInput(e.target.value)}
                    placeholder="e.g. OFF-BMC-104"
                  />
                </div>

                <div className="auth-field-group">
                  <div className="label-with-demo">
                    <label>Officer Security Passcode / Password:</label>
                    <button 
                      type="button" 
                      className="demo-fill-link"
                      onClick={() => { setPasswordInput('officer123'); setAuthError(''); }}
                    >
                      Demo Key: officer123
                    </button>
                  </div>
                  <input 
                    type="password" 
                    value={passwordInput} 
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter shift password..."
                    autoFocus
                  />
                </div>

                <div className="auth-modal-actions">
                  <button 
                    type="button" 
                    className="auth-cancel-btn"
                    onClick={() => setShowAuthModal(false)}
                  >
                    Cancel (Stay Off Duty)
                  </button>
                  <button 
                    type="submit" 
                    className="auth-submit-btn"
                  >
                    Authenticate & Enable On-Duty ➔
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Shift KPI Metrics Strip */}
        <div className="officer-kpis-grid">
          <div className="officer-kpi-card">
            <span>Today's Assigned Route</span>
            <strong>{items.length + 1} Stops</strong>
            <small>Ward H-West Priority Grid</small>
          </div>

          <div className="officer-kpi-card highlight">
            <span>Current Active Stop</span>
            <strong>{items[0]?.incidentId || 'CP-MUM-2026-1042'}</strong>
            <small>{items[0]?.category || 'POTHOLE'} · Bandra West</small>
          </div>

          <div className="officer-kpi-card">
            <span>Shift Resolutions</span>
            <strong>3 Completed Today</strong>
            <small>SLA Compliance: 100%</small>
          </div>

          <div className="officer-kpi-card">
            <span>SLA Target Remaining</span>
            <strong>14h 20m</strong>
            <small>BMC Charter Deadline</small>
          </div>
        </div>

        {/* Worklist Section */}
        <div className="worklist-container-card">
          <div className="worklist-card-header">
            <div>
              <h2>Assigned Incident Worklist Queue</h2>
              <span>Select an incident to navigate GPS and record after-repair photo evidence</span>
            </div>

            <div className="worklist-tabs-row">
              {['Today', 'All assignments'].map((x) => 
                <button key={x} className={filter === x ? 'active' : ''} onClick={() => setFilter(x)}>{x}</button>
              )}
            </div>
          </div>

          {query.isLoading ? <LoadingRows /> : query.isError && !query.data ? <ErrorState onRetry={() => query.refetch()}/> : (
            <div className="officer-worklist-grid">
              {items.map((i, index) => (
                <div className={`officer-incident-card ${i.status === 'IN_PROGRESS' ? 'active-stop' : ''}`} key={i.incidentId}>
                  <div className="card-stop-index">
                    <span>STOP #{String(index + 1).padStart(2, '0')}</span>
                    <span className={`status-pill ${i.status.toLowerCase()}`}>{statusLabels[i.status] || i.status}</span>
                  </div>

                  <div className="card-main-details">
                    <div className="title-row">
                      <span className={`priority-tag ${i.priority.toLowerCase()}`}>{i.priority} PRIORITY</span>
                      <h3>{categoryLabels[i.category] || i.category}</h3>
                    </div>

                    <p className="reporter-quote">"{i.description || 'Inspection required for reported civic damage.'}"</p>

                    <div className="location-gps-bar">
                      <MapPin size={15} />
                      <span>{i.location?.latitude ? `${i.location.latitude}° N, ${i.location.longitude}° E` : '19.0760° N, 72.8777° E'} · Bandra West</span>
                    </div>
                  </div>

                  <div className="card-actions-bar">
                    <button className="nav-gps-btn" onClick={() => window.alert('Opening GPS navigation coordinates...')}>
                      <Navigation size={14} /> GPS Direct
                    </button>
                    <Link href={`/officer/incidents/${i.incidentId}`} className="terminal-open-btn">
                      Open Repair Terminal <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>;
}

function OfficerDetailPage() {
    const { id = 'CP-24081' } = useParams();
    const query = useGetAdminIncident(id);
    const fallback = seeded.find((x) => x.incidentId === id) || seeded[0];
    const incident = useFallback(query.data, fallback);
    const start = useStartIncidentWork();
    const [started, setStarted] = useState(incident.status === 'IN_PROGRESS');
    const [done, setDone] = useState(false);
    const [note, setNote] = useState('');
    const [evidenceUploaded, setEvidenceUploaded] = useState(false);

    const begin = () => { start.mutate({ incidentId: id }, { onSuccess: () => setStarted(true), onError: () => setStarted(true) }); };
    const resolvePreview = () => { 
      if (!evidenceUploaded) {
        setEvidenceUploaded(true);
      }
      setDone(true); 
      setNote(note || 'After repair evidence photo uploaded and submitted for municipal verification.'); 
    };

    return <div className="ops-page officer-terminal-page">
      <OpsNav role="officer"/>
      <main className="officer-detail-wrap cp-wrap">
        <Link href="/officer" className="back-link-btn">
          <ArrowLeft size={15}/> Return to Field Worklist
        </Link>

        {/* Mobile Terminal Hero Header */}
        <div className="terminal-hero-card">
          <div className="terminal-hero-info">
            <div className="tags-line">
              <span className="ticket-id-tag">{incident.incidentId}</span>
              <span className={`priority-tag ${incident.priority.toLowerCase()}`}>{incident.priority} PRIORITY</span>
              <span className={`status-badge ${incident.status.toLowerCase()}`}>{statusLabels[incident.status] || incident.status}</span>
            </div>
            <h1>{categoryLabels[incident.category] || incident.category} Repair Terminal</h1>
            <p>{incident.description || 'On-site municipal repair inspection and evidence logging.'}</p>
          </div>

          <div className="terminal-hero-gps">
            <div className="gps-box">
              <MapPin size={20} />
              <div>
                <strong>19.0760° N, 72.8777° E</strong>
                <span>±{incident.location?.accuracy || 14}m GPS Accuracy · Bandra West</span>
              </div>
            </div>
            <button className="nav-btn-large" onClick={() => window.alert('Opening Google Maps Navigation...')}>
              <Navigation size={16}/> Start Navigation
            </button>
          </div>
        </div>

        {/* Side-by-Side Evidence Upload Terminal */}
        <div className="evidence-terminal-grid">
          {/* BEFORE Photo Box */}
          <div className="terminal-card before-card">
            <div className="card-head-tag before">
              <Camera size={15} /> 📷 BEFORE REPAIR (CITIZEN REPORT)
            </div>

            <div className="image-preview-container">
              <img 
                src={incident.imageUrl || "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80"} 
                alt="Before Repair" 
              />
            </div>

            <div className="evidence-info">
              <span className="small-label">AI GEMINI VISION ANALYSIS</span>
              <p>Severity Rating: <strong>{incident.severity || 8.7} / 10.0</strong></p>
              <small>Reported at {formatDate(incident.reportedAt)}</small>
            </div>
          </div>

          {/* AFTER Photo Upload Box */}
          <div className="terminal-card after-card">
            <div className="card-head-tag after">
              <Check size={15} /> 📸 AFTER COMPLETION EVIDENCE (FIELD CREW)
            </div>

            {!started ? (
              <div className="start-work-prompt">
                <Target size={40} />
                <h3>Arrived on Location?</h3>
                <p>Click below to start the on-site repair timer and activate evidence capture.</p>
                <button className="start-work-btn" onClick={begin}>
                  <Target size={18} /> Start On-Site Work & Timer
                </button>
              </div>
            ) : !done ? (
              <div className="evidence-upload-form">
                <div className="timer-running-banner">
                  <Clock3 size={16} /> Work In-Progress · SLA Timer Running
                </div>

                <label className="field-label">On-Site Field Crew Note:</label>
                <textarea 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
                  placeholder="Record work completed on site (e.g., Pothole filled with cold asphalt mix)..."
                />

                <div 
                  className={`camera-upload-dropzone ${evidenceUploaded ? 'uploaded' : ''}`}
                  onClick={() => setEvidenceUploaded(true)}
                >
                  <ImagePlus size={28} />
                  <div>
                    <strong>{evidenceUploaded ? '✅ After Evidence Photo Attached' : 'Take or Upload After Repair Photo'}</strong>
                    <small>{evidenceUploaded ? 'Click to change photo' : 'Show the completed repair clearly'}</small>
                  </div>
                </div>

                <button className="resolve-submit-btn" onClick={resolvePreview}>
                  <Check size={18} /> Mark Resolved & Submit Evidence
                </button>
              </div>
            ) : (
              <div className="resolved-success-box">
                <div className="success-icon-wrap">
                  <Check size={32} />
                </div>
                <h2>Work Completed & Verified</h2>
                <p>"{note}"</p>
                <span className="synced-pill"><ShieldCheck size={14} /> Evidence Sent to Command Center</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>;
}
function OperatorRouteGuard({ component: Component }) {
    const isAuth = typeof window !== 'undefined' && localStorage.getItem('cp_operator_auth') === 'true';

    if (!isAuth) {
        return <div className="cp-wrap auth-restriction-screen">
          <div className="restriction-card">
            <div className="rest-icon-wrap">
              <ShieldCheck size={32} />
            </div>
            <h2>Municipal Command Center Access Restricted</h2>
            <p>The Admin Dashboard and operator control tools are restricted to authorized municipal personnel. Please authenticate with your Municipal Operator credentials.</p>
            <Link href="/login" className="pill-button">Go to Municipal Operator Login ➔</Link>
          </div>
        </div>;
    }

    return <Component />;
}

function CitizenRouteGuard({ component: Component }) {
    const isAuth = typeof window !== 'undefined' && localStorage.getItem('cp_citizen_auth') === 'true';

    if (!isAuth) {
        return <div className="cp-wrap auth-restriction-screen">
          <div className="restriction-card">
            <div className="rest-icon-wrap">
              <UserCheck size={32} />
            </div>
            <h2>Citizen Authentication Required</h2>
            <p>Please log in with your phone number or citizen account to access your filed reports, live timeline status, and municipal resolution receipts.</p>
            <Link href="/login" className="pill-button">Go to Citizen Login ➔</Link>
          </div>
        </div>;
    }

    return <Component />;
}

function CitizenIncidentRoute() { return <IncidentDetailPage />; }
function Router() {
    const [location] = useLocation();
    return <ErrorBoundary resetKey={location}>
      <Switch>
        <Route path="/" component={HomePage}/>
        <Route path="/login" component={LoginPage}/>
        {/* Protected Citizen Routes */}
        <Route path="/report" component={() => <CitizenRouteGuard component={ReportPage}/>}/>
        <Route path="/portal" component={() => <CitizenRouteGuard component={UserPortal}/>}/>
        <Route path="/incidents" component={() => <CitizenRouteGuard component={IncidentsPage}/>}/>
        <Route path="/incidents/:id" component={() => <CitizenRouteGuard component={CitizenIncidentRoute}/>}/>

        {/* Protected Municipal Command Center & Admin Routes */}
        <Route path="/admin" component={() => <OperatorRouteGuard component={AdminDashboard}/>}/>
        <Route path="/admin/officers" component={() => <OperatorRouteGuard component={OfficersPage}/>}/>
        <Route path="/analytics" component={() => <OperatorRouteGuard component={AnalyticsPage}/>}/>
        <Route path="/admin/incidents/:id" component={() => <OperatorRouteGuard component={() => <IncidentDetailPage operator/>}/>}/>

        <Route path="/officer" component={OfficerPage}/>
        <Route path="/officer/incidents/:id" component={OfficerDetailPage}/>
        <Route component={NotFound}/>
      </Switch>
    </ErrorBoundary>;
}
function App() {
    return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}
export default App;
