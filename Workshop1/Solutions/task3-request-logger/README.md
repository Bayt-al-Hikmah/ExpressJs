# Task 3: Request Logger Middleware (Workshop 1 Solution)

This solution demonstrates how to create reusable middleware in **Express.js**.

A logging middleware is registered with `app.use()`, so it runs for every incoming request before the route handler. The terminal records the HTTP method and URL, making it easier to observe application traffic.

### What This Solution Demonstrates

- **Custom Middleware:** Write a function that receives `req`, `res`, and `next`.
- **Global Registration:** Use `app.use()` to apply middleware to every route.
- **Request Information:** Read the method and URL from the request object.
- **Middleware Order:** Understand that middleware runs before the matching route handler.

### Project Structure

- `app.js` — Express server, logging middleware, and sample routes.
- `package.json` — Project dependencies and the start script.

### Getting Started

**1. Install Dependencies**

```bash
npm install
```

**2. Start the Application**

```bash
npm start
```

### Exploring the Solution

| Route | What to Explore |
|---|---|
| `/` | Visit the home page and watch the terminal log the request. |
| `/api/books/201` | A JSON route that also passes through the logger. |
| `/api/profile/Alice` | Another route to confirm the middleware is global. |
| `/missing` | The logger still runs even though no route matches. |

Each request should produce a line similar to:

```text
GET /api/books/201
```

### Workshop Objective

By the end of this solution, you should be able to write and register middleware that runs across an entire Express application.
