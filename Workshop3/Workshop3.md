# Workshop 3: Database Integration and CRUD Operations with PostgreSQL

## Objectives

- Understand why web applications need databases.
- Introduction to relational databases and PostgreSQL.
- Understand the basic structure of relational databases (tables, rows, columns, and primary keys).
- Learn the fundamentals of SQL (Structured Query Language).
- Connect an Express application to a PostgreSQL database.
- Create database tables and define constraints.
- Perform SQL queries using the `pg` library.
- Understand and implement CRUD operations (Create, Read, Update, Delete).
- Retrieve and display database records dynamically using EJS.
- Update and delete existing records.
- Search and filter database records.
- Handle database errors and missing resources.
- Organize database-related code and configuration.

## From Temporary Storage to Persistent Data

In our previous workshop, we built a Quote Sharing Web Application using Express and EJS. Users could submit quotes, browse existing quotes, and search for quotes written by specific authors.

However, we stored the submitted information inside a simple JavaScript array.

For example:

```javascript
const quotes = [];

quotes.push({
    author: 'Albert Einstein',
    content: 'Life is like riding a bicycle. To keep your balance, you must keep moving.'
});
```

This approach works perfectly for demonstrating how an application receives and processes information. However, it has an important limitation: **the data is stored in the application's memory and disappears when the server stops or restarts.**

Imagine building a real application where users submit hundreds or thousands of quotes. We obviously don't want to lose all that information whenever we restart our server.

We need a way to store information permanently, retrieve it whenever necessary, and manage it independently of our application's execution.

This is where **databases** become important.

A database allows us to store, organize, retrieve, and modify information in a structured way. Instead of keeping everything inside our JavaScript application, we delegate data storage and management to a dedicated system.

In this workshop, we will introduce PostgreSQL and learn how to connect it to our Express application.

We will also revisit the Quote Sharing Application from our previous workshop and replace its temporary storage with a real database.

This will allow our application to store submitted quotes permanently, retrieve them, update them, and delete them.

## Introduction to Databases

### What is a Database?

A database is an organized collection of information that can be stored, retrieved, and modified efficiently.

For example, an online store might have a database containing:

- Customers and their accounts.
- Products and their prices.
- Orders and their details.
- Payments and transactions.

Instead of keeping all this information inside application code, the application communicates with the database whenever it needs to access or modify information.

A **Database Management System (DBMS)** is software responsible for managing databases. It provides the tools and mechanisms needed to create databases, store information, execute queries, manage relationships, and control access to data.

Some popular database management systems include:

- PostgreSQL.
- MySQL.
- SQLite.
- Microsoft SQL Server.
- MongoDB.

Different database systems organize and manage information differently. In this workshop, we will focus on relational databases.

### Relational Databases

A relational database organizes information into **tables**.

Each table represents a particular entity or category of information, while its columns define the attributes and its rows contain individual records.

For example, imagine we want to store information about the quotes submitted to our application.

We could create a table called `quotes`:

| id | author | content | created_at |
|---|---|---|---|
| 1 | Albert Einstein | Life is like riding a bicycle. | 2026-11-15 |
| 2 | Steve Jobs | Stay hungry, stay foolish. | 2026-11-15 |
| 3 | Nelson Mandela | It always seems impossible until it's done. | 2026-11-15 |

Let's understand the structure:

- **Table:** A collection of related records. In our example, the table is called `quotes`.
- **Column:** An attribute describing the information stored in a table. Examples include `author` and `content`.
- **Row:** A single record inside a table. Each submitted quote represents one row.

Relational databases allow us to organize information into multiple tables and establish relationships between them.

For example, an application might have a `users` table and a `posts` table. Each post could reference the user who created it.

We will explore these relationships in a later workshop when we introduce user authentication and authorization.

### Understanding Primary Keys

When working with tables, we need a reliable way to identify individual records.

Imagine that two users submit the same quote, or two different authors have the same name.

Using the author's name or quote content to identify a record would be unreliable.

This is why databases use **Primary Keys**.

A primary key is a column, or a combination of columns, that uniquely identifies each row in a table.

For example:

| id | author | content |
|---|---|---|
| 1 | Alice | First quote |
| 2 | Alice | Second quote |
| 3 | Bob | Third quote |

Here, the `id` column is the primary key.

Even though Alice submitted two quotes, each quote has a different identifier.

Primary keys allow us to retrieve, update, and delete specific records without confusing them with other records.

### Introduction to SQL

Relational databases use a language called **SQL (Structured Query Language)** to communicate with and manipulate data.

SQL provides commands for creating tables, inserting records, retrieving information, updating existing data, and deleting records.

Some of the most important SQL commands include:

| SQL Command | Purpose |
|---|---|
| `CREATE TABLE` | Creates a new table. |
| `INSERT` | Adds new records. |
| `SELECT` | Retrieves records. |
| `UPDATE` | Modifies existing records. |
| `DELETE` | Removes records. |

These operations form the foundation of database interaction and are commonly grouped under the term **CRUD**.

We will explore CRUD in detail later in this workshop.

## Introduction to PostgreSQL

Now that we understand what databases are and how relational databases organize information, let's introduce the database system we will use.

PostgreSQL is a powerful, open-source relational database management system.

It allows us to store structured information, define relationships between tables, enforce constraints, and execute SQL queries.

We choose PostgreSQL because:

- It is open-source and widely used.
- It supports relational database concepts and advanced SQL features.
- It provides strong data integrity mechanisms.
- It works well with Node.js and Express.
- It is suitable for applications ranging from small projects to large production systems.

In this workshop, PostgreSQL will be responsible for storing our application's quotes, while Express will handle incoming requests and communicate with the database.
### Installing PostgreSQL

First, we need PostgreSQL installed on our development machine.

You can download it from the official website:

