# Workshop 4: Using an ORM, Authentication, and Authorization

## Objectives

In this workshop, we will learn how to:

- Understand what an ORM is and why developers use one.
- Configure Prisma ORM to work with PostgreSQL.
- Define database models and relationships using Prisma.
- Perform CRUD operations through Prisma Client.
- Understand the difference between authentication and authorization.
- Register users and securely store their passwords.
- Implement login and logout using sessions.
- Protect routes and restrict access to user-owned resources.

## Introduction

In the previous workshop, we learned how to connect an Express application to PostgreSQL and interact with the database using SQL queries. We created tables, inserted records, retrieved information, and implemented CRUD operations.

Writing SQL directly is useful because it helps us understand how relational databases work. However, as an application grows, writing and maintaining queries throughout the application can become repetitive.

In this workshop, we will explore another way to work with relational databases: **Object-Relational Mapping (ORM)**. We will use Prisma to define our data models and interact with PostgreSQL through JavaScript methods instead of writing SQL for every operation.

We will also introduce two important concepts used in multi-user applications: **authentication** and **authorization**. Authentication allows an application to verify a user's identity, while authorization determines which resources that user is allowed to access or modify.

To practise these concepts, we will build a different application: a **Study Planner**. Users will be able to create accounts, organise their studies into projects, and manage tasks within each project. Each user will have their own projects and tasks, which will give us an opportunity to work with database relationships and access control.

We will continue using PostgreSQL, but this time Prisma will handle the interaction between our Express application and the database.

## Understanding Object-Relational Mapping (ORM)

Before working with Prisma, let's understand what an ORM is and why it is useful.

An **Object-Relational Mapping (ORM)** tool allows us to interact with a relational database using objects and methods from our programming language instead of writing SQL queries for every operation.

In a relational database, information is organised into tables containing rows and columns. In our application, however, we usually work with objects representing entities such as users, projects, and tasks.

An ORM connects these two worlds by mapping database tables to application models. This allows us to work with database records using concepts that are familiar from our application code.

For example, consider a database table named `users`:

| id | username | password_hash |
|---|---|---|
| 1 | ali | ... |
| 2 | sara | ... |

Using SQL, we could retrieve a user with:

```sql
SELECT * FROM users WHERE id = 1;
```

With an ORM, we can perform the same operation using a method:

```javascript
const user = await prisma.user.findUnique({
  where: {
    id: 1
  }
});
```

Here, we use `prisma.user.findUnique()` to retrieve a user whose ID is `1`.

The ORM translates this method call into the appropriate database query and returns the result to our application. We can then work with that result as a JavaScript object.

### Why use an ORM?

An ORM offers several advantages:

- **Less repetitive SQL:** Common operations such as creating, updating, and retrieving records are provided through reusable methods.
- **Model-based development:** We define our database structure using models that represent application entities.
- **Relationship management:** We can define relationships between models and retrieve related records more easily.
- **Database consistency:** Schema migrations help us manage changes to the database structure over time.
- **Developer productivity:** We can focus more on application logic instead of manually constructing every database query.

However, using an ORM does not mean that we no longer need to understand SQL or relational databases. We still need to understand tables, relationships, indexes, constraints, and how database queries affect performance. The ORM makes common operations easier to write, but it does not remove the underlying database concepts.

### Which ORM will we use?

There are several ORM libraries available in the Node.js ecosystem, including Sequelize, TypeORM, and Prisma.

For this workshop, we will use **Prisma ORM**.

Prisma provides a schema language that allows us to define our data models. It also generates **Prisma Client**, which gives us methods for creating, retrieving, updating, and deleting database records from our JavaScript application.

Now that we understand the role of an ORM and the tool we will use, let's set up Prisma in a new Express project.

## Setting Up Prisma with PostgreSQL

Before installing Prisma, let's create a new directory for our Study Planner application.

We will keep this application separate from the project we used in the previous workshop. This gives us an opportunity to practise the same backend concepts in a different context instead of continuously extending one application.

### Creating the project

```bash
mkdir study-planner
cd study-planner
npm init -y
```

Next, we will configure the project to use ES modules. This allows us to use `import` and `export` syntax throughout our application:

```bash
npm pkg set type="module"
```

Now install the packages we need for the application:

```bash
npm install express ejs express-session csrf-sync express-validator argon2 dotenv @prisma/client@7 @prisma/adapter-pg@7 pg
```

Install Prisma CLI and the TypeScript runner:

```bash
npm install -D prisma@7 tsx
```

You may notice that we specify the major version when installing Prisma.

**Why are we installing Prisma version 7 explicitly?**

