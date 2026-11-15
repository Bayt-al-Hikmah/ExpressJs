# Task 2: Assignment Submission (Workshop 5 Solution)

This solution implements an assignment submission flow with **Express.js, Prisma 7, PostgreSQL, and Multer**.

Students start a submission for an assignment and attach up to three files. Submission metadata is stored in PostgreSQL, files are written to a private directory, and every download or delete is limited to the student who owns the submission.

### What This Solution Demonstrates

- **Prisma Relations:** `User` → `Submission` → `SubmissionFile`, plus `Assignment` → `Submission`.
- **Multipart Forms:** Upload files with `multipart/form-data`.
- **Allowed File Types:** Accept PDF, JPEG, PNG, and plain text through a MIME allowlist.
- **Upload Limits:** Allow up to three files of 10 MB each.
- **Generated Storage Names:** Save files under UUID names and keep original names in the database.
- **Per-Student Ownership:** Filter submissions and files by the session user.
- **Secure Download:** Serve files from a private directory with `nosniff`.
- **Cleanup:** Delete the stored file when its metadata row is deleted.
- **Authentication and CSRF:** Protect all forms and downloads.

### Project Structure

- `app.js` — Express entry point.
- `routes/app.js` — Assignment, submission, upload, download, and delete routes.
- `routes/auth.js` — Register, login, and logout.
- `prisma/schema.prisma` — `User`, `Assignment`, `Submission`, and `SubmissionFile` models.
- `prisma.config.ts` — Prisma CLI configuration.
- `db/prisma.js` — Prisma Client initialization.
- `middleware/requireLogin.js` — Authentication guard.
- `middleware/csrf.js` — CSRF token helpers.
- `middleware/upload.js` — Multer storage, limits, and MIME filter.
- `utils/storage.js` — Stored file removal helper.
- `views/` — Login, registration, assignment list, and submission templates.
- `public/style.css` — Application styles.
- `storage/uploads/` — Private uploaded files (not committed).
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
CREATE ROLE assignment_submissions
WITH LOGIN PASSWORD 'assignment12345'
CREATEDB;

CREATE DATABASE assignment_submissions
OWNER assignment_submissions;

\q
```

The `CREATEDB` permission is required for Prisma Migrate's shadow database.

**3. Configure Environment Variables**

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://assignment_submissions:assignment12345@localhost:5432/assignment_submissions"
SESSION_SECRET="replace-with-a-long-random-secret"
```

Keep `.env` out of version control.

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

http://localhost:3000/assignments

### Exploring the Solution

| Route | What to Explore |
|---|---|
| `/register` | Create a student account. |
| `/login` | Start a session. |
| `/logout` | End the session with a CSRF-protected request. |
| `/assignments` | View assignments and your previous submissions. |
| `POST /submissions` | Start a submission for an assignment. |
| `/submissions/:id` | View your submission and its files. |
| `POST /submissions/:id/files` | Upload up to three files. |
| `/files/:id` | Download a file from one of your submissions. |
| `POST /files/:id/delete` | Delete a file and its stored copy. |

Upload PDF, JPEG, PNG, or plain-text files. Other content types are rejected by the MIME allowlist.

### Workshop Objective

By the end of this solution, you should be able to implement a private file-submission workflow with ownership checks, upload validation, metadata storage, and cleanup.