[PostgreSQL Downloads](https://www.postgresql.org/download/)

PostgreSQL also comes with `psql`, a command-line tool that allows us to connect to a database and execute SQL commands.

Another convenient option is pgAdmin, which provides a graphical interface for managing PostgreSQL databases.

After installation, open your terminal and check whether PostgreSQL is available:

```bash
psql --version
```

If the command works, PostgreSQL's command-line client is available.

### Creating Our Database

Before connecting Express to PostgreSQL, we need to create a database and a dedicated user account for our application.

We will call our database:

```text
quote_app
```

You can create it using pgAdmin or the PostgreSQL command-line interface.

On Linux, PostgreSQL commonly uses Peer Authentication for local administrative connections. To access PostgreSQL as its default administrative user, execute:

```bash
sudo -i -u postgres
```

Then open the PostgreSQL command-line interface:

```bash
psql
```

You should now be connected as the PostgreSQL administrator.

Next, create a dedicated user for our application:

```sql
CREATE ROLE quote_app_user
WITH LOGIN PASSWORD 'choose-a-local-password';
```

Then create the database and assign ownership to this user:

```sql
CREATE DATABASE quote_app
OWNER quote_app_user;
```

Let's understand these commands.

**CREATE ROLE**

```sql
CREATE ROLE quote_app_user
WITH LOGIN PASSWORD 'choose-a-local-password';
```

Creates a PostgreSQL role called `quote_app_user`.

The `LOGIN` attribute allows this role to authenticate and connect to PostgreSQL, while `PASSWORD` specifies the password it must provide.

We will use this account when our Express application connects to PostgreSQL.

**CREATE DATABASE**

```sql
CREATE DATABASE quote_app
OWNER quote_app_user;
```

Creates a database named `quote_app` and assigns ownership to `quote_app_user`.

This means our application user owns the database and can manage its objects without relying on the PostgreSQL administrative account.

After creating the database, exit the PostgreSQL terminal:

```sql
\q
```

Then return to your normal Linux user:

```bash
exit
```

We can now connect using the application account:

```bash
psql -h localhost -U quote_app_user -d quote_app
```

Let's understand the connection options:

- `-h localhost`: Connects to PostgreSQL through the local network interface rather than using a Unix socket.
- `-U quote_app_user`: Specifies the PostgreSQL username.
- `-d quote_app`: Specifies the database we want to connect to.

Enter the password when prompted.

**Note:** This connection assumes PostgreSQL allows password authentication for local TCP connections. Its default configuration on many Linux installations supports this.

Alternatively, you can create the role and database through pgAdmin using its graphical interface.

We now have a database and a dedicated user account ready for our Express application.

## Connecting Express to PostgreSQL

Now that PostgreSQL is installed and our database has been created, we need a way for our Express application to communicate with it.

Node.js doesn't include a built-in PostgreSQL driver. We need a package that handles communication between JavaScript and PostgreSQL.

For this, we will use **node-postgres**, commonly called `pg`.

The `pg` library allows our Node.js application to connect to PostgreSQL, execute SQL statements, and retrieve query results.

### Installing the Required Packages

Inside our existing Quote Sharing project, install:

```bash
npm install pg dotenv
```

These packages provide:

- `pg`: The PostgreSQL driver used to communicate with the database.
- `dotenv`: Allows us to load environment variables from a `.env` file.

We will use environment variables to store our database connection settings rather than writing credentials directly into our application code.

### Configuring Environment Variables

Create a `.env` file in the root directory of the project.

**`.env`:**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quote_app
DB_USER=quote_app_user
DB_PASSWORD=choose-a-local-password

SESSION_SECRET=your-generated-random-secret
NODE_ENV=development
```

Let's understand these values:

- `DB_HOST`: The hostname where PostgreSQL is running.
- `DB_PORT`: The port PostgreSQL listens on. The default is usually `5432`.
- `DB_NAME`: The database we want to connect to.
- `DB_USER`: The PostgreSQL account used by our application.
- `DB_PASSWORD`: The password associated with that account.
- `SESSION_SECRET`: The secret used by our session middleware, which we introduced in Workshop 2.
- `NODE_ENV`: Specifies the environment in which our application is running.

The `dotenv` package loads these values into `process.env`, allowing us to access them from JavaScript.

**Important:** Never upload your `.env` file to GitHub because it contains sensitive credentials.

Create a `.gitignore` file if you don't already have one:

```text
node_modules/
.env
```

This ensures Git ignores both installed dependencies and our environment configuration.

### Creating the Database Connection

As our application grows, we shouldn't establish a completely new database connection every time a route needs to execute a query.

Instead, we can use a **connection pool**.

A connection pool manages a collection of reusable database connections. When our application needs to execute a query, it obtains an available connection from the pool and returns it when the operation finishes.

This avoids repeatedly establishing and closing database connections.

The `pg` library provides the `Pool` class for this purpose.

Let's create a folder called `db` in the root directory:

```text
quote_sharing_app/
├── db/
│   └── pool.js
├── routes/
├── views/
├── public/
├── .env
├── .gitignore
├── package.json
└── app.js
```

**`db/pool.js`:**

```javascript
const { Pool } = require('pg');

// Check required environment variables
const requiredVariables = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
];

for (const variable of requiredVariables) {
    if (!process.env[variable]) {
        throw new Error(`${variable} is missing from the environment.`);
    }
}

// Create the PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Handle unexpected errors from idle connections
pool.on('error', (error) => {
    console.error('Unexpected database connection error:', error);
});

module.exports = pool;
```

Let's break down what happens here.

First, we import the `Pool` class from the `pg` package.

Then, we verify that our required environment variables exist. This prevents our application from silently starting with missing database credentials.

Next, we create the connection pool:

```javascript
const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});
```

The connection settings tell our application where PostgreSQL is running and which database account to use.

Finally, we export the pool:

```javascript
module.exports = pool;
```

This allows other files, especially our route handlers, to import the same connection pool and execute database queries.

### Testing the Database Connection

Before integrating PostgreSQL into our routes, let's verify that the connection works.

Create a file inside the `db` folder.

**`db/test-connection.js`:**

```javascript
const pool = require('./pool');

async function testConnection() {

    try {

        const result = await pool.query(
            'SELECT NOW() AS current_time'
        );

        console.log('Database connected successfully!');
        console.log('Database time:', result.rows[0].current_time);

    } catch (error) {

        console.error('Database connection failed:', error.message);

        process.exitCode = 1;

    } finally {

        await pool.end();

    }

}

testConnection();
```

Before running the test, we need to load our `.env` file.

Run:

```bash
node -r dotenv/config db/test-connection.js
```

If everything is configured correctly, you should see something similar to:

```text
Database connected successfully!
Database time: 2026-11-15T...
```

We have now successfully connected Node.js to PostgreSQL.

This is an important milestone because our Express application can now communicate with a real database.

## Designing Our Database

Now that our application can connect to PostgreSQL, we need to decide how to organize the information we want to store.

Before writing SQL queries from Express, we must first create the database tables.

We will start with a single table called `quotes`.

### Creating the Quotes Table

Our table needs to store the following information:

| Column | Data Type | Purpose |
|---|---|---|
| id | INTEGER | Unique identifier for each quote. |
| author | VARCHAR(100) | Name of the quote's author. |
| content | VARCHAR(300) | The quote's text. |
| created_at | TIMESTAMPTZ | When the quote was created. |
| updated_at | TIMESTAMPTZ | When the quote was last updated. |

Let's create a file called `schema.sql` inside our `db` directory.

**`db/schema.sql`:**

```sql
CREATE TABLE IF NOT EXISTS quotes (

    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    author VARCHAR(100) NOT NULL,

    content VARCHAR(300) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT author_min_length
        CHECK (char_length(btrim(author)) >= 3),

    CONSTRAINT content_not_empty
        CHECK (char_length(btrim(content)) > 0)

);
```

Let's understand the table definition.

**The `id` Column**

```sql
id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY
```

This creates an automatically generated identifier for each quote.

- `INTEGER`: The column stores integer values.
- `GENERATED ALWAYS AS IDENTITY`: PostgreSQL automatically generates a unique number whenever a new record is inserted.
- `PRIMARY KEY`: Ensures that each record has a unique identifier.

We don't need to manually generate IDs in our Express application.

PostgreSQL handles this automatically.

**The `author` Column**

```sql
author VARCHAR(100) NOT NULL
```

This stores the author's name.

- `VARCHAR(100)`: Stores text with a maximum length of 100 characters.
- `NOT NULL`: Prevents the column from containing a missing value.

**The `content` Column**

```sql
content VARCHAR(300) NOT NULL
```

This stores the quote itself.

We limit its maximum length to 300 characters to match the requirements from Workshop 2.

**The Timestamp Columns**

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
```