Prisma 8 is currently available as a release candidate, while Prisma 7 remains the supported stable major version. We will use Prisma 7 throughout this workshop so that the commands and code examples remain consistent.

We are also installing `tsx` because Prisma 7 generates a TypeScript client. It allows our JavaScript application to execute the generated TypeScript client without requiring us to convert the entire project to TypeScript.

Update the scripts in `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch app.js",
    "start": "tsx app.js"
  }
}
```

### Creating the PostgreSQL database

Before configuring Prisma, we need a PostgreSQL database for our application.

Create a new database named `study_planner`. You can do this using the PostgreSQL command line or a graphical database tool.

We will use the following connection string:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/study_planner"
SESSION_SECRET="your-long-random-secret"
```

Replace the username and password in `DATABASE_URL` with your own PostgreSQL credentials.

The `SESSION_SECRET` value will be used later when we configure user sessions. For now, make sure that you replace the example value with a long, random secret.

Create a `.gitignore` file:

```gitignore
node_modules/
.env
generated/
```

Never commit your environment variables or database credentials to a public repository.

### Initialising Prisma

With the project and database ready, we can initialise Prisma.

Run the following command:

```bash
npx prisma@7 init
```

This command creates the Prisma configuration and schema files.

Our project will have a structure similar to this:

```text
study-planner/
│
├── generated/
├── prisma/
│   └── schema.prisma
│
├── app.js
├── package.json
├── prisma.config.ts
├── .env
└── .gitignore
```

### Configuring Prisma

Open `prisma.config.ts`:

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

This configuration tells Prisma where to find our schema and provides the database connection URL through the `DATABASE_URL` environment variable.

Now open `prisma/schema.prisma`:

```prisma
generator client {
  provider            = "prisma-client-js"
  output              = "../generated/prisma"
  moduleFormat        = "esm"
  importFileExtension = "ts"
}

datasource db {
  provider = "postgresql"
}
```

Let's look at a few details in this configuration.

Notice that we are not placing the database connection URL inside `schema.prisma`. In Prisma 7, the connection URL is configured through `prisma.config.ts`.

We are also specifying a custom output directory for the generated Prisma Client. The `importFileExtension = "ts"` setting ensures that the generated imports work correctly when we use `tsx` to run our JavaScript application.

## Designing Our Database Models

Now that Prisma is configured, we can start designing the database structure for our Study Planner.

Before writing application routes or database queries, we need to identify the main types of information our application will store.

Our Study Planner has three main entities:

**User:** Represents a registered account.

**Project:** Represents a study project created by a user. For example, a user might create projects such as Electronics, Mathematics, or Programming.

**Task:** Represents an individual task belonging to a project. A task might be to study a chapter, complete an exercise, or build a small circuit.

These entities are connected through relationships. We can represent the structure as follows:

```text
User
 │
 │ One-to-Many
 │
 ▼
Project
 │
 │ One-to-Many
 │
 ▼
Task
```

Let's read this diagram from top to bottom.

A user can have multiple projects, but each project belongs to one user. Similarly, a project can contain multiple tasks, but each task belongs to one project.

Both relationships are examples of **one-to-many relationships**. We will represent these relationships in Prisma so that we can retrieve related records and enforce the ownership structure of our application.

### Defining the models

Open `prisma/schema.prisma` and add the following models:

```prisma
enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
}

model User {
  id           Int       @id @default(autoincrement())
  username     String    @unique @db.VarChar(25)
  passwordHash String    @map("password_hash") @db.VarChar(255)
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  projects     Project[]

  @@map("users")
}

model Project {
  id          Int       @id @default(autoincrement())
  title       String    @db.VarChar(100)
  description String?   @db.Text
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime  @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

  userId      Int       @map("user_id")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  tasks       Task[]

  @@index([userId])
  @@map("projects")
}

model Task {
  id          Int        @id @default(autoincrement())
  title       String     @db.VarChar(150)
  description String?    @db.Text
  status      TaskStatus @default(TODO)
  dueDate     DateTime?  @map("due_date") @db.Timestamptz(6)
  createdAt   DateTime   @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime   @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

  projectId   Int        @map("project_id")
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@map("tasks")
}
```

Let's break down the schema and understand the Prisma concepts used in these models.

### Models and fields

Each `model` represents an entity in our application and, by default, maps to a table in the database.

For example, the `User` model represents the users stored in our database, while `Project` and `Task` represent the other two entities.

Inside a model, each field represents a property of that entity. Fields have types such as `Int`, `String`, `Boolean`, and `DateTime`.

Some fields also have attributes:

- `@id` identifies the primary key.
- `@default(autoincrement())` automatically generates an ID.
- `@unique` prevents duplicate values.
- `@default(now())` sets the initial value to the current date and time.
- `@map` maps a Prisma field to a differently named database column.
- `@@map` maps a Prisma model to a differently named database table.

The question mark in `description String?` means that the field is optional. A project or task can therefore be created without providing a description.

### Relationships

Consider these fields in the `User` model:

```prisma
projects Project[]
```

This tells Prisma that a user can be associated with multiple projects.

Now let's look at the other side of the relationship. Consider the following fields in the `Project` model:

```prisma
userId Int

