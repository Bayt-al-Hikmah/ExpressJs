# Multer Basics (Workshop 5 Example)

This example introduces file uploads in **Express.js** using **Multer**.

It shows how a `multipart/form-data` form is submitted, how uploaded files are written to disk with generated names, how to handle single and multiple uploads, and how upload limits and MIME filters protect the application.

### What You'll Learn

- **Multipart Forms:** Build HTML forms that upload files.
- **Multer Disk Storage:** Save uploads to a local directory.
- **Generated Filenames:** Use `randomUUID()` to avoid collisions and unsafe original names.
- **Single vs Multiple Uploads:** Use `upload.single()` and `upload.array()`.
- **Upload Limits:** Enforce file size and file count limits.
- **MIME Filtering:** Reject file types that are not JPEG, PNG, or WebP.
- **Upload Errors:** Return useful JSON responses for rejected uploads.

### Project Structure

- `app.js` — Multer configuration, upload routes, and error handling.
- `public/index.html` — Upload forms for single and multiple files.
- `storage/uploads/` — Saved files, created automatically at runtime (not committed).
- `package.json` — Dependencies and the start script.

### Getting Started

**1. Install Dependencies**

```bash
npm install
```

**2. Start the Application**

```bash
npm start
```

**3. Open the Application**

http://localhost:3000/

### Exploring the Examples

| Route | What to Explore |
|---|---|
| `/` | Upload forms for one photo or up to three photos. |
| `POST /upload-single` | Upload one file with the field name `photo`. |
| `POST /upload-multiple` | Upload up to three files with the field name `photos`. |

The upload configuration allows JPEG, PNG, and WebP files up to **2 MB** each and at most **3 files** per request. Try uploading a large file or an unsupported type to see the JSON error response.

Uploaded files are saved in `storage/uploads/` with UUID filenames. The original name and stored name are returned in the JSON response.

### Workshop Objective

By the end of this example, you should understand how Multer parses multipart requests and how storage, naming, limits, and filters work together to handle uploads safely.
