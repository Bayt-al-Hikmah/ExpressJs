# Workshop 5: Handling Multimedia and File Uploads with Express

## Objectives

In this workshop, we will learn how to:

- Understand how browsers upload files using `multipart/form-data`.
- Use Multer to handle file uploads in Express.
- Configure disk storage and control where uploaded files are saved.
- Upload single files and multiple files.
- Validate uploaded files and restrict their types and sizes.
- Store file metadata in PostgreSQL using Prisma.
- Associate uploaded media with database records.
- Display images and videos in EJS templates.
- Protect media routes using authentication and authorization.
- Manage uploaded files when records are updated or deleted.
- Understand common security and storage considerations when working with user-uploaded files.

## Introduction

In the previous workshop, we learned how to use Prisma ORM to interact with PostgreSQL. We defined models and relationships, implemented CRUD operations, and introduced authentication and authorization using password hashing and sessions.

These concepts allow us to build applications where users can create and manage their own information. However, most applications do not work with text and numbers alone. Many applications also need to receive and display files.

For example:

- A social platform allows users to upload profile pictures and share photographs.
- An e-commerce application allows administrators to upload product images.
- A learning platform allows students to submit assignments and teachers to share course materials.
- A travel application allows users to share photographs and videos from their trips.

In this workshop, we will learn how to handle these files using **Multer**, a middleware for Express that processes file uploads.

We will also continue using Prisma and PostgreSQL, but this time we will store information about uploaded files in the database while keeping the actual files in a separate storage directory.

To practise these concepts, we will build a different application: a **Travel Journal**.

Users will be able to create trips and add journal entries containing written descriptions, photographs, and short videos. Each user will manage their own trips and media, allowing us to reuse the authentication and authorization concepts from the previous workshop.

Let's start by understanding how file uploads work and how they differ from the forms we have already built.

## Understanding File Uploads

So far, when we handled HTML forms, we mainly worked with text values such as usernames, email addresses, and messages.

For example, a contact form could submit information using:

```html
<form action="/contact" method="POST">
    <input type="text" name="name">
    <textarea name="message"></textarea>
    <button type="submit">Submit</button>
</form>
```

The browser sends these values in the request body, and Express can parse them using `express.urlencoded()`.

However, files such as images, videos, and documents need a different form encoding.

### The `multipart/form-data` format

When a form contains a file input, we normally use the `multipart/form-data` encoding type.

For example:

```html
<form action="/upload" method="POST" enctype="multipart/form-data">
    <input type="text" name="title">
    <input type="file" name="image">
    <button type="submit">Upload</button>
</form>
```

Notice that we added:

```html
enctype="multipart/form-data"
```

This tells the browser to encode the form as multiple parts. Each part can contain a regular form field or a file.

The browser then sends the form data using the `multipart/form-data` format.

An important distinction is that `express.urlencoded()` does not process multipart file uploads. We need middleware that understands this format and can extract both the submitted fields and the uploaded files.

This is where Multer becomes useful.

### How a file upload works

When a user submits a form containing a file, the process generally follows these steps:

1. The user selects a file through an HTML file input.
2. The browser sends the form using `multipart/form-data`.
3. Express receives the incoming request.
4. Multer processes the multipart request and extracts the form fields and files.
5. The uploaded file is temporarily or permanently stored according to our configuration.
6. Our route handler validates the file and performs the required application logic.
7. The application stores information about the file in the database when necessary.

The process can be represented as follows:

```text
          USER SELECTS A FILE
                   |
                   v
           HTML FORM SUBMITTED
          (multipart/form-data)
                   |
                   v
             EXPRESS SERVER
                   |
                   v
             MULTER MIDDLEWARE
                   |
             +-----+-----+
             |           |
             v           v
        FORM FIELDS   UPLOADED FILE
             |           |
             |           v
             |       FILE STORAGE
             |           |
             +-----+-----+
                   |
                   v
              ROUTE HANDLER
                   |
                   v
             DATABASE RECORD
             (File Metadata)
```

The important point is that the file itself and the information describing that file are two different things. We will explore this distinction next.

## Where Should We Store Uploaded Files?

When an application receives a file, we need to decide where its contents should be stored.

There are two common approaches:

- Store the file directly inside the database as binary data.
- Store the file in a filesystem or object-storage service and save its metadata and storage location in the database.

For this workshop, we will use the second approach.

### Storing files and metadata separately

Imagine a user uploads a photograph called `paris.jpg`.

The file contains the actual image data. Alongside it, we may need to store information such as:

- The name of the file.
- Its MIME type.
- Its size.
- Its storage name or key.
- The user or journal entry associated with it.
- The date it was uploaded.

We can save the actual image in a directory on the server and store this information in PostgreSQL.

For example, our database record might look like this:

| id | original_name | storage_name | mime_type | size_bytes |
|---|---|---|---|---:|
| 1 | paris.jpg | 8f3a...jpg | image/jpeg | 245760 |

The actual file could be stored at:

```text
storage/uploads/8f3a...jpg
```

The database stores the information needed to identify and manage the file, while the filesystem stores its contents.

This approach has several advantages:

- **Database efficiency:** Large files do not need to be stored directly in our relational tables.
- **Flexible storage:** Files can later be moved to dedicated storage services without redesigning the application's main data model.
- **Simpler file delivery:** The application can serve files through dedicated routes or a storage service.
- **Independent management:** We can manage file storage separately from the records that describe those files.

An important consequence is that a database migration or backup alone does not include the actual uploaded files. We need to consider both the database and file storage when backing up an application.

### Public and private file storage

Not every uploaded file should be accessible to everyone.

For example, product images in a public store may be visible to all visitors. However, private documents or personal travel journals may only be available to their owners.

We can distinguish between two storage approaches:

**Public files:** Files that any visitor is allowed to access. They can be served through Express static middleware or a public storage service.

**Private files:** Files that require permission before they can be accessed. The server should check the user's identity and permissions before sending the file.

For our Travel Journal, we will treat uploaded photographs and videos as private. A user should only be able to view media belonging to their own journal entries.

Therefore, we will store uploaded files outside the `public` directory and serve them through an authenticated Express route.

This will allow us to apply the same ownership rules we learned in the previous workshop.

## Introduction to Multer

