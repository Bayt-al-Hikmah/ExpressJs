# Event Board API (Workshop 6 Example)

This example builds a complete REST-style JSON API with a static Fetch client, using **Express 5, Prisma 7, and PostgreSQL**.

The API supports registration, login, sessions, CSRF protection, event CRUD, ownership checks, pagination, filtering, search, cover image uploads, rate limiting, and consistent JSON error responses.

### What You'll Learn

- **REST-Style JSON API:** Organize endpoints under `/api` with consistent response shapes.
- **Validation:** Validate bodies, params, and query strings with `express-validator`.
- **Session Authentication:** Register, log in, inspect the current user, and log out.
- **CSRF for APIs:** Fetch a token from `/api/csrf-token` and send it in the `X-CSRF-Token` header.
- **Ownership Checks:** Allow only the event organizer to update, delete, or upload a cover.
- **Pagination, Filtering, and Search:** Support `page`, `category`, and `search` query parameters.
- **Status Visibility:** Hide draft events from users who do not own them.
- **File Uploads:** Accept one validated cover image with Multer.
- **Secure Media Serving:** Serve covers through a route with access checks.
- **Rate Limiting and Helmet:** Limit request volume and set security headers.
- **Fetch Client:** Consume the API from a static frontend with `credentials: 'same-origin'`.

### Project Structure

- `app.js` — Express setup, security middleware, sessions, API routes, and error handling.
- `prisma/schema.prisma` — `User`, `Event`, and `MediaAsset` models plus enums.
- `prisma.config.ts` — Prisma CLI configuration.
- `db/prisma.js` — Prisma Client initialization.
- `middleware/requireAuth.js` — Returns a 401 JSON response for unauthenticated requests.
- `middleware/csrf.js` — Reads CSRF tokens from the request header or body.
- `middleware/upload.js` — Multer cover-image configuration and limits.
- `utils/mediaStorage.js` — Cover storage and cleanup helpers.
- `routes/auth.js` — Registration, login, current user, and logout endpoints.
- `routes/events.js` — Event listing, CRUD, and cover endpoints.
- `public/index.html` — Static frontend.
- `public/js/api.js` — Fetch wrapper that attaches the CSRF token.
- `public/js/main.js` — Frontend interactions for auth and events.
- `public/css/style.css` — Frontend styles.
- `storage/event-covers/` — Private cover images (not committed).
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

Keep `.env` out of version control. `SESSION_SECRET` is required by the application.

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

### Exploring the Examples

| Endpoint | What to Explore |
|---|---|
| `GET /api/csrf-token` | Obtain a token for state-changing requests. |
| `POST /api/auth/register` | Create a user with email, username, and password. |
| `POST /api/auth/login` | Start a session; login attempts are rate-limited. |
| `GET /api/auth/me` | Return the current session user. |
| `POST /api/auth/logout` | Destroy the session. |
| `GET /api/events` | Public event list with `page`, `category`, and `search`. |
| `POST /api/events` | Create an event as an authenticated user. |
| `GET /api/events/:eventId` | View a published event, or a draft you own. |
| `PATCH /api/events/:eventId` | Update an event you own. |
| `DELETE /api/events/:eventId` | Delete an event you own. |
| `PUT /api/events/:eventId/cover` | Upload a JPEG, PNG, or WebP cover up to 5 MB. |
| `GET /api/events/:eventId/cover` | Serve a cover with visibility checks. |

State-changing requests require the CSRF token in the `X-CSRF-Token` header and the session cookie. The included frontend handles both automatically. The API also applies a global limit of 200 requests per 15 minutes and a stricter login limit.

### Workshop Objective

By the end of this example, you should be able to design and secure a JSON API that supports authentication, ownership, pagination, uploads, and a browser-based client.
