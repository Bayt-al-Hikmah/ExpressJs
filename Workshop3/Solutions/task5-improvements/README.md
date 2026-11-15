# Task 5: Quote Management Improvements (Workshop 3 Solution)

This solution polishes the database-backed quote application with several usability and robustness improvements.

Quotes show when they were last modified, lists are ordered newest first, invalid IDs produce a proper 404 page, deletions require confirmation, and unexpected database errors are handled without exposing internal details.

### What This Solution Demonstrates

- **Timestamps:** Display `updated_at` alongside the original creation time.
- **Newest-First Ordering:** Order quotes by `created_at DESC`.
- **Input Validation:** Reject non-integer and out-of-range IDs before querying.
- **404 Handling:** Render a not-found page for missing or invalid quotes.
- **Delete Confirmation:** Ask the user to confirm before deleting.
- **Safe Error Handling:** Show a generic error page instead of leaking SQL or stack details.

### Project Structure

- `app.js` — Express setup, sessions, 404 and error handlers, database startup check.
- `db/schema.sql` — Quotes table with created and updated timestamps.
- `db/pool.js` — PostgreSQL connection pool.
- `middlewares/csrf.js` — CSRF protection helpers.
- `routes/quotes.js` — Quote routes with validation and improved handling.
- `views/` — Home, share, show, edit, search, 404, and error templates.
- `views/partials/` — Shared header, navigation, and footer.
- `public/css/style.css` — Application styles.
- `.env.example` — Example database and session configuration.
- `package.json` — Project dependencies and scripts.

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
CREATE ROLE quote_app_user
WITH LOGIN PASSWORD 'choose-a-local-password';

CREATE DATABASE quote_app
OWNER quote_app_user;

\q
```

**3. Configure Environment Variables**

```bash
cp .env.example .env
```

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quote_app
DB_USER=quote_app_user
DB_PASSWORD=choose-a-local-password
SESSION_SECRET=replace-with-random-secret
NODE_ENV=development
```

**4. Apply the Database Schema**

```bash
psql -h localhost -U quote_app_user -d quote_app -f db/schema.sql
```

**5. Start the Application**

```bash
npm start
```

### Exploring the Solution

| Route | What to Explore |
|---|---|
| `/` | Quotes are listed newest first. |
| `/quotes/:id` | The page shows both creation and last-modified timestamps. |
| `/quotes/abc` | Invalid IDs render the 404 page instead of causing a query error. |
| `/quotes/:id/edit` | Saving an edit updates `updated_at`. |
| `/quotes/:id/delete` | The delete action includes a confirmation step. |

Stop the database or supply invalid credentials to see the generic error page instead of raw database details.

### Workshop Objective

By the end of this solution, you should be able to harden a CRUD application with better validation, clearer status handling, and safer error responses.
