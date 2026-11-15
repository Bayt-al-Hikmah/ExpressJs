# Workshop 6: Building REST APIs with Express

## Objectives

In this workshop, we will learn how to:

- Understand the shift from server-side rendering to API-driven applications.
- Understand APIs, REST principles, resources, endpoints, and HTTP methods.
- Design consistent JSON responses and use appropriate HTTP status codes.
- Build REST-style API endpoints using Express and Prisma.
- Validate API requests and handle errors consistently.
- Reuse session-based authentication and authorization in an API.
- Send requests from the browser using the Fetch API.
- Update the DOM using data returned by an API.
- Upload files through an API using `FormData` and Multer.
- Understand CORS and configure an API for a separate frontend when necessary.
- Protect API endpoints using rate limiting.
- Understand token-based authentication and how it differs from session authentication.

## Introduction

In the previous workshops, we learned how to build server-rendered web applications using Express and EJS. The server received a request, processed it, generated an HTML page, and returned that page to the browser.

We then extended our applications with PostgreSQL, Prisma, authentication, authorization, and file uploads. We learned how to store application data, associate resources with their owners, and manage uploaded media securely.

So far, however, the server has mostly been responsible for generating the pages that users see. In this workshop, we will explore another way to build web applications: **API-driven applications**.

Instead of returning a complete HTML page for every operation, our backend will expose endpoints that receive requests and return structured data, usually in JSON format. JavaScript in the browser will communicate with these endpoints and update the interface using the returned information.

To practise this approach, we will build a different application: an **Event Board**.

Users will be able to create accounts, browse published events, create and manage their own events, search and filter the event list, and upload an image for each event. Visitors will be able to browse published events, while authenticated organisers will be able to manage their own events.

We will continue using Express, PostgreSQL, Prisma, and the authentication concepts from our previous workshops. We will also reuse the secure file-upload practices from Workshop 5, but this time we will send files to the server through an API using JavaScript.

Let's start by understanding how an API-driven application differs from the server-rendered applications we have already built.

## From Server-Side Rendering to API-Driven Applications

In our previous workshops, we used **Server-Side Rendering (SSR)**. With this approach, the server generates the HTML document before sending it to the browser.

For example, when a user visits a page containing a list of events, the browser requests the page, Express retrieves the required information, EJS generates the HTML, and the server returns the completed document.

### Traditional Server-Side Rendering

A typical request follows these steps:

1. The user visits a page or submits a form.
2. The browser sends an HTTP request to the server.
3. Express processes the request and retrieves the required information.
4. EJS renders an HTML document using that information.
5. The server sends the generated HTML to the browser.
6. The browser displays the page.

This approach works well for many applications. It is straightforward, and the server remains responsible for generating the page content.

However, with traditional full-page navigation, an action often causes the browser to request and receive another HTML document. Even when we only want to update a small part of the interface, the browser may need to navigate to a new page and replace the current document.

This is not necessarily a performance problem in every application. Server-side rendering can be an excellent choice. The important point is that it is not the only way to build an interactive web application.

### API-Driven Applications

An API-driven application separates the responsibilities of the frontend and backend more clearly.

The backend exposes endpoints that allow clients to retrieve and modify application data. Instead of generating an HTML page for every operation, the API usually returns data in a structured format such as JSON.

JavaScript uses that data to update the interface without navigating to a new page.

For example, when a user creates an event, the process can work as follows:

1. The user fills in the event form and clicks the submit button.
2. JavaScript reads the form values.
3. JavaScript sends an HTTP request to the API.
4. Express validates the request and creates the event in PostgreSQL through Prisma.
5. The API returns a JSON response describing the result.
6. JavaScript uses the response to update the event list in the browser.

The process can be represented as follows:

```text
             USER INTERFACE
                   |
                   v
            JAVASCRIPT EVENT
                   |
                   v
             FETCH REQUEST
                   |
                   v
             EXPRESS API
                   |
          +--------+--------+
          |                 |
          v                 v
     BUSINESS LOGIC      VALIDATION
          |                 |
          +--------+--------+
                   |
                   v
             PRISMA CLIENT
                   |
                   v
              POSTGRESQL
                   |
                   v
              JSON RESPONSE
                   |
                   v
             JAVASCRIPT
                   |
                   v
              UPDATE DOM
```

Notice that the backend does not need to know how the frontend displays the returned information. It is responsible for processing the request and returning the appropriate result.

### What is an API?

API stands for **Application Programming Interface**.

An API is an interface that allows one software application to communicate with another. It defines which operations are available, what information a client should send, and what kind of response it can expect.

In our web application, the API acts as the communication interface between the frontend and backend.

For example, an event application might expose the following endpoints:

```text
GET    /api/events
GET    /api/events/10
POST   /api/events
PATCH  /api/events/10
DELETE /api/events/10
```

A browser application can use these endpoints to display and manage events. A mobile application could use the same endpoints without needing a separate implementation of the event-management logic.

This is one of the main advantages of API-driven development: **different clients can reuse the same backend functionality**.

An API does not have to be used by a browser. It can also be consumed by mobile applications, desktop applications, other servers, or automated tools.

### Understanding API Requests and Responses

When a client communicates with an API, it sends an HTTP request and receives an HTTP response.

A request may contain:

- An HTTP method describing the requested operation.
- A URL identifying the endpoint or resource.
- Headers containing additional information, such as the content type or authentication credentials.
- A request body containing data that the server needs to process.

For example, a client could send the following request to create an event:

```http
POST /api/events HTTP/1.1
Content-Type: application/json
```

```json
{
    "title": "Introduction to Robotics",
    "description": "A practical robotics workshop for beginners.",
    "location": "Community Technology Center",
    "startsAt": "2027-03-20T09:00:00.000Z",
    "category": "EDUCATION"
}
```

The API processes the request and might return:

```json
{
    "message": "Event created successfully.",
    "data": {
        "id": 10,
        "title": "Introduction to Robotics",
        "description": "A practical robotics workshop for beginners.",
        "location": "Community Technology Center",
        "category": "EDUCATION",
        "status": "DRAFT"
    }
}
```

The response contains structured data rather than a complete HTML page. The frontend can use this information to display a success message or add the event to the interface.

### The Role of JavaScript

To communicate with an API from the browser, we can use the JavaScript **Fetch API**.

Fetch allows us to send HTTP requests and process the responses returned by the server.

For example, we can retrieve a list of events using:

```javascript
const response = await fetch('/api/events');
const result = await response.json();

console.log(result);
```

The first line sends a GET request to `/api/events`. The second line reads the JSON response and converts it into a JavaScript value.

We can then use that value to update the page.

Instead of submitting a form and navigating to another page, JavaScript can handle the form's submit event, send the request, and update the relevant part of the DOM.

The general process is:

1. **Listen for an event:** Detect a form submission or button click.
2. **Collect information:** Read the values entered by the user.
3. **Send a request:** Use `fetch()` to communicate with the API.
4. **Process the response:** Read the returned JSON data and check whether the request succeeded.
5. **Update the interface:** Display the result by modifying the DOM.

We will implement this process later when we connect the Event Board interface to our API.

## Understanding REST API Architecture

There are different ways to design APIs. One of the most widely used approaches for web APIs is **REST (Representational State Transfer)**.

REST is an architectural style that defines constraints for designing network-based applications. A REST-style API commonly represents application information as resources and uses standard HTTP methods to interact with those resources.

For example, in our Event Board, users and events are resources.

A resource is an entity or piece of information that the application makes available through its API. Each resource is identified by a URL.

### Resource-Based URLs

REST-style APIs use URLs to identify resources rather than creating a separate custom action URL for every operation.

For example:

```text
/api/events
/api/events/10
/api/users/5
```

Here:

- `/api/events` identifies the collection of events.
- `/api/events/10` identifies one event.
- `/api/users/5` identifies a user.

Notice that the URL identifies the resource. The HTTP method tells the server what operation the client wants to perform.

### Using Standard HTTP Methods

HTTP provides standard methods that describe the operation a client wants to perform.

| Method | Purpose | Example |
|---|---|---|
| `GET` | Retrieve a resource or collection. | `GET /api/events` |
| `POST` | Create a new resource or submit an operation. | `POST /api/events` |
| `PUT` | Replace a resource or a specific subresource. | `PUT /api/events/10/cover` |
| `PATCH` | Partially update an existing resource. | `PATCH /api/events/10` |
| `DELETE` | Remove a resource. | `DELETE /api/events/10` |

For example, we use `GET /api/events` to retrieve events and `POST /api/events` to create one.

We do not need separate URLs such as `/api/getEvents` and `/api/createEvent`. The resource URL and HTTP method together describe the operation.

There is also an important distinction between PUT and PATCH:

- **PUT** is normally used when replacing the state of a resource or a specific subresource.
- **PATCH** is used when applying a partial update to an existing resource.

For our application, we will use PATCH when updating only selected event fields. We will use PUT when replacing an event's cover image.

### Stateless Communication

One of the constraints of REST is **statelessness**.

Stateless communication means that each request must contain the information needed by the server to understand and process it. The server should not depend on information that exists only in the memory of a previous request.

This does not mean that the application cannot store data in a database. The server can still store users, events, orders, and other application information. The constraint concerns the communication between the client and server.

In this workshop, our main API will use cookie-based sessions because we already learned session authentication in Workshop 4. The server uses the session to identify the current user. This is convenient for our browser-based application, but it means that the authentication mechanism itself is stateful.

Therefore, our API will follow resource-oriented REST conventions, but the use of server-side sessions means it does not satisfy the strict stateless REST constraint. Later, we will introduce JWT as an alternative and discuss its trade-offs.

### Client-Server Separation

REST separates the client from the server.

The client is responsible for the user interface and user experience. It decides how information is displayed and how users interact with the application.

The server is responsible for application rules, data validation, authentication, authorization, and database operations.

