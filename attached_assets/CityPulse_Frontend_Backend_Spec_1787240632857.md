# CityPulse — Frontend & Backend Detailed Specification

Companion to the PRD (v2.0) and the CV model pipeline already covered. This
document nails down every endpoint, JSON payload, and screen-to-API mapping
needed to actually build the React frontend and Spring Boot backend.

Base URL convention: `https://api.citypulse.app`
All authenticated requests carry `Authorization: Bearer <jwt>`.
All timestamps are ISO-8601 UTC. All incident IDs use the format `CP-2026-001042`.

---

## 1. Incident state model (authoritative)

```
SUBMITTED → AI_ANALYSIS → AWAITING_REVIEW → ASSIGNED → IN_PROGRESS
  → RESOLVED → CITIZEN_VERIFICATION → CLOSED

AI_ANALYSIS → MANUAL_REVIEW → AWAITING_REVIEW   (AI failure / low confidence)

CITIZEN_VERIFICATION → REOPENED → IN_PROGRESS   (citizen rejects resolution)
```

Every transition writes a row to `incident_status_history`
(`old_status`, `new_status`, `changed_by`, `remarks`, `created_at`).

---

## 2. Backend (Spring Boot)

### 2.1 Standard error shape

Every 4xx/5xx response uses the same envelope so the frontend has one error handler:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "location.latitude must be between -90 and 90",
    "field": "location.latitude",
    "timestamp": "2026-08-20T10:15:00Z"
  }
}
```

Common codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`,
`DUPLICATE_ACCOUNT`, `INVALID_ASSIGNMENT`, `AI_SERVICE_UNAVAILABLE`.

### 2.2 Auth

**`POST /api/v1/auth/register`**

Request:
```json
{
  "name": "Ananya Das",
  "email": "ananya.das@example.com",
  "phone": "+91-9876543210",
  "password": "StrongPass!23"
}
```
Response `201`:
```json
{
  "userId": "usr_7f1a2b",
  "name": "Ananya Das",
  "email": "ananya.das@example.com",
  "role": "CITIZEN",
  "createdAt": "2026-08-20T10:00:00Z"
}
```
Validation: unique email/phone, password hashed with bcrypt/argon2, duplicate
returns `409` with code `DUPLICATE_ACCOUNT`.

**`POST /api/v1/auth/login`**

