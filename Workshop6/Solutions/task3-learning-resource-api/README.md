# Task 3: Learning Resource API (Workshop 6 Solution)

This task asks you to build a REST API for learning resources with instructor/student-style authorization, draft versus published visibility, CRUD operations, and optional attachment or cover uploads.

The folder currently contains the completed **Event Board API** from the workshop example, which serves as the reference implementation. It already demonstrates published and draft records, public visibility rules, owner-only updates, authenticated writes, validation, pagination, filtering, search, uploads, and a Fetch client.

### What This Solution Demonstrates

- **Role-Style Authorization:** Authenticated owners manage their own records.
- **Draft vs Published Visibility:** Drafts are hidden from other users; published records are public.
- **CRUD:** Create, read, update, and delete resources through JSON endpoints.
- **Validation:** Validate request bodies, route parameters, and query strings.
- **CSRF Protection:** Require a token for every state-changing request.
- **Pagination, Filtering, and Search:** Public listings support query parameters.
- **Uploads:** Accept one validated cover image per resource.
- **Secure Serving:** Serve uploaded images through an access-checked route.
- **Rate Limiting and Helmet:** Protect the API from excessive traffic and set security headers.
- **Fetch Client:** Same-origin browser requests with session cookies and CSRF tokens.

### Implementation Note

> The code in this folder is the completed Event Board API example (`User`, `Event`, and `MediaAsset`). Use it as the reference for the learning-resource task, then adapt the models, routes, validation, and frontend to the resource domain. The run instructions and endpoints below describe the code that is currently present.

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

If you rename the database for the learning-resource domain, update `DATABASE_URL` to match. Keep `.env` out of version control.

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
| `GET /api/events` | Public list showing only published records. |
| `POST /api/events` | Create a record as an authenticated user. |
| `GET /api/events/:eventId` | View a published record or your own draft. |
| `PATCH /api/events/:eventId` | Update a record you own. |
| `DELETE /api/events/:eventId` | Delete a record you own. |
| `PUT /api/events/:eventId/cover` | Upload a validated cover image. |
| `GET /api/events/:eventId/cover` | Serve the cover with visibility checks. |

### Adapting to the Task

Rename the resource models and routes for learning resources, add instructor/student-style authorization rules, keep the draft and published visibility checks, and preserve the validation, CSRF, upload, pagination, and error-handling patterns.

### Workshop Objective

By the end of this task, you should be able to adapt a secured API reference implementation to a role-aware content platform with draft and published states.
