# Forms, Validation, and CSRF (Workshop 2 Example)

This workshop explores how to handle user input in an Express.js application, from submitting HTML forms to validating data and protecting application routes against common security threats.

Through three practical examples, you will learn how to handle GET and POST requests, process submitted form data, implement manual and automated validation, manage sessions, and protect forms against Cross-Site Request Forgery (CSRF) attacks.

### What You'll Learn

- **HTML Forms:** Understand how forms work and how to handle GET and POST requests in Express.
- **Form Data Processing:** Use `express.urlencoded` middleware to parse data submitted through HTML forms.
- **Manual Validation:** Implement your own validation logic to check user input and handle invalid submissions.
- **Automated Validation:** Use `express-validator` to define validation rules and manage validation errors.
- **Session Management:** Understand how sessions maintain user-related state across multiple requests.
- **CSRF Protection:** Use `csrf-sync` to protect form submissions against Cross-Site Request Forgery attacks.

### Project Structure

- `app.js` — Main application entry point. Configures middleware, sessions, and application routes.
- `routes/contact.js` — Basic form handling with manual validation.
- `routes/contact-validation.js` — Form validation using `express-validator`.
- `routes/contact-csrf.js` — CSRF-protected form with validation and session-backed tokens.
- `views/*.ejs` — EJS templates for rendering forms, displaying submitted data, and presenting validation errors.
- `views/partials/` — Shared header, navigation, and footer partials.
- `public/css/style.css` — Stylesheet for the application's user interface.
- `package.json` — Project dependencies and the start script.

### Getting Started

**1. Install Dependencies**

```bash
npm install
```

**2. Configure the Session Secret**

Set an environment variable for session configuration:

```bash
export SESSION_SECRET="replace-with-random-secret"
```

For a real application, use a strong, randomly generated secret and keep it outside your source code. If the variable is not set, the example falls back to a development-only secret.

**3. Start the Application**

```bash
npm start
```

### Exploring the Examples

Once the application is running, open the following routes to explore each implementation:

| Route | What to Explore |
|---|---|
| `/contact` | Basic HTML form handling with manual validation. |
| `/contact_val` | Form validation using `express-validator`. |
| `/contact_csrf` | Session-based CSRF protection using `csrf-sync`. |

Submit each form with missing, short, or invalid values to compare how errors are collected and displayed. Then submit valid data to see the confirmation message. On the CSRF-protected form, inspect the hidden `_csrf` field and try submitting after removing the session cookie to see the request rejected.

### Workshop Objective

By the end of this workshop, you should understand how user-submitted data travels from an HTML form to an Express route, how to validate that data before processing it, and why protecting forms is an essential part of building secure web applications.