Now that we understand how file uploads work, let's introduce the middleware we will use to handle them.

**Multer** is an Express middleware for handling `multipart/form-data` requests. It processes incoming form data and makes uploaded files available to our route handlers.

Multer provides several useful capabilities:

- **File Handling:** Extracts uploaded files from multipart requests.
- **Storage Configuration:** Allows us to store files in memory or on disk.
- **File Filtering:** Allows us to accept or reject files based on information available during upload.
- **Upload Limits:** Allows us to restrict file sizes, file counts, and other request properties.
- **Multiple Upload Methods:** Supports single files, multiple files, and multiple named file fields.

### Installing Multer

We will use the Express project structure and dependencies from the previous workshop, but create a separate project for the Travel Journal.

Start by creating the project directory:

```bash
mkdir travel-journal
cd travel-journal
npm init -y
npm pkg set type="module"
```

Install the dependencies used in Workshop 4, along with Multer and the file-type detection package:

```bash
npm install express ejs express-session csrf-sync express-validator argon2 dotenv @prisma/client@7 @prisma/adapter-pg@7 pg multer@^2.5.0 file-type
```

Install Prisma CLI and `tsx` as development dependencies:

```bash
npm install -D prisma@7 tsx
```

Initialise Prisma and configure the same scripts we used in Workshop 4:

```bash
npx prisma@7 init
npm pkg set scripts.dev="tsx watch app.js" scripts.start="tsx app.js"
```

Use the Prisma 7 configuration and client connection setup from Workshop 4. Create a new PostgreSQL database named `travel_journal` and update `DATABASE_URL` in your `.env` file to point to it. Use a strong `SESSION_SECRET` as we did previously.

We will also reuse the authentication routes, session configuration, CSRF middleware, `requireLogin` middleware, and the database connection module from Workshop 4. This allows us to focus on the new concepts without repeating the entire authentication implementation.

The `file-type` package is an ES module, which fits the ES module configuration we use in this project.

We use Multer to process incoming uploads. We will use `file-type` later to inspect the actual contents of uploaded files rather than relying only on information supplied by the browser.

### Understanding Multer middleware

Multer can be configured in several ways depending on how we want to handle uploaded files.

For example, the following middleware accepts one file from a form field named `image`:

```javascript
upload.single('image')
```

The uploaded file becomes available through:

```javascript
req.file
```

If we want to accept multiple files using the same field name, we can use:

```javascript
upload.array('images', 5)
```

The uploaded files become available through:

```javascript
req.files
```

The number `5` specifies the maximum number of files accepted through that field.

Multer also provides `upload.fields()` when a form contains multiple file inputs with different names.

For example:

```javascript
upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 5 }
])
```

In this case, the uploaded files become available through `req.files`, grouped by their field names:

```javascript
req.files.cover;
req.files.gallery;
```

This is useful when a form needs to accept different types of files at the same time, such as one profile picture and several supporting documents.

An important detail is that Multer should only be registered on routes that are expected to handle uploads. We should not register it globally using `app.use()`, because this would allow unrelated routes to process unexpected file uploads.

## Designing the Travel Journal Database

Before implementing the upload functionality, let's decide how our application will organise trips, journal entries, and media files.

Our application will contain three main entities in addition to the existing `User` model:

**Trip:** Represents a trip created by a user. For example, a user might create a trip named Paris, Tokyo, or Algiers.

**JournalEntry:** Represents a particular experience or activity during a trip. It contains a title, a written description, and the date of the entry.

**MediaAsset:** Represents an uploaded photograph or video associated with a journal entry.

Their relationships can be represented as follows:

```text
             User
               |
               | One-to-Many
               v
              Trip
               |
               | One-to-Many
               v
          JournalEntry
               |
               | One-to-Many
               v
           MediaAsset
          (Image / Video)
```

A user can create multiple trips, but each trip belongs to one user.

A trip can contain multiple journal entries, but each entry belongs to one trip.

A journal entry can contain multiple media files, but each media file belongs to one journal entry.

This structure allows us to keep the text content and uploaded media organised while maintaining the ownership relationships between users and their files.

### Extending the Prisma models

Open `prisma/schema.prisma` in the Travel Journal project.

We will keep the authentication fields from the `User` model in Workshop 4 because we still need registered users and password hashes. Since this is a different application, replace the Study Planner's `projects Project[]` relation with a `trips Trip[]` relation:

```prisma
model User {
  id           Int       @id @default(autoincrement())
  username     String    @unique @db.VarChar(25)
  passwordHash String    @map("password_hash") @db.VarChar(255)
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  trips        Trip[]

  @@map("users")
}
```

Now add the following models and enum:

```prisma
enum MediaKind {
  IMAGE
  VIDEO
}

model Trip {
  id          Int            @id @default(autoincrement())
  title       String         @db.VarChar(100)
  destination String?        @db.VarChar(120)
  description String?        @db.Text
  startDate   DateTime?      @map("start_date") @db.Timestamptz(6)
  endDate     DateTime?      @map("end_date") @db.Timestamptz(6)
  createdAt   DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)

  userId      Int            @map("user_id")
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  entries     JournalEntry[]

  @@index([userId])
  @@map("trips")
}

model JournalEntry {
  id          Int          @id @default(autoincrement())
  title       String       @db.VarChar(120)
  story       String?      @db.Text
  visitedAt   DateTime     @default(now()) @map("visited_at") @db.Timestamptz(6)
  createdAt   DateTime     @default(now()) @map("created_at") @db.Timestamptz(6)

  tripId      Int          @map("trip_id")
  trip        Trip         @relation(fields: [tripId], references: [id], onDelete: Cascade)

  media       MediaAsset[]

  @@index([tripId])
  @@map("journal_entries")
}

model MediaAsset {
  id           Int          @id @default(autoincrement())
  storageName  String       @unique @map("storage_name") @db.VarChar(255)
  originalName String       @map("original_name") @db.VarChar(180)
  mimeType     String       @map("mime_type") @db.VarChar(100)
  sizeBytes    Int          @map("size_bytes")
  kind         MediaKind
  caption      String?      @db.VarChar(200)
  createdAt    DateTime     @default(now()) @map("created_at") @db.Timestamptz(6)

  entryId      Int          @map("entry_id")
  entry        JournalEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)

  @@index([entryId])
  @@map("media_assets")
}
```

