# Study Planner (Workshop 4 Example)

This example builds an authenticated web application with **Express.js, Prisma 7, and PostgreSQL**.

Users register and log in, then manage their own projects and tasks. The example combines database relations, password hashing with Argon2id, session-based authentication, CSRF protection, protected routes, and ownership checks.

### What You'll Learn

- **Prisma Relations:** Model `User` → `Project` → `Task` with cascading deletes.
- **Migrations:** Create the database schema from `schema.prisma`.
- **Password Security:** Hash passwords with Argon2id and verify them on login.
- **Session Authentication:** Store the logged-in user in the session and regenerate the session on login.
- **Protected Routes:** Require authentication before accessing project pages.
- **Ownership Checks:** Restrict every project and task operation to its owner.
- **CSRF Protection:** Protect forms with `csrf-sync`.
- **Validation:** Validate usernames, passwords, project titles, and task titles.
- **Server-Rendered UI:** Use EJS views and partials for the application.

### Project Structure

- `app.js` — Express setup, sessions, CSRF locals, routes, and error handlers.
- `prisma/schema.prisma` — `User`, `Project`, and `Task` models plus the `TaskStatus` enum.
- `prisma.config.ts` — Prisma CLI configuration.
- `db/prisma.js` — Prisma Client initialization with the PostgreSQL adapter.
- `middleware/requireLogin.js` — Redirects unauthenticated users to the login page.
- `middleware/csrf.js` — CSRF token generation and protection.
- `routes/auth.js` — Register, login, and logout routes.
- `routes/projects.js` — Project and task routes with ownership checks.
- `views/auth/` — Login and registration templates.
- `views/projects/` — Project list and project detail templates.
- `views/partials/` — Shared header, navigation, and footer.
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

The `CREATEDB` permission allows Prisma Migrate to create its temporary shadow database during development.

**3. Configure Environment Variables**

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://study_planner:study12345@localhost:5432/study_planner"
SESSION_SECRET="replace-with-a-long-random-secret"
NODE_ENV=development
```

`SESSION_SECRET` is required. Use a long, random value and keep `.env` out of version control.

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

| Route | What to Explore |
|---|---|
| `/` | Redirects to the projects page when logged in, otherwise to login. |
| `/register` | Create an account. Passwords must be at least 12 characters. |
| `/login` | Authenticate and start a session. |
| `/logout` | Destroy the session through a CSRF-protected POST request. |
| `/projects` | List and create projects owned by the current user. |
| `/projects/:projectId` | View a project, add tasks, change task status, and delete tasks. |

Register two users and confirm that each one can only see and modify their own projects.

**Note:** The example uses a development-only in-memory session store and is not intended for production deployment.

### Workshop Objective

By the end of this example, you should understand how Prisma, authentication, sessions, CSRF protection, and ownership checks combine to secure a multi-user Express application.
