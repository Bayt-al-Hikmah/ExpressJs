# Task 1: User Profile API (Workshop 1 Solution)

This solution builds a simple user profile API with **Express.js**.

The API retrieves a profile by username from the URL. By default it returns only the public username; an optional `details=true` query parameter reveals the email and role. Unknown usernames produce a JSON 404 response.

### What This Solution Demonstrates

- **Route Parameters:** Read the requested username with `req.params.username`.
- **Case-Insensitive Lookup:** Normalize the username before searching the in-memory store.
- **Optional Query Parameters:** Use `req.query.details` to control the response shape.
- **Conditional JSON Responses:** Return different fields for basic and detailed requests.
- **404 Handling:** Respond with a clear error when a user does not exist.

### Project Structure

- `app.js` — Express server, sample users, and the `/api/profile/:username` endpoint.
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
| `/api/profile/Alice` | Retrieve Alice's basic profile. |
| `/api/profile/Alice?details=true` | Retrieve Alice's profile with email and role. |
| `/api/profile/bob` | Usernames are matched case-insensitively. |
| `/api/profile/Unknown` | See the JSON 404 response for a missing user. |

### Workshop Objective

By the end of this solution, you should be able to expose a small resource with Express, vary the response with query parameters, and handle missing records correctly.