This automatically stores the date and time when a quote is created.

We also have:

```sql
updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
```

This initially contains the creation time. We will update it whenever a quote is modified.

**The Constraints**

At the end, we define two additional constraints.

```sql
CHECK (char_length(btrim(author)) >= 3)
```

This ensures that the author's name contains at least three non-whitespace characters.

And:

```sql
CHECK (char_length(btrim(content)) > 0)
```

This prevents empty or whitespace-only quotes.

Notice that we already introduced validation using `express-validator` in Workshop 2.

Why do we validate the data again inside the database?

Because application-level validation and database constraints serve different purposes.

- Application validation provides useful feedback to users.
- Database constraints protect the integrity of stored data, even if information reaches the database through another application or an unexpected code path.

This is an important principle: **validation in the application should not replace data integrity rules in the database.**

### Executing the SQL File

Now that we have defined our table, we need to execute the SQL file against our database.

From the root directory of the project, run:

```bash
psql -h localhost -U quote_app_user -d quote_app -f db/schema.sql
```

Alternatively, you can open pgAdmin, connect to the `quote_app` database, open the Query Tool, and execute the contents of `schema.sql`.

You should see a message indicating that the table was created successfully.

To verify the table, connect to the database:

```bash
psql -h localhost -U quote_app_user -d quote_app
```

Then execute:

```sql
SELECT * FROM quotes;
```

Since we haven't inserted any quotes yet, the result should be empty.

However, our table is ready to receive data.

## Working with SQL Queries

Before using PostgreSQL inside Express, let's understand how to communicate with our database using SQL.

We introduced the main SQL commands earlier. Now we will explore them with practical examples using our `quotes` table.

### INSERT: Adding New Records

The `INSERT` command allows us to add new information to a table.

For example:

```sql
INSERT INTO quotes (author, content)
VALUES (
    'Albert Einstein',
    'Life is like riding a bicycle. To keep your balance, you must keep moving.'
);
```

This inserts a new record into the `quotes` table.

Notice that we don't provide an `id`, `created_at`, or `updated_at`.

PostgreSQL automatically generates the ID and timestamps using the defaults we defined in the table.

We can also use the `RETURNING` clause:

```sql
INSERT INTO quotes (author, content)
VALUES ('Steve Jobs', 'Stay hungry, stay foolish.')
RETURNING *;
```

`RETURNING *` tells PostgreSQL to return the newly inserted record.

This is useful because our application may need the generated ID or other automatically generated values immediately after insertion.

### SELECT: Retrieving Records

The `SELECT` command retrieves information from a table.

To retrieve all quotes:

```sql
SELECT * FROM quotes;
```

The asterisk (`*`) means that we want all columns.

We can also retrieve only specific columns:

```sql
SELECT id, author, content
FROM quotes;
```

This is useful when we don't need every column in the table.

### Filtering Records with WHERE

Sometimes we don't want every record.

For example, we may want to retrieve quotes written by a specific author.

We can use `WHERE`:

```sql
SELECT *
FROM quotes
WHERE author = 'Albert Einstein';
```

This returns only records whose author matches the specified value.

We can also retrieve a specific quote using its ID:

```sql
SELECT *
FROM quotes
WHERE id = 1;
```

This is particularly useful when displaying or updating an individual record.

### Sorting Records with ORDER BY

We may want to display the newest quotes first.

We can use `ORDER BY`:

```sql
SELECT *
FROM quotes
ORDER BY created_at DESC;
```

Here:

- `ORDER BY` sorts the results.
- `created_at` specifies which column we use for sorting.
- `DESC` means descending order.

This displays the newest quotes first.

If we use `ASC`, records will be displayed in ascending order instead.

### Limiting Results with LIMIT

Sometimes retrieving every record isn't necessary.

We can use `LIMIT` to control the number of returned rows.

For example:

```sql
SELECT *
FROM quotes
ORDER BY created_at DESC
LIMIT 10;
```

This retrieves only the ten most recent quotes.

This is useful for our homepage, where we want to display a limited number of recent submissions.

### UPDATE: Modifying Existing Records

The `UPDATE` command modifies existing records.

For example:

```sql
UPDATE quotes
SET content = 'A new version of the quote.'
WHERE id = 1;
```

This changes the content of the quote whose ID is `1`.

Notice the importance of `WHERE`.

Without it:

```sql
UPDATE quotes
SET content = 'A new version of the quote.';
```

Every record in the table would be modified.

Always be careful when updating or deleting records.

### DELETE: Removing Records

The `DELETE` command removes records from a table.

For example:

```sql
DELETE FROM quotes
WHERE id = 1;
```

This deletes the quote whose ID is `1`.

Again, the `WHERE` condition is extremely important.

Without it:

```sql
DELETE FROM quotes;
```

All records in the table would be removed.

### Summary of CRUD Operations

We have now introduced the four fundamental operations used to manage data.

| Operation | SQL Command | Purpose |
|---|---|---|
| Create | INSERT | Add new records. |
| Read | SELECT | Retrieve records. |
| Update | UPDATE | Modify existing records. |
| Delete | DELETE | Remove records. |

These operations are collectively called **CRUD**, and they form the foundation of most data-driven applications.

In the next section, we will connect these operations to Express routes and allow users to perform them through our website.

## Integrating PostgreSQL into Our Express Application

Now that we understand the database structure and basic SQL operations, it's time to connect everything to our existing web application.

Remember that in Workshop 2, we created a Quote Sharing Application that stored quotes inside a JavaScript array.

We will now replace that temporary storage with PostgreSQL.

Instead of adding or retrieving information from a JavaScript array, our route handlers will execute SQL queries.

The overall process will look like this:

```text
        USER
          |
          v
      HTML FORM
          |
          v
    EXPRESS ROUTE
          |
          v
       SQL QUERY
          |
          v
      POSTGRESQL
          |
          v
     QUERY RESULT
          |
          v
      EXPRESS
          |
          v
       EJS VIEW
          |
          v
        USER
```

### Updating Our Project Structure

As we introduce database functionality, we will organize our project so that database configuration remains separate from route handling.

Our updated structure will look like this:

```text
quote_sharing_app/
├── db/
│   ├── pool.js
│   ├── schema.sql
│   └── test-connection.js
├── middlewares/
│   └── csrf.js
├── routes/
│   └── quotes.js
├── views/
│   ├── partials/
│   │   ├── _header.ejs
│   │   ├── _navbar.ejs
│   │   └── _footer.ejs
│   ├── home.ejs
│   ├── share.ejs
│   ├── show.ejs
│   ├── edit.ejs
│   ├── search.ejs
│   ├── 404.ejs
│   └── error.ejs
├── public/
│   └── css/
│       └── style.css
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── app.js
```

We will keep the templates, static files, form validation, and CSRF protection from Workshop 2.

Our main additions are:

- `db/`: Contains database configuration and SQL schema.
- `middlewares/`: Contains reusable middleware configuration.
- `routes/quotes.js`: Handles the application's quote-related operations.