For example, the Event Board frontend can display an event card in any way it wants. The backend only needs to return the event information in a predictable format.

This separation allows us to build different interfaces without rewriting the business logic.

### Cacheability, a Uniform Interface, and a Layered System

REST also defines other constraints.

**Cacheability** means that responses should indicate whether they can be stored and reused by a client or an intermediary cache. For example, a public list of published events may be suitable for short-term caching, while a private account response should not be cached by a shared cache.

**A uniform interface** means that clients interact with resources through consistent conventions. Resource URLs, standard HTTP methods, representations such as JSON, and meaningful status codes help make an API predictable. A complete REST uniform interface can also use hypermedia links to guide clients through available actions. We will focus on the resource and HTTP conventions used by many practical REST-style APIs rather than implementing every part of the full REST model.

**A layered system** means that the client does not need to know whether it is communicating directly with the application server or through an intermediary such as a reverse proxy, gateway, or cache. Each layer has a defined responsibility and communicates with the next layer.

We will apply these ideas through consistent endpoint naming, JSON response formats, appropriate cache headers, and HTTP status codes.

### Understanding HTTP Status Codes

HTTP status codes describe the result of processing a request.

Some commonly used status codes include:

| Status Code | Meaning | When we use it |
|---|---|---|
| `200` | OK | A request succeeded and a response contains data. |
| `201` | Created | A new resource was successfully created. |
| `204` | No Content | A request succeeded but does not need to return a response body. |
| `400` | Bad Request | The submitted information is invalid. |
| `401` | Unauthorized | Authentication is required or the supplied credentials are invalid. |
| `403` | Forbidden | The user is authenticated but is not allowed to perform the operation. |
| `404` | Not Found | The requested resource does not exist or is not available to the current user. |
| `409` | Conflict | The request conflicts with existing data, such as a duplicate email address. |
| `413` | Payload Too Large | The uploaded request exceeds the configured size limit. |
| `415` | Unsupported Media Type | The submitted file or request format is not supported. |
| `429` | Too Many Requests | The client has exceeded a rate limit. |
| `500` | Internal Server Error | An unexpected error occurred on the server. |

Using meaningful status codes helps clients understand the result without having to interpret every message manually.

For example, a successful event creation should normally return `201 Created`, while trying to access an event that does not exist should return `404 Not Found`.

### A Consistent JSON Response Format

An API should return responses in a predictable structure. This makes it easier for the frontend to process successful requests and display errors.

For this workshop, successful responses will generally contain a `message` and a `data` property:

```json
{
    "message": "Events retrieved successfully.",
    "data": []
}
```

A validation error can contain a message and an array describing the invalid fields:

```json
{
    "message": "Validation failed.",
    "errors": [
        {
            "field": "title",
            "message": "Event title is required."
        }
    ]
}
```

The exact response structure is a design decision, but it should remain consistent throughout the API. We should also avoid returning internal database errors, stack traces, password hashes, or private server information to clients.

## Designing Our Event Board API

Before writing our routes, let's decide what our application should do and which resources it needs.

The Event Board will allow users to discover events and allow organisers to publish and manage their own events.

Our application will support two main types of access:

- **Visitors:** Can browse published events and view their details.
- **Authenticated organisers:** Can create events, view their own drafts, update their events, upload cover images, publish events, and delete their own events.

Each event belongs to the user who created it. An organiser must not be able to modify another organiser's event by changing an ID in the URL.

### Designing the Resources

Our application will use two main database models:

**User:** Represents a registered organiser. It stores account information and has a relationship with the events created by that user.

**Event:** Represents an event created by an organiser. It contains the event title, description, location, date, category, publication status, and optional cover image.

The relationship can be represented as follows:

```text
             User
               |
               | One-to-Many
               |
               v
             Event
               |
               | One-to-One
               |
               v
           MediaAsset
```

A user can create multiple events, but each event belongs to one user. Each event can have one cover image, and each cover image belongs to one event.

We will store the image file in the filesystem and its metadata in the database, following the approach introduced in Workshop 5.

### Planning the API Endpoints

Before implementing the routes, let's define the endpoints our frontend will use.

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| `GET` | `/api/events` | Retrieve published events and the current user's own events. | Public, with owner-specific results when logged in |
| `GET` | `/api/events/:eventId` | Retrieve one event. | Public if published; otherwise owner only |
| `POST` | `/api/events` | Create an event. | Authenticated |
| `PATCH` | `/api/events/:eventId` | Update event information. | Event owner |
| `DELETE` | `/api/events/:eventId` | Delete an event. | Event owner |
| `GET` | `/api/events/:eventId/cover` | Retrieve the event cover image. | Public if published; otherwise owner only |
| `PUT` | `/api/events/:eventId/cover` | Upload or replace the cover image. | Event owner |
| `DELETE` | `/api/events/:eventId/cover` | Remove the cover image. | Event owner |
| `POST` | `/api/auth/register` | Register an organiser. | Public |
| `POST` | `/api/auth/login` | Authenticate an organiser. | Public |
| `POST` | `/api/auth/logout` | End the current session. | Authenticated |
| `GET` | `/api/auth/me` | Retrieve the currently authenticated user. | Authenticated |

This table acts as a small API contract. It tells us which operations are available, which HTTP method each operation uses, and whether authentication is required.

We will use the same conventions when building the routes.

## Setting Up Our Project

Now that we understand the API architecture and have designed the resources, let's create the Event Board project.

We will create a new project rather than modifying the Study Planner or Travel Journal. This allows us to practise the same backend techniques in a different application.

Use Node.js 22 or later for this workshop. Express 5 supports Node.js 18 and later, while the current `file-type` release used for file-signature inspection requires Node.js 22 or later. Check your installed version with:

```bash
node -v
npm -v
```

### Creating the project

```bash
mkdir event-board
cd event-board
npm init -y
npm pkg set type="module"
```

We will use ES modules so that we can import and export our application modules using `import` and `export`.

### Installing the required packages

Install Express, session management, validation, password hashing, Prisma, and the other packages used by our application:

```bash
npm install express@5 express-session csrf-sync express-validator argon2 dotenv @prisma/client@7 @prisma/adapter-pg@7 pg multer@^2 file-type helmet express-rate-limit cors jsonwebtoken
```

Install Prisma CLI and `tsx` as development dependencies:

```bash
npm install -D prisma@7 tsx
```

We will use:

- `express`: The backend web framework.
- `express-session`: Session-based authentication, as introduced in Workshop 4.
- `csrf-sync`: CSRF protection for requests authenticated through cookies.
- `express-validator`: Validation and sanitization of incoming data.
- `argon2`: Secure password hashing.
- `@prisma/client`, `@prisma/adapter-pg`, and `pg`: Database access through Prisma 7 and PostgreSQL.
- `multer`: Processing `multipart/form-data` uploads.
- `file-type`: Inspecting file signatures to help verify uploaded file contents.
- `helmet`: Setting several security-related HTTP response headers.
- `express-rate-limit`: Limiting repeated requests.
- `cors`: Configuring cross-origin access when the frontend is hosted on a different origin.
- `jsonwebtoken`: Demonstrating JWT-based authentication as an alternative to sessions.
- `dotenv`: Loading environment variables from `.env`.
- We do not need EJS for this frontend. Unlike our previous server-rendered applications, Express will serve a static HTML document and JavaScript will retrieve application data from the API.

Configure the project scripts:

```bash
npm pkg set scripts.dev="tsx watch app.js" scripts.start="tsx app.js"
```

### Creating the PostgreSQL database

Create a new PostgreSQL database named `event_board` using the PostgreSQL command line or a graphical database tool.

Create a `.env` file in the root of the project:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/event_board"
SESSION_SECRET="replace-with-a-long-random-secret"
JWT_SECRET="replace-with-a-separate-long-random-secret"
NODE_ENV="development"
PORT=3000
```

Replace the database username and password with your own PostgreSQL credentials.

Generate strong secrets instead of using the example values. For example, Node.js can generate a random hexadecimal secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run the command separately for `SESSION_SECRET` and `JWT_SECRET`. Keep the values private and never commit `.env` to a public repository.

Create a `.gitignore` file:

```gitignore
node_modules/
.env
generated/
storage/
```

The `storage` directory will contain uploaded files, so we do not want to add its contents to Git.

### Initialising Prisma

We will continue using Prisma 7 and PostgreSQL, as we did in Workshop 4.

Initialise Prisma:

```bash
npx prisma@7 init
```

This creates the Prisma schema and configuration files.

Open the Prisma configuration file generated by the CLI. In our earlier project it was named `prisma.config.ts`; some newer Prisma 7 releases may generate `prisma7.config.ts`. Edit the file that already exists instead of creating both.

Make sure it loads the database URL from the environment:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        url: env("DATABASE_URL")
    }
});
```

If Prisma generated a configuration file with additional migration settings, keep those settings as well. The important point is that Prisma 7 reads the connection URL from the Prisma configuration file.

Now open `prisma/schema.prisma` and configure the client generator and PostgreSQL provider:

```prisma
generator client {
    provider            = "prisma-client"
    output              = "../generated/prisma"
    moduleFormat        = "esm"
    importFileExtension = "ts"
}

datasource db {
    provider = "postgresql"
}
```

Notice that we do not place `url = env("DATABASE_URL")` inside the datasource block. In Prisma 7, the connection URL is configured through `prisma.config.ts`.

We are also using a custom output directory for the generated Prisma Client, just as we did in Workshop 4.

## Designing Our Database Models

Before creating the tables, let's define the information that our Event Board needs to store.

An event needs a title, description, location, start date, category, and publication status. It also needs to be associated with the organiser who created it.

We will define two enums to represent the available event categories and publication states.

### Defining the models

Open `prisma/schema.prisma` and add the following models:

