# Task 2: Recipe Organizer (Workshop 4 Solution)

This solution builds a recipe organizer with **Express.js, Prisma 7, and PostgreSQL**.

Users create recipes with an ingredient list. The schema uses an explicit many-to-many join model so each recipe can store a quantity for every ingredient without duplicating ingredient names.

### What This Solution Demonstrates

- **Explicit Many-to-Many:** Connect `Recipe` and `Ingredient` through `RecipeIngredient`.
- **Extra Join Fields:** Store `quantity` on the join model, not on either side.
- **Upsert:** Reuse an existing ingredient by name or create it when missing.
- **Per-User Ownership:** Recipes belong to the logged-in user and are filtered by owner.
- **Nested Writes:** Create a recipe and its ingredient rows in one Prisma operation.
- **Authentication and CSRF:** Register, log in, and protect all forms.
- **Relations with `include`:** Load recipes with ingredients for display.

### Project Structure

- `app.js` — Express setup, sessions, CSRF locals, routes, and error handlers.
- `prisma/schema.prisma` — `User`, `Recipe`, `Ingredient`, and `RecipeIngredient` models.
- `db/prisma.js` — Prisma Client initialization.
- `middleware/requireLogin.js` — Authentication guard for recipe routes.
- `middleware/csrf.js` — CSRF token helpers.
- `routes/auth.js` — Register, login, and logout.
- `routes/projects.js` — Recipe routes (mounted under `/projects`).
- `views/auth/` — Login and registration templates.
- `views/projects/index.ejs` — Recipe list and creation form.
- `views/partials/` — Shared layout partials.
- `public/` — Application CSS.
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
CREATE ROLE recipe_organizer
WITH LOGIN PASSWORD 'recipe12345'
CREATEDB;

CREATE DATABASE recipe_organizer
OWNER recipe_organizer;

\q
```

The `CREATEDB` permission is required for Prisma Migrate's shadow database.

**3. Configure Environment Variables**

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://recipe_organizer:study12345@localhost:5432/recipe_organizer"
SESSION_SECRET="replace-with-a-long-random-secret"
NODE_ENV=development
```

The example uses the `recipe_organizer` database name. Change `DATABASE_URL` if you create a different database.

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

### Exploring the Solution

| Route | What to Explore |
|---|---|
| `/register` | Create an account. |
| `/login` | Start a session. |
| `/logout` | End the session with a CSRF-protected request. |
| `/projects` | View your recipes and create a new one with an ingredient and quantity. |
| `/projects/:id/delete` | Delete one of your recipes. |

Create two recipes that use the same ingredient name to see the shared `Ingredient` row reused through the join table.

### Workshop Objective

By the end of this solution, you should be able to model and use an explicit many-to-many relationship with extra fields in Prisma.