Let's understand some of the important fields.

### Understanding the MediaAsset model

The `MediaAsset` model represents a file uploaded by a user.

It does not contain the file's binary contents. Instead, it stores the information needed to identify and manage the file.

Some important fields include:

- `storageName`: The generated name used to locate the file in our storage directory.
- `originalName`: The original filename provided by the user. We keep it for display purposes only.
- `mimeType`: The verified media type, such as `image/jpeg` or `video/mp4`.
- `sizeBytes`: The size of the uploaded file in bytes.
- `kind`: Indicates whether the uploaded file is an image or a video.
- `caption`: An optional description displayed alongside the media.
- `entryId`: The foreign key connecting the media file to its journal entry.

Notice that we keep both `originalName` and `storageName`.

We should not use the original filename to construct a filesystem path. It comes from the client and should be treated as untrusted input. Instead, we will generate a unique storage name on the server and keep the original name only as descriptive information.

### Applying the database changes

After adding the models, create a migration:

```bash
npx prisma migrate dev --name add_travel_journal_media
```

Then generate Prisma Client:

```bash
npx prisma generate
```

Our database is now ready to store trips, journal entries, and media metadata.

Remember that this migration creates database tables only. It does not create the directory where uploaded files will be stored. We will configure that separately.

### Creating trips and journal entries

We already learned how to perform CRUD operations with Prisma in Workshop 4. We will use the same techniques here to create trips and journal entries.

Create a file named `routes/trips.js`:

```javascript
import express from "express";

import prisma from "../db/prisma.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";

const router = express.Router();

// Display the current user's trips and their journal entries.
router.get("/", async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        userId: req.session.user.id
      },
      include: {
        entries: {
          orderBy: {
            createdAt: "desc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.render("trips/index", { trips });
  } catch (error) {
    next(error);
  }
});

// Create a new trip for the authenticated user.
router.post("/", csrfSynchronisedProtection, async (req, res, next) => {
  try {
    const title = typeof req.body.title === "string"
      ? req.body.title.trim()
      : "";

    if (!title || title.length > 100) {
      return res.status(400).send("A trip title between 1 and 100 characters is required.");
    }

    await prisma.trip.create({
      data: {
        title,
        destination: typeof req.body.destination === "string"
          ? req.body.destination.trim().slice(0, 120) || null
          : null,
        user: {
          connect: {
            id: req.session.user.id
          }
        }
      }
    });

    res.redirect("/trips");
  } catch (error) {
    next(error);
  }
});

// Create a journal entry inside a trip owned by the current user.
router.post("/:tripId/entries", csrfSynchronisedProtection, async (req, res, next) => {
  try {
    const tripId = Number(req.params.tripId);
    const title = typeof req.body.title === "string"
      ? req.body.title.trim()
      : "";

    if (!Number.isSafeInteger(tripId) || tripId <= 0) {
      return res.sendStatus(404);
    }

    if (!title || title.length > 120) {
      return res.status(400).send("An entry title between 1 and 120 characters is required.");
    }

    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        userId: req.session.user.id
      }
    });

    if (!trip) {
      return res.sendStatus(404);
    }

    const entry = await prisma.journalEntry.create({
      data: {
        title,
        story: typeof req.body.story === "string"
          ? req.body.story.trim() || null
          : null,
        trip: {
          connect: {
            id: trip.id
          }
        }
      }
    });

    res.redirect(`/entries/${entry.id}`);
  } catch (error) {
    next(error);
  }
});

export default router;
```

Let's understand the important parts.

The first route retrieves only the trips belonging to the authenticated user. It also includes their journal entries so that we can display them on the page.

The second route creates a trip and connects it to the current user through the session. We never accept the owner ID from the form.

The third route first checks that the selected trip belongs to the current user. Only then does it create a journal entry connected to that trip.

Now create `views/trips/index.ejs`:

```ejs
<%- include('../partials/_header', { title: 'My Trips' }) %>
<%- include('../partials/_navbar') %>

<main>
    <h1>My Travel Journal</h1>

    <h2>Create a Trip</h2>

    <form action="/trips" method="POST">
        <input type="hidden" name="_csrf" value="<%= csrfToken %>">

        <label for="title">Trip Name:</label>
        <input type="text" id="title" name="title" maxlength="100" required>

        <label for="destination">Destination:</label>
        <input type="text" id="destination" name="destination" maxlength="120">

        <button type="submit">Create Trip</button>
    </form>

    <h2>My Trips</h2>

    <% if (trips.length === 0) { %>
        <p>You have not created any trips yet.</p>
    <% } %>

    <% trips.forEach(trip => { %>
        <section>
            <h3><%= trip.title %></h3>
            <p><%= trip.destination || 'Destination not specified' %></p>

            <h4>Journal Entries</h4>

            <% trip.entries.forEach(entry => { %>
                <p>
                    <a href="/entries/<%= entry.id %>">
                        <%= entry.title %>
                    </a>
                </p>
            <% }); %>

            <form action="/trips/<%= trip.id %>/entries" method="POST">
                <input type="hidden" name="_csrf" value="<%= csrfToken %>">

                <label for="entry-title-<%= trip.id %>">Entry Title:</label>
                <input
                    type="text"
                    id="entry-title-<%= trip.id %>"
                    name="title"
                    maxlength="120"
                    required
                >

                <label for="entry-story-<%= trip.id %>">Description:</label>
                <textarea
                    id="entry-story-<%= trip.id %>"
                    name="story"
                ></textarea>

                <button type="submit">Add Journal Entry</button>
            </form>
        </section>
    <% }); %>
</main>

<%- include('../partials/_footer') %>
```

This page allows users to create trips, view their existing trips, and add journal entries to each trip.

When a new entry is created, the application redirects the user to its page. We will use that page to upload and display photographs and videos.

## Preparing the File Storage Directory

We need a directory where Multer can save uploaded files.

For this workshop, we will use the following structure:

```text
travel-journal/
├── db/
│   └── prisma.js
├── middleware/
│   ├── csrf.js
│   ├── requireLogin.js
│   └── upload.js
├── routes/
│   ├── auth.js
│   ├── trips.js
│   ├── entries.js
│   └── media.js
├── utils/
│   └── mediaStorage.js
├── views/
│   ├── partials/
│   ├── trips/
│   │   └── index.ejs
│   └── entries/
│       └── show.ejs
├── public/
│   └── css/
│       └── style.css
├── storage/
│   └── uploads/
├── prisma/
│   └── schema.prisma
├── generated/
├── app.js
├── prisma.config.ts
├── package.json
└── .env
```