### Configuring CSRF Protection

In Workshop 2, we introduced CSRF protection using `csrf-sync` and `express-session`.

We will continue using the same approach rather than introducing another CSRF implementation.

Create the following file:

**`middlewares/csrf.js`:**

```javascript
const { csrfSync } = require('csrf-sync');

const {
    generateToken,
    csrfSynchronisedProtection
} = csrfSync({
    getTokenFromRequest: (req) => req.body?._csrf
});

module.exports = {
    generateToken,
    csrfSynchronisedProtection
};
```

This allows us to import the token-generation function and protection middleware wherever we need them.

Notice that `csrf-sync` stores the CSRF token in the current session by default. This is why session middleware must be registered before our application routes.

We also configure the middleware to retrieve submitted tokens from the `_csrf` field in our HTML forms.

### Understanding Parameterized Queries

Before implementing our CRUD routes, there is one important concept we need to understand.

When sending user input to PostgreSQL, we should never directly concatenate that input into SQL statements.

Consider this example:

```javascript
const author = req.query.author;

const result = await pool.query(
    `SELECT * FROM quotes WHERE author = '${author}'`
);
```

This is dangerous because the user controls the value of `author`.

A malicious user could submit specially crafted input that changes the SQL statement being executed.

This can lead to an attack called **SQL Injection**.

To prevent this, we use **Parameterized Queries**.

For example:

```javascript
const author = req.query.author;

const result = await pool.query(
    'SELECT * FROM quotes WHERE author = $1',
    [author]
);
```

Here, `$1` represents a parameter placeholder.

The actual value is supplied separately through the second argument:

```javascript
[author]
```

For multiple parameters:

```javascript
const result = await pool.query(
    `SELECT *
     FROM quotes
     WHERE author = $1
     AND id = $2`,
    [author, id]
);
```

Here:

- `$1` receives the author's name.
- `$2` receives the quote ID.

The database driver safely transmits the SQL statement and its values separately.

This prevents user-provided values from being interpreted as SQL syntax.

**Always use parameterized queries when inserting, searching, updating, or deleting data based on user input.**

This is one of the most important database security practices students should learn.

### Understanding Query Results

When we execute a query using:

```javascript
const result = await pool.query(
    'SELECT * FROM quotes'
);
```

The returned object contains information about the executed query.

The most important property for us is:

```javascript
result.rows
```

This contains an array of records returned by PostgreSQL.

For example:

```javascript
console.log(result.rows);
```

Might produce:

```javascript
[
    {
        id: 1,
        author: 'Albert Einstein',
        content: 'Life is like riding a bicycle.',
        created_at: 2026-11-15T...
    },
    {
        id: 2,
        author: 'Steve Jobs',
        content: 'Stay hungry, stay foolish.',
        created_at: 2026-11-15T...
    }
]
```

Other useful properties include:

- `result.rowCount`: The number of rows affected by a query.
- `result.command`: The SQL command that was executed.
- `result.fields`: Metadata about returned columns.

For our workshop, we will primarily use `result.rows` and sometimes `result.rowCount`.

## Building Our First Database-Backed Application

Now we can connect everything together.

We will build the routes responsible for creating, displaying, searching, updating, and deleting quotes.

Before implementing them, remember the relationship between HTTP methods and CRUD:

| Operation | Typical HTTP Method | Route Example |
|---|---|---|
| Create | POST | `/share` |
| Read | GET | `/` or `/quotes/1` |
| Update | PUT or PATCH | `/quotes/1` |
| Delete | DELETE | `/quotes/1` |

Because traditional HTML forms support GET and POST directly, we will use POST for form submissions that update or delete records.

The important point is the operation being performed, not simply the name of the HTTP method.

### Creating the Quotes Router

Create a new file:

**`routes/quotes.js`:**

Start by importing the required packages and configuring our router.

```javascript
const express = require('express');

const {
    body,
    validationResult
} = require('express-validator');

const pool = require('../db/pool');

const {
    generateToken,
    csrfSynchronisedProtection
} = require('../middlewares/csrf');

const router = express.Router();
```

Here:

- `express` provides the router.
- `express-validator` validates submitted form data.
- `pool` provides access to our PostgreSQL database.
- `generateToken` creates CSRF tokens.
- `csrfSynchronisedProtection` protects state-changing requests.

### Read: Displaying Quotes on the Homepage

Let's start by retrieving the quotes stored in PostgreSQL.

In Workshop 2, our homepage displayed information from a JavaScript array.

Now we want it to retrieve the latest quotes directly from the database.

Add the following route to `quotes.js`:

```javascript
// Display the latest quotes
router.get('/', async (req, res) => {

    const result = await pool.query(
        `SELECT id, author, content, created_at
         FROM quotes
         ORDER BY created_at DESC
         LIMIT 20`
    );

    res.render('home', {
        quotes: result.rows,
        title: 'Recent Quotes'
    });

});
```

Let's understand what happens here.

First, we execute:

```sql
SELECT id, author, content, created_at
FROM quotes
ORDER BY created_at DESC
LIMIT 20;
```

This retrieves the 20 most recent quotes.

We then access the returned records through:

```javascript
result.rows
```

Finally, we pass them to our EJS template:

```javascript
res.render('home', {
    quotes: result.rows
});
```

This makes the retrieved records available through the `quotes` variable inside our template.

#### Creating the Homepage Template

**`views/home.ejs`:**

```ejs
<%- include('partials/_header', { title: 'Recent Quotes' }) %>

<%- include('partials/_navbar') %>

<main>

    <h1>Welcome to Quote Sharing!</h1>

    <p>Discover and share inspiring quotes.</p>

    <a href="/share" class="btn btn-primary">Share a Quote</a>

    <h2>Recent Quotes</h2>

    <% if (quotes.length > 0) { %>

        <div class="quotes-list">

            <% quotes.forEach(quote => { %>

                <article class="quote-card">

                    <blockquote>
                        <%= quote.content %>
                    </blockquote>

                    <p>— <%= quote.author %></p>

                    <a href="/quotes/<%= quote.id %>">
                        View Quote
                    </a>

                    <small>
                        <%= quote.created_at.toLocaleString() %>
                    </small>

                </article>

            <% }); %>

        </div>

    <% } else { %>

        <p>No quotes have been submitted yet.</p>

    <% } %>

</main>

<%- include('partials/_footer') %>
```

Let's examine the important parts.

We use:

```ejs
<% quotes.forEach(quote => { %>
```

to iterate over the records retrieved from PostgreSQL.

For each quote, we display:

- Its content.
- Its author.
- Its creation date.
- A link to view the individual quote.

Notice that we use:

```ejs
<%= quote.content %>
```

instead of:

```ejs
<%- quote.content %>
```

This ensures user-submitted text is HTML-escaped rather than interpreted as raw HTML.

This is important because user-generated content should not be trusted as HTML.

We also check whether the quotes array is empty and display an appropriate message when no records exist.

### Create: Submitting a New Quote

Next, we need to implement the operation that inserts new records into our database.

In Workshop 2, we created a form that allowed users to submit quotes.

We will reuse that idea, but instead of adding the submitted information to a JavaScript array, we will insert it into PostgreSQL.

#### Displaying the Submission Form

