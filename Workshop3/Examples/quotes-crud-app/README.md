# Quotes CRUD App (Workshop 3 Example)

This example turns the Workshop 2 quote-sharing idea into a persistent application backed by **PostgreSQL**.

It demonstrates a complete create, read, update, delete, and search flow using parameterized SQL queries, server-side validation, CSRF protection, and EJS views.

### What You'll Learn

- **PostgreSQL with `pg`:** Use a connection pool to run queries from Express routes.
- **Schema and Constraints:** Define a quotes table with primary keys, timestamps, and database-level checks.
- **Parameterized Queries:** Pass values as `$1`, `$2`, and so on to avoid SQL injection.
- **CRUD Routes:** Create, list, view, edit, and delete quotes.
- **Search:** Query by author with case-insensitive matching.
- **Validation and CSRF:** Reuse `express-validator` and `csrf-sync` from Workshop 2.
- **Error Handling:** Render custom 404 and error pages when queries or routes fail.

### Project Structure

- `app.js` — Express setup, sessions, static assets, error handlers, and database startup check.
- `db/pool.js` — PostgreSQL connection pool.
- `db/schema.sql` — Quotes table definition and constraints.
- `middlewares/csrf.js` — Shared CSRF token generation and protection.
- `routes/quotes.js` — All quote routes and SQL queries.
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

`SESSION_SECRET` is required by `app.js`. Keep `.env` out of version control.

**4. Apply the Database Schema**

```bash
psql -h localhost -U quote_app_user -d quote_app -f db/schema.sql
```

The schema starts with `DROP TABLE IF EXISTS quotes;`, so running it resets all existing quotes.

**5. Start the Application**

```bash
npm start
```

The application checks the database connection before it begins listening.

### Exploring the Examples

| Route | What to Explore |
|---|---|
| `/` | The 20 most recent quotes loaded from PostgreSQL. |
| `/share` | Create a quote with validation and a CSRF token. |
| `/quotes/:id` | View a single quote. |
| `/quotes/:id/edit` | Update a quote's author and content. |
| `/quotes/:id/delete` | Delete a quote through a CSRF-protected POST form. |
| `/search?author=alice` | Case-insensitive author search. |

Try creating, editing, and deleting a quote, then restart the server to confirm that the data persists.

### Workshop Objective

By the end of this example, you should understand how to connect Express routes to PostgreSQL and implement persistent CRUD operations safely with parameterized SQL.
