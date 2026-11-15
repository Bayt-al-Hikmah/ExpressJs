# Task 3: Event Management (Workshop 4 Solution)

This solution builds an event management application with **Express.js, Prisma 7, and PostgreSQL**.

Users can create events and register for events created by others. Registrations use a composite primary key to prevent duplicates, while deletion is restricted to the event organiser.

### What This Solution Demonstrates

- **Many-to-Many Registrations:** Connect users and events through a `Registration` join model.
- **Composite Primary Key:** Use `@@id([userId, eventId])` to prevent duplicate registrations.
- **Upsert for Idempotency:** Register a user without creating duplicate rows.
- **Organiser Ownership:** Allow only the organiser to delete an event.
- **Two Relations to `User`:** Distinguish organized events from registrations with named relations.
- **Authentication and CSRF:** Register, log in, and protect all forms.
- **Nested Relation Loading:** Display events with their organiser and registration list.

### Project Structure

- `app.js` — Express setup, sessions, CSRF locals, routes, and error handlers.
- `prisma/schema.prisma` — `User`, `Event`, and `Registration` models with named relations.
- `db/prisma.js` — Prisma Client initialization.
- `middleware/requireLogin.js` — Authentication guard for event routes.
- `middleware/csrf.js` — CSRF token helpers.
- `routes/auth.js` — Register, login, and logout.
- `routes/projects.js` — Event routes (mounted under `/projects`).
- `views/auth/` — Login and registration templates.
- `views/projects/index.ejs` — Event list, creation form, registration, and organiser controls.
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
CREATE ROLE event_management
WITH LOGIN PASSWORD 'event12345'
CREATEDB;

CREATE DATABASE event_management
OWNER event_management;

\q
```

The `CREATEDB` permission is required for Prisma Migrate's shadow database.

**3. Configure Environment Variables**

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://event_management:event12345@localhost:5432/event_management"
SESSION_SECRET="replace-with-a-long-random-secret"
NODE_ENV=development
```

The example uses the `event_management` database name. Change `DATABASE_URL` if you use a different database.

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
| `/register` | Create an account. |
| `/login` | Start a session. |
| `/logout` | End the session with a CSRF-protected request. |
| `/projects` | View all events and create a new one. |
| `/projects/:id/register` | Register for an event; repeated clicks do not create duplicates. |
| `/projects/:id/delete` | Delete an event only if you are its organiser. |

Register two users, create an event with one, and confirm that the other user can register but cannot delete it.

### Workshop Objective

By the end of this solution, you should be able to model many-to-many participation with Prisma and enforce role-like ownership rules in an authenticated application.
