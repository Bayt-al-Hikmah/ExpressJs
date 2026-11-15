# Task 2: Search by Content (Workshop 3 Solution)

This solution adds a case-insensitive **content search** to the database-backed quote application.

Instead of matching an exact author name, the search route looks for the supplied term anywhere inside a quote's content using PostgreSQL `ILIKE` and a parameterized pattern.

### What This Solution Demonstrates

- **Case-Insensitive Search:** Use `ILIKE` for matching regardless of letter case.
- **Parameterized Patterns:** Build `%term%` safely as a query parameter.
- **Search UX:** Preserve the search term and show an empty result state.
- **SQL Safety:** Keep user input out of the SQL string itself.

### Project Structure

- `app.js` — Express setup, sessions, error handlers, and database startup check.
- `db/schema.sql` — Quotes table definition.
- `db/pool.js` — PostgreSQL connection pool.
- `middlewares/csrf.js` — CSRF protection helpers.
- `routes/quotes.js` — Quote routes including content search.
- `views/search.ejs` — Content search form and results.
- `views/` — Home, share, show, edit, 404, and error templates.
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
| `/search?content=life` | Find quotes whose content contains `life` in any letter case. |
| `/search?content=CODE` | Confirm that uppercase and lowercase terms behave the same. |
| `/search?content=` | See the empty search state. |
| `/share` | Add a quote, then search for text inside it. |

The route uses `WHERE content ILIKE $1` with `%term%`, so the user's term is always passed as data rather than concatenated into SQL.

### Workshop Objective

By the end of this solution, you should be able to implement flexible, safe search queries with parameterized SQL patterns.