```prisma
enum EventCategory {
    TECHNOLOGY
    EDUCATION
    ART
    COMMUNITY
    SPORTS
    OTHER
}

enum EventStatus {
    DRAFT
    PUBLISHED
}

model User {
    id           Int      @id @default(autoincrement())
    username     String   @unique @db.VarChar(25)
    email        String   @unique @db.VarChar(254)
    passwordHash String   @map("password_hash") @db.VarChar(255)
    createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

    events       Event[]

    @@map("users")
}

model Event {
    id          Int           @id @default(autoincrement())
    title       String        @db.VarChar(120)
    description String        @db.Text
    location    String        @db.VarChar(160)
    startsAt    DateTime      @map("starts_at") @db.Timestamptz(6)
    category    EventCategory @default(OTHER)
    status      EventStatus   @default(DRAFT)
    createdAt   DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)
    updatedAt   DateTime      @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

    organizerId Int           @map("organizer_id")
    organizer   User          @relation(fields: [organizerId], references: [id], onDelete: Cascade)
    cover       MediaAsset?

    @@index([organizerId])
    @@index([status, startsAt])
    @@map("events")
}

model MediaAsset {
    id           Int      @id @default(autoincrement())
    storageName  String   @unique @map("storage_name") @db.VarChar(255)
    originalName String   @map("original_name") @db.VarChar(180)
    mimeType     String   @map("mime_type") @db.VarChar(100)
    sizeBytes    Int      @map("size_bytes")
    createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

    eventId      Int      @unique @map("event_id")
    event        Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

    @@map("media_assets")
}
```

Let's understand the important parts.

### Models and fields

Each Prisma model represents an entity in our application and maps to a database table.

The `User` model represents registered organisers. The `Event` model stores event information, and the `MediaAsset` model stores metadata about the uploaded cover image.

The `passwordHash` field stores a password hash rather than the original password. We use `@map` and `@@map` to keep the JavaScript and Prisma field names readable while using snake_case names in PostgreSQL.

The `EventCategory` and `EventStatus` enums restrict these fields to known values. This helps keep the data consistent. For example, an event status can be `DRAFT` or `PUBLISHED`, rather than an arbitrary string.

### Relationships

The `events Event[]` field in the `User` model indicates that one user can have multiple events.

The following fields in the `Event` model define the relationship to its organiser:

```prisma
organizerId Int
organizer   User @relation(
    fields: [organizerId],
    references: [id],
    onDelete: Cascade
)
```

`organizerId` is the foreign key that connects an event to its owner. The `organizer` field allows Prisma Client to retrieve the associated user.

The `cover MediaAsset?` field represents an optional one-to-one relationship. An event may have no cover image or one cover image.

In `MediaAsset`, the `eventId` field is marked as `@unique`, which prevents multiple cover records from being associated with the same event.

### Applying the database changes

Now create the tables using a migration:

```bash
npx prisma migrate dev --name init
```

Then generate Prisma Client:

```bash
npx prisma generate
```

The migration creates the database tables based on our Prisma models. Whenever we change the models later, we should create another migration with a descriptive name.

## Connecting Prisma to Express

Now that the database structure is ready, we need to make Prisma Client available to our Express routes.

Create a directory named `db` and add a file named `prisma.js`:

```text
event-board/
├── db/
│   └── prisma.js
├── generated/
├── prisma/
├── prisma.config.ts
├── app.js
└── package.json
```

Inside `db/prisma.js`, add:

```javascript
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

export default prisma;
```

We create one Prisma Client instance and export it so that all our routes can reuse the same database connection setup.

Do not create a new `PrismaClient` every time a route is called. A shared instance is sufficient for this application.

This is the same Prisma 7 and PostgreSQL approach we used in Workshop 4. We are keeping the database technology consistent so that we can focus on learning the API architecture.

## Configuring Express for API Requests

Before creating our API routes, let's configure the Express application.

An API receives different kinds of requests. Some clients send JSON, while browser forms that contain files use `multipart/form-data`. We need to register the appropriate middleware for each type of request.

Create the following directories:

```text
event-board/
├── db/
├── middleware/
├── routes/
├── public/
│   ├── css/
│   └── js/
├── storage/
│   └── event-covers/
├── prisma/
├── generated/
├── app.js
└── ...
```

The `public` directory will contain our frontend files. The `storage/event-covers` directory will contain uploaded cover images and must not be exposed through `express.static()`.

### Understanding the request parsers

We will use two built-in Express middleware functions:

```javascript
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));
```

`express.json()` parses JSON request bodies and makes the resulting object available through `req.body`.

`express.urlencoded()` parses traditional HTML form data encoded as `application/x-www-form-urlencoded`.

Neither middleware processes uploaded files from `multipart/form-data`. We will use Multer for those requests later.

The body-size limits help prevent clients from sending unnecessarily large JSON or URL-encoded request bodies.

### Setting up the session middleware

We will reuse session-based authentication from Workshop 4. This is appropriate for our first browser-based API because the frontend and backend will initially be served from the same Express application.

Create `middleware/session.js`:

```javascript
import session from "express-session";

if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is required.");
}

const sessionMiddleware = session({
    name: "sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24
    }
});

export default sessionMiddleware;
```

Let's understand the important options:

- `name` defines the cookie name used for the session identifier.
- `secret` is used to sign the session cookie.
- `resave: false` avoids saving an unchanged session unnecessarily.
- `saveUninitialized: false` avoids creating sessions that have not been modified.
- `httpOnly: true` prevents browser-side JavaScript from reading the cookie.
- `sameSite: "lax"` provides an additional defence against some cross-site requests.
- `secure` tells the browser to send the cookie only over HTTPS in production.
- `maxAge` defines how long the cookie remains valid.

The default in-memory session store is suitable for local learning only. It is not designed for production workloads and does not share sessions between multiple server instances. A deployed application should use a persistent session store.

When deploying behind a trusted reverse proxy that terminates HTTPS, Express may need an appropriate `trust proxy` configuration so that secure cookies are handled correctly. Do not enable trust for arbitrary proxies; configure it according to the actual deployment environment.

### Configuring CSRF protection for API requests

Because our browser uses cookies for authentication, the browser automatically attaches the session cookie to requests sent to our application. This means we must continue protecting state-changing requests against Cross-Site Request Forgery (CSRF), as we learned in Workshop 2 and Workshop 4.

The API frontend will send the CSRF token in a custom HTTP header named `X-CSRF-Token`.

Create `middleware/csrf.js`:

```javascript
import { csrfSync } from "csrf-sync";

const {
    generateToken,
    csrfSynchronisedProtection
} = csrfSync({
    getTokenFromRequest: (req) => req.headers["x-csrf-token"]
});

export {
    generateToken,
    csrfSynchronisedProtection
};
```

The CSRF middleware stores its token in the current session and checks the token sent by the client. We use a request header because our frontend will send JSON and multipart requests rather than traditional form submissions containing a hidden field.

We will create a GET endpoint that provides a token to the frontend. The frontend must include that token in every state-changing request that uses the session cookie.

## Understanding API Authentication and Authorization

Before building the protected endpoints, let's connect the API architecture to the authentication and authorization concepts from Workshop 4.

**Authentication** answers the question: who is making the request?

**Authorization** answers the question: is this user allowed to perform the requested operation?

For example, an organiser can be authenticated and still be forbidden from editing another organiser's event.

The fact that a request reaches a protected API endpoint does not mean that the user is allowed to access every resource.

### Creating authentication middleware

Create `middleware/requireAuth.js`:

```javascript
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            message: "Authentication is required."
        });
    }

    req.user = req.session.user;
    next();
}

export default requireAuth;
```

This middleware checks whether the session contains an authenticated user.

If the user is not logged in, the API returns `401 Unauthorized` as JSON. Unlike a server-rendered application, we do not redirect an API client to an HTML login page. The frontend can decide how to respond to the error.

If the user is authenticated, we make the user information available through `req.user` and call `next()`.

### Creating event ownership middleware

We will also create middleware that retrieves an event only when it belongs to the authenticated user.

Create `middleware/requireEventOwner.js`:

```javascript
import prisma from "../db/prisma.js";

async function requireEventOwner(req, res, next) {
    const eventId = Number(req.params.eventId);

    if (!Number.isSafeInteger(eventId) || eventId <= 0) {
        return res.status(404).json({
            message: "Event not found."
        });
    }

    const event = await prisma.event.findFirst({
        where: {
            id: eventId,
            organizerId: req.user.id
        },
        include: {
            cover: true
        }
    });

    if (!event) {
        return res.status(404).json({
            message: "Event not found."
        });
    }

    req.event = event;
    next();
}

export default requireEventOwner;
```

This middleware checks two conditions:

- The requested event ID must exist.
- The event must belong to the authenticated user.

If either condition fails, we return `404 Not Found`.

Returning the same response for a missing event and an event owned by another user avoids confirming that another user's private event exists.

Notice that we use the user ID from the session, not a user ID supplied by the browser. The server must determine ownership using trusted authentication information.

## Creating Authentication API Routes

Now that the session and CSRF middleware are ready, we can create API endpoints for registration, login, logout, and retrieving the current user.

These endpoints will use the same authentication principles from Workshop 4. The main difference is that they return JSON responses instead of rendering EJS templates.

Create `routes/auth.js`:

