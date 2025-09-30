### Objectives
- Implement user **registration, login, and logout** functionality using Express `express-session`.
- Build a simple wiki app where users can create and view pages.
- Handle **rich text** input safely using Markdown.
- Allow users to **upload files** (like avatars) and manage them securely.
- Explore the evolution of CSS: from component classes to **utility-first frameworks**.
### User Authentication
For this workshop, we’ll build a simple wiki application where users can register, log in, logout, and create content. Since we’re not using a database yet, we’ll simulate user storage with a JavaScript object. In a real application, you’d replace this with a database like MongoDB or PostgreSQL.
#### Simulating Our Database
In our application, we’ll create a JavaScript object to hold user and page data. This acts as our in-memory “database” for now.
**`routes/data.js`:**
```
const users = {}; // e.g., { 'username': { password: 'password123', avatar: null } }
const pages = {}; // e.g., { 'HomePage': { content: 'Welcome!', author: 'admin' } }

module.exports = { users, pages };
```
#### The Express `express-session` Middleware
How does our app remember who’s logged in across requests? Express uses the `express-session` middleware to manage **sessions**, which store user data in a secure cookie on the client’s browser. We can store information like the username in the session and access it on subsequent requests.  
To use sessions, Express requires a `secret` for signing the session cookie to prevent tampering. We’ll set this up in our main app file and use middleware to handle authentication.
**Install required packages**:
```
npm install express express-session ejs marked express-validator multer
```
#### Modular Routing with Express Router
Instead of defining all routes in `app.js`, we’ll use Express’s `Router` to organize routes into separate files for better modularity. This approach keeps our code clean and scalable, especially as the app grows. Each router acts as a mini-app, handling specific routes and middleware.  
Create a `routes` folder with an `auth.js` file for authentication routes and a `wiki.js` file for wiki-related routes.
**`routes/auth.js`:**
```
const express = require('express');
const { body, validationResult } = require('express-validator');
const { users } = require('./data');
const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register', { errors: [], messages: req.session.messages || [] });
    req.session.messages = [];
});

router.post('/register', [
    body('username').notEmpty().withMessage('Username is required').trim().isLength({ min: 3, max: 25 }),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array().map(err => ({ category: 'danger', message: err.msg }));
        return res.redirect('/register');
    }

    const { username, password } = req.body;
    if (users[username]) {
        req.session.messages = [{ category: 'danger', message: 'Username already exists!' }];
        return res.redirect('/register');
    }

    users[username] = { password, avatar: null };
    req.session.messages = [{ category: 'success', message: 'Registration successful! Please log in.' }];
    res.redirect('/login');
});

router.get('/login', (req, res) => {
    res.render('login', { errors: [], messages: req.session.messages || [] });
    req.session.messages = [];
});

router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array().map(err => ({ category: 'danger', message: err.msg }));
        return res.redirect('/login');
    }

    const { username, password } = req.body;
    const user = users[username];
    if (user && user.password === password) {
        req.session.username = username;
        req.session.messages = [{ category: 'success', message: 'Login successful!' }];
        res.redirect('/');
    } else {
        req.session.messages = [{ category: 'danger', message: 'Invalid username or password.' }];
        res.redirect('/login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;
```
**`app.js`:**

