# Task 3: Total Quote Count (Workshop 3 Solution)

This solution adds a total quote counter to the database-backed quote application.

The home route runs a list query and an aggregate count query, then passes the total to the EJS template so it can be displayed above the recent quotes.

### What This Solution Demonstrates

- **Aggregate Queries:** Use `SELECT COUNT(*)` to summarize table data.
- **Parallel Queries:** Run the list and count queries together with `Promise.all`.
- **Type Conversion:** Convert PostgreSQL's string count into a number.
- **Template Data:** Pass aggregate results to EJS alongside the quote list.

### Project Structure

- `app.js` — Express setup, sessions, error handlers, and database startup check.
- `db/schema.sql` — Quotes table definition.
- `db/pool.js` — PostgreSQL connection pool.
- `middlewares/csrf.js` — CSRF protection helpers.
- `routes/quotes.js` — Quote routes including the total count query.
- `views/home.ejs` — Home page that displays the total.
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
| `/` | The total number of quotes appears next to the recent quotes. |
| `/share` | Add a quote and return home to see the total increase. |
| `/quotes/:id/delete` | Delete a quote and confirm that the total decreases. |

The count reflects the whole table, while the list on the home page is still limited to the 20 most recent quotes.

### Workshop Objective

By the end of this solution, you should be able to combine aggregate SQL queries with list queries and present summary data in a template.
