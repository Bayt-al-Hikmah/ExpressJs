# Params and Query (Workshop 1 Example)

This example demonstrates how to read dynamic values from a URL in an **Express.js** application.

It compares two common ways of receiving input: **route parameters**, which are part of the URL path, and **query parameters**, which follow the `?` character. Both are read from the request object and used to build a response.

### What You'll Learn

- **Route Parameters:** Read dynamic path segments with `req.params`.
- **Query Parameters:** Read optional values from the query string with `req.query`.
- **Conditional Responses:** Return different results depending on whether a query value was provided.
- **JSON Responses:** Send structured data with `res.json()`.

### Project Structure

- `app.js` — Express server and route definitions.
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

### Exploring the Examples

| Route | What to Explore |
|---|---|
| `/user/Alice` | `req.params.username` is used to greet the user by name. |
| `/search?query=node%20tutorials` | `req.query.query` is read and returned as JSON. |
| `/search` | The route detects a missing query value and returns a prompt instead. |

Try changing the username in the path or the search term in the query string and observe how the response changes.

### Workshop Objective

By the end of this example, you should be able to choose between route parameters and query parameters and access both safely through the Express request object.
