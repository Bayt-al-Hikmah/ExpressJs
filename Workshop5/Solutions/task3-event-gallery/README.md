# Task 3: Event Media Gallery (Workshop 5 Solution)

This solution builds a public event gallery with **Express.js, Prisma 7, PostgreSQL, and Multer**.

Anyone can browse events and their photos, while only the event organiser can create events, upload images, and delete media. Image files are content-validated, stored privately, and served through a controlled route.

### What This Solution Demonstrates

- **Prisma Relations:** `User` → `Event` → `EventMedia`.
- **Public Gallery:** Browse events and media without logging in.
- **Organiser Ownership:** Only the organiser can upload to or manage an event.
- **Image Uploads:** Add up to five images at once with an optional caption.
- **Upload Limits:** Enforce 8 MB per file and five files per request.
- **MIME and Content Validation:** Use an allowlist plus `file-type` inspection.
- **Private Storage:** Keep files outside `public/` and serve them through a route.
- **Secure Serving:** Set the detected MIME type and `X-Content-Type-Options: nosniff`.
- **Cleanup:** Delete database rows and stored files together.
- **Authentication and CSRF:** Protect every write operation.

### Project Structure

- `app.js` — Express setup, sessions, routes, and upload-aware error handling.
- `prisma/schema.prisma` — `User`, `Event`, and `EventMedia` models.
- `prisma.config.ts` — Prisma CLI configuration.
- `db/prisma.js` — Prisma Client initialization.
- `middleware/requireLogin.js` — Authentication guard.
- `middleware/csrf.js` — CSRF token helpers.
- `middleware/upload.js` — Multer storage, limits, and MIME filter.
- `utils/storage.js` — Image storage and removal helpers.
- `routes/auth.js` — Register, login, and logout.
- `routes/events.js` — Event gallery, uploads, and media deletion.
- `views/events.ejs` — Public event list and creation form.
- `views/event.ejs` — Event detail page and gallery.
- `views/auth.ejs` — Login and registration page.
- `public/style.css` — Application styles.
- `storage/uploads/` — Private image storage (not committed).
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
CREATE ROLE event_gallery
WITH LOGIN PASSWORD 'gallery12345'
CREATEDB;

CREATE DATABASE event_gallery
OWNER event_gallery;

\q
```

The `CREATEDB` permission is required for Prisma Migrate's shadow database.

**3. Configure Environment Variables**

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://event_gallery:gallery12345@localhost:5432/event_gallery"
SESSION_SECRET="replace-with-a-long-random-secret"
```

Keep `.env` out of version control. `SESSION_SECRET` is required by the application.

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

http://localhost:3000/events

### Exploring the Solution

| Route | What to Explore |
|---|---|
| `/events` | Browse all events and their media; log in to create one. |
| `/events/:id` | View an event, its organiser, and its gallery. |
| `/media/:id/file` | Public serving of gallery images. |
| `POST /events` | Create an event while logged in. |
| `POST /events/:id/media` | Upload up to five images with a caption as the organiser. |
| `POST /media/:id/delete` | Delete media only if you organise the event. |

Register two users, create an event with one, and confirm that the other user can browse the gallery but cannot upload or delete media.

### Workshop Objective

By the end of this solution, you should be able to build a public gallery with organiser-only management, content-validated uploads, secure media serving, and consistent cleanup.