The `public` directory contains files that can be served directly to the browser, such as our stylesheet.

The `storage/uploads` directory is different. It contains private user-uploaded media and must not be exposed through `express.static()`.

Create the directory if it does not exist, and add it to `.gitignore`:

```gitignore
node_modules/
.env
generated/
storage/uploads/
```

We do not want uploaded user files to be committed to Git.

We will also create the directory automatically when the application starts, so the upload configuration does not depend on someone creating it manually.

## Configuring Multer

Now that the database models and storage directory are ready, we can configure Multer.

Create a file named `middleware/upload.js`:

```javascript
import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

export const mediaDirectory = path.resolve(
  process.cwd(),
  "storage",
  "uploads"
);

// Create the upload directory if it does not exist.
mkdirSync(mediaDirectory, { recursive: true });

// Configure where and how Multer stores incoming files.
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, mediaDirectory);
  },

  filename: (req, file, callback) => {
    // Use a generated name instead of the client-provided filename.
    callback(null, randomUUID());
  }
});

const imageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

const videoMimeTypes = new Set([
  "video/mp4"
]);

function createUpload({ allowedMimeTypes, fileSize, maxFiles }) {
  return multer({
    storage,

    limits: {
      fileSize,
      files: maxFiles,
      fields: 5,
      parts: maxFiles + 5
    },

    fileFilter: (req, file, callback) => {
      // This is an early check based on the MIME type sent by the client.
      if (!allowedMimeTypes.has(file.mimetype)) {
        const error = new Error("Unsupported file type.");
        error.code = "UNSUPPORTED_FILE_TYPE";
        return callback(error);
      }

      callback(null, true);
    }
  });
}

// Allow up to five images, with a maximum of 8 MB per file.
export const uploadImages = createUpload({
  allowedMimeTypes: imageMimeTypes,
  fileSize: 8 * 1024 * 1024,
  maxFiles: 5
}).array("images", 5);

// Allow one video, with a maximum size of 50 MB.
export const uploadVideo = createUpload({
  allowedMimeTypes: videoMimeTypes,
  fileSize: 50 * 1024 * 1024,
  maxFiles: 1
}).single("video");
```

Let's understand the important parts.

### Disk storage

First, we configure Multer using:

```javascript
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, mediaDirectory);
  },

  filename: (req, file, callback) => {
    callback(null, randomUUID());
  }
});
```

The `destination` function determines where uploaded files are saved.

The `filename` function determines the name used to store each file.

We use `randomUUID()` to generate a unique filename. This prevents files with the same original filename from overwriting one another and avoids using an untrusted filename as part of our storage path.

We do not add an extension at this stage. After Multer saves the file, we will inspect its contents and choose an extension based on the detected file type.

Multer also provides memory storage, which keeps uploaded files in memory as buffers. This can be useful for small files or processing pipelines that do not need a temporary disk file. However, large files or many simultaneous uploads can consume significant memory. Since our application accepts photographs and videos, we will use disk storage instead.

### File filtering

Multer provides the `fileFilter` option, which allows us to reject files before accepting them.

In our example, we only accept the MIME types required by the Travel Journal:

- JPEG, PNG, and WebP for images.
- MP4 for videos.

However, there is an important security detail.

The MIME type in `file.mimetype` is provided by the client. A user can change the filename or claim that a different type of file is an image.

Therefore, this check is useful as an early filter, but it is not sufficient to prove that a file really contains image or video data. We will inspect the file contents after upload.

### Upload limits

We also configure limits for each upload type.

For images, we allow a maximum of five files, with each file limited to 8 MB.

For videos, we allow one file, with a maximum size of 50 MB.

These limits help prevent unnecessarily large uploads from consuming excessive disk space and server resources.

Multer also supports limits for the number of regular form fields and the total number of multipart parts. We set these values because upload requests should not contain an unlimited number of fields or files.

## Validating Uploaded File Contents

So far, we have configured Multer to check the MIME type sent by the browser and store files on disk.

However, we should not trust the browser's description of a file.

For example, someone could rename a text file to `holiday.jpg` and submit it while claiming that it is an image.

To reduce this risk, we can inspect the file's binary signature, also known as its **magic number**.

Many file formats contain identifying byte patterns that allow software to recognise the format independently of the filename.

We will use the `file-type` package to inspect these signatures.

### Creating the media storage helper

Create a file named `utils/mediaStorage.js`:

```javascript
import { randomUUID } from "node:crypto";
import { rename, unlink } from "node:fs/promises";
import path from "node:path";
import { fileTypeFromFile } from "file-type";

import prisma from "../db/prisma.js";
import { mediaDirectory } from "../middleware/upload.js";

const allowedTypes = {
  IMAGE: new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"]
  ]),

  VIDEO: new Map([
    ["video/mp4", "mp4"]
  ])
};

async function removeFile(filePath) {
  try {
    await unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

function getSafeOriginalName(originalName) {
  // Remove any path components supplied in the original filename.
  const name = originalName.replaceAll("\\", "/").split("/").pop();
  return name.slice(0, 180);
}

export async function storeUploadedFiles(files, kind, entryId, caption = null) {
  const finalPaths = [];

  try {
    const records = [];

    for (const file of files) {
      // Inspect the actual file contents rather than trusting file.mimetype.
      const detectedType = await fileTypeFromFile(file.path);
      const extension = allowedTypes[kind].get(detectedType?.mime);

      if (!detectedType || !extension) {
        const error = new Error("The uploaded file content is not an accepted media type.");
        error.status = 400;
        error.code = "INVALID_FILE_CONTENT";
        throw error;
      }

      // Generate the final storage name using the verified file type.
      const storageName = `${randomUUID()}.${extension}`;
      const finalPath = path.join(mediaDirectory, storageName);

      await rename(file.path, finalPath);
      finalPaths.push(finalPath);

      records.push({
        storageName,
        originalName: getSafeOriginalName(file.originalname),
        mimeType: detectedType.mime,
        sizeBytes: file.size,
        kind,
        caption: caption || null,
        entryId
      });
    }

    // Save the metadata for all uploaded files in one database operation.
    await prisma.mediaAsset.createMany({
      data: records
    });

    return records;
  } catch (error) {
    // Remove temporary files and any files already moved to final storage.
    const pathsToRemove = [
      ...files.map(file => file.path),
      ...finalPaths
    ];

    await Promise.all(
      pathsToRemove.map(async filePath => {
        try {
          await removeFile(filePath);
        } catch (cleanupError) {
          console.error("Could not clean up uploaded file:", cleanupError);
        }
      })
    );

    throw error;
  }
}
```

