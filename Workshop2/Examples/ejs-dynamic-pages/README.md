# EJS Dynamic Pages (Workshop 2 Example)

This example demonstrates how to build dynamic web pages with **Express.js and EJS**.

Instead of sending static HTML, Express renders EJS templates and injects data from route handlers. The same templates can display different content for different URLs, which is the foundation of server-rendered applications.

### What You'll Learn

- **Template Engine Setup:** Configure EJS as the view engine and set the views directory.
- **Rendering Views:** Pass data from a route to a template with `res.render()`.
- **Dynamic Content:** Display values, conditions, and collections inside EJS.
- **Reusable Pages:** Use the same template structure for different kinds of pages.
- **Static Assets:** Serve CSS through `express.static()`.

### Project Structure

- `app.js` — Express server, EJS configuration, and route definitions.
- `views/index.ejs` — Home page with a dynamic name.
- `views/profile.ejs` — User profile with a bio and a rendered list.
- `views/dashboard.ejs` — Dashboard whose content depends on a route parameter.
- `views/tasks.ejs` — Task list rendered with a loop and an empty state.
- `public/css/style.css` — Stylesheet for the example pages.
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
| `/` | A simple page rendered with a name passed from the route. |
| `/profile/bob` | A dynamic profile with a bio and a shopping list. |
| `/dashboard/admin` | Conditional content based on the `:status` parameter. |
| `/tasks` | A collection rendered with an EJS loop and an empty-state check. |

Try changing the username or status in the URL to see how the same template produces different output.

### Workshop Objective

By the end of this example, you should understand how Express and EJS work together to turn application data into complete HTML pages.
