# Travel Journal (Workshop 5 Example)

This example builds an authenticated travel journal with **Express.js, Prisma 7, PostgreSQL, and Multer**.

Users create trips, add journal entries, and attach images or videos to entries. Media metadata is stored in the database, files are kept outside the public directory, and access is restricted to the owner.

### What You'll Learn

- **Multipart Uploads:** Accept images and videos with Multer.
- **Disk Storage:** Save files with generated names and keep the storage directory private.
- **Upload Limits:** Enforce size, count, field, and part limits.
- **Content Validation:** Combine an early MIME filter with `file-type` inspection.
- **Media Metadata:** Store filenames, original names, MIME types, sizes, kinds, and captions in Prisma.
- **Secure Serving:** Stream media through a route that checks ownership before reading the file.
- **Cleanup:** Delete database rows and filesystem files together.
- **Upload Error Handling:** Remove partially uploaded files and return appropriate responses.
- **Authentication and CSRF:** Reuse sessions, Argon2id, ownership checks, and `csrf-sync` from Workshop 4.

### Project Structure

- `app.js` — Express setup, sessions, routes, and upload-aware error handling.
- `prisma/schema.prisma` — `User`, `Trip`, `JournalEntry`, and `MediaAsset` models.
- `prisma.config.ts` — Prisma CLI configuration.
- `db/prisma.js` — Prisma Client initialization.
- `middleware/requireLogin.js` — Authentication guard.
- `middleware/csrf.js` — CSRF token helpers.
- `middleware/upload.js` — Multer storage, limits, and MIME filters.
- `utils/mediaStorage.js` — Media persistence and deletion helpers.
- `routes/auth.js` — Register, login, and logout.
- `routes/trips.js` — Trip and entry creation.
- `routes/entries.js` — Entry viewing and media uploads.
- `routes/media.js` — Owner-checked media serving and deletion.
- `views/` — Auth, trip, entry, and error templates.
- `views/partials/` — Shared layout partials.
- `public/css/style.css` — Application styles.
- `storage/uploads/` — Private media files (not committed).
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
CREATE ROLE travel_journal
WITH LOGIN PASSWORD 'travel12345'
CREATEDB;

CREATE DATABASE travel_journal
OWNER travel_journal;

\q
```

The `CREATEDB` permission is required for Prisma Migrate's shadow database.

**3. Configure Environment Variables**

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://travel_journal:travel12345@localhost:5432/travel_journal"
SESSION_SECRET="replace-with-a-long-random-secret"
NODE_ENV=development
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

http://localhost:3000/

### Exploring the Examples

| Route | What to Explore |
|---|---|
| `/register` | Create an account. |
| `/login` | Start a session. |
| `/trips` | View and create your trips. |
| `/trips/:tripId/entries` | Add a journal entry to one of your trips. |
| `/entries/:entryId` | View an entry and its media. |
| `/entries/:entryId/images` | Upload up to five images with an optional caption. |
| `/entries/:entryId/video` | Upload one MP4 video with an optional caption. |
| `/media/:mediaId` | Serve a media file only to its owner. |
| `/media/:mediaId/delete` | Delete media metadata and its stored file. |

Register two users and confirm that one user cannot view or download the other user's entries or media.

### Workshop Objective

By the end of this example, you should be able to implement an authenticated media feature with safe storage, validated uploads, ownership checks, and consistent cleanup.