```javascript
import express from "express";
import argon2 from "argon2";
import { body, validationResult } from "express-validator";

import prisma from "../db/prisma.js";
import requireAuth from "../middleware/requireAuth.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";

const router = express.Router();

function sendValidationErrors(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed.",
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }))
        });
    }

    next();
}

function regenerateSession(req) {
    return new Promise((resolve, reject) => {
        req.session.regenerate(error => {
            if (error) reject(error);
            else resolve();
        });
    });
}

function saveSession(req) {
    return new Promise((resolve, reject) => {
        req.session.save(error => {
            if (error) reject(error);
            else resolve();
        });
    });
}

router.post(
    "/register",
    csrfSynchronisedProtection,
    body("username")
        .isString()
        .bail()
        .trim()
        .isLength({ min: 3, max: 25 })
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("Username must be 3–25 characters and contain only letters, numbers, and underscores."),
    body("email")
        .isString()
        .bail()
        .trim()
        .isEmail()
        .withMessage("Enter a valid email address.")
        .normalizeEmail(),
    body("password")
        .isString()
        .bail()
        .isLength({ min: 12 })
        .withMessage("Password must contain at least 12 characters."),
    sendValidationErrors,
    async (req, res) => {
        const username = req.body.username;
        const email = req.body.email;
        const passwordHash = await argon2.hash(req.body.password, {
            type: argon2.argon2id
        });

        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true
            }
        });

        res.status(201).json({
            message: "Account created successfully.",
            data: { user }
        });
    }
);

router.post(
    "/login",
    csrfSynchronisedProtection,
    body("email").isString().bail().trim().isEmail().normalizeEmail(),
    body("password").isString().bail().notEmpty(),
    sendValidationErrors,
    async (req, res) => {
        const user = await prisma.user.findUnique({
            where: { email: req.body.email }
        });

        if (!user || !(await argon2.verify(user.passwordHash, req.body.password))) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Regenerate the session ID after authentication.
        await regenerateSession(req);

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        await saveSession(req);

        res.json({
            message: "Login successful.",
            data: {
                user: req.session.user
            }
        });
    }
);

router.get("/me", requireAuth, (req, res) => {
    res.json({
        data: {
            user: req.user
        }
    });
});

router.post("/logout", requireAuth, csrfSynchronisedProtection, (req, res, next) => {
    req.session.destroy(error => {
        if (error) return next(error);

        res.clearCookie("sid", {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        res.json({
            message: "Logout successful."
        });
    });
});

export default router;
```

Let's understand the important parts.

### Registration

The registration route receives a username, email address, and password.

We validate the submitted values using `express-validator`. If validation fails, we return a `400 Bad Request` response containing the validation errors as JSON.

If the information is valid, we hash the password using Argon2id and create the user through Prisma.

Notice that the response uses Prisma's `select` option to return only the fields the client needs. We never return the password hash.

If the username or email already exists, Prisma will return a unique-constraint error. We will handle this in our central error handler later and return `409 Conflict`.

### Login

The login route finds the user using the submitted email address and verifies the password against the stored hash.

If the credentials are invalid, we return the same error message whether the email does not exist or the password is incorrect. This avoids revealing which email addresses are registered.

After successful verification, we regenerate the session ID and store the authenticated user's information in the new session.

Regenerating the session ID after login helps protect against session fixation attacks, as we learned in Workshop 4.

One important detail: regenerating the session creates a new session, so the browser should request a fresh CSRF token after login.

### Logout

The logout route destroys the current session and clears the session cookie.

We use POST because logging out changes the application's authentication state. Since our API uses cookie-based authentication, the request is also protected by CSRF middleware.

### Providing a CSRF token

We need one endpoint that allows the frontend to obtain a CSRF token before sending state-changing requests.

We will add this endpoint when configuring `app.js`:

```javascript
app.get("/api/csrf-token", (req, res) => {
    res.json({
        data: {
            csrfToken: generateToken(req)
        }
    });
});
```

The frontend will request this endpoint and keep the returned token in JavaScript memory. It will include the token in the `X-CSRF-Token` header when sending POST, PUT, PATCH, or DELETE requests.

## Building the Event API

Now that users can authenticate, we can create the endpoints for managing events.

We will create a router that handles event collections and individual events.

Create `routes/events.js`:

```javascript
import express from "express";
import { body, param, validationResult } from "express-validator";

import prisma from "../db/prisma.js";
import requireAuth from "../middleware/requireAuth.js";
import requireEventOwner from "../middleware/requireEventOwner.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";

const router = express.Router();

const categories = [
    "TECHNOLOGY",
    "EDUCATION",
    "ART",
    "COMMUNITY",
    "SPORTS",
    "OTHER"
];

function checkValidation(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed.",
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }))
        });
    }

    next();
}

function toEventResponse(event) {
    return {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startsAt: event.startsAt,
        category: event.category,
        status: event.status,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        organizer: event.organizer,
        coverUrl: event.cover ? `/api/events/${event.id}/cover` : null
    };
}

// GET /api/events
// Retrieve published events and, when logged in, the current user's own events.
router.get("/", async (req, res) => {
    const pageValue = Number(req.query.page ?? 1);
    const limitValue = Number(req.query.limit ?? 10);

    if (
        !Number.isInteger(pageValue) || pageValue < 1 ||
        !Number.isInteger(limitValue) || limitValue < 1
    ) {
        return res.status(400).json({
            message: "Page and limit must be positive integers."
        });
    }

    const page = pageValue;
    const limit = Math.min(limitValue, 50);
    const skip = (page - 1) * limit;

    const search = typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const category = typeof req.query.category === "string"
        ? req.query.category
        : undefined;

    if (category && !categories.includes(category)) {
        return res.status(400).json({
            message: "Invalid event category."
        });
    }

    const visibilityFilter = req.session.user
        ? {
            OR: [
                { status: "PUBLISHED" },
                { organizerId: req.session.user.id }
            ]
        }
        : { status: "PUBLISHED" };

    const where = {
        ...visibilityFilter,
        ...(search && {
            title: {
                contains: search,
                mode: "insensitive"
            }
        }),
        ...(category && { category })
    };

    const [events, total] = await prisma.$transaction([
        prisma.event.findMany({
            where,
            skip,
            take: limit,
            orderBy: { startsAt: "asc" },
            include: {
                organizer: {
                    select: { id: true, username: true }
                },
                cover: true
            }
        }),
        prisma.event.count({ where })
    ]);

    res.json({
        message: "Events retrieved successfully.",
        data: {
            events: events.map(toEventResponse),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    });
});

// GET /api/events/:eventId
// Retrieve one published event or an event owned by the current user.
router.get(
    "/:eventId",
    param("eventId").isInt({ min: 1 }).toInt(),
    checkValidation,
    async (req, res) => {
        const eventId = req.params.eventId;

        const event = await prisma.event.findFirst({
            where: {
                id: eventId,
                ...(req.session.user
                    ? {
                        OR: [
                            { status: "PUBLISHED" },
                            { organizerId: req.session.user.id }
                        ]
                    }
                    : { status: "PUBLISHED" })
            },
            include: {
                organizer: {
                    select: { id: true, username: true }
                },
                cover: true
            }
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found."
            });
        }

        res.json({
            data: { event: toEventResponse(event) }
        });
    }
);

// POST /api/events
// Create an event for the authenticated organiser.
router.post(
    "/",
    requireAuth,
    csrfSynchronisedProtection,
    body("title").isString().bail().trim().isLength({ min: 3, max: 120 })
        .withMessage("Title must contain between 3 and 120 characters."),
    body("description").isString().bail().trim().isLength({ min: 10, max: 3000 })
        .withMessage("Description must contain between 10 and 3000 characters."),
    body("location").isString().bail().trim().isLength({ min: 2, max: 160 })
        .withMessage("Location must contain between 2 and 160 characters."),
    body("startsAt").isISO8601().toDate()
        .withMessage("Provide a valid event date and time."),
    body("category").optional().isIn(categories)
        .withMessage("Choose a valid event category."),
    body("status").optional().isIn(["DRAFT", "PUBLISHED"])
        .withMessage("Choose a valid event status."),
    checkValidation,
    async (req, res) => {
        const event = await prisma.event.create({
            data: {
                title: req.body.title,
                description: req.body.description,
                location: req.body.location,
                startsAt: req.body.startsAt,
                category: req.body.category ?? "OTHER",
                status: req.body.status ?? "DRAFT",
                organizerId: req.user.id
            },
            include: {
                organizer: {
                    select: { id: true, username: true }
                },
                cover: true
            }
        });

        res.status(201).json({
            message: "Event created successfully.",
            data: { event: toEventResponse(event) }
        });
    }
);

// PATCH /api/events/:eventId
// Update selected fields of an event owned by the authenticated organiser.
router.patch(
    "/:eventId",
    requireAuth,
    csrfSynchronisedProtection,
    param("eventId").isInt({ min: 1 }).toInt(),
    body("title").optional().isString().bail().trim().isLength({ min: 3, max: 120 }),
    body("description").optional().isString().bail().trim().isLength({ min: 10, max: 3000 }),
    body("location").optional().isString().bail().trim().isLength({ min: 2, max: 160 }),
    body("startsAt").optional().isISO8601().toDate(),
    body("category").optional().isIn(categories),
    body("status").optional().isIn(["DRAFT", "PUBLISHED"]),
    checkValidation,
    requireEventOwner,
    async (req, res) => {
        const allowedFields = [
            "title",
            "description",
            "location",
            "startsAt",
            "category",
            "status"
        ];

        const data = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                data[field] = req.body[field];
            }
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).json({
                message: "Provide at least one field to update."
            });
        }

        const event = await prisma.event.update({
            where: { id: req.event.id },
            data,
            include: {
                organizer: {
                    select: { id: true, username: true }
                },
                cover: true
            }
        });

        res.json({
            message: "Event updated successfully.",
            data: { event: toEventResponse(event) }
        });
    }
);

// DELETE /api/events/:eventId
router.delete(
    "/:eventId",
    requireAuth,
    csrfSynchronisedProtection,
    param("eventId").isInt({ min: 1 }).toInt(),
    checkValidation,
    requireEventOwner,
    async (req, res) => {
        const previousStorageName = req.event.cover?.storageName;

        await prisma.event.delete({
            where: { id: req.event.id }
        });

        // The database record is gone; now remove the associated file if one existed.
        if (previousStorageName) {
            try {
                await deleteEventCoverFile(previousStorageName);
            } catch (error) {
                console.error("Could not remove deleted event cover:", error);
            }
        }

        res.status(204).end();
    }
);

export default router;
```

