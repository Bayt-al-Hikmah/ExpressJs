# Fetch Client (Workshop 6 Example)

This example demonstrates how a browser page communicates with a JSON API using the **Fetch API**.

Express serves a small API and a static frontend. The frontend loads items with `fetch`, renders them into the DOM, and submits new items as JSON without a full page reload.

### What You'll Learn

- **JSON APIs:** Return structured data from Express with `res.json()`.
- **Static Frontend Hosting:** Serve HTML, CSS, and JavaScript from Express.
- **GET Requests with Fetch:** Load data when the page opens.
- **POST Requests with Fetch:** Send JSON in the request body.
- **Response Handling:** Check `response.ok` and parse JSON.
- **Safe DOM Updates:** Use `textContent` instead of injecting HTML.
- **Same-Origin Requests:** Rely on the browser's same-origin policy for relative URLs.

### Project Structure

- `server.js` — Express JSON API and static file hosting.
- `public/index.html` — Page with a form and an item list.
- `public/app.js` — Fetch client that loads and adds items.
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
| `/` | The HTML page and Fetch client. |
| `GET /api/items` | Returns the current in-memory item list. |
| `POST /api/items` | Accepts `{ "title": "..." }` and adds an item. |

Add an item through the form and watch the list refresh. Submit an empty title to see the API return a validation error that the client displays in the status area.

Items are stored in memory and reset whenever the server restarts.

### Workshop Objective

By the end of this example, you should be able to connect a browser interface to an Express JSON API and handle both successful and failed requests.