Add a GET route:

```javascript
// Display the quote submission form
router.get('/share', (req, res) => {

    res.render('share', {
        csrfToken: generateToken(req),
        errors: [],
        values: {
            author: '',
            content: ''
        },
        title: 'Share a Quote'
    });

});
```

This route renders the form and generates a CSRF token for the current session.

We also initialize the form values and validation errors.

#### Validating and Processing the Form

Now let's implement the POST route.

```javascript
// Handle quote submission
router.post('/share',

    csrfSynchronisedProtection,

    [
        body('author')
            .isString()
            .withMessage('Author must be text.')
            .bail()
            .trim()
            .notEmpty()
            .withMessage('Author name is required.')
            .bail()
            .isLength({ min: 3, max: 100 })
            .withMessage('Author name must be between 3 and 100 characters.'),

        body('content')
            .isString()
            .withMessage('Quote must be text.')
            .bail()
            .trim()
            .notEmpty()
            .withMessage('Quote cannot be empty.')
            .bail()
            .isLength({ max: 300 })
            .withMessage('Quote must not exceed 300 characters.')

    ],

    async (req, res) => {

        const errors = validationResult(req);

        const values = {
            author: typeof req.body.author === 'string' ? req.body.author : '',
            content: typeof req.body.content === 'string' ? req.body.content : ''
        };

        // Return the form if validation fails
        if (!errors.isEmpty()) {

            return res.status(400).render('share', {
                csrfToken: generateToken(req),
                errors: errors.array(),
                values,
                title: 'Share a Quote'
            });

        }

        const { author, content } = req.body;

        // Insert the quote into PostgreSQL
        const result = await pool.query(
            `INSERT INTO quotes (author, content)
             VALUES ($1, $2)
             RETURNING id`,
            [author, content]
        );

        const quoteId = result.rows[0].id;

        res.redirect(`/quotes/${quoteId}`);

    }

);
```

Let's break down the implementation.

**CSRF Protection**

The first middleware:

```javascript
csrfSynchronisedProtection
```

verifies that the request contains a valid CSRF token before processing the form.

**Input Validation**

We use `express-validator`, just as we did in Workshop 2.

The author must be between 3 and 100 characters, while the quote must not exceed 300 characters.

We also trim the values and reject empty submissions.

**Handling Validation Errors**

We collect the errors using:

```javascript
const errors = validationResult(req);
```

If the submitted information is invalid, we render the form again and preserve the submitted values.

**Database Insertion**

If validation succeeds, we execute:

```javascript
const result = await pool.query(
    `INSERT INTO quotes (author, content)
     VALUES ($1, $2)
     RETURNING id`,
    [author, content]
);
```

This is our first database insertion directly from an Express route.

We use `$1` and `$2` as placeholders for the author's name and quote content.

The submitted values are supplied separately through the array.

Finally, `RETURNING id` gives us the identifier generated by PostgreSQL.

We use that identifier to redirect the user to the newly created quote:

```javascript
res.redirect(`/quotes/${quoteId}`);
```

This is an example of the **Post/Redirect/Get** pattern.

After a successful POST request, we redirect the browser to a GET route rather than displaying the result directly from the POST request.

This avoids the usual browser form-resubmission problem when refreshing the resulting page.

#### Creating the Submission Template

**`views/share.ejs`:**

```ejs
<%- include('partials/_header', { title: 'Share a Quote' }) %>

<%- include('partials/_navbar') %>

<main>

    <h1>Share a Quote</h1>

    <form action="/share" method="POST">

        <input
            type="hidden"
            name="_csrf"
            value="<%= csrfToken %>"
        >

        <label for="author">Author Name:</label>

        <input
            type="text"
            id="author"
            name="author"
            value="<%= values.author %>"
            required
        >

        <% errors.forEach(error => { %>
            <% if (error.path === 'author') { %>
                <p class="error"><%= error.msg %></p>
            <% } %>
        <% }); %>

        <label for="content">Quote:</label>

        <textarea
            id="content"
            name="content"
            maxlength="300"
            required
        ><%= values.content %></textarea>

        <% errors.forEach(error => { %>
            <% if (error.path === 'content') { %>
                <p class="error"><%= error.msg %></p>
            <% } %>
        <% }); %>

        <button type="submit" class="btn btn-primary">
            Submit Quote
        </button>

    </form>

</main>

<%- include('partials/_footer') %>
```

The form contains two fields:

- Author name.
- Quote content.

It also includes the hidden CSRF token.

When submitted, the browser sends the form data to `/share` using POST.

Our route validates the information and inserts it into PostgreSQL.

### Read: Viewing an Individual Quote

We already implemented a route that displays multiple quotes on the homepage.

However, we also want users to open a specific quote.

For example:

```text
http://localhost:3000/quotes/1
```

Here, `1` is the ID of the requested quote.

Add the following route:

```javascript
// Display an individual quote
router.get('/quotes/:id', async (req, res) => {

    const id = Number(req.params.id);

    // Validate the ID
    if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(404).render('404', {
            title: 'Page Not Found',
            url: req.originalUrl
        });
    }

    const result = await pool.query(
        `SELECT id, author, content, created_at, updated_at
         FROM quotes
         WHERE id = $1`,
        [id]
    );

    // Check whether the quote exists
    if (result.rows.length === 0) {
        return res.status(404).render('404', {
            title: 'Quote Not Found',
            url: req.originalUrl
        });
    }

    res.render('show', {
        quote: result.rows[0],
        csrfToken: generateToken(req),
        title: 'View Quote'
    });

});
```

Let's understand what happens here.

First, we retrieve the ID from the URL:

```javascript
const id = Number(req.params.id);
```

Then, we verify that it is a positive safe integer.

Next, we query PostgreSQL:

```sql
SELECT id, author, content, created_at, updated_at
FROM quotes
WHERE id = $1;
```

The ID is passed separately as a parameter.

If the database doesn't contain a matching record, we return a `404 Not Found` response.

Otherwise, we render the `show.ejs` template and pass the retrieved quote to it.

#### Creating the Individual Quote Template

**`views/show.ejs`:**

```ejs
<%- include('partials/_header', { title: 'View Quote' }) %>

<%- include('partials/_navbar') %>

<main>

    <article class="quote-card">

        <h1>Quote Details</h1>

        <blockquote>
            <%= quote.content %>
        </blockquote>

        <p>— <%= quote.author %></p>

        <small>
            Created:
            <%= quote.created_at.toLocaleString() %>
        </small>

        <p>
            Last updated:
            <%= quote.updated_at.toLocaleString() %>
        </p>

    </article>

    <div class="form-actions">

        <a
            href="/quotes/<%= quote.id %>/edit"
            class="btn btn-primary"
        >
            Edit Quote
        </a>

        <form
            action="/quotes/<%= quote.id %>/delete"
            method="POST"
            onsubmit="return confirm('Are you sure you want to delete this quote?')"
        >

            <input
                type="hidden"
                name="_csrf"
                value="<%= csrfToken %>"
            >

            <button type="submit" class="btn btn-danger">
                Delete Quote
            </button>

        </form>

    </div>

    <a href="/">Back to Home</a>

</main>

<%- include('partials/_footer') %>
```

