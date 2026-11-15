# Partials and Static Assets (Workshop 2 Example)

This example demonstrates how to keep EJS pages maintainable with reusable partials and how to serve static files such as stylesheets and images.

The shared header, navigation, and footer live in separate templates and are included by each page. This avoids duplicating markup and keeps the layout consistent across the site.

### What You'll Learn

- **EJS Partials:** Split repeated markup into files under `views/partials/`.
- **Template Includes:** Reuse partials with `<%- include(...) %>`.
- **Consistent Layout:** Apply the same header, navigation, and footer to multiple pages.
- **Static Files:** Serve CSS and images with `express.static()`.
- **Page Titles:** Pass per-page data to a shared layout.

### Project Structure

- `app.js` — Express server, EJS configuration, and routes.
- `views/partials/_header.ejs` — Shared document header and opening markup.
- `views/partials/_navbar.ejs` — Shared navigation bar.
- `views/partials/_footer.ejs` — Shared footer and closing markup.
- `views/index.ejs` — Home page that includes the partials.
- `views/about.ejs` — About page using the same partials.
- `public/css/style.css` — Stylesheet served as a static asset.
- `public/images/logo.svg` — Logo image served as a static asset.
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
| `/` | The home page assembled from shared partials. |
| `/about` | A second page that reuses the exact same layout. |
| `/css/style.css` | A static file served directly by Express. |
| `/images/logo.svg` | A static image used by the shared header. |

View the page source in your browser to see how the partials are combined into one HTML document.

### Workshop Objective

By the end of this example, you should be able to structure an Express view layer with reusable partials and correctly serve static assets.
