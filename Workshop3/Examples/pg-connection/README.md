# PostgreSQL Connection (Workshop 3 Example)

This example introduces **PostgreSQL** in an Express.js project using the `pg` package and a connection pool.

It focuses on the connection layer only: reading database settings from environment variables, creating a reusable `Pool`, validating required configuration, and running a simple query to confirm that the application can reach PostgreSQL.

### What You'll Learn

- **Connection Pools:** Create a `pg` Pool and reuse it across the application.
- **Environment Configuration:** Load database settings with `dotenv`.
- **Configuration Validation:** Fail early when a required environment variable is missing.
- **Connection Testing:** Run a simple query to verify connectivity.
- **Clean Shutdown:** Close the pool when the test finishes.

### Project Structure

- `db/pool.js` — Creates and exports the PostgreSQL connection pool.
- `db/test-connection.js` — Runs a connectivity check and prints the database time.
- `app.js` — Minimal script that connects, queries the database, and exits.
- `.env.example` — Example database environment variables.
- `package.json` — Project dependencies and scripts.

### Getting Started

**1. Install Dependencies**

```bash
npm install
```

**2. Create the Database and User**

Open PostgreSQL as an administrative user:

```bash
sudo -i -u postgres
psql
```

Create a role and database for the example:

```sql
CREATE ROLE quote_app_user
WITH LOGIN PASSWORD 'choose-a-local-password';

CREATE DATABASE quote_app
OWNER quote_app_user;

\q
```

You can substitute your own role and database names, but the values in `.env` must match.

**3. Configure Environment Variables**

Create your `.env` file:

```bash
cp .env.example .env
```

Set the connection values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quote_app
DB_USER=quote_app_user
DB_PASSWORD=choose-a-local-password
```

Keep `.env` out of version control. `db/pool.js` throws an error if `DB_HOST`, `DB_NAME`, `DB_USER`, or `DB_PASSWORD` is missing.

**4. Test the Connection**

```bash
npm run test:db
```

A successful run prints:

```text
Database connected successfully!
Database time: ...
```

**5. Run the Minimal Script**

```bash
npm start
```

`app.js` performs a similar query and then closes the pool.

### Exploring the Example

| Command | What to Explore |
|---|---|
| `npm run test:db` | A dedicated connectivity check with clear success and failure output. |
| `npm start` | The same connection used by a minimal application script. |
| Remove a variable from `.env` | See the early configuration error raised by `db/pool.js`. |

### Workshop Objective

By the end of this example, you should be able to connect an Express.js project to PostgreSQL with a pool and verify that the configuration works before building application features.