Request:
```json
{ "email": "ananya.das@example.com", "password": "StrongPass!23" }
```
Response `200`:
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "expiresIn": 900,
  "user": { "userId": "usr_7f1a2b", "name": "Ananya Das", "role": "CITIZEN" }
}
```

**`POST /api/v1/auth/refresh`**

Request: `{ "refreshToken": "eyJhbGciOi..." }`
Response `200`: `{ "accessToken": "eyJhbGciOi...", "expiresIn": 900 }`

Roles: `CITIZEN`, `OPERATOR`, `FIELD_OFFICER`, `ADMIN`. Every non-auth route
below is guarded by role at the controller layer (Spring Security
`@PreAuthorize`).

### 2.3 Citizen endpoints

**`POST /api/v1/incidents`** — multipart/form-data (not JSON, because of the image)

Form fields:
```
image: file (required, jpeg/png/webp, max 10MB)
additionalImages: file[] (optional, max 3)
latitude: number (required)
longitude: number (required)
accuracy: number (meters, required)
description: string (optional, max 500 chars)
category: string (optional — citizen-suggested, AI can override)
```

Response `201`:
```json
{
  "incidentId": "CP-2026-001042",
  "status": "SUBMITTED",
  "createdAt": "2026-08-20T10:12:04Z",
  "trackingUrl": "/incidents/CP-2026-001042"
}
```
Backend does, in order: validate MIME/size/EXIF integrity → upload to object
storage → insert `incidents` row (`status=SUBMITTED`) → insert
`incident_images` row → insert location as a PostGIS `POINT` →
asynchronously call the internal AI endpoint (§2.6) → return immediately.
The citizen never waits on AI inference.

**`GET /api/v1/incidents/{id}`**

Response `200`:
```json
{
  "incidentId": "CP-2026-001042",
  "category": "POTHOLE",
  "status": "ASSIGNED",
  "priority": "HIGH",
  "description": "Large pothole near the bus stop",
  "location": { "latitude": 20.2961, "longitude": 85.8245, "accuracy": 8.5 },
  "images": ["https://cdn.citypulse.app/incidents/CP-2026-001042/0.jpg"],
  "reportedAt": "2026-08-20T10:12:04Z",
  "timeline": [
    { "status": "SUBMITTED", "at": "2026-08-20T10:12:04Z" },
    { "status": "AWAITING_REVIEW", "at": "2026-08-20T10:12:09Z" },
    { "status": "ASSIGNED", "at": "2026-08-20T10:20:11Z" }
  ],
  "latestUpdate": "Assigned to Road Maintenance — South Zone"
}
```

**`GET /api/v1/incidents/my`** — paginated list for the logged-in citizen

Query params: `?status=OPEN&page=0&size=20`
Response `200`:
```json
{
  "content": [
    { "incidentId": "CP-2026-001042", "category": "POTHOLE", "status": "ASSIGNED", "reportedAt": "2026-08-20T10:12:04Z" }
  ],
  "page": 0, "size": 20, "totalElements": 1
}
```

**`POST /api/v1/incidents/{id}/verify`**

Request:
```json
{ "outcome": "CONFIRMED" }
```
`"outcome"` is `"CONFIRMED"` (→ `CLOSED`) or `"REJECTED"` (→ triggers reopen flow).
Response `200`: `{ "incidentId": "CP-2026-001042", "status": "CLOSED" }`

**`POST /api/v1/incidents/{id}/reopen`**

Request:
```json
{ "reason": "Pothole was patched but has reopened after rain" }
```
Response `200`: `{ "incidentId": "CP-2026-001042", "status": "REOPENED" }`
Records `citizen_id`, `reason`, `timestamp`; only allowed within a
configurable window after resolution.

### 2.4 Operator endpoints (`/api/v1/admin/...`)

**`GET /api/v1/admin/incidents`**

Query params: `?status=AWAITING_REVIEW&category=POTHOLE&priority=CRITICAL&department=1&minSeverity=7&sort=severity,desc&page=0&size=25`

Response `200`:
```json
{
  "content": [
    {
      "incidentId": "CP-2026-001042",
      "category": "POTHOLE",
      "aiConfidence": 0.96,
      "severity": 8.7,
      "priority": "HIGH",
      "status": "AWAITING_REVIEW",
      "location": { "latitude": 20.2961, "longitude": 85.8245 },
      "reportedAt": "2026-08-20T10:12:04Z"
    }
  ],
  "page": 0, "size": 25, "totalElements": 143
}
```

**`GET /api/v1/admin/incidents/{id}`** — full detail for the review screen

Response `200`:
```json
{
  "incidentId": "CP-2026-001042",
  "status": "AWAITING_REVIEW",
  "citizen": { "userId": "usr_7f1a2b", "name": "Ananya Das" },
  "description": "Large pothole near the bus stop",
  "images": ["https://cdn.citypulse.app/incidents/CP-2026-001042/0.jpg"],
  "location": { "latitude": 20.2961, "longitude": 85.8245, "accuracy": 8.5 },
  "aiAnalysis": {
    "modelVersion": "citypulse-yolo-v1",
    "category": "POTHOLE",
    "confidence": 0.96,
    "severity": 8.7,
    "severityLabel": "CRITICAL",
    "detectedFeatures": ["large_surface_damage", "standing_water"]
  },
  "finalCategory": null,
  "priority": null,
  "assignment": null,
  "statusHistory": [
    { "oldStatus": null, "newStatus": "SUBMITTED", "changedBy": "usr_7f1a2b", "at": "2026-08-20T10:12:04Z" },
    { "oldStatus": "SUBMITTED", "newStatus": "AWAITING_REVIEW", "changedBy": "system", "at": "2026-08-20T10:12:09Z" }
  ]
}
```

**`PATCH /api/v1/admin/incidents/{id}/category`**

Request:
```json
{ "category": "WATERLOGGING", "reason": "AI misread standing water as road surface damage" }
```
Response `200`:
```json
{ "incidentId": "CP-2026-001042", "originalCategory": "POTHOLE", "finalCategory": "WATERLOGGING" }
```
Backend stores original AI prediction, corrected category, operator ID,
timestamp, and reason — never overwrites the raw AI result.

**`PATCH /api/v1/admin/incidents/{id}/priority`**

Request:
```json
{ "priority": "CRITICAL", "reason": "Immediate public safety concern at this location" }
```
Response `200`: `{ "incidentId": "CP-2026-001042", "aiSeverity": 6.4, "finalPriority": "CRITICAL" }`

**`POST /api/v1/admin/incidents/{id}/assign`**

Request:
```json
{
  "departmentId": 3,
  "divisionId": 12,
  "teamId": 41,
  "notes": "Peak-hour hazard, prioritize today"
}
```
Response `200`:
```json
{
  "incidentId": "CP-2026-001042",
  "status": "ASSIGNED",
  "assignment": {
    "department": "Road Maintenance",
    "division": "South Zone",
    "team": "Road Team B",
    "assignedBy": "usr_op_18",
    "assignedAt": "2026-08-20T10:20:11Z"
  }
}
```
Validation (`FR-023`): division must belong to department, team must belong
to division, operator must hold assignment permission — otherwise `400`
with code `INVALID_ASSIGNMENT`.

### 2.5 Field officer endpoints

**`GET /api/v1/officer/incidents`** — assignments for the logged-in officer

Response `200`:
```json
{
  "content": [
    {
      "incidentId": "CP-2026-001042",
      "category": "POTHOLE",
      "priority": "HIGH",
      "image": "https://cdn.citypulse.app/incidents/CP-2026-001042/0.jpg",
      "location": { "latitude": 20.2961, "longitude": 85.8245 },
      "assignedAt": "2026-08-20T10:20:11Z",
      "status": "ASSIGNED"
    }
  ]
}
```

**`POST /api/v1/incidents/{id}/start`**

Request: `{}` (no body needed — officer and timestamp taken from the auth context)
Response `200`: `{ "incidentId": "CP-2026-001042", "status": "IN_PROGRESS", "startedAt": "2026-08-20T11:00:02Z" }`

**`POST /api/v1/incidents/{id}/resolve`** — multipart/form-data

Form fields:
```
image: file (required — resolution evidence photo)
description: string (required)
```
Response `200`:
```json
{
  "incidentId": "CP-2026-001042",
  "status": "RESOLVED",
  "resolvedAt": "2026-08-20T15:30:00Z",
  "evidenceUrl": "https://cdn.citypulse.app/resolutions/CP-2026-001042/0.jpg"
}
```
Triggers a citizen notification (§2.7).

### 2.6 Internal AI contract

**`POST /internal/v1/analyze`** — service-to-service, called by the backend
after `POST /api/v1/incidents`, never exposed publicly.

Request:
```json
{
  "incidentId": "CP-2026-001042",
  "imageUrl": "https://cdn.citypulse.app/incidents/CP-2026-001042/0.jpg"
}
```
Response `200`:
```json
{
  "category": "POTHOLE",
  "confidence": 0.96,
  "severity": 8.7,
  "severity_label": "CRITICAL",
  "detected_features": ["large_surface_damage", "standing_water"],
  "model_version": "citypulse-yolo-v1"
}
```
Backend behavior on the response:
- `confidence >= threshold` (e.g. 0.7): status → `AWAITING_REVIEW`, `ai_analysis` row written.
- `confidence < threshold`: status → `MANUAL_REVIEW` → `AWAITING_REVIEW`, flagged for the operator.
- Timeout / 5xx / network error: status → `MANUAL_REVIEW` → `AWAITING_REVIEW`, `ai_analysis.metadata.error` set, incident never blocked or lost (`FR-014`).

### 2.7 Notifications (event-driven, `FR-038`)

Internally triggered, not a public endpoint per se, but the citizen-facing
shape (e.g. delivered via WebSocket or polled at `GET /api/v1/notifications`):
```json
{
  "notificationId": "ntf_881a",
  "incidentId": "CP-2026-001042",
  "type": "INCIDENT_RESOLVED",
  "message": "Your report has been resolved. Please confirm.",
  "createdAt": "2026-08-20T15:30:05Z",
  "read": false
}
```
`type` ∈ `INCIDENT_ASSIGNED | INCIDENT_IN_PROGRESS | INCIDENT_RESOLVED | INCIDENT_REOPENED | INCIDENT_CLOSED`.

### 2.8 Analytics endpoints

All under `/api/v1/analytics`, operator/admin only.

**`GET /analytics/overview`**
```json
{
  "totalIncidents": 4210, "openIncidents": 312, "criticalIncidents": 18,
  "avgResolutionHours": 41.2, "reopenRate": 0.06
}
```
**`GET /analytics/categories`**
```json
{ "POTHOLE": 1204, "GARBAGE": 980, "WATERLOGGING": 611, "BROKEN_STREETLIGHT": 402 }
```
**`GET /analytics/severity`**
```json
{ "CRITICAL": 88, "HIGH": 340, "MEDIUM": 1211, "LOW": 2571 }
```
**`GET /analytics/locations?bbox=85.7,20.2,85.9,20.4`** — GeoJSON `FeatureCollection` of incident points for the map dashboard, computed via PostGIS.

**`GET /analytics/resolution-time?groupBy=department`**
```json
{ "Road Maintenance": 38.4, "Sanitation": 22.1, "Electrical": 55.7 }
```

### 2.9 Core entities (as persisted)

```
users(id, name, email, phone, password_hash, role, created_at, updated_at)
departments(id, name, description, active, created_at)
divisions(id, department_id, name, zone, active)
teams(id, division_id, name, active)
incidents(id, citizen_id, description, category, severity, priority, status, location GEOGRAPHY(POINT), created_at, updated_at)
incident_images(id, incident_id, url, kind[original|resolution], created_at)
ai_analysis(id, incident_id, model_version, predicted_category, confidence, severity, severity_label, metadata JSONB, created_at)
assignments(id, incident_id, department_id, division_id, team_id, assigned_by, assigned_at, notes)
incident_status_history(id, incident_id, old_status, new_status, changed_by, remarks, created_at)
resolution_evidence(id, incident_id, officer_id, image_url, description, created_at)
notifications(id, user_id, incident_id, type, message, read, created_at)
audit_events(id, actor_id, action, target_type, target_id, before JSONB, after JSONB, created_at)
```

---

## 3. Frontend (React)

### 3.1 Route map by role

```
/                         → landing / "Report an Issue" CTA (public)
/login  /register         → auth
/report                    → citizen: new incident form
/incidents                 → citizen: "my reports" list
/incidents/:id             → citizen: incident detail + timeline + verify/reopen