Here, we display the information retrieved from PostgreSQL.

We also provide two actions:

- Edit Quote.
- Delete Quote.

The delete action is implemented as a POST form containing a CSRF token.

This is important because deleting a record changes application data and should not be performed through a simple GET link.

### Update: Editing an Existing Quote

Now imagine a user notices a spelling mistake in a previously submitted quote.

Instead of submitting another quote, we want to allow the existing record to be modified.

This is where the UPDATE operation becomes useful.

We need two routes:

- GET `/quotes/:id/edit`: Displays the edit form.
- POST `/quotes/:id/edit`: Processes the changes.

#### Displaying the Edit Form

Add:

```javascript
// Display the quote editing form
router.get('/quotes/:id/edit', async (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(404).render('404', {
            title: 'Quote Not Found',
            url: req.originalUrl
        });
    }

    const result = await pool.query(
        'SELECT * FROM quotes WHERE id = $1',
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).render('404', {
            title: 'Quote Not Found',
            url: req.originalUrl
        });
    }

    res.render('edit', {
        quote: result.rows[0],
        csrfToken: generateToken(req),
        errors: [],
        values: {
            author: result.rows[0].author,
            content: result.rows[0].content
        },
        title: 'Edit Quote'
    });

});
```

This route retrieves the existing quote and passes its information to the edit template.

We also generate a CSRF token because the corresponding form will submit a state-changing request.

#### Processing the Update

Now we can implement the POST route:

```javascript
// Update an existing quote
router.post('/quotes/:id/edit',

    csrfSynchronisedProtection,

    [
        body('author')
            .isString()
            .withMessage('Author must be text.')
            .bail()
            .trim()
            .notEmpty()
            .withMessage('Author name is required.')
            .bail()
            .isLength({ min: 3, max: 100 })
            .withMessage('Author name must be between 3 and 100 characters.'),

        body('content')
            .isString()
            .withMessage('Quote must be text.')
            .bail()
            .trim()
            .notEmpty()
            .withMessage('Quote cannot be empty.')
            .bail()
            .isLength({ max: 300 })
            .withMessage('Quote must not exceed 300 characters.')

    ],

    async (req, res) => {

        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(404).render('404', {
                title: 'Quote Not Found',
                url: req.originalUrl
            });
        }

        // Ensure the quote exists
        const existingQuote = await pool.query(
            'SELECT id FROM quotes WHERE id = $1',
            [id]
        );

        if (existingQuote.rows.length === 0) {
            return res.status(404).render('404', {
                title: 'Quote Not Found',
                url: req.originalUrl
            });
        }

        const errors = validationResult(req);

        const values = {
            author: typeof req.body.author === 'string' ? req.body.author : '',
            content: typeof req.body.content === 'string' ? req.body.content : ''
        };

        if (!errors.isEmpty()) {

            return res.status(400).render('edit', {
                quote: { id },
                csrfToken: generateToken(req),
                errors: errors.array(),
                values,
                title: 'Edit Quote'
            });

        }

        const { author, content } = req.body;

        const result = await pool.query(
            `UPDATE quotes
             SET author = $1,
                 content = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING id`,
            [author, content, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).render('404', {
                title: 'Quote Not Found',
                url: req.originalUrl
            });
        }

        res.redirect(`/quotes/${id}`);

    }

);
```

Let's break down the important parts.

**Checking the Identifier**

We first validate that the requested ID is a positive integer.

Then we verify that the corresponding quote exists.

This prevents us from trying to update a record that isn't present.

**Validating User Input**

Just like our creation form, we validate the author and quote content.

If the input is invalid, we render the form again and preserve the submitted values.

**Executing the UPDATE Query**

The important operation is:

```javascript
const result = await pool.query(
    `UPDATE quotes
     SET author = $1,
         content = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id`,
    [author, content, id]
);
```

Here:

- `$1` represents the new author name.
- `$2` represents the new quote content.
- `$3` represents the ID of the record being modified.

We use `WHERE id = $3` to make sure that only the requested quote is updated.

We also change `updated_at` to the current timestamp.

Finally, we redirect the user to the updated quote.

#### Creating the Edit Template

**`views/edit.ejs`:**

```ejs
<%- include('partials/_header', { title: 'Edit Quote' }) %>

<%- include('partials/_navbar') %>

<main>

    <h1>Edit Quote</h1>

    <form
        action="/quotes/<%= quote.id %>/edit"
        method="POST"
    >

        <input
            type="hidden"
            name="_csrf"
            value="<%= csrfToken %>"
        >

        <label for="author">Author Name:</label>

        <input
            type="text"
            id="author"
            name="author"
            value="<%= values.author %>"
            required
        >

        <% errors.forEach(error => { %>
            <% if (error.path === 'author') { %>
                <p class="error"><%= error.msg %></p>
            <% } %>
        <% }); %>

        <label for="content">Quote:</label>

        <textarea
            id="content"
            name="content"
            maxlength="300"
            required
        ><%= values.content %></textarea>

        <% errors.forEach(error => { %>
            <% if (error.path === 'content') { %>
                <p class="error"><%= error.msg %></p>
            <% } %>
        <% }); %>

        <button type="submit" class="btn btn-primary">
            Save Changes
        </button>

    </form>

    <a href="/quotes/<%= quote.id %>">Cancel</a>

</main>

<%- include('partials/_footer') %>
```

Notice that the form action contains the quote's ID:

```html
action="/quotes/<%= quote.id %>/edit"
```

This allows our server to know which record the user wants to modify.

### Delete: Removing a Quote

The final CRUD operation is deleting an existing record.

We already added a delete form to our individual quote page.

Now we need to implement the corresponding route.

```javascript
// Delete an existing quote
router.post(
    '/quotes/:id/delete',

    csrfSynchronisedProtection,

    async (req, res) => {

        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(404).render('404', {
                title: 'Quote Not Found',
                url: req.originalUrl
            });
        }

        const result = await pool.query(
            `DELETE FROM quotes
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).render('404', {
                title: 'Quote Not Found',
                url: req.originalUrl
            });
        }

        res.redirect('/');

    }
);