Let's understand the most important parts of these routes.

### Retrieving events

The GET collection route retrieves events using `findMany()`.

We support three query parameters:

- `search` filters events by title.
- `category` filters events by category.
- `page` and `limit` control pagination.

For example:

```text
GET /api/events?search=robotics&category=EDUCATION&page=1&limit=10
```

The `skip` and `take` options allow Prisma to retrieve only the records needed for the requested page. We also retrieve the total number of matching events so that the frontend can display pagination controls.

Notice that the query only returns published events to visitors. When an authenticated organiser makes the request, the API also includes that organiser's own events, including drafts.

This is an example of applying authorization rules while retrieving a collection, not only when updating or deleting a resource.

### Creating an event

The POST route validates the event information and creates the event using Prisma.

The most important detail is:

```javascript
organizerId: req.user.id
```

We get the organiser ID from the authenticated session. We do not accept an `organizerId` from the request body because a client must not be allowed to choose another user as the owner of a resource.

### Updating an event

The PATCH route uses `requireEventOwner` before updating the database.

This ensures that the event belongs to the authenticated user.

We also construct the `data` object using only the allowed fields. This prevents clients from changing properties such as `id`, `organizerId`, or internal database fields by adding them to the JSON request.

### Deleting an event

The DELETE route checks ownership and then deletes the event.

It returns `204 No Content` because the operation succeeded and the client does not need a response body.

The event's cover metadata is deleted automatically because the Prisma relationship uses `onDelete: Cascade`. We will still need to remove the actual file from storage. We will handle that carefully when we add the media routes.

## Connecting the API Routes

Now that we have created the authentication and event routers, we need to mount them in our Express application.

Open `app.js`:

```javascript
import "dotenv/config";
import express from "express";
import path from "node:path";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import multer from "multer";

import sessionMiddleware from "./middleware/session.js";
import { generateToken } from "./middleware/csrf.js";
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(helmet());

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));

app.use(sessionMiddleware);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please try again later."
    }
});

app.use("/api", apiLimiter);

app.get("/api/csrf-token", (req, res) => {
    res.json({
        data: {
            csrfToken: generateToken(req)
        }
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

const publicDirectory = path.resolve("public");
app.use(express.static(publicDirectory, { index: false }));

app.get("/", (req, res) => {
    res.sendFile(path.join(publicDirectory, "index.html"));
});

app.use("/api", (req, res) => {
    res.status(404).json({
        message: "API endpoint not found."
    });
});

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error.code === "EBADCSRFTOKEN") {
        return res.status(403).json({
            message: "Invalid or missing CSRF token. Refresh the page and try again."
        });
    }

    if (error.code === "P2002") {
        return res.status(409).json({
            message: "A record with one of these values already exists."
        });
    }

    if (error instanceof multer.MulterError) {
        const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        return res.status(status).json({
            message: status === 413
                ? "The uploaded file is too large."
                : "The upload request could not be processed."
        });
    }

    if (error.code === "UNSUPPORTED_FILE_TYPE" || error.code === "INVALID_FILE_CONTENT") {
        return res.status(415).json({
            message: error.message
        });
    }

    const clientErrorStatus = error.status ?? error.statusCode;

    if (
        Number.isInteger(clientErrorStatus) &&
        clientErrorStatus >= 400 &&
        clientErrorStatus < 500
    ) {
        return res.status(clientErrorStatus).json({
            message: error.message
        });
    }

    console.error(error);

    res.status(500).json({
        message: "Something went wrong on the server."
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
```

Let's understand the middleware order.

1. `helmet()` adds several security-related HTTP headers.
2. `express.json()` and `express.urlencoded()` parse the request formats they support.
3. The session middleware makes session information available to later middleware and routes.
4. The rate limiter restricts repeated requests to the API.
5. The CSRF-token endpoint provides a token to the frontend.
6. The authentication and event routers handle API requests.
7. Static middleware serves the frontend files.
8. The API 404 handler responds when an API endpoint does not exist.
9. The error handler returns a consistent JSON response for unexpected errors.

Middleware order matters. For example, session middleware must run before routes that access `req.session`, and body parsers must run before routes that read JSON or URL-encoded request bodies.

Express 5 forwards rejected promises from asynchronous route handlers to error-handling middleware automatically. This is why our async route handlers can use `await` without wrapping every route in a separate try/catch block. We still need explicit handling when we want to return a particular response or clean up a partially completed operation.

Our session configuration uses the default in-memory store, which is only suitable for local development. A production application must use a persistent session store. We will discuss distributed storage when we introduce Redis later in this workshop.

## Uploading Files Through an API

In Workshop 5, we learned how to receive files through traditional HTML forms using `multipart/form-data` and Multer.

The same format can be used when sending files through an API. The difference is that JavaScript creates the request using the browser's `FormData` object instead of relying on a normal form submission.

For our Event Board, organisers can upload a cover image for their events.

We will reuse the security principles from Workshop 5:

- Store uploaded files outside the public directory.
- Generate storage names on the server rather than trusting the original filename.
- Apply file-size and file-count limits.
- Use the browser-provided MIME type only as an early filter.
- Inspect the actual file signature before accepting the image.
- Check authentication and event ownership before processing the upload.
- Keep file metadata in PostgreSQL and file contents in the filesystem.

### Creating the storage directory

Create the directory where event cover images will be stored:

```bash
mkdir -p storage/event-covers
```

Our uploaded files will be stored outside `public`, so they cannot be accessed simply by guessing a static URL.

### Configuring Multer

Create `middleware/upload.js`:

```javascript
import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

export const coverDirectory = path.resolve("storage", "event-covers");

mkdirSync(coverDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, coverDirectory);
    },
    filename: (req, file, callback) => {
        callback(null, randomUUID());
    }
});

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
]);

const coverUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
        fields: 0,
        parts: 1
    },
    fileFilter: (req, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            const error = new Error("Only JPEG, PNG, and WebP images are accepted.");
            error.code = "UNSUPPORTED_FILE_TYPE";
            return callback(error);
        }

        callback(null, true);
    }
}).single("cover");

export default coverUpload;
```

Let's understand the configuration.

### Disk storage

We use `multer.diskStorage()` to save incoming files to the `storage/event-covers` directory.

The filename is generated using `randomUUID()`. This means we do not use the filename supplied by the user as the storage name.

At this point, the file does not have an extension. We will inspect its contents after Multer has stored it and then assign an extension based on the detected file format.

### File filtering

The `fileFilter` checks the MIME type supplied by the browser and rejects file types outside our allowed list.

However, `file.mimetype` is provided by the client. It can be changed, so it is not proof that the file really contains an image.

We use this check as an early filter only. The actual file contents will be inspected after upload.

### Upload limits

We allow one cover image with a maximum size of 5 MB.

The `files`, `fields`, and `parts` limits restrict the structure of the multipart request. These limits help prevent unnecessarily large or complex requests from consuming server resources.

Multer should be attached only to routes that are expected to accept files. Do not register unrestricted Multer middleware globally.

### Inspecting the actual file contents

Install and use the `file-type` package to inspect the uploaded file's binary signature.

Create `utils/mediaStorage.js`:

```javascript
import { randomUUID } from "node:crypto";
import { rename, unlink } from "node:fs/promises";
import path from "node:path";
import { fileTypeFromFile } from "file-type";

import prisma from "../db/prisma.js";
import { coverDirectory } from "../middleware/upload.js";

const allowedTypes = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"]
]);

async function removeFile(filePath) {
    try {
        await unlink(filePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
}

function safeOriginalName(originalName) {
    const name = originalName.replaceAll("\\", "/").split("/").pop();
    return name.slice(0, 180);
}

export async function saveEventCover(file, eventId) {
    let finalPath;

    try {
        const detectedType = await fileTypeFromFile(file.path);
        const extension = allowedTypes.get(detectedType?.mime);

        if (!detectedType || !extension) {
            const error = new Error("The uploaded file is not a supported image.");
            error.status = 415;
            error.code = "INVALID_FILE_CONTENT";
            throw error;
        }

        const storageName = `${randomUUID()}.${extension}`;
        finalPath = path.join(coverDirectory, storageName);

        await rename(file.path, finalPath);

        const previousAsset = await prisma.mediaAsset.findUnique({
            where: { eventId }
        });

        const asset = await prisma.mediaAsset.upsert({
            where: { eventId },
            create: {
                storageName,
                originalName: safeOriginalName(file.originalname),
                mimeType: detectedType.mime,
                sizeBytes: file.size,
                eventId
            },
            update: {
                storageName,
                originalName: safeOriginalName(file.originalname),
                mimeType: detectedType.mime,
                sizeBytes: file.size
            }
        });

        // The database now points to the new file. Remove the previous file afterwards.
        if (previousAsset) {
            const previousPath = path.join(
                coverDirectory,
                path.basename(previousAsset.storageName)
            );

            try {
                await removeFile(previousPath);
            } catch (cleanupError) {
                console.error("Could not remove the previous cover image:", cleanupError);
            }
        }

        return asset;
    } catch (error) {
        const pathsToRemove = [file.path, finalPath].filter(Boolean);

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

export async function deleteEventCoverFile(storageName) {
    const safeName = path.basename(storageName);

    if (safeName !== storageName) {
        throw new Error("Invalid storage name.");
    }

    await removeFile(path.join(coverDirectory, safeName));
}
```

Let's understand the important steps.

First, `fileTypeFromFile()` inspects the file contents and attempts to identify the actual format. We only accept JPEG, PNG, and WebP.

If the detected MIME type is not in our allowlist, we reject the upload. We do not rely on the extension or MIME type supplied by the browser.

File-signature detection is a useful verification step, but it is not a guarantee that a file is harmless or fully valid. The application still needs size limits, safe storage, controlled file delivery, and appropriate image processing where required.