user User @relation(
  fields: [userId],
  references: [id],
  onDelete: Cascade
)
```

The `userId` field is the foreign key that connects a project to its owner. It stores the ID of the user who created the project.

The `user` field represents the relationship from Prisma Client's perspective. It allows us to retrieve the user associated with a project without manually writing a separate SQL join.

The same idea applies to the relationship between projects and tasks: `projectId` stores the foreign key, while `project` represents the relationship in Prisma Client.

Notice that we also use `onDelete: Cascade`. This means that deleting a project will automatically delete its associated tasks. Deleting a user will also delete that user's projects and their tasks.

### Applying the database changes

Once the models and relationships are defined, we need to apply them to our PostgreSQL database.

We do this using a **migration**. Create the initial migration with the following command:

```bash
npx prisma migrate dev --name init
```

Then generate the Prisma Client:

```bash
npx prisma generate
```

A migration records a change to the database structure. Instead of manually creating the tables, Prisma generates and executes the SQL required to apply the schema.

Whenever you modify your Prisma models, you should create a new migration so that the database structure stays in sync with your schema. You can then regenerate Prisma Client when needed.

For example:

```bash
npx prisma migrate dev --name add_project_color
npx prisma generate
```

## Connecting Prisma to Express

Our database models are now defined, and the initial migration has created the corresponding tables in PostgreSQL.

The next step is to connect Prisma Client to our Express application so that our routes can interact with the database.

Create a directory named `db` and a file named `prisma.js`:

```text
study-planner/
│
├── db/
│   └── prisma.js
│
├── generated/
├── prisma/
├── app.js
└── ...
```

Inside `db/prisma.js`:

```javascript
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
  adapter
});