module.exports = router;
```

Let's understand what happens.

First, we retrieve the quote ID from the URL.

Then, we execute:

```sql
DELETE FROM quotes
WHERE id = $1
RETURNING id;
```

This tells PostgreSQL to delete the record matching the supplied ID.

The `RETURNING` clause allows us to check whether a record was actually deleted.

If no matching record exists, PostgreSQL returns no rows, and we display a 404 page.

Otherwise, the user is redirected to the homepage.

We have now implemented the four main CRUD operations in Express.

**An important security limitation:** At this stage, our application doesn't have user authentication. Consequently, the edit and delete routes are accessible to anyone who can reach them. This is acceptable only for this isolated learning exercise. Don't deploy the application in this form. In the next workshop, we will introduce authentication and authorization and restrict these operations to permitted users.

### Search: Finding Quotes by Author

We have already learned how to retrieve records, but sometimes users don't want to display every quote.

They may want to find quotes written by a particular author.

In Workshop 2, we created a search form that used query parameters.

We will preserve that functionality but replace the JavaScript-array search with an SQL query.

Add the following route:

```javascript
// Search quotes by author
router.get('/search', async (req, res) => {

    const author = typeof req.query.author === 'string'
        ? req.query.author.trim()
        : '';

    let quotes = [];
    let searched = false;

    if (author) {

        const result = await pool.query(
            `SELECT id, author, content, created_at
             FROM quotes
             WHERE LOWER(author) = LOWER($1)
             ORDER BY created_at DESC`,
            [author]
        );

        quotes = result.rows;
        searched = true;

    }

    res.render('search', {
        author,
        quotes,
        searched,
        title: 'Search Quotes'
    });

});
```

Let's understand this query:

```sql
SELECT id, author, content, created_at
FROM quotes
WHERE LOWER(author) = LOWER($1)
ORDER BY created_at DESC;
```

The `LOWER()` function converts text to lowercase before comparing it.

This means searching for:

```text
Albert Einstein
```

will also match:

```text
ALBERT EINSTEIN
```

and:

```text
albert einstein
```

We also use `ORDER BY created_at DESC` to display the newest matching quotes first.

Notice that the query still uses a parameterized value rather than directly inserting the search term into the SQL statement.

#### Creating the Search Template

**`views/search.ejs`:**

```ejs
<%- include('partials/_header', { title: 'Search Quotes' }) %>

<%- include('partials/_navbar') %>

<main>

    <h1>Search Quotes</h1>

    <form action="/search" method="GET">

        <label for="author">Author Name:</label>

        <input
            type="text"
            id="author"
            name="author"
            value="<%= author %>"
            placeholder="Enter an author's name"
        >

        <button type="submit">
            Search
        </button>

    </form>

    <% if (searched) { %>

        <h2>Search Results</h2>

        <% if (quotes.length > 0) { %>

            <% quotes.forEach(quote => { %>

                <article class="quote-card">

                    <blockquote>
                        <%= quote.content %>
                    </blockquote>

                    <p>— <%= quote.author %></p>

                    <a href="/quotes/<%= quote.id %>">
                        View Quote
                    </a>

                </article>

            <% }); %>

        <% } else { %>

            <p>No quotes found for author.</p>

        <% } %>

    <% } %>

</main>

<%- include('partials/_footer') %>
```

Here, the form uses GET:

```html
<form action="/search" method="GET">
```

When someone searches for an author, the browser sends the search term through a query parameter.

For example:

```text
http://localhost:3000/search?author=Albert%20Einstein
```

Our Express route retrieves the value through:

```javascript
req.query.author
```

Then it sends the value to PostgreSQL and displays the matching results.

This is an excellent example of how the concepts from Workshop 1, Workshop 2, and Workshop 3 work together.

## Configuring Our Express Application

We have implemented the different operations, but our routes are still defined inside a separate router file.

We need to mount this router into the main Express application.

Before doing that, let's review the middleware we need.

From Workshop 2, we already introduced:

- EJS as our templating engine.
- `express.static()` for serving static files.
- `express.urlencoded()` for parsing form submissions.
- `express-session` for managing sessions.
- `csrf-sync` for CSRF protection.

We will keep those concepts and continue using the same implementation.

We don't need to introduce another templating engine, session system, or form-processing mechanism.

### Updating `app.js`

Our final `app.js` should look like this:

**`app.js`:**

```javascript
require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');

const pool = require('./db/pool');

const app = express();
const PORT = 3000;

// Check the session secret
if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is required.');
}

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse form data
app.use(express.urlencoded({
    extended: false,
    limit: '10kb'
}));

// Configure sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60
    }
}));

// Register application routes
app.use('/', require('./routes/quotes'));

// Handle unknown routes
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Page Not Found',
        url: req.originalUrl
    });
});

// Handle application errors
app.use((err, req, res, next) => {

    if (res.headersSent) {
        return next(err);
    }

    // Handle invalid CSRF tokens
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).render('error', {
            title: 'Invalid Submission',
            message: 'Your form submission is invalid or has expired. Please reload the form and try again.'
        });
    }

    console.error(err);

    res.status(500).render('error', {
        title: 'Server Error',
        message: 'Something went wrong while processing your request.'
    });

});

// Start the server after checking the database connection
async function startServer() {

    try {

        await pool.query('SELECT 1');

        console.log('Database connected successfully!');

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {

        console.error('Unable to connect to PostgreSQL:');
        console.error(error.message);

        process.exit(1);

    }

}

startServer();
```

Let's understand the important parts.

**Middleware Configuration**

We register the middleware before mounting our routes.

For example:

```javascript
app.use(express.urlencoded({
    extended: false,
    limit: '10kb'
}));
```

This allows Express to parse submitted form data before our route handlers attempt to access `req.body`.

We also configure the session middleware before our routes because CSRF protection depends on the session.

**Registering Our Router**

```javascript
app.use('/', require('./routes/quotes'));
```

This connects all the routes defined inside `quotes.js` to our main application.

We don't need to manually define each route inside `app.js`.

**Handling Unknown Routes**

The following middleware handles requests that don't match any registered route:

```javascript
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Page Not Found',
        url: req.originalUrl
    });
});
```

It must appear after our application routes.

**Handling Errors**

We also define error-handling middleware with four arguments:

```javascript
(err, req, res, next)
```

It handles unexpected application errors and invalid CSRF tokens.

Notice that we don't expose database error details to users. We log the error on the server and return a generic message to the browser.

This workshop uses Express 5, which automatically forwards rejected promises from asynchronous route handlers to error-handling middleware. If you are using Express 4, asynchronous errors must be forwarded explicitly.

**Checking the Database Connection**

Before starting the HTTP server, we execute:

```javascript
await pool.query('SELECT 1');
```

This checks whether PostgreSQL is reachable.

If the connection fails, the application reports the problem instead of starting with an unavailable database.

### Creating the Error Templates

We need two templates for our error responses.

**`views/404.ejs`:**

```ejs
<%- include('partials/_header', { title: title }) %>

<%- include('partials/_navbar') %>

<main>

    <h1>404 - Page Not Found</h1>

    <p>
        Sorry, the requested resource
        <strong><%= url %></strong>
        could not be found.
    </p>

    <a href="/">Return to Home</a>

</main>

<%- include('partials/_footer') %>
```

**`views/error.ejs`:**

```ejs
<%- include('partials/_header', { title: title }) %>

<%- include('partials/_navbar') %>

<main>

    <h1><%= title %></h1>

    <p><%= message %></p>

    <a href="/">Return to Home</a>

</main>