Next, we generate a new storage name using a random UUID and an extension derived from the verified format. The original filename is retained only as metadata, after removing path components and limiting its length.

We then create or update the `MediaAsset` record. The database stores the file's generated storage name, original name, verified MIME type, size, and event relationship.

Notice that we replace the database record before removing the previous file. If the database update fails, the previous cover remains available. If the file cleanup fails after the database update, the new cover still works, although an unused old file may remain and require cleanup.

This demonstrates an important point from Workshop 5: the filesystem and database are separate resources. A database transaction cannot automatically roll back a filesystem operation, so we need deliberate cleanup and recovery logic.

### Creating the cover upload route

At the top of `routes/events.js`, add the upload and storage imports:

```javascript
import coverUpload from "../middleware/upload.js";
import { saveEventCover, deleteEventCoverFile } from "../utils/mediaStorage.js";
import { coverDirectory } from "../middleware/upload.js";
import path from "node:path";
import prisma from "../db/prisma.js";
```

Keep the existing imports for Express, validators, authentication middleware, and CSRF protection. Do not add a second import of `prisma` if it is already present in the file.

Insert the following routes into `routes/events.js` before `export default router;`:

```javascript
// PUT /api/events/:eventId/cover
// Upload or replace the cover image for an event owned by the current user.
router.put(
    "/:eventId/cover",
    requireAuth,
    param("eventId").isInt({ min: 1 }).toInt(),
    checkValidation,
    requireEventOwner,
    csrfSynchronisedProtection,
    coverUpload,
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                message: "Select an image to upload."
            });
        }

        const asset = await saveEventCover(req.file, req.event.id);

        res.status(200).json({
            message: "Event cover uploaded successfully.",
            data: {
                cover: {
                    id: asset.id,
                    mimeType: asset.mimeType,
                    sizeBytes: asset.sizeBytes,
                    url: `/api/events/${req.event.id}/cover`
                }
            }
        });
    }
);

// DELETE /api/events/:eventId/cover
router.delete(
    "/:eventId/cover",
    requireAuth,
    csrfSynchronisedProtection,
    param("eventId").isInt({ min: 1 }).toInt(),
    checkValidation,
    requireEventOwner,
    async (req, res) => {
        if (!req.event.cover) {
            return res.status(404).json({
                message: "This event does not have a cover image."
            });
        }

        const storageName = req.event.cover.storageName;

        await prisma.mediaAsset.delete({
            where: { eventId: req.event.id }
        });

        try {
            await deleteEventCoverFile(storageName);
        } catch (error) {
            console.error("Could not remove deleted cover file:", error);
        }

        res.status(204).end();
    }
);
```

The important part is the order of the middleware.

1. `requireAuth` verifies that the user is logged in.
2. The event ID is validated.
3. `requireEventOwner` confirms that the user owns the event.
4. CSRF middleware validates the request header.
5. Multer processes the multipart upload.
6. The route handler verifies the file contents and stores the metadata.

We check authentication and ownership before Multer processes the upload. This prevents unauthorised users from making the application store files for events they do not own.

We also validate the CSRF token before Multer runs because our token is sent in an HTTP header. This avoids writing a file to disk before rejecting a request with an invalid token.

The DELETE route removes the database record and then attempts to remove the corresponding file. If filesystem cleanup fails, the database no longer references the file, but an unused file may remain. In a production application, a background cleanup process can identify and remove such orphaned files.

### Serving the event cover image

Our storage directory is private, so we need an API endpoint that checks access before sending a cover image.

Add the following route to `routes/events.js`:

```javascript
// GET /api/events/:eventId/cover
router.get(
    "/:eventId/cover",
    param("eventId").isInt({ min: 1 }).toInt(),
    checkValidation,
    async (req, res) => {
        const event = await prisma.event.findUnique({
            where: { id: req.params.eventId },
            include: {
                cover: true
            }
        });

        if (!event || !event.cover) {
            return res.status(404).json({
                message: "Cover image not found."
            });
        }

        const isOwner = req.session.user?.id === event.organizerId;
        const isPublic = event.status === "PUBLISHED";

        if (!isPublic && !isOwner) {
            return res.status(404).json({
                message: "Cover image not found."
            });
        }

        const storageName = path.basename(event.cover.storageName);

        if (storageName !== event.cover.storageName) {
            return res.status(404).json({
                message: "Cover image not found."
            });
        }

        const filePath = path.join(coverDirectory, storageName);

        res.set("X-Content-Type-Options", "nosniff");
        res.set("Cache-Control", isPublic ? "public, max-age=300" : "private, no-store");
        res.type(event.cover.mimeType);
        res.sendFile(filePath, error => {
            if (error && !res.headersSent) {
                res.status(error.statusCode === 404 ? 404 : 500).end();
            }
        });
    }
);
```

This route allows anyone to retrieve the cover of a published event. A draft event's cover is only available to its organiser.

Notice that we do not accept a filesystem path from the URL. We retrieve the database record, use the generated storage name, and verify it with `path.basename()` before constructing the path.

The response uses the MIME type detected during upload and sets `X-Content-Type-Options: nosniff`. We also use different cache policies for public and private event images.

## Uploading Files from the Browser with FormData

The backend upload route is ready. Now we need to understand how JavaScript sends a file through an API.

When a user selects a file using an HTML file input, JavaScript can access the selected file through the input element's `files` property.

The browser provides the `FormData` object to construct a multipart request containing text fields and files.

### Creating FormData

For example:

```javascript
const formData = new FormData();
formData.append("cover", fileInput.files[0]);
```

Here, we create a `FormData` object and append the selected file using the field name `cover`.

The field name must match the name expected by Multer:

```javascript
.single("cover")
```

This is important because Multer uses the field name to identify the uploaded file.

### Sending the upload request

We can send the file using Fetch:

```javascript
const response = await fetch(`/api/events/${eventId}/cover`, {
    method: "PUT",
    body: formData,
    headers: {
        "X-CSRF-Token": csrfToken
    }
});

const result = await response.json();
```

Notice that we do not set the `Content-Type` header manually.

The browser automatically sets the correct `multipart/form-data` content type and includes the boundary that separates the parts of the request. If we set the header ourselves without the boundary, the server may not be able to parse the request correctly.

We also include the CSRF token in the custom header because this application uses cookie-based session authentication.

The browser sends same-origin cookies automatically with Fetch's default credentials behavior. If the frontend and API are later hosted on different origins, we will need to configure credentials and CORS correctly.

## Working with the Fetch API

Now that we understand how to send JSON data and files, let's explore Fetch in more detail.

Fetch is a browser API that allows JavaScript to make HTTP requests and process HTTP responses.

It returns a Promise that resolves to a `Response` object when the server responds.

### Sending a GET request

To retrieve the events:

```javascript
const response = await fetch("/api/events");
const result = await response.json();

console.log(result.data.events);
```

We use `response.json()` to read the response body and parse it as JSON.

### Sending JSON data

When we want to create an event, we send a POST request containing JSON:

```javascript
const response = await fetch("/api/events", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken
    },
    body: JSON.stringify({
        title: "Introduction to Robotics",
        description: "A practical robotics workshop for beginners.",
        location: "Community Technology Center",
        startsAt: "2027-03-20T09:00:00.000Z",
        category: "EDUCATION",
        status: "PUBLISHED"
    })
});

const result = await response.json();
```

Here, `JSON.stringify()` converts a JavaScript object into a JSON string. We also set the `Content-Type` header to tell the server that the request body contains JSON.

The CSRF header is required because creating an event changes application data and our authentication uses cookies.

### Understanding response.ok

An important detail about Fetch is that it does not automatically reject its Promise when the server returns an HTTP error status such as `400`, `401`, `404`, or `500`.

The Promise normally resolves as long as the browser successfully receives an HTTP response.

Therefore, we need to check `response.ok`:

```javascript
const response = await fetch("/api/events");

if (!response.ok) {
    throw new Error("Could not retrieve events.");
}

const result = await response.json();
```

The `response.ok` property is `true` for successful HTTP status codes in the 200–299 range and `false` for other status codes.

We should also remember that not every successful response contains JSON. For example, our DELETE endpoint returns `204 No Content`. Calling `response.json()` on an empty response body would cause an error.

### Creating a reusable API helper

As our frontend grows, we do not want to repeat the same response and error handling logic in every request.

We can create a helper function that handles JSON responses consistently.

Create `public/js/api.js`:

```javascript
let csrfToken = null;

export async function refreshCsrfToken() {
    const response = await fetch("/api/csrf-token");
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message ?? "Could not obtain a CSRF token.");
    }

    csrfToken = result.data.csrfToken;
}

export async function apiRequest(url, options = {}) {
    const headers = new Headers(options.headers ?? {});

    const method = (options.method ?? "GET").toUpperCase();
    const changesData = !["GET", "HEAD", "OPTIONS"].includes(method);

    if (changesData && csrfToken) {
        headers.set("X-CSRF-Token", csrfToken);
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: "same-origin"
    });

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const result = contentType.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
        const error = new Error(
            result?.message ?? `Request failed with status ${response.status}.`
        );

        error.status = response.status;
        error.details = result?.errors ?? [];
        throw error;
    }

    return result;
}
```

The helper adds the CSRF header to state-changing requests, checks the HTTP response, handles empty `204` responses, and returns the parsed JSON data.

We keep the CSRF token in JavaScript memory. We do not need to place it in localStorage. The session cookie is managed by the browser and is marked HttpOnly so that JavaScript cannot read it.

After a successful login, the server regenerates the session. The frontend should call `refreshCsrfToken()` again so that it receives a token associated with the new session.

For example:

```javascript
await apiRequest("/api/auth/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email: "organiser@example.com",
        password: "a-long-example-password"
    })
});

await refreshCsrfToken();
```

The token refresh is necessary because the old anonymous session was replaced during login.

## Updating the DOM Using API Responses

