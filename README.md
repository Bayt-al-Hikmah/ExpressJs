# Express.js Workshop Series

A 6-part, hands-on Express.js course in this repository. Each workshop includes a lesson (`WorkshopX.md`), runnable **Examples**, and **Solutions** with short READMEs (what it demonstrates, structure, how to run).

## Prerequisites
- **Frontend basics (HTML/CSS/JS)**: https://github.com/Bayt-al-Hikmah/Front_End
- **JavaScript / Node.js basics**: https://github.com/Bayt-al-Hikmah/Nodejs
- **SQL & databases**: https://github.com/Bayt-al-Hikmah/SQL
- Local setup as needed per workshop: Node.js/npm, and for later workshops PostgreSQL.

## Repository Structure

```text
.
├── README.md
├── Workshop1/  # Intro to backend, Node.js & Express
├── Workshop2/  # Templates, static files, forms & CSRF
├── Workshop3/  # PostgreSQL integration & CRUD
├── Workshop4/  # Prisma ORM, auth & authorization
├── Workshop5/  # File uploads & multimedia
└── Workshop6/  # REST APIs & API-driven frontend
```

Each `WorkshopX/` contains:
- `WorkshopX.md` — lecture/material and tasks
- `Examples/` — focused runnable examples for the workshop concepts
- `Solutions/` — solved tasks/projects for the workshop
- every example/solution has a `README.md` with scope, structure, and run steps

## Workshops

| # | Topic | Key concepts | Examples | Solutions |
|---|---|---|---|---|
| 1 | Node.js & Express basics | Client-server, Express app, middleware, routing, params/query, JSON APIs | `hello-express`, `params-and-query`, `product-api` | `task1-user-profile-api`, `task2-book-api`, `task3-request-logger` |
| 2 | Server-rendered pages & forms | EJS, partials/layout, static assets, GET/POST forms, validation, sessions & CSRF (in-memory) | `ejs-dynamic-pages`, `partials-and-static`, `forms-validation-csrf` | `quote-sharing-app` |
| 3 | PostgreSQL & CRUD | `pg` Pool, schema/constraints, parameterized SQL, CRUD, search, 404/error handling | `pg-connection`, `quotes-crud-app` | `task1-categories`, `task2-search-content`, `task3-total-count`, `task4-pagination`, `task5-improvements`, `final-quote-sharing-db` |
| 4 | Prisma, auth & authorization | Prisma models/relations/migrations, Argon2id, sessions, login/logout, CSRF, ownership checks | `prisma-basics`, `study-planner` | `task1-reading-tracker`, `task2-recipe-organizer`, `task3-event-management` |
| 5 | File uploads & multimedia | Multer, multipart forms, storage/limits, content validation, media metadata, secure serving, cleanup | `multer-basics`, `travel-journal` | `task1-product-catalogue`, `task2-assignment-submission`, `task3-event-gallery` |
| 6 | REST APIs & frontend integration | JSON APIs, validation, auth/CSRF, ownership, pagination/filtering, Fetch client, API uploads, rate limiting | `fetch-client`, `event-board-api` | `task1-equipment-catalogue-api`, `task2-pet-adoption-api`, `task3-learning-resource-api` |

## How to Use
1. Follow workshops in order — each builds on previous concepts.
2. Read `WorkshopX/WorkshopX.md`, run the examples, then complete/compare solutions.
3. For DB/Prisma projects: configure `.env`, create the database, apply schema/migrations (`db/schema.sql` or `npx prisma migrate dev && npx prisma generate`) before `npm start`.
4. Check each workshop’s **References** section for further reading.

Happy coding.
