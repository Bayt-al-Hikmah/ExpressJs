# Quote Sharing Web App (Workshop 2 Solution)

This solution combines the Workshop 2 concepts into a small server-rendered application where visitors can share and search quotes.

Quotes are stored in memory, so the application focuses on views, forms, validation, sessions, and CSRF protection rather than database persistence. Quotes are cleared whenever the server restarts.

### What This Solution Demonstrates

- **EJS Views and Partials:** A shared layout for the home, share, and search pages.
- **Static Assets:** CSS and images served with `express.static()`.
- **GET and POST Forms:** A share form that displays validation errors and preserves submitted values.
- **Automated Validation:** `express-validator` rules for the author name and quote text.
- **Session-Based CSRF Protection:** `csrf-sync` tokens embedded in every share form.
- **In-Memory Storage:** A simple array used as the quote store.
- **Author Search:** Case-insensitive filtering by author name.

### Project Structure

- `app.js` — Express setup, EJS configuration, sessions, static assets, and route mounting.
- `routes/quotes.js` — Home, share, and search routes with validation and CSRF protection.
- `views/home.ejs` — Recent quotes with a loop and an empty state.
- `views/share.ejs` — Quote submission form with errors and preserved values.
- `views/search.ejs` — Author search form and results.
- `views/partials/` — Shared header, navigation, and footer.
- `public/css/style.css` — Application styles.
- `public/images/logo.svg` — Logo used by the shared header.
- `package.json` — Project dependencies and the start script.

### Getting Started

**1. Install Dependencies**

```bash
npm install
```

**2. Configure the Session Secret**

```bash
export SESSION_SECRET="replace-with-random-secret"
```

The session secret signs the session cookie that stores the CSRF token state. Use a long, random value and keep it out of source control.

**3. Start the Application**

```bash
npm start
```

**4. Open the Application**

http://localhost:3000/

### Exploring the Solution

| Route | What to Explore |
|---|---|
| `/` | The 20 most recent quotes with an empty state when none exist. |
| `/share` | The submission form, validation errors, preserved input, CSRF token, and confirmation message. |
| `/search?author=alice` | Case-insensitive author search. |
| `/search` | Search behavior when no author is provided. |

Try submitting an empty form, a very long quote, and a valid quote. Inspect the hidden `_csrf` input and confirm that removing it causes the request to be rejected.

### Workshop Objective

By the end of this solution, you should be able to combine EJS views, form handling, validation, sessions, and CSRF protection in one complete Express application.