Let's understand how this helper works.

First, we define the media types accepted by our application and map each verified MIME type to a safe file extension.

Then, for every uploaded file, we call:

```javascript
const detectedType = await fileTypeFromFile(file.path);
```

This function inspects the file contents and returns information about the detected type when it recognises the format.

We compare the detected MIME type against our allowlist. If the file does not match one of the formats supported by our application, we reject it.

After verifying the file, we generate a new storage name and move it to its final location.

Finally, we create the corresponding database records using `prisma.mediaAsset.createMany()`.

Notice that we also clean up files if an error occurs. This is important because the filesystem and the database are separate storage systems. A database operation cannot automatically roll back a file that has already been written to disk.

**An important security consideration:** File-signature detection is a useful validation step, but it is not a complete malware scanner or a guarantee that a file is safe to process. Production applications may also need antivirus scanning, stricter content validation, image re-encoding, and other controls depending on the type of files they accept.

## Creating Journal Entries and Uploading Images

Now that our upload middleware and storage helper are ready, let's connect them to the Travel Journal application.

We will allow users to upload several photographs to an existing journal entry.

Before accepting the files, we must confirm that the journal entry belongs to the authenticated user.

This is important because authentication alone does not guarantee ownership. A logged-in user should not be able to upload media to another user's journal entry simply by changing its ID in the URL.

### Checking ownership of a journal entry

Create `routes/entries.js`:

```javascript
import express from "express";

import prisma from "../db/prisma.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";
import { uploadImages, uploadVideo } from "../middleware/upload.js";
import { storeUploadedFiles } from "../utils/mediaStorage.js";

const router = express.Router();

async function loadOwnedEntry(req, res, next) {
  try {
    const entryId = Number(req.params.entryId);

    if (!Number.isSafeInteger(entryId) || entryId <= 0) {
      return res.sendStatus(404);
    }

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        trip: {
          is: {
            userId: req.session.user.id
          }
        }
      },
      include: {
        trip: {
          select: {
            id: true,
            title: true
          }
        },
        media: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    if (!entry) {
      return res.sendStatus(404);
    }

    req.entry = entry;
    next();
  } catch (error) {
    next(error);
  }
}

// Display a journal entry and its uploaded media.
router.get("/:entryId", loadOwnedEntry, (req, res) => {
  res.render("entries/show", {
    entry: req.entry
  });
});
```

Here, we retrieve a journal entry only when its associated trip belongs to the current user.

We also include the related media records so that the template can display the uploaded photographs and videos.

The user ID comes from the authenticated session, not from a value submitted by the browser.

If the entry does not exist or belongs to another user, we return a `404 Not Found` response.

### Uploading multiple images

Now we can define the route that accepts photographs.

Add the following route to `routes/entries.js`:

```javascript
router.post(
  "/:entryId/images",
  loadOwnedEntry,
  uploadImages,
  csrfSynchronisedProtection,
  async (req, res, next) => {
    try {
      const files = req.files ?? [];

      if (files.length === 0) {
        return res.status(400).send("Please select at least one image.");
      }

      const caption = typeof req.body.caption === "string"
        ? req.body.caption.trim().slice(0, 200)
        : null;

      await storeUploadedFiles(
        files,
        "IMAGE",
        req.entry.id,
        caption
      );

      res.redirect(`/entries/${req.entry.id}`);
    } catch (error) {
      next(error);
    }
  }
);
```

Notice the order of our middleware:

1. `loadOwnedEntry` verifies that the authenticated user owns the journal entry.
2. `uploadImages` processes the multipart request and stores the uploaded files temporarily.
3. `csrfSynchronisedProtection` validates the CSRF token submitted with the form.
4. The route handler validates the file contents and saves their metadata.

We place the ownership check before Multer so that an unauthorised user cannot make the application accept and store files for an entry they do not own.

You may also notice that CSRF protection comes after Multer in this route. The CSRF token is a regular field inside the multipart request, so Multer needs to parse the request before the token becomes available in `req.body`.

This means the files may already have been written to temporary storage before the CSRF check runs. We use strict upload limits and clean up temporary files when an error occurs. The application must never process or publish the files before the CSRF check succeeds.

### Uploading a single video

We can use the same approach for videos.

Add another route:

```javascript
router.post(
  "/:entryId/video",
  loadOwnedEntry,
  uploadVideo,
  csrfSynchronisedProtection,
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).send("Please select a video.");
      }

      const caption = typeof req.body.caption === "string"
        ? req.body.caption.trim().slice(0, 200)
        : null;

      await storeUploadedFiles(
        [req.file],
        "VIDEO",
        req.entry.id,
        caption
      );

      res.redirect(`/entries/${req.entry.id}`);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

The main difference is that we use `uploadVideo`, which accepts one file from a field named `video`.

Multer makes this file available through `req.file`, whereas the image upload route uses `req.files` because it accepts multiple files.

We now have separate routes for uploading photographs and videos, each with its own file size and file count limits.

## Creating the Upload Forms

The backend routes are ready, but users still need a way to select and submit their files.

We will add two forms to the journal entry page: one for photographs and another for videos.

Create or update `views/entries/show.ejs`:

```ejs
<%- include('../partials/_header', { title: entry.title }) %>
<%- include('../partials/_navbar') %>

