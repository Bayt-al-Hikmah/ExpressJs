# Task 1: Quote Categories (Workshop 3 Solution)

This solution extends the database-backed quote application with a **category** field.

Each quote now belongs to a fixed category. The category is stored in PostgreSQL, selected through a dropdown, validated on the server, and shown wherever quotes are displayed.

### What This Solution Demonstrates

- **Schema Changes:** Add a `category` column with a default value and a database check.
- **Fixed Choices:** Define an allowed category list in the route layer.
- **Server-Side Validation:** Reject values that are not in the allowed list with `isIn`.
- **Insert and Update:** Persist the category when creating or editing a quote.
- **Display:** Show the category on the home, detail, and search pages.

### Project Structure

- `app.js` — Express setup, sessions, error handlers, and database startup check.
- `db/schema.sql` — Quotes table including the `category` column and constraint.
- `db/pool.js` — PostgreSQL connection pool.
- `middlewares/csrf.js` — CSRF protection helpers.
- `routes/quotes.js` — Quote routes with category validation.
- `views/` — Templates updated to display and edit categories.
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

The schema resets the `quotes` table, so existing rows are removed when it is applied.

**5. Start the Application**

```bash
npm start
```

### Exploring the Solution

| Route | What to Explore |
|---|---|
| `/` | Quotes display their category alongside the author and content. |
| `/share` | Choose a category from the fixed dropdown. |
| `/quotes/:id` | View a quote with its category. |
| `/quotes/:id/edit` | Change the category of an existing quote. |
| `/search?author=alice` | Search results include the category. |

The allowed categories are `Motivation`, `Life`, `Technology`, `Success`, and `Education`. Try submitting a category that is not in the list to see server-side validation reject it.

### Workshop Objective

By the end of this solution, you should be able to extend an existing SQL schema and keep database constraints, server validation, and form controls consistent.
