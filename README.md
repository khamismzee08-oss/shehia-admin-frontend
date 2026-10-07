# Shehia Admin Frontend — React + Vite

SPA admin frontend for the supplied Spring Boot Shehia Management API.

## Backend endpoints used

### Authentication
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/change-password`
- `POST /api/v1/auth/logout`

### Dashboard
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/dashboard/activity?days=7`

### Residents
- `GET /api/v1/admin/residents`
- `GET /api/v1/admin/residents?status=PENDING`
- `GET /api/v1/admin/residents/{id}`
- `PUT /api/v1/admin/residents/{id}/status`
- `PUT /api/v1/admin/residents/{id}/verify?status=ACTIVE`

### Letters
- `GET /api/v1/admin/letters`
- `GET /api/v1/admin/letters?status=PENDING`
- `GET /api/v1/admin/letters/{referenceNumber}`
- `PUT /api/v1/admin/letters/{referenceNumber}/review`
- `GET /api/v1/admin/letters/{referenceNumber}/preview`
- `GET /api/v1/admin/letters/{referenceNumber}/pdf`

### Issues
- `GET /api/v1/admin/issues`
- `GET /api/v1/admin/issues?status=PENDING`
- `GET /api/v1/admin/issues/{reportNumber}`
- `PUT /api/v1/admin/issues/{reportNumber}/status`
- `PUT /api/v1/admin/issues/{reportNumber}/assign`
- `PUT /api/v1/admin/issues/{reportNumber}/priority`

### Announcements
- `GET /api/v1/admin/announcements`
- `GET /api/v1/admin/announcements?status=PUBLISHED`
- `GET /api/v1/admin/announcements/{id}`
- `POST /api/v1/admin/announcements`
- `PUT /api/v1/admin/announcements/{id}`
- `PUT /api/v1/admin/announcements/{id}/publish`
- `PUT /api/v1/admin/announcements/{id}/unpublish`
- `DELETE /api/v1/admin/announcements/{id}`

## Run

1. Copy `.env.example` to `.env`.
2. Set `VITE_API_BASE_URL` to the Spring Boot API, normally:
   `http://localhost:8080/api/v1`
3. Install dependencies:
   `npm install`
4. Start:
   `npm run dev`
5. Production build:
   `npm run build`

## Important integration note

The supplied backend exposes no admin endpoints for:
- creating/editing admin users
- letter-template management
- issue-category management
- audit-log retrieval
- server-side PDF/CSV report generation

Therefore the UI does not invent those endpoints or fake their data. Reports uses the live dashboard/activity endpoints and downloads CSV snapshots of the live list endpoints. Settings exposes the backend's actual change-password operation.

The frontend stores only the JWT/session needed for authentication in localStorage and sends `Authorization: Bearer <token>` for protected requests.

The letter HTML preview is rendered from the backend response. It is assumed to be trusted server-generated HTML.