<main>
    <h1><%= entry.title %></h1>

    <p><%= entry.story || 'No description has been added.' %></p>

    <h2>Photographs</h2>

    <form
        action="/entries/<%= entry.id %>/images"
        method="POST"
        enctype="multipart/form-data"
    >
        <input type="hidden" name="_csrf" value="<%= csrfToken %>">

        <label for="images">Choose photographs:</label>
        <input
            type="file"
            id="images"
            name="images"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
        >

        <label for="image-caption">Caption:</label>
        <input
            type="text"
            id="image-caption"
            name="caption"
            maxlength="200"
        >

        <button type="submit">Upload Photographs</button>
    </form>

    <h2>Videos</h2>

    <form
        action="/entries/<%= entry.id %>/video"
        method="POST"
        enctype="multipart/form-data"
    >
        <input type="hidden" name="_csrf" value="<%= csrfToken %>">

        <label for="video">Choose a video:</label>
        <input
            type="file"
            id="video"
            name="video"
            accept="video/mp4"
            required
        >

        <label for="video-caption">Caption:</label>
        <input
            type="text"
            id="video-caption"
            name="caption"
            maxlength="200"
        >

        <button type="submit">Upload Video</button>
    </form>

    <h2>Uploaded Media</h2>

    <% entry.media.forEach(media => { %>
        <div class="media-item">
            <% if (media.kind === 'IMAGE') { %>
                <img
                    src="/media/<%= media.id %>"
                    alt="<%= media.caption || 'Travel photograph' %>"
                    loading="lazy"
                >
            <% } else if (media.kind === 'VIDEO') { %>
                <video controls preload="metadata">
                    <source
                        src="/media/<%= media.id %>"
                        type="<%= media.mimeType %>"
                    >
                    Your browser does not support HTML video.
                </video>
            <% } %>

            <% if (media.caption) { %>
                <p><%= media.caption %></p>
            <% } %>
        </div>
    <% }); %>
</main>

<%- include('../partials/_footer') %>
```

Let's look at the important parts.

First, both forms use:

```html
enctype="multipart/form-data"
```

Without this attribute, the browser will not submit the selected files using the encoding expected by Multer.

The image input also uses:

```html
multiple
```

This allows the user to select more than one image.

We use:

```html
accept="image/jpeg,image/png,image/webp"
```

The `accept` attribute helps the browser display the expected file types in the file picker. However, it is only a convenience for the user. It does not validate the uploaded file and can be bypassed. The server must still perform its own checks.

Finally, notice how we display uploaded content:

- Images are displayed using the `<img>` element.
- Videos are displayed using the `<video>` element.

Both elements request the media through `/media/:mediaId`. We will implement this route next so that the server can check ownership before returning the file.

## Serving Uploaded Media Securely

Our files are stored outside the `public` directory. This is intentional because we do not want every uploaded file to become publicly accessible through a predictable URL.

Instead, we will create a route that retrieves the corresponding media record, checks whether the current user owns it, and then sends the file to the browser.

Create `routes/media.js`:

```javascript
import express from "express";
import path from "node:path";
import { unlink } from "node:fs/promises";

import prisma from "../db/prisma.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";
import { mediaDirectory } from "../middleware/upload.js";

const router = express.Router();

