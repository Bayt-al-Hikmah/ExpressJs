# Final Project: Database-Backed Quote Sharing (Workshop 3 Solution)

This final solution combines the Workshop 3 material into a complete quote-sharing application backed by **PostgreSQL**.

Visitors can browse recent quotes, create new ones, view individual quotes, edit or delete them, and search by author. All writes are validated and CSRF-protected, and every query uses parameters instead of string concatenation.

### What This Solution Demonstrates

- **Persistent CRUD:** List, create, read, update, and delete quotes in PostgreSQL.
- **Parameterized SQL:** Pass all user values through `$1`, `$2`, and similar placeholders.
- **Schema Constraints:** Enforce minimum lengths and non-empty content at the database level.
- **Validation and CSRF:** Use `express-validator` and `csrf-sync` on every state-changing route.
- **Search:** Case-insensitive author search.
- **EJS Views and Partials:** A consistent server-rendered interface with shared layout files.
- **Timestamps:** Track and display creation and last-modified times.
- **404 and Error Handling:** Custom pages for missing records and unexpected failures.

### Project Structure

- `app.js` — Express setup, sessions, static assets, error handlers, and startup check.
- `db/pool.js` — PostgreSQL connection pool.
- `db/schema.sql` — Quotes table, defaults, and constraints.
- `middlewares/csrf.js` — Shared CSRF protection helpers.
- `routes/quotes.js` — All quote routes and queries.
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

Keep `.env` out of version control. `SESSION_SECRET` is required by the application.

**4. Apply the Database Schema**

```bash
psql -h localhost -U quote_app_user -d quote_app -f db/schema.sql
```

The schema drops and recreates the `quotes` table, so applying it resets existing data.

**5. Start the Application**

```bash
npm start
```

**6. Open the Application**

http://localhost:3000/

### Exploring the Solution

| Route | What to Explore |
|---|---|
| `/` | The 20 most recent quotes ordered newest first. |
| `/share` | Create a quote with validation, preserved values, and CSRF protection. |
| `/quotes/:id` | View a single quote with its timestamps. |
| `/quotes/:id/edit` | Edit a quote and update `updated_at`. |
| `/quotes/:id/delete` | Delete a quote through a protected POST request. |
| `/search?author=alice` | Case-insensitive author search. |

Try invalid input, missing quote IDs, and a missing CSRF token to see each layer of protection respond correctly.

### Workshop Objective

By the end of this final project, you should be able to build a complete server-rendered CRUD application with PostgreSQL, validation, CSRF protection, and robust error handling.