/admin                      → operator: dashboard (KPI cards + queue + map)
/admin/incidents/:id        → operator: review screen

/officer                    → officer: assignment list (mobile-first)
/officer/incidents/:id      → officer: active assignment detail
```
Role is read from the JWT; route guards redirect to `/login` or a 403 page.

### 3.2 Citizen flow

**`/report`** — single-screen form matching `Open → Photograph → Location → Submit` (§13.1 of the PRD).

1. On mount: request geolocation permission (`navigator.geolocation.getCurrentPosition`), store `{latitude, longitude, accuracy}` in local component state. If denied, fall back to a manual map-pin picker.
2. Camera/file input for the primary image, optional up to 3 more.
3. Optional description textarea (500 char limit enforced client-side, mirrored server-side).
4. Submit → `POST /api/v1/incidents` as `multipart/form-data` (payload in §2.3).
5. On `201`, redirect to `/incidents/{incidentId}` and show the tracking screen immediately — never block on AI results.

```jsx
async function submitIncident(formValues) {
  const fd = new FormData();
  fd.append("image", formValues.image);
  formValues.additionalImages.forEach(f => fd.append("additionalImages", f));
  fd.append("latitude", formValues.location.latitude);
  fd.append("longitude", formValues.location.longitude);
  fd.append("accuracy", formValues.location.accuracy);
  if (formValues.description) fd.append("description", formValues.description);
  const res = await fetch("/api/v1/incidents", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) throw await res.json(); // { error: {...} }
  return res.json(); // { incidentId, status, createdAt, trackingUrl }
}
```

**`/incidents/:id`** — matches §13.2: incident ID, category, status, reported date, location, image, timeline, latest update. Calls `GET /api/v1/incidents/{id}`. Poll every 15–30s while status is not terminal (`CLOSED`), or subscribe to the notification channel if available. Shows Confirm/Reject buttons only when `status === "CITIZEN_VERIFICATION"`, wired to `POST /incidents/{id}/verify`.

### 3.3 Operator flow

**`/admin`** — layout per §13.3 (sidebar / KPI cards / queue / map).

- On mount: `GET /analytics/overview` for KPI cards, `GET /admin/incidents?status=AWAITING_REVIEW&sort=severity,desc` for the queue, `GET /analytics/locations` for the map layer.
- Queue table row click → `/admin/incidents/:id`.
- Filter bar (category, status, priority, department, geographic) maps directly to the query params on `GET /admin/incidents`.

**`/admin/incidents/:id`** — review screen per §13.4, six sections on one page (no cross-navigation required):

1. Evidence — images from `GET /admin/incidents/{id}`.
2. Location — map pin from `location`.
3. AI analysis — `aiAnalysis.category`, `confidence`, `detectedFeatures`.
4. Severity — `aiAnalysis.severity` + `severityLabel`, with an override control that calls `PATCH .../priority`.
5. History — `statusHistory` timeline.
6. Routing controls — three cascading selects (department → division → team, each filtered by the parent selection) that submit to `POST .../assign`.

Category override (`PATCH .../category`) and priority override (`PATCH .../priority`) are separate calls, both requiring a `reason` field per `FR-019`/`FR-020`.

### 3.4 Field officer flow

Mobile-first per §13.5.

**`/officer`** — list from `GET /officer/incidents`, each card showing priority badge, category, thumbnail, distance/location.

**`/officer/incidents/:id`** — detail with three primary actions surfaced as large touch targets:
- "Start work" → `POST /incidents/{id}/start`, only visible when `status === "ASSIGNED"`.
- "Upload evidence & resolve" → camera capture + description → `POST /incidents/{id}/resolve` (multipart), only visible when `status === "IN_PROGRESS"`.
- Map + issue image + priority are always visible at the top of the screen.

### 3.5 State & data-fetching notes

- Use a query cache (React Query/TanStack Query) keyed by `["incident", id]` and `["adminIncidents", filters]` — invalidate on every mutation (`assign`, override, start, resolve, verify) so screens stay in sync without manual refetch logic.
- Citizen-facing screens never show `aiAnalysis` internals — only `category`, `status`, `priority`, and `latestUpdate` (privacy-by-default, `NFR-005`).
- All mutation calls should optimistically disable the triggering button and surface `error.message` from the standard error envelope (§2.1) inline, not as a generic toast, so operators/officers know exactly what failed.