export default prisma;
```

Let's understand what this file does.

First, we import the generated `PrismaClient` and the PostgreSQL adapter, `PrismaPg`. We then create the adapter using our database connection string and pass it to the Prisma Client constructor.

Finally, we export the client so that other parts of our application can reuse it.

**An important detail:** We should not create a new `PrismaClient` every time a route is called. A typical Express application should use one shared instance rather than repeatedly creating new database clients.

Prisma 7 uses a database driver adapter for direct PostgreSQL connections. In our example, `PrismaPg` connects Prisma Client to PostgreSQL through the `pg` driver.

## Working with CRUD Operations in Prisma

Now that Prisma is connected to Express, we can start interacting with our database.

In the previous workshop, we used SQL statements such as `INSERT`, `SELECT`, `UPDATE`, and `DELETE` to perform database operations. With Prisma, we use methods provided by Prisma Client to perform the same operations.

These methods are organised around the models we defined in `schema.prisma`. Let's look at the basic CRUD operations one by one.

For example:

```javascript
prisma.user
prisma.project
prisma.task
```

Each model exposes methods for interacting with its records. For example, `prisma.user` gives us access to operations for users, while `prisma.project` and `prisma.task` provide operations for projects and tasks.

### Creating a record

To create a project:

```javascript
const project = await prisma.project.create({
  data: {
    title: "Learning Electronics",
    description: "My electronics learning roadmap",
    user: {
      connect: {
        id: 1
      }
    }
  }
});
```

The `create()` method inserts a new project into the database.

Notice that we use `connect` to associate the new project with an existing user. In this example, the project is connected to the user whose ID is `1`.

### Retrieving records

We can retrieve multiple records using `findMany()`. For example, to retrieve all projects:

```javascript
const projects = await prisma.project.findMany();
```

When we need one specific record, we can use `findUnique()`. For example, to retrieve a project using its ID:

```javascript
const project = await prisma.project.findUnique({
  where: {
    id: 1
  }
});
```

The `findUnique()` method can also retrieve a record using another field that has a unique constraint. For example, we can retrieve a user using their username:

```javascript
const user = await prisma.user.findUnique({
  where: {
    username: "ali"
  }
});
```

### Updating records

To modify an existing record, we use the `update()` method.

For example, to change a project's title:

```javascript
const project = await prisma.project.update({
  where: {
    id: 1
  },

  data: {
    title: "Learning Embedded Systems"
  }
});
```

Here, `where` identifies the record we want to update, while `data` contains the fields and values we want to change.

### Deleting records

When we no longer need a record, we can remove it using the `delete()` method.

For example, to delete a project using its ID:

```javascript
await prisma.project.delete({
  where: {
    id: 1
  }
});
```

The `where` option identifies the project that should be deleted. Prisma then executes the corresponding database operation.

These examples introduce the basic CRUD operations: creating, retrieving, updating, and deleting records.

In a real application, we also need to validate submitted information, check whether the current user is allowed to perform an operation, and handle possible errors before changing the database.

### Retrieving related records

So far, we have retrieved individual records and collections of records. Another useful feature of an ORM is the ability to retrieve related records as part of the same query.

For example, we can retrieve a project together with all its tasks:

```javascript
const project = await prisma.project.findUnique({
  where: {
    id: 1
  },

  include: {
    tasks: true
  }
});
```

We can also retrieve a user together with their projects:

```javascript
const user = await prisma.user.findUnique({
  where: {
    id: 1
  },

  include: {
    projects: true
  }
});
```

The `include` option tells Prisma to retrieve related records along with the main record.

For example, we can retrieve a project and its tasks in one query. We will use this feature when displaying a user's projects and the tasks that belong to each project.

## Authentication and Password Hashing

Now that we understand how to create and retrieve database records, we can start working with user accounts.

Before implementing registration and login, we need to understand two related but different concepts: **authentication** and **authorization**.

**Authentication** is the process of verifying a user's identity. For example, when someone logs in using a username and password, the application checks whether the submitted credentials are valid.

**Authorization** determines what an authenticated user is allowed to access or do. For example, a user may be allowed to manage their own projects but should not be allowed to modify another user's projects.

In this section, we will begin with password security, which is an important part of implementing authentication.

### Why should we hash passwords?

When a user registers, they provide a password that the application needs to verify later during login.

A common mistake is to store the original password directly in the database. This is dangerous because anyone who gains access to the database could read the users' passwords.

Instead, we store a **password hash**. Password hashing transforms a password into a derived value that is intentionally expensive to reverse. When the user logs in, we verify the submitted password against the stored hash rather than trying to decrypt it.

For this workshop, we will use **Argon2id**, a password-hashing algorithm designed for securely storing passwords. We already installed the `argon2` package when setting up the project.

### Hashing a password

```javascript
import argon2 from "argon2";

const password = "my-secure-password";

const passwordHash = await argon2.hash(password, {
  type: argon2.argon2id
});
```

The value returned by `argon2.hash()` is the password hash that we store in the database.

We should never store the original password. The hash is sufficient for verifying the password when the user attempts to log in.

### Verifying a password

When the user logs in, we use:

```javascript
const isValid = await argon2.verify(
  passwordHash,
  password
);
```

The `argon2.verify()` method compares the submitted password with the stored hash and returns `true` if they match or `false` otherwise.

Notice that we do not decrypt the hash to recover the original password. Password hashing is not encryption; it is a one-way process designed for password verification.

## Managing User Sessions

After verifying a user's identity, we need a way to recognise that user when they send additional requests to our application.

HTTP is stateless. This means that each request is independent, and the server does not automatically remember which user made a previous request.

To solve this problem, we can use **sessions**. A session allows the server to maintain information associated with a particular user's browser across multiple requests.

We will use `express-session`, which we have already encountered in our earlier Express work.

### How sessions work

Let's follow what happens when a user logs in:

1. The browser sends the user's login information to the server.
2. The server verifies the submitted credentials.
3. The server creates a session and stores information associated with the authenticated user.
4. The browser receives a cookie containing the session ID.
5. On subsequent requests, the browser sends that cookie automatically.
6. The server uses the session ID to retrieve the associated session data.

The cookie normally contains a session identifier, not the user's password. The actual session data is maintained by the server.

### Configuring express-session

Now let's configure the session middleware in `app.js`. This middleware must be registered before routes that need to access session information:

```javascript
import session from "express-session";

