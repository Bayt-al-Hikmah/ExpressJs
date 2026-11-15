# Task 4: Pagination (Workshop 3 Solution)

This solution adds pagination to the database-backed quote application.

The home page displays ten quotes per page. The requested page comes from the `?page=` query parameter, and the route uses `LIMIT` and `OFFSET` together with a total count to build page navigation.

### What This Solution Demonstrates

- **LIMIT and OFFSET:** Fetch only the rows needed for the current page.
- **Query Parameters:** Read and sanitize the requested page number.
- **Total Pages:** Calculate navigation from the total row count and page size.
- **Empty and Invalid Pages:** Fall back to page 1 for invalid values.
- **Parallel Queries:** Fetch the page and the count at the same time.

### Project Structure

- `app.js` — Express setup, sessions, error handlers, and database startup check.
- `db/schema.sql` — Quotes table definition.
- `db/pool.js` — PostgreSQL connection pool.
- `middlewares/csrf.js` — CSRF protection helpers.
- `routes/quotes.js` — Quote routes including pagination logic.
- `views/home.ejs` — Home page with previous and next page controls.
- `views/` — Share, show, edit, search, 404, and error templates.
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
| `/?page=1` | The first page of quotes. |
| `/?page=2` | The next set of ten quotes after adding enough rows. |
| `/?page=999` | A page beyond the available data. |
| `/?page=abc` | Invalid input falls back to page 1. |

Add more than ten quotes to see the page controls become useful.

### Workshop Objective

By the end of this solution, you should be able to paginate SQL results safely and expose page navigation through query parameters.
