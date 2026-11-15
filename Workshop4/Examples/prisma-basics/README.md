# Prisma Basics (Workshop 4 Example)

This example introduces **Prisma ORM** in a JavaScript project with **PostgreSQL**.

It defines related `User`, `Project`, and `Task` models, applies a migration, generates Prisma Client, and runs a script that creates records, loads them with `include`, and cleans them up through a cascading delete.

### What You'll Learn

- **Prisma Models:** Define tables, fields, defaults, and relations in `schema.prisma`.
- **Field Mapping:** Map JavaScript-friendly field names to database column names with `@map`.
- **Migrations:** Create and apply the database schema with Prisma Migrate.
- **Prisma Client:** Query the database from JavaScript with the generated client.
- **CRUD Operations:** Create users, projects, and tasks.
- **Relations and `include`:** Load a project together with its tasks and owner.
- **Cascading Deletes:** Remove a user and rely on `onDelete: Cascade` to clean up related rows.
- **Prisma 7 Setup:** Use `prisma.config.ts` and the `@prisma/adapter-pg` driver adapter.

### Project Structure

- `prisma/schema.prisma` — Database models and relationships.
- `prisma.config.ts` — Prisma CLI configuration and datasource URL.
- `db/prisma.js` — Prisma Client initialization with the PostgreSQL adapter.
- `demo.js` — Example CRUD operations and relation loading.
- `generated/prisma/` — Generated Prisma Client output.
- `.env.example` — Example database connection URL.
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

Create a dedicated role and database:

```sql
CREATE ROLE prisma
WITH LOGIN PASSWORD 'prisma12345'
CREATEDB;

CREATE DATABASE prisma_basics
OWNER prisma;

\q
```

The `CREATEDB` permission is required because Prisma Migrate creates a temporary shadow database during development migrations.

**3. Configure Environment Variables**

```bash
cp .env.example .env
```

Set the connection URL to match the role and database you created:

```env
DATABASE_URL="postgresql://prisma:prisma12345@localhost:5432/prisma_basics"
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

**6. Run the Demo**

```bash
npm run demo
```

### Exploring the Example

The demo performs the following sequence:

| Step | What to Explore |
|---|---|
| Create a user | A `User` row is inserted with a unique username. |
| Create a project | The project is connected to the user through a relation. |
| Create tasks | Multiple tasks are inserted for the project. |
| Load with `include` | The project is fetched with its tasks and owner in one query. |
| Delete the user | Cascading deletes remove the related project and tasks. |

Run `npm run demo` more than once to see how the unique username constraint affects repeated runs, then inspect the database tables with `psql` if you want to follow each change.

### Workshop Objective

By the end of this example, you should understand how Prisma models, migrations, relations, and the generated client fit into an Express.js project.