router.get("/:mediaId", async (req, res, next) => {
  try {
    const mediaId = Number(req.params.mediaId);

    if (!Number.isSafeInteger(mediaId) || mediaId <= 0) {
      return res.sendStatus(404);
    }

    const media = await prisma.mediaAsset.findFirst({
      where: {
        id: mediaId,
        entry: {
          is: {
            trip: {
              is: {
                userId: req.session.user.id
              }
            }
          }
        }
      }
    });

    if (!media) {
      return res.sendStatus(404);
    }

    // The storage name was generated by our application.
    const fileName = path.basename(media.storageName);

    if (fileName !== media.storageName) {
      return res.sendStatus(404);
    }

    const filePath = path.join(mediaDirectory, fileName);

    res.set("X-Content-Type-Options", "nosniff");
    res.set("Cache-Control", "private, no-store");
    res.set("Content-Disposition", "inline");
    res.type(media.mimeType);

    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

export default router;
```

Let's understand what happens here.

First, we retrieve the media record using its ID.

However, we do not search using the media ID alone. We also check the ownership relationship:

```javascript
entry: {
    is: {
        trip: {
            is: {
                userId: req.session.user.id
            }
        }
    }
}
```

This ensures that the media belongs to a journal entry whose trip belongs to the currently authenticated user.

If the media does not exist or belongs to another user, we return `404 Not Found`.

Only after checking ownership do we construct the file path and send the file using `res.sendFile()`.

Notice that we use the generated `storageName`, not the original filename supplied by the client. We also set `X-Content-Type-Options: nosniff` to prevent browsers from interpreting the response as a different content type.

This approach allows our application to keep uploaded media private while still displaying it inside authenticated pages.

### Registering the routes

We now need to connect the new routes to our main Express application.

In `app.js`, import the routers:

```javascript
import tripRoutes from "./routes/trips.js";
import entryRoutes from "./routes/entries.js";
import mediaRoutes from "./routes/media.js";
import requireLogin from "./middleware/requireLogin.js";
```

Keep the `express.urlencoded()` and session middleware from Workshop 4. The URL-encoded parser is still needed for our normal trip forms and media deletion forms, while Multer will parse the multipart requests used for file uploads.

Also make sure the middleware that exposes the current user and CSRF token is registered after the session middleware and before our routes.

Then mount the routers:

```javascript
app.use("/trips", requireLogin, tripRoutes);
app.use("/entries", requireLogin, entryRoutes);
app.use("/media", requireLogin, mediaRoutes);
```

This means that all entry and media routes require an authenticated user.

The routes still perform their own ownership checks because being logged in does not automatically grant access to every resource.

## Handling Upload Errors

File uploads can fail for several reasons.

For example:

- The uploaded file exceeds the configured size limit.
- The request contains more files than the route accepts.
- The file field name does not match the expected field name.
- The MIME type is not accepted by our early filter.
- The actual file contents do not match the allowed formats.
- The user submits an invalid CSRF token.

Multer passes upload errors to Express, allowing us to handle them through error-handling middleware.

There is also an important cleanup step. If Multer has already stored temporary files and a later middleware rejects the request, we should remove those temporary files.

### Adding upload error handling

In `app.js`, register an error-handling middleware after our routes and normal 404 handler:

```javascript
import multer from "multer";
import { unlink } from "node:fs/promises";

app.use(async (error, req, res, next) => {

    // Remove files that Multer saved before a later middleware failed.
    const uploadedFiles = [
        ...(Array.isArray(req.files) ? req.files : []),
        ...(req.file ? [req.file] : [])
    ];

    await Promise.all(
        uploadedFiles.map(async file => {
            try {
                await unlink(file.path);
            } catch (cleanupError) {
                if (cleanupError.code !== "ENOENT") {
                    console.error("Upload cleanup failed:", cleanupError);
                }
            }
        })
    );

    if (res.headersSent) {
        return next(error);
    }

    if (error.code === "EBADCSRFTOKEN") {
        return res.status(403).send("Invalid or missing CSRF token. Please reload the form and try again.");
    }

    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).send("The uploaded file is too large.");
        }

        return res.status(400).send("The upload could not be processed. Check the selected files and try again.");
    }

    if (
        error.code === "UNSUPPORTED_FILE_TYPE" ||
        error.code === "INVALID_FILE_CONTENT"
    ) {
        return res.status(400).send(error.message);
    }

    // Keep internal error details and filesystem paths out of the response.
    console.error(error);
    res.status(500).send("Something went wrong on the server.");
});
```

Here, we first attempt to remove any temporary files associated with the failed request.

Then we check the error type and return an appropriate HTTP status code.

For example:

- `400 Bad Request` is appropriate when the submitted file type or request is invalid.
- `403 Forbidden` is used when CSRF validation fails.
- `413 Payload Too Large` is used when an upload exceeds the configured size limit.
- `500 Internal Server Error` is used for unexpected server errors.

In a production application, we would normally render a proper error page instead of sending plain text. We may also log more detailed diagnostic information without exposing internal paths or server errors to users.

## Removing Uploaded Files

So far, we have learned how to upload and display files. However, managing media also means knowing how to remove it.

Imagine a user deletes a photograph from a journal entry.

We need to remove both:

1. The media record from PostgreSQL.
2. The physical file from the storage directory.

Deleting only the database record leaves an unused file on disk. Deleting only the physical file leaves a database record pointing to a file that no longer exists.

### Creating a media deletion route

Add the following route to `routes/media.js`:

```javascript
router.post("/:mediaId/delete", csrfSynchronisedProtection, async (req, res, next) => {
    try {
        const mediaId = Number(req.params.mediaId);

        if (!Number.isSafeInteger(mediaId) || mediaId <= 0) {
            return res.sendStatus(404);
        }

        const media = await prisma.mediaAsset.findFirst({
            where: {
                id: mediaId,
                entry: {
                    is: {
                        trip: {
                            is: {
                                userId: req.session.user.id
                            }
                        }
                    }
                }
            }
        });

        if (!media) {
            return res.sendStatus(404);
        }

        // Confirm that the stored name cannot escape the upload directory.
        const fileName = path.basename(media.storageName);

        if (fileName !== media.storageName) {
            return res.sendStatus(404);
        }

        // Remove the database record first.
        await prisma.mediaAsset.delete({
            where: {
                id: media.id
            }
        });

        // Then remove the physical file.
        const filePath = path.join(mediaDirectory, fileName);

        try {
            await unlink(filePath);
        } catch (error) {
            if (error.code !== "ENOENT") {
                console.error("Could not remove uploaded file:", error);
            }
        }

        res.redirect(`/entries/${media.entryId}`);
    } catch (error) {
        next(error);
    }
});
```

We first retrieve the media record using both its ID and the current user's ownership relationship.

If the record does not belong to the current user, the application returns `404` without deleting anything.

After deleting the database record, we remove the corresponding physical file.

We delete the database record first so that the application no longer exposes a media record that points to a file we could not remove. If the filesystem operation fails, the application should log the problem so that the remaining file can be cleaned up later.

In a larger application, we would usually introduce a more reliable cleanup process, such as a background job that retries failed deletions and periodically checks for orphaned files.

There is another detail to remember when deleting a journal entry or an entire trip. Prisma's `onDelete: Cascade` can remove related database records, but it cannot remove files from the filesystem. Before deleting a parent record, we should retrieve the storage names of its media files, delete the database records, and then remove the corresponding physical files. Otherwise, the files may remain in storage even though their database records have disappeared.

### Adding a delete button to the template

Inside the media loop in `views/entries/show.ejs`, add:

```ejs
<form action="/media/<%= media.id %>/delete" method="POST">
    <input type="hidden" name="_csrf" value="<%= csrfToken %>">
    <button type="submit">Delete Media</button>
</form>
```

This sends a POST request to our deletion route.

We use POST because deleting a file changes the application's state. We also include the CSRF token because the route performs a state-changing operation.

## Understanding Image Processing and Optimization

Now that we can upload and display images, let's consider another problem.

Photographs from modern phones and cameras can be quite large. Displaying the original files directly may increase page loading times and consume unnecessary bandwidth.

A common solution is to resize and optimize images before displaying them.

For example, if a user uploads an image that is 6000 pixels wide, our application may not need to send the full-resolution image when displaying it inside a small journal entry.

We can generate a smaller version for web display.

### Introducing Sharp

**Sharp** is a Node.js library for image processing. It can resize, rotate, convert, and optimize images.

Install it using:

```bash
npm install sharp
```

Check the Sharp documentation for its current Node.js runtime requirements before installing it in your environment.

Assume `imagePath` is the verified source image and `outputPath` is the destination where we want to save the optimized version.

After verifying that an uploaded file is an accepted image, we can use Sharp to generate a smaller WebP version:

```javascript
import sharp from "sharp";

await sharp(imagePath)
    .rotate()
    .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true
    })
    .webp({ quality: 82 })
    .toFile(outputPath);