The API now returns data, but the user still needs to see that information.

JavaScript can use the returned JSON objects to create or update HTML elements.

For example, imagine that our page contains an empty container:

```html
<section>
    <h2>Upcoming Events</h2>
    <div id="events-list"></div>
</section>
```

We can retrieve the events and display them inside this container.

### Rendering event cards

Create a file named `public/js/events.js`:

```javascript
import { apiRequest } from "./api.js";

const eventsList = document.querySelector("#events-list");

function createEventCard(event) {
    const article = document.createElement("article");
    article.className = "event-card";

    const title = document.createElement("h3");
    title.textContent = event.title;

    const description = document.createElement("p");
    description.textContent = event.description;

    const location = document.createElement("p");
    location.textContent = event.location;

    const date = document.createElement("time");
    date.dateTime = event.startsAt;
    date.textContent = new Date(event.startsAt).toLocaleString();

    article.append(title, description, location, date);

    if (event.coverUrl) {
        const image = document.createElement("img");
        image.src = event.coverUrl;
        image.alt = `Cover image for ${event.title}`;
        article.prepend(image);
    }

    return article;
}

export async function loadEvents() {
    eventsList.textContent = "Loading events...";

    try {
        const result = await apiRequest("/api/events");
        eventsList.replaceChildren();

        if (result.data.events.length === 0) {
            eventsList.textContent = "No events are available yet.";
            return;
        }

        for (const event of result.data.events) {
            eventsList.append(createEventCard(event));
        }
    } catch (error) {
        eventsList.textContent = error.message;
    }
}
```

Let's understand what happens here.

First, we retrieve the list using `apiRequest()`. We then loop through the returned event objects and create an HTML card for each event.

We use `textContent` when inserting user-provided text. This treats the value as text instead of HTML and helps avoid inserting untrusted markup into the page.

If the event has a cover image, we create an `<img>` element and set its `src` to the cover API endpoint.

We also display a loading message while the request is being processed and an appropriate message when there are no events or the request fails.

### Connecting the interface

Create `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Board</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header>
        <h1>Event Board</h1>
        <p>Discover events and share what is happening in your community.</p>
    </header>

    <main>
        <section>
            <h2>Upcoming Events</h2>
            <div id="events-list" aria-live="polite"></div>
        </section>
    </main>

    <script type="module" src="/js/main.js"></script>
</body>
</html>
```

Create `public/js/main.js`:

```javascript
import { refreshCsrfToken } from "./api.js";
import { loadEvents } from "./events.js";

async function startApplication() {
    try {
        await refreshCsrfToken();
        await loadEvents();
    } catch (error) {
        document.querySelector("#events-list").textContent = error.message;
    }
}

startApplication();
```

The frontend is now a static HTML page. Express serves the page and JavaScript files, while JavaScript communicates with the API to retrieve event information.

This is a small example of the API-driven approach. We will extend the interface with forms for login, event creation, editing, and image uploads as an exercise.

## CORS: Connecting a Frontend from Another Origin

So far, the frontend and backend are served by the same Express application. The browser requests the page and API from the same origin.

An **origin** is the combination of the protocol, hostname, and port.

For example:

```text
http://localhost:3000
http://localhost:5173
```

These URLs have different origins because they use different ports.

When JavaScript running on one origin tries to read a response from another origin, the browser applies the Cross-Origin Resource Sharing (CORS) rules.

CORS is a browser-enforced mechanism that uses HTTP response headers to decide whether frontend JavaScript is allowed to read a cross-origin response.

It is important to understand that CORS is not an authentication system and does not prevent all requests from reaching the server. Tools such as Postman and `curl` are not restricted by browser CORS enforcement.

### Configuring CORS in Express

Imagine that we move our frontend to a Vite development server running at `http://localhost:5173`, while the API remains at `http://localhost:3000`.

Install the CORS package if it is not already installed:

```bash
npm install cors
```

In `app.js`, import it:

```javascript
import cors from "cors";
```

Register the middleware before our API routes:

```javascript
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));
```

Here:

- `origin` specifies the frontend origin that is allowed to read responses.
- `credentials: true` allows the browser to include credentials, such as session cookies, in cross-origin requests.
- `allowedHeaders` lists the custom headers that the frontend is allowed to send.
- `methods` lists the HTTP methods supported by the API.

On the frontend, requests must include credentials:

```javascript
fetch("http://localhost:3000/api/events", {
    credentials: "include"
});
```

When using cookie-based authentication across origins, we must also configure cookie attributes correctly. Cross-site cookies generally require `SameSite=None; Secure`, which means HTTPS is required. We must continue using CSRF protection for state-changing requests.

Do not use `origin: "*"` together with credentialed requests. A credentialed CORS response must identify the allowed origin rather than allowing every origin.

For our main application, we will keep the frontend and API on the same origin. The separate-origin configuration is an additional setup we can use when we later introduce Vite or another independent frontend development server.

## API Rate Limiting

As an API gains more users, we need to protect it from excessive requests and abuse.

**Rate limiting** is the practice of restricting how many requests a client can make during a specific time window.

For example, we may want to:

- Limit repeated login attempts to make password guessing more difficult.
- Limit general API traffic to reduce unnecessary load.
- Apply stricter limits to expensive or sensitive operations.

Rate limiting is not a replacement for authentication or authorization. It is an additional protection that helps control request volume.

### Implementing rate limiting

We already installed `express-rate-limit`.

In `app.js`, we can create a general API limiter:

```javascript
import { rateLimit } from "express-rate-limit";

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please try again later."
    }
});

app.use("/api", apiLimiter);
```

This configuration allows up to 100 requests from a client during a 15-minute window. When the limit is exceeded, the middleware returns `429 Too Many Requests`.

The default store keeps counters in the server's memory. This is sufficient for a single local development process, but it is not shared between multiple application instances and its counters are lost when the process restarts.

### Applying a stricter limit to login

Authentication endpoints deserve additional protection because attackers may repeatedly attempt passwords.

Create `middleware/rateLimiters.js`:

```javascript
import { rateLimit } from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many login attempts. Please try again later."
    }
});
```

Then import it in `routes/auth.js`:

```javascript
import { loginLimiter } from "../middleware/rateLimiters.js";
```

Apply it to the login route:

```javascript
router.post(
    "/login",
    loginLimiter,
    csrfSynchronisedProtection,
    // validation and login handler...
);
```

The login endpoint is now subject to both the general API limit and the stricter login limit. The effective result is that a client must satisfy both limits.

The limits used here are examples for learning. Real applications should choose values based on their users, traffic, infrastructure, and operational requirements. When an application runs behind a reverse proxy, its proxy configuration must also be handled carefully so that the rate limiter receives the correct client IP address.

### Distributed rate limiting with Redis

The in-memory store is not appropriate when an application runs across several server instances. Each instance would maintain separate counters, so a client could make more requests by reaching different instances.

A shared store such as Redis allows multiple application instances to use the same rate-limit counters.

Redis is an in-memory data store commonly used for caching, sessions, queues, and other short-lived application data.

For a production deployment, we can configure `express-rate-limit` with a compatible Redis store. This is an additional infrastructure topic, so we will keep the main workshop implementation on the built-in memory store and treat Redis as an extension.

## Token-Based Authentication with JWT

So far, we have used sessions to authenticate API requests. This is a good choice for our browser-based application and allows us to reuse the authentication concepts from Workshop 4.

However, some API clients need to authenticate using a token that they send with each request. This is where **token-based authentication** becomes useful.

A common token format is the **JSON Web Token (JWT)**.

A JWT is a compact token containing claims. A signed JWT can be verified by the server to check that its contents have not been modified and that it was created by a trusted issuer.

A signed JWT is not encrypted by default. Anyone who obtains it can generally decode and read its payload, so we should never place passwords or other secrets inside it.

### How JWT authentication works

A typical access-token flow works as follows:

1. The client sends login credentials to the API.
2. The server verifies the credentials.
3. The server creates a signed access token containing claims such as the user's ID and expiration time.
4. The client receives the token.
5. The client sends the token with later requests, usually in the `Authorization` header using the `Bearer` scheme.
6. The server verifies the token before allowing access to protected endpoints.

For example:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

The server verifies the token's signature and claims. If verification succeeds, the API can identify the user associated with the token.

### Understanding the difference between sessions and JWT

| Session Authentication | JWT Authentication |
|---|---|
| The browser sends a session cookie. | The client sends a token, commonly in the Authorization header. |
| Session data is normally stored on the server when using `express-session`. | Claims are carried inside the signed token. |
| The server looks up the session using its identifier. | The server verifies the token's signature and claims. |
| Sessions can be destroyed centrally. | A self-contained access token usually remains valid until expiration unless a revocation mechanism is added. |
| Cookie-based authentication requires CSRF protection for state-changing requests. | A bearer token sent explicitly in an Authorization header is not automatically attached by the browser, but token storage and XSS risks must still be considered. |

Neither approach is universally better. Sessions are often a straightforward choice for browser applications. Tokens can be useful when different clients need to present credentials explicitly to an API.

JWT does not automatically make an application faster or more scalable. If a system needs immediate token revocation, it may require a denylist or another server-side mechanism, which introduces state again.

### Installing and configuring jsonwebtoken

We already installed `jsonwebtoken`. Create a helper named `utils/tokens.js`:

```javascript
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required.");
}

const ISSUER = "event-board-api";
const AUDIENCE = "event-board-clients";

export function createAccessToken(user) {
    return jwt.sign(
        {},
        process.env.JWT_SECRET,
        {
            algorithm: "HS256",
            subject: String(user.id),
            issuer: ISSUER,
            audience: AUDIENCE,
            expiresIn: "15m"
        }
    );
}

export function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: ISSUER,
        audience: AUDIENCE
    });
}
```

We use a short-lived access token and specify the allowed algorithm, issuer, and audience.

