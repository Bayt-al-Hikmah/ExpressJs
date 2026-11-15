# Hello Express (Workshop 1 Example)

This example introduces **Express.js** and the fundamentals of building a web server.

Through a minimal application, you will see how an Express app is created, how middleware runs before routes, how an HTTP GET request is handled, and how a response travels back to the browser.

### What You'll Learn

- **Express Application:** Create an Express app and start it on a local port.
- **Middleware:** Register a custom middleware function that runs for every request.
- **Routing:** Define a GET route for the application root.
- **Responses:** Send a plain-text response with `res.send()`.
- **Request Lifecycle:** Follow a request from the client through middleware to the route handler and back.

### Project Structure

- `app.js` — Express server, logging middleware, and the root route.
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

**3. Open the Application**

http://localhost:3000/

### Exploring the Example

| Route | What to Explore |
|---|---|
| `/` | The server responds with `Hello, World!`. |
| Any URL | The terminal prints the HTTP method and requested URL before the response is produced. |

Try visiting a route that does not exist to see that the logging middleware still runs, while Express returns its default 404 response.

### Workshop Objective

By the end of this example, you should understand the basic shape of an Express application and how middleware participates in the request-response lifecycle.