<%- include('partials/_footer') %>
```

These templates use the reusable components introduced in Workshop 2.

### Running Our Application

Now everything is connected.

Make sure:

- PostgreSQL is running.
- The `quote_app` database exists.
- The `quotes` table has been created.
- Your `.env` file is configured.
- The database connection works.

Run:

```bash
node app.js
```

You should see:

```text
Database connected successfully!
Server running at http://localhost:3000
```

Visit:

```text
http://localhost:3000
```

Our homepage should appear.

Submit a quote through `/share`, and it should be inserted into PostgreSQL.

You can verify this by connecting to the database and executing:

```sql
SELECT * FROM quotes;
```

You should see the newly submitted quote.

Now restart the Express server and visit the homepage again.

**The submitted quotes should still be there.**

This is the most important difference between our previous implementation and the current one.

We are no longer storing application data temporarily in JavaScript memory. We are using PostgreSQL to persist information independently of our server's execution.

## Understanding What We Have Built

Let's step back and examine the complete application.

In Workshop 1, we learned how Express receives HTTP requests and sends responses.

In Workshop 2, we learned how to render HTML pages, process forms, and validate submitted information.

Now, in Workshop 3, we have introduced a database that stores our application's information permanently.

Our application follows this process:

```text
         USER
           |
           v
      HTML PAGE
        (EJS)
           |
           v
       HTTP REQUEST
           |
           v
     EXPRESS ROUTE
           |
           v
     INPUT VALIDATION
           |
           v
      PARAMETERIZED
        SQL QUERY
           |
           v
       POSTGRESQL
           |
           v
       QUERY RESULT
           |
           v
      EXPRESS ROUTE
           |
           v
      EJS TEMPLATE
           |
           v
          HTML
           |
           v
          USER
```

Each technology has a specific responsibility:

| Technology | Responsibility |
|---|---|
| Express | Handles incoming requests and application routes. |
| EJS | Generates dynamic HTML pages. |
| express-validator | Validates submitted information. |
| csrf-sync | Protects state-changing form submissions against CSRF. |
| node-postgres (`pg`) | Connects Node.js to PostgreSQL. |
| PostgreSQL | Stores and manages application data. |

This is a basic example of how modern server-rendered applications are structured.

## Tasks

Now that we have connected PostgreSQL to Express and implemented CRUD operations, let's practice extending our application.

### Task 1: Add Quote Categories

Currently, our quotes only contain an author and content.

Extend the application by introducing categories.

For example:

- Motivation.
- Life.
- Technology.
- Success.
- Education.

Your task is to:

1. Add a `category` column to the quotes table.
2. Update the submission form to include a category field.
3. Validate the submitted category.
4. Insert the category into PostgreSQL.
5. Display the category alongside each quote.
6. Update the edit functionality so that users can change a quote's category.

For this task, you can use a fixed list of categories in an HTML `<select>` element.

### Task 2: Search Quotes by Content

Currently, our search functionality finds quotes by author.

Extend it so users can also search through the quote text.

For example:

```text
/search?content=life
```

The application should retrieve quotes containing the specified word or phrase.

Hint: PostgreSQL provides the `ILIKE` operator for case-insensitive pattern matching.

Example:

```sql
SELECT *
FROM quotes
WHERE content ILIKE $1;
```

Remember to pass the search pattern as a parameter rather than concatenating user input into the SQL statement.

### Task 3: Display the Total Number of Quotes

Improve the homepage by displaying the total number of quotes stored in the database.

For example:

```text
Total Quotes: 125
```

Hint:

```sql
SELECT COUNT(*) FROM quotes;
```

This introduces SQL aggregate functions and demonstrates how to retrieve statistics from a database.

### Task 4: Add Pagination

Currently, the homepage displays the 20 most recent quotes.

What happens when our application contains thousands of quotes?

Retrieving and displaying every record on a single page is inefficient.

Modify the homepage to display only a limited number of quotes per page.

For example:

- Page 1: Quotes 1–10.
- Page 2: Quotes 11–20.
- Page 3: Quotes 21–30.

Hint: PostgreSQL provides `LIMIT` and `OFFSET`.

For example:

```sql
SELECT *
FROM quotes
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;
```

Then:

```sql
SELECT *
FROM quotes
ORDER BY created_at DESC
LIMIT 10 OFFSET 10;
```

Use a query parameter such as `?page=2` to determine which records should be displayed.

### Task 5: Improve Quote Management

Extend the application so that:

- Users can see when a quote was last modified.
- The homepage displays the newest quotes first.
- Invalid quote IDs return a proper 404 response.
- Deleting a quote requires confirmation.
- Database errors are handled without exposing internal database information to the user.

## Final Project: Building a Database-Backed Quote Sharing Application

For the final project, we will take the Quote Sharing Application from Workshop 2 and transform it into a persistent web application.

The objective is to combine everything we have learned across the three workshops.

### Functional Requirements

#### Homepage (`/`)

- Retrieve quotes from PostgreSQL.
- Display the most recent quotes.
- Show the author and creation date.
- Display a message when no quotes exist.

#### Quote Submission (`/share`)

- Allow users to submit an author name and quote content.
- Validate submitted information.
- Store valid submissions in PostgreSQL.
- Protect the form with CSRF tokens.
- Preserve submitted values when validation fails.

#### Individual Quote (`/quotes/:id`)

- Retrieve a quote using its unique identifier.
- Display its information.
- Provide links for editing and deleting the quote.

#### Editing (`/quotes/:id/edit`)

- Retrieve the existing quote.
- Display its current information.
- Allow the user to modify it.
- Validate changes before updating the database.

#### Deleting (`/quotes/:id/delete`)

- Delete the selected quote.
- Verify that the record exists.
- Protect the deletion request using CSRF.
- Redirect to the homepage after successful deletion.

#### Searching (`/search`)

- Search for quotes by author.
- Support case-insensitive matching.
- Display all matching results.
- Show an appropriate message when no results are found.

#### Database Requirements

- Use PostgreSQL to store all quotes.
- Use a primary key to identify each quote.
- Store creation and modification timestamps.
- Use parameterized SQL queries.
- Apply appropriate database constraints.

#### Application Requirements

- Use Express for routing.
- Use EJS for dynamic HTML rendering.
- Reuse the partials introduced in Workshop 2.
- Serve static files through `express.static()`.
- Validate all submitted information on the server.
- Protect state-changing forms with CSRF tokens.
- Handle missing records and database errors.

**Important:** Editing and deleting are unrestricted in this workshop because we haven't introduced authentication yet. This is a development-only limitation. In the next workshop, we will introduce user accounts and permissions to ensure that users can only manage the records they are authorized to modify.

### Suggested Project Structure

Your final project should be organized as follows:

```text
quote_sharing_app/
│
├── db/
│   ├── pool.js
│   ├── schema.sql
│   └── test-connection.js
│
├── middlewares/
│   └── csrf.js
│
├── routes/
│   └── quotes.js
│
├── views/
│   ├── partials/
│   │   ├── _header.ejs
│   │   ├── _navbar.ejs
│   │   └── _footer.ejs
│   │
│   ├── home.ejs
│   ├── share.ejs
│   ├── show.ejs
│   ├── edit.ejs
│   ├── search.ejs
│   ├── 404.ejs
│   └── error.ejs
│
├── public/
│   └── css/
│       └── style.css
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── app.js
```

By completing this project, you should understand how to build a server-rendered application that communicates with a real relational database.

You will have moved beyond temporary JavaScript storage and learned how to create, retrieve, update, and delete persistent records using PostgreSQL.

This knowledge will prepare us for the next workshop, where we will introduce user accounts, authentication, and authorization.
## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [node-postgres: Parameterized queries](https://node-postgres.com/features/queries#parameterized-query)
- [Express: Database integration](https://expressjs.com/en/guide/database-integration.html)
- [OWASP: SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [OWASP: Query Parameterization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html)