app.use(
  session({
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
  })
);
```

Let's go through the important options in this configuration:

- `name` defines the session cookie name.
- `secret` is used to sign the session identifier cookie.
- `resave` controls whether the session is saved again when it has not changed.
- `saveUninitialized` prevents saving sessions that have not been modified.
- `httpOnly` prevents client-side JavaScript from reading the cookie.
- `sameSite` helps control when browsers send the cookie with cross-site requests.
- `secure` makes the browser send the cookie only over HTTPS.
- `maxAge` defines how long the cookie remains valid.

For this workshop, the default in-memory session store is sufficient for local development. However, it is not suitable for production because sessions are lost when the server restarts and the store is not designed for production workloads.

A production application should use an appropriate persistent session store.

### Session fixation protection

There is one more important security step we should take when a user logs in: regenerate the session ID.

This helps protect against **session fixation attacks**, where an attacker attempts to make a victim use a session identifier that is already known to the attacker.

With `express-session`, we can use:

```javascript
req.session.regenerate((err) => {
  if (err) {
    return next(err);
  }

  req.session.user = {
    id: user.id,
    username: user.username
  };

  req.session.save((err) => {
    if (err) {
      return next(err);
    }

    res.redirect("/projects");
  });
});
```

The `regenerate()` method creates a new session ID. We then store the authenticated user's ID and username in the new session.

Finally, we call `req.session.save()` before redirecting. This ensures that the session data is saved before the browser makes its next request.

## Implementing Registration, Login, and Logout

We now have the main components required to implement authentication:

- **Prisma Client:** Stores and retrieves user records.
- **Argon2id:** Hashes passwords during registration and verifies them during login.
- **Express sessions:** Remembers authenticated users across requests.
- **Express Validator:** Validates the information submitted through our forms.

Let's combine these components to implement registration, login, and logout.

Create a `routes` directory:

```text
study-planner/
│
├── routes/
│   └── auth.js
│
├── db/
├── generated/
├── prisma/
└── app.js
```

### Registration

The first step is to allow a new user to create an account.

The registration process should:

1. Receive a username and password.
2. Validate the submitted information.
3. Check whether the username is already registered.
4. Hash the password.
5. Create the user in the database.
6. Redirect the user to the login page.

Let's implement the registration route in `routes/auth.js`.

The following example focuses on the POST route that processes the submitted registration form:

```javascript
import express from "express";
import argon2 from "argon2";
import { body, validationResult } from "express-validator";
import prisma from "../db/prisma.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";

const router = express.Router();

router.post(
  "/register",
  csrfSynchronisedProtection,

  body("username")
    .isString()
    .bail()
    .trim()
    .isLength({ min: 3, max: 25 })
    .matches(/^[a-zA-Z0-9_]+$/),

  body("password")
    .isString()
    .bail()
    .isLength({ min: 12 }),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).render("auth/register", {
          errors: errors.array(),
          values: {
            username: req.body.username
          }
        });
      }

      const username = req.body.username.toLowerCase();
      const password = req.body.password;

      const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id
      });

      await prisma.user.create({
        data: {
          username,
          passwordHash
        }
      });

      res.redirect("/login");
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(409).render("auth/register", {
          errors: [{ msg: "This username is already taken." }],
          values: {
            username: req.body.username
          }
        });
      }

      next(error);
    }
  }
);

export default router;
```

Let's walk through the important parts of this route.

First, the validation middleware checks the submitted username and password before the route handler processes them. We then call `validationResult(req)` to collect any validation errors. If the submitted information is invalid, we return the registration page with the errors and the previously entered username.

If validation succeeds, we convert the username to lowercase and hash the password using Argon2id. We then create the user record through `prisma.user.create()`.

There is also an important database constraint to consider. The `username` field is marked as `@unique` in our Prisma model, so two users cannot register with the same username. If a username is already registered, Prisma returns an error with the code `P2002`. We catch that error and display an appropriate message.

Notice that we only save `passwordHash` in the database. The original password is never stored.

### Login

After users can create accounts, we need to allow them to log in.

The login process is slightly different from registration. We need to:

1. Receive the username and password.
2. Find the user in the database.
3. Verify the submitted password against the stored hash.
4. Regenerate the session.
5. Store the user's ID and username in the session.
6. Redirect the user to their projects.

Example:

```javascript
router.post(
  "/login",
  csrfSynchronisedProtection,

  body("username").isString().bail().trim(),
  body("password").isString(),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).render("auth/login", {
          error: "Please enter valid credentials."
        });
      }

      const username = req.body.username.toLowerCase();
      const password = req.body.password;

      const user = await prisma.user.findUnique({
        where: {
          username
        }
      });

      if (
        !user ||
        !(await argon2.verify(user.passwordHash, password))
      ) {
        return res.status(401).render("auth/login", {
          error: "Invalid username or password."
        });
      }

      req.session.regenerate((err) => {
        if (err) {
          return next(err);
        }

        req.session.user = {
          id: user.id,
          username: user.username
        };

        req.session.save((err) => {
          if (err) {
            return next(err);
          }

          res.redirect("/projects");
        });
      });
    } catch (error) {
      next(error);
    }
  }
);
```

Let's look at the main steps in this route.

First, we retrieve the user from the database using the submitted username. If the user does not exist, or if `argon2.verify()` determines that the password is incorrect, we return the same error message.

This is intentional. Returning different messages could reveal whether a particular username is registered.

When the credentials are valid, we regenerate the session ID and store the user's ID and username in the new session. Finally, we save the session and redirect the user to their projects.

### Logout

The final part of the authentication process is logout.

Logging out means destroying the current session so that the browser can no longer use it to access authenticated routes.

We use a POST request because logging out changes the application's state. We should also protect this request with CSRF middleware.

```javascript
router.post(
  "/logout",
  csrfSynchronisedProtection,
  (req, res, next) => {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }

      res.clearCookie("sid", {
        path: "/"
      });

      res.redirect("/login");
    });
  }
);
```

Let's understand what happens when the user logs out.

The `req.session.destroy()` method removes the current session from the session store. We then clear the `sid` cookie from the browser so that it no longer sends the old session identifier.

After the session is destroyed, the browser can no longer use it to access the authenticated part of the application. We then redirect the user to the login page.

## Protecting Routes with Authentication Middleware

Now that users can register and log in, we need to protect the parts of our application that require an authenticated user.

For example, visitors should not be able to access `/projects` unless they have logged in.

We can enforce this rule using middleware. The middleware checks whether the current request belongs to a user with an active session and either allows the request to continue or redirects the visitor to the login page.

Create a directory named `middleware` and add `requireLogin.js`:

```javascript
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  next();
}