```
const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const wikiRoutes = require('./routes/wiki');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(session({
    secret: 'your-super-secret-key-that-no-one-knows',
    resave: false,
    saveUninitialized: false
}));
app.use(express.urlencoded({ extended: true }));

app.use(authRoutes);
app.use(wikiRoutes);

app.get('/', (req, res) => {
    res.render('index', { username: req.session.username, messages: req.session.messages || [] });
    req.session.messages = [];
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```
We use `express-session` to manage user sessions and `express.urlencoded` to parse form data. The `authRoutes` and `wikiRoutes` routers handle authentication and wiki functionality, respectively. Messages are stored in `req.session.messages`.
**`views/layout.ejs`:**
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>MyApp</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <header class="site-header">
        <div class="container header-inner">
            <a class="brand" href="/">MyApp</a>
            <nav class="main-nav">
                <% if (username) { %>
                    <span class="greet">Hello, <%= username %></span>
                    <a href="/logout" class="nav-link">Logout</a>
                <% } else { %>
                    <a href="/login" class="nav-link">Login</a>
                    <a href="/register" class="nav-link">Register</a>
                <% } %>
            </nav>
        </div>
    </header>

    <main class="container">
        <% if (messages && messages.length > 0) { %>
            <div class="flash-wrapper">
                <% messages.forEach(message => { %>
                    <div class="flash flash-<%= message.category.toLowerCase() %>">
                        <span class="flash-message"><%= message.message %></span>
                        <button class="flash-dismiss" onclick="this.parentElement.style.display='none'">×</button>
                    </div>
                <% }); %>
            </div>
        <% } %>

        <section class="content">
            <%- body %>
        </section>
    </main>

    <footer class="site-footer">
        <div class="container">
            <small>&copy; 2025 MyApp</small>
        </div>
    </footer>
</body>
</html>
```
**`views/register.ejs`:**
```
<%- include('layout') %>
<h1 class="page-title">Create an account</h1>

