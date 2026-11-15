# Task 1: Personal Reading Tracker (Workshop 4 Solution)

This solution builds a personal reading tracker with **Express.js, Prisma 7, and PostgreSQL**.

Each authenticated user maintains their own list of books. Books move through a reading status enum, and every add, update, or delete operation is restricted to the owner.

### What This Solution Demonstrates

- **Prisma Enum:** Use `ReadingStatus` with `TO_READ`, `READING`, and `COMPLETED`.
- **Per-User Ownership:** Filter books by the session user's ID on every query.
- **Authentication:** Register, log in, and log out with Argon2id password hashing.
- **Sessions and CSRF:** Keep the user in a session and protect all forms.
- **CRUD:** Create books, list them, update their status, and delete them.
- **Scoped Writes:** Use `updateMany` and `deleteMany` with an ownership filter so another user's rows cannot be changed.

### Project Structure

- `app.js` — Express setup, sessions, CSRF locals, routes, and error handlers.
- `prisma/schema.prisma` — `User` and `Book` models plus the `ReadingStatus` enum.
- `db/prisma.js` — Prisma Client initialization.
- `middleware/requireLogin.js` — Authentication guard for private routes.
- `middleware/csrf.js` — CSRF token helpers.
- `routes/auth.js` — Register, login, and logout.
- `routes/projects.js` — Book routes (mounted under `/projects`).
- `views/auth/` — Login and registration templates.
- `views/projects/index.ejs` — Reading list, add form, status controls, and delete actions.
- `views/partials/` — Shared layout partials.
- `public/` — Application CSS.
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
CREATE ROLE study_planner
WITH LOGIN PASSWORD 'study12345'
CREATEDB;

CREATE DATABASE study_planner
OWNER study_planner;

\q
```

The `CREATEDB` permission is needed for Prisma Migrate's shadow database.

**3. Configure Environment Variables**

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://study_planner:study12345@localhost:5432/study_planner"
SESSION_SECRET="replace-with-a-long-random-secret"
NODE_ENV=development
```

The provided `.env.example` uses the database name `study_planner`. You can change `DATABASE_URL` to any database you create, as long as the name matches.

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

| Route | What to Explore |
|---|---|
| `/register` | Create an account with a username and a password of at least 12 characters. |
| `/login` | Start a session. |
| `/logout` | Destroy the session through a CSRF-protected request. |
| `/projects` | View your books and add a new one. |
| `/projects/:id/status` | Change a book between `TO_READ`, `READING`, and `COMPLETED`. |
| `/projects/:id/delete` | Delete one of your books. |

Create two accounts and confirm that each reading list is private.

### Workshop Objective

By the end of this solution, you should be able to model an enum-backed resource in Prisma and enforce per-user ownership across all write operations.
