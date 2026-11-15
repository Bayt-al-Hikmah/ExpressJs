# Task 1: Equipment Catalogue API (Workshop 6 Solution)

This task asks you to build a REST API for an equipment catalogue with CRUD operations, search and filtering, pagination, validation, authenticated management, and optional image uploads.

The folder currently contains the completed **Event Board API** from the workshop example, which serves as the reference implementation for this task. It already demonstrates the required API patterns: JSON responses, validation, sessions, CSRF protection, ownership checks, pagination, filtering, search, uploads, and a Fetch client.

### What This Solution Demonstrates

- **REST-Style API:** Predictable JSON endpoints and status codes.
- **Validation:** Request body, parameter, and query validation with `express-validator`.
- **Authentication:** Session-based register, login, current-user, and logout endpoints.
- **CSRF Protection:** Tokens issued by the API and sent in the `X-CSRF-Token` header.
- **Ownership Checks:** Only the record owner can update, delete, or upload an image.
- **Pagination, Filtering, and Search:** Query parameters for page, category, and text search.
- **Draft Visibility:** Unpublished records are hidden from other users.
- **Image Uploads:** Multer with an image MIME allowlist and a 5 MB limit.
- **Secure Media Serving:** A controlled route serves uploaded images.
- **Rate Limiting and Security Headers:** Global and login-specific limits plus Helmet.
- **Fetch Client:** A static frontend consumes the API with credentials.

### Implementation Note

> The code in this folder is the completed Event Board API example (`User`, `Event`, and `MediaAsset`). Use it as the reference for the task, then adapt the Prisma models, routes, and frontend to the equipment domain. The run instructions and endpoints below describe the code that is currently present.

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

If you rename the database for the equipment domain, update `DATABASE_URL` to match. Keep `.env` out of version control.

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
| `GET /api/events` | Paginated, filtered, searchable public list. |
| `POST /api/events` | Create a resource as an authenticated user. |
| `GET /api/events/:eventId` | View a published resource or your own draft. |
| `PATCH /api/events/:eventId` | Update a resource you own. |
| `DELETE /api/events/:eventId` | Delete a resource you own. |
| `PUT /api/events/:eventId/cover` | Upload a JPEG, PNG, or WebP image up to 5 MB. |
| `GET /api/events/:eventId/cover` | Serve the uploaded image with visibility checks. |

### Adapting to the Task

Rename the resource models and routes for the equipment domain, update the validation rules and form fields, and keep the existing patterns for authentication, CSRF, ownership, pagination, filtering, uploads, and JSON error handling.

### Workshop Objective

By the end of this task, you should be able to apply the full Workshop 6 API pattern to a new resource while preserving validation, security, and consistent client integration.