```

Here:

- `rotate()` applies the image's orientation information when available.
- `resize()` limits the output dimensions without enlarging smaller images.
- `webp()` converts the image into the WebP format and applies compression.
- `toFile()` writes the processed image to the specified location.

We could store this optimized version and use it when rendering the journal entry.

This is an additional improvement rather than a requirement for our first upload implementation. It also illustrates why verifying a file before passing it to an image-processing library is important.

### What about videos?

Videos require different processing techniques because resizing or converting them can be more computationally expensive.

For this workshop, we will accept MP4 videos and display them using the HTML `<video>` element.

Larger applications may use tools such as FFmpeg to generate different resolutions, extract thumbnails, or convert videos into formats suitable for different devices.

These tasks are often performed in background workers rather than during the original HTTP request, because video processing can take considerable time and CPU resources.

## Testing the Application

Now that we have configured file uploads, media storage, and authenticated media routes, let's test the application.

Start the server:

```bash
npm run dev
```

Log in to the application and open one of your journal entries.

### Testing image uploads

- Select one JPEG image and upload it.
- Select multiple images and upload them together.
- Confirm that the uploaded images appear on the journal entry page.
- Check that each image has a database record in the `media_assets` table.
- Check that the actual files exist inside `storage/uploads/`.
- Try uploading an image larger than the configured limit.

### Testing video uploads

- Select an MP4 video and upload it.
- Confirm that the video appears with playback controls.
- Try uploading a video larger than 50 MB.
- Try submitting an unsupported file type.

### Testing file validation

For testing purposes, create a text file and rename it to `fake-image.jpg`.

Try uploading it as an image.

Depending on the browser and operating system, the client may describe the file as an image based on its filename or selected file type. Our server-side file signature check should still reject it because its contents do not match an accepted image format.

Remember that file signature detection is not a complete security scanner. It is one layer of validation in our upload process.

### Testing authorization

Create two different user accounts.

For example:

- User A creates a trip and adds a journal entry with photographs.
- User B logs in and creates a different trip.
- User B tries to open one of User A's media URLs by changing the media ID.
- User B tries to upload files using the ID of User A's journal entry.
- User B tries to delete one of User A's media records.

The application should reject these operations.

This is particularly important because uploaded files can contain personal information. Protecting the page that displays a file is not enough; the route that sends the actual file must perform its own authorization check.

## Additional Considerations for File Uploads

The examples in this workshop are suitable for understanding the main concepts, but real applications need to consider additional requirements.

### Never trust the original filename

The original filename is provided by the client. It may contain unexpected characters or path components.

We use a generated storage name and keep the original filename only for display purposes. When displaying it in EJS, we should use escaped output (`<%=`), not raw HTML output (`<%-`).

### Do not rely only on the file extension or MIME type

A filename extension and the MIME type supplied by the browser can both be changed.

We therefore use an allowlist and inspect the file's binary signature. Depending on the application's requirements, further validation or malware scanning may also be necessary.

### Set upload limits

Applications should define limits for:

- Maximum file size.
- Maximum number of files per request.
- Maximum number and size of regular form fields.
- The file formats that the application accepts.

These limits help reduce the risk of excessive resource consumption.

### Avoid storing private files in the public directory

If we place uploaded files inside a directory served by `express.static()`, visitors may be able to access them without passing through our authorization checks.

For private files, store them outside the public web root and serve them through routes that verify the user's permissions.

### Consider dedicated storage in production

Storing files on the local filesystem is convenient for learning and small deployments. However, production applications often use dedicated object-storage services.

Examples include Amazon S3, Cloudflare R2, and other compatible storage services.

These services can provide durable storage, lifecycle policies, and delivery through content delivery networks.

The database can continue storing the file metadata and storage key, while the actual file is stored by the external service.

### Remember that files and database records are separate resources

Prisma can manage database operations, but it cannot automatically roll back a filesystem operation.

For example, if we save a file and the database operation fails, the file may remain on disk without a corresponding record.

Our helper removes files when the metadata operation fails, but a production system should also plan for interrupted uploads, failed deletions, and orphaned files.

## Tasks

The Travel Journal is our main example for this workshop, but you should practise applying the same concepts to different applications.

The following tasks will help you explore file uploads, media metadata, database relationships, and access control in other contexts.

### Task 1: Product Catalogue with Image Galleries

Create an application where administrators can manage products in an online store.

Each product should contain:

- Name.
- Description.
- Price.
- Category.
- One or more product images.

The application should allow an administrator to:

- Create a product.
- Upload a main product image.
- Upload multiple additional images.
- View the product and its image gallery.
- Replace an existing image.
- Delete an image without deleting the product.
- Delete a product and remove its associated image files.

Think about how you would represent the relationship between products and images using Prisma.

Also consider which files should be public and which routes should require administrator access.

### Task 2: Assignment Submission Platform

Create an application where students can submit assignments and instructors can review them.

Each assignment submission should contain:

- A title.
- A description.
- The submission date.
- One or more attached files.
- The student who submitted it.

The application should allow students to:

- Register and log in.
- View available assignments.
- Submit files for an assignment.
- Replace a submission before its deadline.
- View their own submitted files.

Instructors should be able to:

- View submissions for their assignments.
- Download submitted files.
- Delete an invalid attachment.

Consider the following questions:

- Which file formats should be accepted?
- What maximum file size should be allowed?
- How will you prevent students from viewing other students' private submissions?
- How will you associate uploaded files with a particular assignment and student?

### Task 3: Event Media Gallery

Create an application where users can publish events and share photographs from those events.

An event should contain:

- Title.
- Description.
- Location.
- Date.
- Organiser.

Each event should have a gallery containing multiple images.

The application should allow:

- Event organisers to upload and manage their event photographs.
- Visitors to view public event galleries.
- Organisers to remove photographs from their own events.
- Users to add captions to photographs.

Extend the database design to represent the relationship between users, events, and uploaded media.

Think about the difference between public media and private media. The gallery images may be publicly accessible, but only the event organiser should be allowed to upload or delete them.

### Final Challenge: Build Your Own Media Application

Think of an application idea that requires users to upload or manage files.

For example, you could build:

- A personal portfolio where users upload project screenshots and demonstration videos.
- A recipe platform where users upload food photographs.
- A property listing application where agents upload property images and floor plans.
- A learning platform where instructors upload course materials and students submit documents.

Before writing code:

1. Identify the main entities in your application.
2. Define the Prisma models and their relationships.
3. Decide which file types your application will accept.
4. Define file size and file count limits.
5. Decide where uploaded files should be stored.
6. Decide which files should be public and which should require authentication.
7. Implement the upload, display, and deletion functionality.
8. Apply authentication and ownership checks to every protected operation.

Try to use an application idea that is different from the examples in this workshop.


## References

- [Multer Documentation](https://github.com/expressjs/multer)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [file-type Documentation](https://www.npmjs.com/package/file-type)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Prisma ORM Relations](https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/relations)