The token subject (`sub`) identifies the user. We do not include the user's password, password hash, or other sensitive information.

### Creating token authentication middleware

Create `middleware/requireBearerToken.js`:

```javascript
import { verifyAccessToken } from "../utils/tokens.js";

function requireBearerToken(req, res, next) {
    const authorization = req.get("Authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "A Bearer token is required."
        });
    }

    const token = authorization.slice("Bearer ".length);

    try {
        const payload = verifyAccessToken(token);
        const userId = Number(payload.sub);

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(401).json({
                message: "Invalid access token."
            });
        }

        req.userId = userId;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired access token."
        });
    }
}

export default requireBearerToken;
```

This middleware retrieves the Bearer token from the Authorization header and verifies it.

If the token is missing, invalid, or expired, the API returns `401 Unauthorized`.

If verification succeeds, the middleware makes the user ID available through `req.userId`.

In a real application, we would normally also load the user from the database and check that the account remains active before performing sensitive operations.

### Returning a token after login

To demonstrate token creation, we can add an alternative login handler that uses the same credential-verification logic as our session-based login route.

After finding the user and verifying the password, create a token:

```javascript
import { createAccessToken } from "../utils/tokens.js";

const accessToken = createAccessToken(user);

res.json({
    message: "Login successful.",
    data: {
        accessToken,
        tokenType: "Bearer",
        expiresIn: 900
    }
});
```

A client can then send the token with protected requests:

```javascript
const response = await fetch("/api/events", {
    headers: {
        "Authorization": `Bearer ${accessToken}`
    }
});
```

For this example, the client keeps the token in memory. We should not teach students to store authentication tokens in `localStorage` as the default production solution. JavaScript running on the same origin can read localStorage, so an XSS vulnerability could expose the token.

For browser applications, consider secure HttpOnly cookies or a Backend-for-Frontend architecture, and understand that cookie-based authentication brings CSRF considerations. For native mobile applications, use the platform's secure credential storage.

Also, do not mix session and token authentication accidentally. Choose one authentication strategy for a given protected route group and configure its middleware consistently.

## Testing Our API

Now that our API and frontend are connected, we need to test the endpoints independently and through the browser.

Testing the API independently is important because it helps us identify whether a problem comes from the backend or from the frontend JavaScript.

We can use Postman, Thunder Client, or `curl` to send requests directly to our API.

### Testing registration and login

Test the following scenarios:

- Register a new organiser.
- Try registering with an email address that already exists.
- Try registering with an invalid email address.
- Try registering with a password shorter than the required length.
- Log in with the correct credentials.
- Try logging in with an incorrect password.
- Retrieve the current user using `GET /api/auth/me`.
- Log out and try accessing the protected endpoint again.

When using Postman, make sure it stores and sends the session cookie. You must also obtain a CSRF token from `GET /api/csrf-token` and send it in the `X-CSRF-Token` header for state-changing requests.

### Testing event operations

After logging in, test the following operations:

- Create an event as a draft.
- Create a published event.
- Retrieve the event collection.
- Filter events using the search and category query parameters.
- Retrieve one event using its ID.
- Update an event using PATCH.
- Publish a draft event.
- Delete an event.
- Try creating an event with invalid data.

Also test the public behavior by making requests without logging in. Visitors should only receive published events.

### Testing authorization

Create two organiser accounts.

For example:

- Organiser A creates an event.
- Organiser B creates a different event.
- Organiser A tries to update Organiser B's event by changing the event ID in the URL.
- Organiser A tries to delete Organiser B's event.
- Organiser A tries to replace Organiser B's cover image.
- A visitor tries to retrieve a draft event.

The API should prevent these operations. It is not enough to hide edit and delete buttons in the frontend. The backend must enforce ownership on every operation.

### Testing file uploads

Test the cover upload endpoint:

- Upload a valid JPEG image.
- Upload a valid PNG image.
- Upload a valid WebP image.
- Try uploading a file larger than 5 MB.
- Try uploading a text file renamed to `.jpg`.
- Try uploading an unsupported image format.
- Try uploading a cover image to an event owned by another user.
- Replace an existing cover image and confirm that the old file is no longer referenced.
- Delete a cover image and verify that both its database record and file are removed.

The API should reject invalid files and prevent users from managing media belonging to other organisers.

### Testing with curl

For a simple public request, we can use:

```bash
curl http://localhost:3000/api/events
```

To retrieve one event:

```bash
curl http://localhost:3000/api/events/10
```

To create an event, use a JSON request body:

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Cookie: sid=YOUR_SESSION_COOKIE" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -d '{
    "title": "Introduction to Robotics",
    "description": "A practical robotics workshop for beginners.",
    "location": "Community Technology Center",
    "startsAt": "2027-03-20T09:00:00.000Z",
    "category": "EDUCATION",
    "status": "PUBLISHED"
  }'
```

In practice, Postman or Thunder Client is often easier for testing cookie-based authentication and CSRF tokens because they can maintain cookies between requests.

## Additional Considerations for API Development

Before moving to the exercises, let's review a few important practices that help make APIs safer and easier to maintain.

### Validate all client input

Never assume that the frontend sends valid information. A client can bypass browser-side validation and send requests directly to the API.

Validate route parameters, query parameters, JSON bodies, and uploaded files on the server.

### Never trust user ownership information from the client

Do not accept an owner ID from the request body when creating a user-owned resource. Use the authenticated user's identity from the session or verified token.

When retrieving, updating, or deleting resources, include the ownership condition in the database query or verify it before performing the operation.

### Do not expose internal errors

Database errors, filesystem paths, stack traces, and secret values should not be returned to clients.

Log technical details on the server and return a useful but safe JSON error message.

### Use HTTPS in production

Passwords, session cookies, and access tokens should be protected in transit. Production applications should use HTTPS and configure secure cookies appropriately.

### Treat uploaded files as untrusted

Continue using the file-upload protections introduced in Workshop 5. File extensions and browser-provided MIME types are not proof of file content. Use generated storage names, content inspection, upload limits, private storage where appropriate, and ownership checks.

### Keep API responses predictable

Use consistent response structures and meaningful status codes. Avoid returning database fields that the client does not need.

### Understand that CORS is not authorization

CORS controls whether browser JavaScript can read a cross-origin response. It does not replace authentication, authorization, CSRF protection, or server-side validation.

### Plan for pagination

Do not return an unlimited number of records from a collection endpoint. Pagination helps keep response sizes manageable and makes large collections easier to navigate.

### Plan for API versioning

As an API evolves, clients may depend on its existing response format. For larger applications, versioning can help introduce breaking changes gradually.

For example:

```text
/api/v1/events
/api/v2/events
```

We will keep a single API version in this workshop, but it is useful to understand why versioning becomes important as an API grows.

## Exercises and Independent Tasks

The Event Board is our main example for this workshop, but you should not limit yourself to building event applications.

The purpose of these exercises is to apply REST API design, authentication, authorization, validation, file uploads, and frontend integration to different problems.

### Task 1: Equipment Catalogue API

Create an API that allows an organisation to manage equipment available for borrowing.

Each equipment item should contain:

- Name.
- Description.
- Category.
- Availability status.
- Quantity.
- Optional image.

The API should allow users to:

- Retrieve all available equipment.
- Search equipment by name.
- Filter equipment by category and availability.
- Retrieve one equipment item by ID.
- Create a new equipment item.
- Update its information and availability.
- Delete an item.
- Upload or replace its image.

Additional requirements:

- Use pagination when retrieving equipment.
- Validate all submitted fields.
- Restrict equipment management to authenticated users with the appropriate ownership or role.
- Return consistent JSON responses and appropriate HTTP status codes.
- Test the endpoints independently of the frontend.

### Task 2: Pet Adoption API

Create an API for managing animals available for adoption.

Each animal should contain:

- Name.
- Species.
- Age.
- Description.
- Adoption status.
- Optional profile image.
- Date added.

The application should allow visitors to browse animals available for adoption. Authenticated shelter staff should be able to create, update, and remove listings.

The API should:

- Provide endpoints for listing and retrieving animals.
- Support search and filtering by species and adoption status.
- Allow authorised staff to create and update listings.
- Allow staff to upload and replace an animal's image.
- Prevent unauthorised users from modifying listings.
- Return appropriate responses when an animal cannot be found.

Try to design the endpoints before writing the implementation.

### Task 3: Learning Resource API

Create an API that allows instructors to publish learning resources for students.

A resource should contain:

- Title.
- Description.
- Subject.
- Resource type.
- Publication status.
- Optional attachment or cover image.

The application should support two roles:

- **Instructor:** Can create, update, publish, and delete their own resources.
- **Student:** Can browse published resources and retrieve their details.

Think about how authentication and authorization should work for each role.

Also consider how you would prevent students from retrieving unpublished resources.

### Final Challenge: Build Your Own API-Driven Application

Think of an application idea that is different from the examples in this workshop.

Before writing code:

1. Identify the main resources in the application.
2. Define the fields and relationships for each resource.
3. Design the API endpoints and choose the correct HTTP methods.
4. Decide which endpoints are public and which require authentication.
5. Define the ownership and authorization rules.
6. Decide what information each endpoint should return.
7. Identify which requests need validation or file uploads.
8. Build a frontend that communicates with the API using Fetch.
9. Test the endpoints independently of the frontend.

Try to build an application where the frontend and backend have clearly separated responsibilities.

## Conclusion


## References

- [Express 5 Documentation](https://expressjs.com/en/5x/api.html)
- [Express Error Handling](https://expressjs.com/en/5x/guide/error-handling/)
- [Prisma ORM 7: PostgreSQL Quickstart](https://www.prisma.io/docs/v7/prisma-orm/quickstart/postgresql)
- [Multer Documentation](https://expressjs.com/en/resources/middleware/multer/)
- [MDN: Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN: FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors/)
- [express-rate-limit Documentation](https://express-rate-limit.mintlify.app/)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)