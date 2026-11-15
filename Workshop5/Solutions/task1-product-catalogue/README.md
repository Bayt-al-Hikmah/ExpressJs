# Task 1: Product Catalogue with Image Galleries (Workshop 5 Solution)

This solution builds a product catalogue where users manage products and image galleries with **Express.js, Prisma 7, PostgreSQL, and Multer**.

Products are public to browse, while creation, image uploads, image replacement, and deletion are restricted to the product owner. Uploaded images are validated by actual file content and stored outside the public directory.

### What This Solution Demonstrates

- **Prisma Relations:** `User` → `Product` → `ProductImage` with cascading deletes.
- **Ownership Checks:** Only the owner can manage a product or its images.
- **Single and Multiple Uploads:** Add up to five images at once or replace one image.
- **Upload Limits and Filters:** Size, count, field, and part limits plus an image MIME allowlist.
- **Content Validation:** Inspect file contents with `file-type` before saving metadata.
- **Generated Storage Names:** Use UUID-based filenames with the detected extension.
- **Secure Image Serving:** Serve gallery images through a route with metadata and `nosniff`.
- **Cleanup:** Remove replaced images and delete all product images when a product is deleted.
- **Authentication and CSRF:** Register, log in, and protect all writes.

### Project Structure

- `app.js` — Express setup, sessions, routes, and upload-aware error handling.
- `prisma/schema.prisma` — `User`, `Product`, and `ProductImage` models.
- `prisma.config.ts` — Prisma CLI configuration.
- `db/prisma.js` — Prisma Client initialization.
- `middleware/requireLogin.js` — Authentication guard.
- `middleware/csrf.js` — CSRF token helpers.
- `middleware/upload.js` — Multer storage, limits, and MIME filters.
- `utils/mediaStorage.js` — Image storage, replacement, and removal helpers.
- `routes/auth.js` — Register, login, and logout.
- `routes/products.js` — Public catalogue, owner management, and image routes.
- `views/auth/` — Login and registration templates.
- `views/products/index.ejs` — Public product list.
- `views/products/show.ejs` — Product detail page with its gallery.
- `views/products/manage.ejs` — Owner controls for products and images.
- `views/partials/` — Shared layout partials.
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
CREATE ROLE product_catalogue
WITH LOGIN PASSWORD 'catalogue12345'
CREATEDB;

CREATE DATABASE product_catalogue
OWNER product_catalogue;

\q
```

The `CREATEDB` permission is required for Prisma Migrate's shadow database.

**3. Configure Environment Variables**

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://product_catalogue:catalogue12345@localhost:5432/product_catalogue"
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

http://localhost:3000/products

### Exploring the Solution

| Route | What to Explore |
|---|---|
| `/products` | Browse all products and their images. |
| `/products/:id` | View a product and its gallery. |
| `/products/images/:imageId/file` | Public gallery image serving. |
| `/register` and `/login` | Create an account and start a session. |
| `/products/manage/mine` | Manage only the products you own. |
| `POST /products` | Create a product. |
| `POST /products/:id/images` | Upload up to five images. |
| `POST /products/images/:imageId/replace` | Replace one image and remove the old file. |
| `POST /products/images/:imageId/delete` | Delete an image and its stored file. |
| `POST /products/:id/delete` | Delete a product and clean up all its images. |

Images are limited to **5 MB** each, up to **5 files** per upload, and only JPEG, PNG, or WebP content is accepted. Try uploading a renamed non-image file to see content validation reject it.

### Workshop Objective

By the end of this solution, you should be able to build an owner-managed image gallery with validated uploads, database metadata, secure serving, and reliable file cleanup.
