# Task 2: Book Information API (Workshop 1 Solution)

This solution builds a book information API with **Express.js**.

Clients request a book by its ID. The full book record is returned by default, while `summary=true` returns only the title and author. An unknown book ID produces a JSON 404 response.

### What This Solution Demonstrates

- **Route Parameters:** Read the requested book ID with `req.params.bookId`.
- **Optional Query Parameters:** Use `req.query.summary` to choose a shorter response.
- **Conditional JSON Responses:** Return either the full record or a summary.
- **404 Handling:** Respond with a clear error for missing books.

### Project Structure

- `app.js` — Express server, sample books, and the `/api/books/:bookId` endpoint.
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
| `/api/books/201` | Retrieve a complete book record. |
| `/api/books/201?summary=true` | Retrieve only the title and author. |
| `/api/books/202` | Try the second book in the sample data. |
| `/api/books/999` | See the JSON 404 response for a missing book. |

### Workshop Objective

By the end of this solution, you should be able to build a parameterized JSON endpoint that supports optional response shapes and handles missing resources.