export default requireLogin;
```

Let's understand what this middleware does.

It checks whether `req.session.user` exists. If it does not, the request does not belong to an authenticated user, so we redirect the visitor to the login page.

Otherwise, `next()` passes control to the next middleware or route handler.

We can now protect a route:

```javascript
app.get("/projects", requireLogin, async (req, res) => {
  res.render("projects/index");
});
```

Or we can protect an entire group of routes:

```javascript
app.use("/projects", requireLogin, projectRoutes);
```

This is especially useful when an entire section of the application requires authentication.

## Authorization: Restricting Access to User-Owned Resources

So far, we have used authentication to determine whether a user is logged in. However, being authenticated does not mean that a user should have access to every resource in the application.

This is where **authorization** becomes important. Authentication tells us who the user is, while authorization determines what that user is allowed to access or modify.

In our Study Planner, users should only be able to manage their own projects.

Consider two users:

- Ali creates a project named "Learning STM32".
- Sara creates a project named "Web Development".

Ali should not be able to edit or delete Sara's project simply by changing the project ID in the URL.

This is an important security rule. Hiding an edit or delete button in the interface is not enough because users can still send requests directly to the server or change an ID in the URL.

The server must verify ownership whenever a protected resource is retrieved, updated, or deleted.

### Retrieving only the current user's projects

Let's start with the project list.

If we retrieve every project without applying a filter, all users could potentially see one another's projects. For example:

```javascript
const projects = await prisma.project.findMany();
```

Instead, we should retrieve only the projects that belong to the currently authenticated user:

```javascript
const projects = await prisma.project.findMany({
  where: {
    userId: req.session.user.id
  },

  orderBy: {
    createdAt: "desc"
  }
});
```

Notice that the user ID comes from the session, not from a value submitted by the browser. This is important because users should not be able to choose or change the owner ID when retrieving their projects.

### Retrieving a specific project

Filtering the project list is not enough. We must also check ownership when a user opens an individual project.

For example, when the user requests a project, we can retrieve it using both the project ID and the authenticated user's ID:

```javascript
const project = await prisma.project.findFirst({
  where: {
    id: Number(req.params.projectId),
    userId: req.session.user.id
  },

  include: {
    tasks: true
  }
});

if (!project) {
  return res.sendStatus(404);
}
```

This query retrieves the project only when both conditions are satisfied:

- The project ID matches the ID in the URL.
- The project belongs to the currently authenticated user.

If the project does not exist or belongs to someone else, the query returns `null`, and we respond with a `404 Not Found` status code.

### Updating a project safely

We must apply the same ownership check when a user updates a project.

Checking ownership before displaying the project is not enough. The update operation itself must also ensure that the project belongs to the current user.

For example:

```javascript
const result = await prisma.project.updateMany({
  where: {
    id: Number(req.params.projectId),
    userId: req.session.user.id
  },

  data: {
    title: req.body.title
  }
});