<form method="POST" class="form-card">
    <label for="username">Username</label>
    <input id="username" name="username" type="text" required>
    <% errors.forEach(error => { %>
        <% if (error.param === 'username') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <label for="password">Password</label>
    <input id="password" name="password" type="password" required>
    <% errors.forEach(error => { %>
        <% if (error.param === 'password') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <div class="form-actions">
        <button type="submit" class="btn btn-primary">Register</button>
        <a href="/login" class="btn btn-link">Already have an account?</a>
    </div>
</form>
```
**`views/login.ejs`:**
```
<%- include('layout') %>
<h1 class="page-title">Log in</h1>

<form method="POST" class="form-card">
    <label for="username">Username</label>
    <input id="username" name="username" type="text" required>
    <% errors.forEach(error => { %>
        <% if (error.param === 'username') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <label for="password">Password</label>
    <input id="password" name="password" type="password" required>
    <% errors.forEach(error => { %>
        <% if (error.param === 'password') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <div class="form-actions">
        <button type="submit" class="btn btn-success">Login</button>
        <a href="/register" class="btn btn-link">Create account</a>
    </div>
</form>
```
**`public/style.css`:**
```
/* Basic reset */
* { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }

:root {
    --container-width: 900px;
    --accent: #2b7cff;
    --muted: #6b7280;
    --bg: #f7f8fb;
    --card: #ffffff;
    --danger: #ef4444;
    --success: #16a34a;
    --info: #0ea5e9;
}

/* Layout */
body {
    background: var(--bg);
    color: #111827;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.container {
    width: 92%;
    max-width: var(--container-width);
    margin: 0 auto;
    padding: 24px 0;
}

/* Header */
.site-header {
    background: var(--card);
    box-shadow: 0 1px 2px rgba(16,24,40,0.06);
    border-bottom: 1px solid rgba(16,24,40,0.04);
}
.header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
}

.brand {
    font-weight: 700;
    color: var(--accent);
    text-decoration: none;
    font-size: 1.1rem;
}

.main-nav { display: flex; gap: 12px; align-items: center; }
.nav-link { text-decoration: none; color: var(--muted); font-size: 0.95rem; padding: 6px 8px; border-radius: 6px; }
.nav-link:hover { background: rgba(43,124,255,0.06); color: var(--accent); }

.greet { color: var(--muted); font-size: 0.95rem; margin-right: 8px; }

/* Flash messages */
.flash-wrapper { margin-bottom: 18px; display: flex; flex-direction: column; gap: 10px; }
.flash {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(16,24,40,0.04);
    background: #fff;
    border: 1px solid rgba(16,24,40,0.04);
}
.flash-message { flex: 1; margin-right: 8px; font-size: 0.95rem; }
.flash-dismiss {
    background: transparent;
    border: none;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    color: var(--muted);
}

/* Flash color variants */
.flash-success { border-color: rgba(22,163,74,0.15); background: rgba(22,163,74,0.05); color: #064e2b; }
.flash-danger { border-color: rgba(239,68,68,0.15); background: rgba(239,68,68,0.05); color: #4c0505; }
.flash-info { border-color: rgba(14,165,233,0.15); background: rgba(14,165,233,0.05); color: #063045; }

/* Content */
.page-title { font-size: 1.4rem; margin-bottom: 12px; color: #111827; }
.content { margin-top: 6px; }

/* Form card */
.form-card {
    display: grid;
    gap: 10px;
    padding: 18px;
    background: var(--card);
    border-radius: 10px;
    border: 1px solid rgba(16,24,40,0.04);
    max-width: 520px;
}
.form-card label { font-size: 0.9rem; color: var(--muted); }
.form-card input[type="text"],
.form-card input[type="password"],
.form-card input[type="email"],
.form-card textarea {
    padding: 10px;
    border-radius: 8px;
    border: 1px solid rgba(16,24,40,0.08);
    font-size: 1rem;
    width: 100%;
    background: #fff;
}

/* Buttons */
.btn {
    display: inline-block;
    padding: 9px 14px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
}
.btn-primary { background: var(--accent); color: white; border-color: rgba(43,124,255,0.1); }
.btn-success { background: var(--success); color: white; border-color: rgba(22,163,74,0.08); }
.btn-link { background: transparent; color: var(--muted); text-decoration: none; padding-left: 8px; }
.form-actions { display: flex; gap: 10px; align-items: center; margin-top: 6px; }

/* Card */
.card {
    padding: 16px;
    border-radius: 10px;
    background: var(--card);
    border: 1px solid rgba(16,24,40,0.04);
}

/* Footer */
.site-footer {
    margin-top: auto;
    padding: 18px 0;
    text-align: center;
    color: var(--muted);
    font-size: 0.9rem;
}
```
### Rich Text and Pages
A wiki needs to support **rich text** for formatted content like headings, bold text, and lists. Instead of allowing raw HTML (which is insecure), we’ll use **Markdown** and convert it to HTML on the server using the `marked` library.  
Install `marked`:
```
npm install marked
```
The wiki routes are defined in `routes/wiki.js` (shown above). The `/wiki/:pageName` route converts Markdown to HTML using `marked`, and the `/create` route lets users create pages with Markdown input.
**`views/wiki_page.ejs`:**
```
<%- include('layout') %>
<h1><%= pageName %></h1>
<p><em>By: <%= page.author %></em></p>
<hr>
<div>
    <%- page.htmlContent %>
</div>
```
**`views/create_page.ejs`:**
```
<%- include('layout') %>
<h1 class="page-title">Create a Wiki Page</h1>

<form method="POST" class="form-card">
    <label for="title">Page Title</label>
    <input id="title" name="title" type="text" required>
    <% errors.forEach(error => { %>
        <% if (error.param === 'title') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <label for="content">Content (Markdown supported)</label>
    <textarea id="content" name="content" rows="12" placeholder="# Heading
Write your text here...
- bullet list
**bold text**
*italic text*"></textarea>
    <% errors.forEach(error => { %>
        <% if (error.param === 'content') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <div class="form-actions">
        <button type="submit" class="btn btn-primary">Create Page</button>
    </div>
</form>

<div class="card" style="margin-top:16px;">
    <h3>Markdown Quick Reference</h3>
    <ul>
        <li><code># Heading</code> → Heading</li>
        <li><code>**bold**</code> → <strong>bold</strong></li>
        <li><code>*italic*</code> → <em>italic</em></li>
        <li><code>- Item</code> → bullet list</li>
        <li><code>[Link](https://example.com)</code> → link</li>
    </ul>
</div>
```
The `<%- %>` tag in `wiki_page.ejs` renders HTML content unescaped, as `marked` generates safe HTML from Markdown.
### Using CKEditor in Express

Markdown is great, but some users prefer a visual editor. **CKEditor** provides a WYSIWYG (What You See Is What You Get) interface, outputting HTML directly. We’ll use the `ckeditor` npm package to integrate it.
**Install CKEditor**:
```
npm install ckeditor4
```
Update `routes/wiki.js` to handle CKEditor input with `express-validator`:
**`routes/wiki.js` (updated `create` routes):**
```
const express = require('express');
const { body, validationResult } = require('express-validator');
const marked = require('marked');
const { pages } = require('./data');
const router = express.Router();

const requireLogin = (req, res, next) => {
    if (!req.session.username) {
        req.session.messages = [{ category: 'danger', message: 'You must be logged in to access this page.' }];
        return res.redirect('/login');
    }
    next();
};

router.get('/wiki/:pageName', (req, res) => {
    const pageName = req.params.pageName;
    const page = pages[pageName];
    if (!page) {
        return res.status(404).render('404', { username: req.session.username, messages: [] });
    }
    page.htmlContent = page.isMarkdown ? marked(page.content) : page.content;
    res.render('wiki_page', { page, pageName, username: req.session.username, messages: [] });
});

router.get('/create', requireLogin, (req, res) => {
    res.render('create_page', { username: req.session.username, errors: [], messages: req.session.messages || [] });
    req.session.messages = [];
});

router.post('/create', requireLogin, [
    body('title').notEmpty().withMessage('Page title is required').trim(),
    body('content').notEmpty().withMessage('Content is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array().map(err => ({ category: 'danger', message: err.msg }));
        return res.redirect('/create');
    }
    const { title, content } = req.body;
    pages[title] = { content, author: req.session.username, isMarkdown: true };
    res.redirect(`/wiki/${title}`);
});

router.get('/create-ck', requireLogin, (req, res) => {
    res.render('create_page_ck', { username: req.session.username, errors: [], messages: req.session.messages || [] });
    req.session.messages = [];
});

router.post('/create-ck', requireLogin, [
    body('title').notEmpty().withMessage('Page title is required').trim(),
    body('content').notEmpty().withMessage('Content is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array().map(err => ({ category: 'danger', message: err.msg }));
        return res.redirect('/create-ck');
    }
    const { title, content } = req.body;
    pages[title] = { content, author: req.session.username, isMarkdown: false };
    res.redirect(`/wiki/${title}`);
});

module.exports = router;
```
**`views/create_page_ck.ejs`:**
```
<%- include('layout') %>
<h1 class="page-title">Create a Wiki Page (CKEditor)</h1>

<form method="POST" class="form-card">
    <label for="title">Page Title</label>
    <input id="title" name="title" type="text" required>
    <% errors.forEach(error => { %>
        <% if (error.param === 'title') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <label for="content">Content</label>
    <textarea id="content" name="content"></textarea>
    <% errors.forEach(error => { %>
        <% if (error.param === 'content') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <div class="form-actions">
        <button type="submit" class="btn btn-primary">Create Page</button>
    </div>
</form>

<script src="/ckeditor/ckeditor.js"></script>
<script>
    CKEDITOR.replace('content');
</script>
```
Copy the CKEditor library to `public/ckeditor/` after downloading from `node_modules/ckeditor4/`. The `isMarkdown` flag in the `pages` object distinguishes between Markdown and CKEditor content, as CKEditor outputs HTML directly.
### File Uploads
Let’s allow users to upload profile pictures (avatars) using the `multer` middleware for secure file handling.  
**Install multer**:
```
npm install multer
```
Configure `multer` to store files in `public/avatars` with allowed extensions:  
**`routes/profile.js`:**  
```
const express = require('express');
const multer = require('multer');
const path = require('path');
const { users } = require('./data');
const router = express.Router();

const requireLogin = (req, res, next) => {
    if (!req.session.username) {
        req.session.messages = [{ category: 'danger', message: 'You must be logged in to access this page.' }];
        return res.redirect('/login');
    }
    next();
};

const upload = multer({
    dest: 'public/avatars/',
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

router.get('/', requireLogin, (req, res) => {
    const user = users[req.session.username];
    res.render('profile', { user, username: req.session.username, messages: req.session.messages || [] });
    req.session.messages = [];
});

router.post('/', requireLogin, upload.single('avatar'), (req, res) => {
    if (!req.file) {
        req.session.messages = [{ category: 'danger', message: 'No file selected or invalid file type.' }];
        return res.redirect('/profile');
    }
    const filename = req.file.filename;
    users[req.session.username].avatar = filename;
    req.session.messages = [{ category: 'success', message: 'Avatar updated!' }];
    res.redirect('/profile');
});

module.exports = router;
```
Update `app.js` to include the profile router:
```
const profileRoutes = require('./routes/profile');
// ...
app.use(profileRoutes);
```
Create the `public/avatars` folder before running the app. The `multer` middleware handles file uploads, ensuring only allowed file types are saved.  
**`views/profile.ejs`:**
```
<%- include('layout') %>
<div class="container">
    <h1>Welcome, <%= user.username %></h1>

    <div class="avatar-section">
        <% if (user.avatar) { %>
            <img src="/avatars/<%= user.avatar %>" alt="User Avatar" class="avatar">
        <% } else { %>
            <p>No avatar uploaded yet.</p>
        <% } %>
    </div>

    <form action="/profile" method="POST" enctype="multipart/form-data">
        <label for="avatar">Upload new avatar:</label>
        <input type="file" id="avatar" name="avatar" accept="image/*" required>
        <button type="submit" class="btn btn-primary">Upload</button>
    </form>
</div>
```
**Update `public/style.css` (add to existing):**
```
.avatar { max-width: 150px; border-radius: 10px; margin-bottom: 12px; }
```
The `enctype="multipart/form-data"` attribute is crucial for file uploads. `multer` sanitizes and saves files securely, and the `fileFilter` ensures only images are accepted.
### A Journey Through CSS Styling
Our wiki app is functional, but its appearance could use some polish. Let’s explore how CSS has evolved to make styling more efficient and maintainable.
#### Act I: The Specific Approach (Class-per-Element)
When starting with CSS, it’s tempting to create a unique class for each element. For example, a login button might have a class `.login-page-button` with all its styles defined explicitly.  
**`public/style.css` (example):**
```
.login-page-button {
    background-color: blue;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
}
```
**HTML:**
```
<button class="login-page-button">Login</button>
```
**Problem**: If we need a similar button on the register page, we’d create `.register-page-button` and duplicate the styles. This violates DRY (Don’t Repeat Yourself) principles, making maintenance difficult.
#### Act II: The Reusable Component (Shared Classes)
To avoid repetition, we create reusable **component classes**. A `.btn` class defines common button styles, and a `.btn-primary` class adds specific colors.  
**`public/style.css` (example):**
```
.btn {
    padding: 10px 20px;
    border-radius: 5px;
}
.btn-primary {
    background-color: blue;
    color: white;
}
```
**HTML:**
```
<button class="btn btn-primary">Login</button>
<button class="btn btn-primary">Register</button>
```
This approach, used by frameworks like Bootstrap, keeps styles DRY and makes updates easier by centralizing component styles.  
#### Act III: The Utility-First Revolution
Utility-first frameworks like **Tailwind CSS** take reusability further by providing single-purpose classes for individual CSS properties:

- `bg-blue-500`: Sets background color.
- `text-white`: Sets text color.
- `p-4`: Sets padding.
- `rounded-md`: Sets border-radius.

Instead of defining components, we combine these utilities directly in HTML, building styles on the fly. This creates a flexible, maintainable styling system without custom CSS for every component.  
**Example (with Tailwind classes):**
```
<button class="bg-blue-500 text-white p-4 rounded-md">Login</button>
```
