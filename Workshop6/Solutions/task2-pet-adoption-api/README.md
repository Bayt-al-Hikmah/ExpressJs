# Task 2: Pet Adoption API (Workshop 6 Solution)

This task asks you to build a REST API for pet adoption listings, with public browsing, staff-authenticated management, ownership and authorization checks, and optional image uploads.

The folder currently contains the completed **Event Board API** from the workshop example, which serves as the reference implementation. It already provides public listing with pagination, filtering, and search, along with authenticated create, update, delete, and image-upload endpoints that are restricted to the record owner.

### What This Solution Demonstrates

- **Public Browsing:** Unauthenticated users can read published records.
- **Protected Management:** Only authenticated users can create or modify records.
- **Ownership Checks:** Updates, deletes, and image uploads are limited to the owner.
- **Validation:** Bodies, route parameters, and query strings are validated.
- **CSRF Protection:** API writes require a token from `/api/csrf-token`.
- **Pagination, Filtering, and Search:** Public list endpoints support query parameters.
- **Draft Visibility:** Draft records are visible only to their owner.
- **Image Uploads:** One validated cover image per record.
- **Secure Media Serving:** Uploaded images are served through a controlled route.
- **Rate Limiting and Helmet:** Request limits and security headers.
- **Fetch Client:** A same-origin browser client sends credentials and CSRF tokens.

### Implementation Note

> The code in this folder is the completed Event Board API example (`User`, `Event`, and `MediaAsset`). Use it as the reference for the pet adoption task, then adapt the Prisma models, routes, validation, and frontend to the pet-listing domain. The run instructions and endpoints below describe the code that is currently present.

### Project Structure

- `app.js` — Express setup, security middleware, sessions, API routes, and error handling.
- `prisma/schema.prisma` — Current `User`, `Event`, and `MediaAsset` models.
- `prisma.config.ts` — Prisma CLI configuration.
- `db/prisma.js` — Prisma Client initialization.
- `middleware/requireAuth.js` — JSON 401 guard for protected endpoints.
- `middleware/csrf.js` — CSRF token handling for API requests.
- `middleware/upload.js` — Cover-image upload configuration.
- `utils/mediaStorage.js` — Media storage and cleanup helpers.
- `routes/auth.js` — Authentication endpoints.
- `routes/events.js` — Current resource CRUD and cover endpoints.
- `public/` — Static Fetch client.
- `storage/event-covers/` — Private uploaded images (not committed).
- `.env.example` — Example database and session configuration.
- `package.json` — Dependencies and scripts.

### Getting Started

**1. Install Dependencies**

```bash
npm install
```

**2. Create the Database and User**

```bash
sudo -i -u postgres
psql
```

```sql
CREATE ROLE event_board
WITH LOGIN PASSWORD 'eventboard12345'
CREATEDB;

CREATE DATABASE event_board
OWNER event_board;

\q
```

The `CREATEDB` permission is required for Prisma Migrate's shadow database.

**3. Configure Environment Variables**

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://event_board:eventboard12345@localhost:5432/event_board"
SESSION_SECRET="replace-with-a-long-random-secret"
NODE_ENV=development
```

If you rename the database for the pet adoption domain, update `DATABASE_URL` to match. Keep `.env` out of version control.

**4. Create and Apply the Migration**

```bash
npx prisma migrate dev --name init
```

**5. Generate Prisma Client**

```bash
npx prisma generate
```

**6. Start the Application**

```bash
npm start
```

**7. Open the Application**

http://localhost:3000/

### Exploring the Solution

| Endpoint | What to Explore |
|---|---|
| `GET /api/csrf-token` | Obtain a CSRF token for writes. |
| `POST /api/auth/register` | Create an account. |
| `POST /api/auth/login` | Start a session. |
| `GET /api/auth/me` | Inspect the current session user. |
| `POST /api/auth/logout` | End the session. |
| `GET /api/events` | Public paginated list with category and search filters. |
| `POST /api/events` | Create a record as an authenticated user. |
| `GET /api/events/:eventId` | View a published record or your own draft. |
| `PATCH /api/events/:eventId` | Update a record you own. |
| `DELETE /api/events/:eventId` | Delete a record you own. |
| `PUT /api/events/:eventId/cover` | Upload a validated cover image. |
| `GET /api/events/:eventId/cover` | Serve the cover with visibility checks. |

### Adapting to the Task

Replace the event models and routes with the pet-listing domain, decide which fields are public, add staff-only authorization where required, and keep the existing validation, CSRF, ownership, pagination, upload, and error-handling patterns.

### Workshop Objective

By the end of this task, you should be able to build a public-facing API with protected staff management and adapt a reference implementation to a new domain.