if (result.count === 0) {
  return res.sendStatus(404);
}

res.redirect("/projects");
```

Notice that we include the owner ID in the database operation itself. This prevents a user from updating another user's project simply by changing the project ID in the URL.

The `updateMany()` method returns a result containing the number of records that were updated. If `count` is `0`, no project matched both conditions, so we return a `404` response.

### Deleting a project safely

```javascript
const result = await prisma.project.deleteMany({
  where: {
    id: Number(req.params.projectId),
    userId: req.session.user.id
  }
});

if (result.count === 0) {
  return res.sendStatus(404);
}

res.redirect("/projects");
```

The ownership check is also part of the deletion query. If no project matches both the requested ID and the current user's ID, nothing is deleted and we return a `404` response.

This is a pattern we should use whenever users manage resources that belong to them.

## Managing Tasks Within Projects

Now that project ownership is in place, let's apply the same idea to tasks.

A task belongs to a project, and a project belongs to a user. Therefore, before allowing someone to create, update, or delete a task, we must verify that the user owns the project containing that task.

For example, when creating a task, first retrieve the project belonging to the current user:

```javascript
const project = await prisma.project.findFirst({
  where: {
    id: Number(req.params.projectId),
    userId: req.session.user.id
  }
});

if (!project) {
  return res.sendStatus(404);
}
```

If the project exists and belongs to the current user, we can create a task and connect it to that project:

```javascript
const task = await prisma.task.create({
  data: {
    title: req.body.title,
    project: {
      connect: {
        id: project.id
      }
    }
  }
});
```

Notice that we do not accept a user ID from the form. We first verify the project using the authenticated user's ID from the session, then connect the new task to that project.

This way, the browser cannot create a task inside another user's project by submitting a different owner ID.

### Updating a task

The same ownership rule applies when updating a task.

We need to verify not only that the task exists, but also that its parent project belongs to the currently authenticated user. Prisma allows us to do this using a relation filter:

```javascript
const task = await prisma.task.findFirst({
  where: {
    id: Number(req.params.taskId),

    project: {
      is: {
        userId: req.session.user.id
      }
    }
  }
});

if (!task) {
  return res.sendStatus(404);
}
```

If the query returns a task, we know that it belongs to a project owned by the current user. We can then update it:

```javascript
await prisma.task.update({
  where: {
    id: task.id
  },

  data: {
    status: "COMPLETED"
  }
});
```

We must apply the same ownership check when deleting a task or performing any other operation that modifies it. Never rely only on the task ID supplied in the URL.

## Connecting Everything in Express

At this point, we have introduced and implemented the main pieces of our application:

- Prisma Client connected to PostgreSQL.
- Database models and relationships.
- CRUD operations for application records.
- User registration and password hashing.
- Login, logout, and session management.
- Middleware for protecting authenticated routes.
- Ownership checks for projects and tasks.

We have looked at these features separately so that we could understand each one. Now let's connect them inside our Express application.

Before configuring the main application, let's review how we can organise the project files.

A possible project structure is:

```text
study-planner/
│
├── db/
│   └── prisma.js
│
├── middleware/
│   ├── csrf.js
│   └── requireLogin.js
│
├── routes/
│   ├── auth.js
│   └── projects.js
│
├── views/
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   │
│   └── projects/
│       ├── index.ejs
│       ├── show.ejs
│       └── new.ejs
│
├── public/
│   └── styles.css
│
├── prisma/
│   └── schema.prisma
│
├── generated/
├── prisma.config.ts
├── app.js
├── package.json
└── .env
```

### CSRF protection

We introduced CSRF protection in an earlier workshop when we worked with HTML forms. We will use the same concept here because our Study Planner contains forms that create, update, and delete resources.

Before connecting the routes, let's place the CSRF configuration in its own middleware file so that we can reuse it throughout the application.

Create `middleware/csrf.js`:

```javascript
import { csrfSync } from "csrf-sync";

const {
  generateToken,
  csrfSynchronisedProtection
} = csrfSync({
  getTokenFromRequest: (req) => req.body?._csrf
});

export {
  generateToken,
  csrfSynchronisedProtection
};
```

This file exports the functions we need to generate CSRF tokens and validate submitted tokens.

We will generate a token for each session and make it available to our EJS templates. Every state-changing form should include that token in a hidden input field.

### Main application configuration

In `app.js`:

```javascript
import "dotenv/config";
import express from "express";
import session from "express-session";
import path from "node:path";

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import requireLogin from "./middleware/requireLogin.js";
import { generateToken } from "./middleware/csrf.js";

const app = express();

app.set("view engine", "ejs");

app.use(express.static(path.join(process.cwd(), "public")));

app.use(express.urlencoded({ extended: false }));

app.use(
  session({
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
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user ?? null;
  res.locals.csrfToken = generateToken(req);
  next();
});

app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/projects");
  }

  res.redirect("/login");
});

app.use(authRoutes);

app.use("/projects", requireLogin, projectRoutes);

app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
```

Let's understand the order in which we register the middleware and routes.

The order is important because each step depends on the previous one:

1. **Static files:** Express serves files from the `public` directory.
2. **Form parsing:** `express.urlencoded()` parses submitted form data so that it is available through `req.body`.
3. **Sessions:** `express-session` makes session information available through `req.session`.
4. **Template data:** We expose the current user and a CSRF token to our EJS templates.
5. **Authentication routes:** We register the public registration, login, and logout routes.
6. **Protected routes:** We apply `requireLogin` before the project router so that visitors must log in before accessing project pages.

For example, session middleware must run before middleware that reads `req.session`. Similarly, form-parsing middleware must run before CSRF middleware that reads the token from `req.body`.

Every form that changes application data should include the CSRF token. Add a hidden input to the corresponding EJS template:

```html
<input
  type="hidden"
  name="_csrf"
  value="<%= csrfToken %>"
>
```

The corresponding POST route should use `csrfSynchronisedProtection` before processing the submitted data.

We also need to handle invalid or missing CSRF tokens and return an appropriate error response, normally `403 Forbidden`.

Remember that the session configuration shown here uses Express's default in-memory store for development only. A production application needs a persistent session store and HTTPS.

## Testing Our Application

We have now connected the database client, session middleware, authentication routes, and protected project routes.

Let's start the application and test the main features:

```bash
npm run dev
```

Open the application in your browser and work through the following scenarios. Try each case rather than only checking that the homepage loads.

### Registration and login

- Register a new account.
- Try registering another account with the same username.
- Check that the password stored in PostgreSQL is a hash, not the original password.
- Log in using the correct credentials.
- Try logging in with an incorrect password.
- Log out and try accessing the project page again.

### Project management

- Create a project.
- Create multiple projects.
- Open a project and add tasks.
- Update the project's title.
- Mark a task as completed.
- Delete a task.
- Delete a project and check what happens to its associated tasks.

### Authorization

Create two different user accounts.

For example:

- User A creates a project.
- User B logs in and creates another project.
- User A tries to access User B's project by changing the project ID in the URL.
- User A tries to update or delete User B's project.
- User B tries to access a task belonging to User A's project.

The application should prevent these operations.

Remember: authorization must be enforced by the server, not only by the user interface.

## Exercises and Independent Tasks

We have used the Study Planner to bring the workshop concepts together. However, you should not limit yourself to this type of application.

The following exercises introduce different scenarios so that you can practise designing models, defining relationships, performing CRUD operations, and applying authentication and authorization rules independently.

### Task 1: Personal Reading Tracker

In this task, create a reading tracker where users can manage the books they are currently reading.

Each book should contain:

- Title
- Author
- Description
- Reading status
- Date added

Each user should be able to:

- Register and log in.
- Add books to their reading list.
- View their own books.
- Update a book's information.
- Change its reading status.
- Delete a book.

Apply the same ownership rules used in the Study Planner.

### Task 2: Recipe Organizer

In this task, create an application where users can store and organise their own recipes.

A recipe should contain:

- Name
- Description
- Preparation time
- Instructions

Extend the database design to include ingredients.

For example, one recipe can contain multiple ingredients, and the same ingredient can be used in multiple recipes.

Design the required Prisma models and relationships.

Consider using an explicit intermediate model if you need to store additional information, such as the quantity of an ingredient.

### Task 3: Event Management System

In this task, create a simple event management application.

Users should be able to create events, while other users can register to attend them.

An event should contain:

- Title
- Description
- Location
- Date
- Organiser

Think about how you would represent the relationship between users and events. A user can register for multiple events, and an event can have multiple registered users.

Design the Prisma models and implement the required operations.

Also consider how to prevent duplicate registrations and how to restrict event editing to the event's organiser.
## References

- [Prisma ORM Documentation](https://www.prisma.io/docs/orm)
- [Prisma: Data model](https://www.prisma.io/docs/orm/prisma-schema/data-model/models)
- [Prisma: Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)
- [Prisma: CRUD](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
- [Prisma: Migrations](https://www.prisma.io/docs/orm/prisma-migrate)
- [Argon2 (npm)](https://www.npmjs.com/package/argon2)
- [OWASP: Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
