### Objectives
- Implement secure password hashing with `bcrypt` and protect routes using middleware.
- Introduce **SQLite** as a lightweight, file-based database for persistent data storage.
- Interact with the database using raw SQL queries, a custom `User` class, and the **Sequelize** ORM.
- Organize the project with a modular structure for scalability and maintainability.
### Project Structure
To build a maintainable Express.js application, we extend the modular structure from the previous lecture. This organization separates concerns, making it easier for teams to collaborate and for the codebase to scale. Here’s the structure:
```
my_express_project/
├── node_modules/
├── public/
│   ├── style.css
│   ├── avatars/
│   └── ckeditor/
├── views/
│   ├── layout.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── profile.ejs
│   ├── wiki_page.ejs
│   ├── create_page.ejs
│   └── create_page_ck.ejs
├── routes/
│   ├── auth.js
│   ├── wiki.js
│   └── profile.js
├── models/
│   ├── db.js
│   ├── user.js
│   └── page.js
├── utils/
│   └── auth.js
├── database.db
├── schema.sql
├── package.json
└── app.js
```
**Why this structure?** Separating routes, models, and utilities ensures that each file has a single responsibility. For example, `routes/auth.js` handles authentication logic, `models/user.js` manages database interactions, and `utils/auth.js` contains reusable middleware. This makes debugging easier, allows frontend developers to focus on `views/`, and lets database engineers work on `models/` without touching route logic. To set up, create these folders and files, install dependencies with `npm install express express-session ejs marked express-validator multer bcrypt sqlite3 sequelize`, and ensure the `public/avatars` and `public/ckeditor` directories exist.

### Hashed Passwords and Authentication
Authentication is the cornerstone of any multi-user application, allowing users to register, log in, and access protected resources securely. In the previous lecture, we used an in-memory object to store users, which was simple but not persistent. Now, we’ll store users in a SQLite database and secure their passwords with `bcrypt`, a robust library for hashing passwords. We’ll also use middleware to protect routes, ensuring only logged-in users can access sensitive pages like their profile.
#### Why Hash Passwords?
Storing passwords in plain text is a security disaster if someone accesses your database, they can steal credentials, especially since many users reuse passwords across sites. Hashing transforms a password into a fixed-length string using a one-way function, meaning even you, the developer, can’t reverse it. `bcrypt` adds a random “salt” to each hash, making it resistant to precomputed attacks (e.g., rainbow tables). When a user logs in, `bcrypt` hashes their input and compares it to the stored hash. If they match, access is granted.  
**How to set it up:** Install `bcrypt` with `npm install bcrypt`. Use `bcrypt.hash(password, 10)` to hash a password with 10 rounds of salting (a good balance of security and performance). Use `bcrypt.compare(password, hash)` to verify login attempts. We’ll integrate this into our authentication routes, storing hashed passwords in SQLite. 
**`utils/auth.js` (reused from previous lecture):**
```
const requireLogin = (req, res, next) => {
    if (!req.session.username) {
        req.session.messages = [{ category: 'danger', message: 'You must log in to access this page.' }];
        return res.redirect('/login');
    }
    next();
};

module.exports = { requireLogin };
```
**Explanation:** The `requireLogin` middleware checks if `req.session.username` exists, indicating a logged-in user. If not, it redirects to the login page with a flash message. This middleware is applied to protected routes, keeping our code DRY.  
**`routes/auth.js`:**
```
const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

const db = new sqlite3.Database('./database.db');

router.get('/register', (req, res) => {
    res.render('register', { errors: [], messages: req.session.messages || [] });
    req.session.messages = [];
});

router.post('/register', [
    body('username').notEmpty().withMessage('Username is required').trim().isLength({ min: 3, max: 25 }),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array().map(err => ({ category: 'danger', message: err.msg }));
        return res.redirect('/register');
    }

    const { username, password } = req.body;

    // Check if username exists
    db.get('SELECT * FROM user WHERE username = ?', [username], async (err, user) => {
        if (err) {
            req.session.messages = [{ category: 'danger', message: 'Database error.' }];
            return res.redirect('/register');
        }
        if (user) {
            req.session.messages = [{ category: 'danger', message: 'Username already exists!' }];
            return res.redirect('/register');
        }

        // Hash password and insert user
        const passwordHash = await bcrypt.hash(password, 10);
        db.run('INSERT INTO user (username, password_hash) VALUES (?, ?)', [username, passwordHash], (err) => {
            if (err) {
                req.session.messages = [{ category: 'danger', message: 'Registration failed.' }];
                return res.redirect('/register');
            }
            req.session.messages = [{ category: 'success', message: 'Registration successful! Please log in.' }];
            res.redirect('/login');
        });
    });
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
    db.get('SELECT * FROM user WHERE username = ?', [username], async (err, user) => {
        if (err || !user) {
            req.session.messages = [{ category: 'danger', message: 'Invalid username or password.' }];
            return res.redirect('/login');
        }

        if (await bcrypt.compare(password, user.password_hash)) {
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.messages = [{ category: 'success', message: 'Login successful!' }];
            res.redirect('/profile');
        } else {
            req.session.messages = [{ category: 'danger', message: 'Invalid username or password.' }];
            res.redirect('/login');
        }
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;
```
**How it works:** The `/register` route validates input with `express-validator`, checks for existing usernames in the SQLite database, hashes the password with `bcrypt`, and stores the user. The `/login` route verifies credentials by comparing the hashed password. The `/logout` route clears the session.   
**How to use:** Users visit `/register` to create an account, `/login` to sign in, and `/logout` to sign out. The session stores `userId` and `username` for tracking logged-in users.  
**`views/register.ejs` (unchanged from previous lecture):**
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
**`views/login.ejs` (unchanged from previous lecture):** 
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
#### Protecting Routes with Middleware
Repeating authentication checks in every route is inefficient and error-prone. The `requireLogin` middleware (from `utils/auth.js`) acts like a gatekeeper, ensuring only authenticated users access protected routes. This is similar to a Python decorator but implemented as Express middleware.  
**`routes/profile.js`:**
```
const express = require('express');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { requireLogin } = require('../utils/auth');
const router = express.Router();

const db = new sqlite3.Database('./database.db');

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
    db.get('SELECT id, username, avatar FROM user WHERE id = ?', [req.session.userId], (err, user) => {
        if (err || !user) {
            req.session.messages = [{ category: 'danger', message: 'User not found.' }];
            return res.redirect('/login');
        }
        res.render('profile', { user, username: req.session.username, messages: req.session.messages || [] });
        req.session.messages = [];
    });
});

router.post('/', requireLogin, upload.single('avatar'), (req, res) => {
    if (!req.file) {
        req.session.messages = [{ category: 'danger', message: 'No file selected or invalid file type.' }];
        return res.redirect('/profile');
    }
    const filename = req.file.filename;
    db.run('UPDATE user SET avatar = ? WHERE id = ?', [filename, req.session.userId], (err) => {
        if (err) {
            req.session.messages = [{ category: 'danger', message: 'Failed to update avatar.' }];
            return res.redirect('/profile');
        }
        req.session.messages = [{ category: 'success', message: 'Avatar updated!' }];
        res.redirect('/profile');
    });
});

module.exports = router;
```
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
**Explanation:** The `/profile` route uses `requireLogin` to ensure only authenticated users can view or update their profile. The `multer` middleware handles avatar uploads, restricting file types to images. **How to use:** After logging in, users visit `/profile` to view their profile or upload an avatar. The database stores the avatar filename, and the image is served from `public/avatars`.
### Working with SQLite
In-memory storage (used in the previous lecture) loses data on server restart. SQLite provides a lightweight, file-based database that persists data without requiring a separate server, making it ideal for learning and small projects.
#### Why SQLite?
- **Serverless**: No need for a database server like MySQL.
- **File-Based**: Stores all data in a single `database.db` file.
- **Simple Setup**: Works out of the box with Node.js via `sqlite3`.

**How to set it up:** Install `sqlite3` with `npm install sqlite3`. Create a `database.db` file by defining a schema and running it with SQLite.  
**`schema.sql`:**  
```
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS page;

CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT
);

CREATE TABLE page (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    is_markdown BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (author_id) REFERENCES user(id)
);
```
**How to initialize:** Run `sqlite3 database.db < schema.sql` in the terminal to create the database and tables. The `user` table stores user data, and the `page` table stores wiki pages with a foreign key linking to the author’s `id`.
#### Connecting Express with SQLite
The `sqlite3` package lets us connect to SQLite and execute queries. We use parameterized queries (`?`) to prevent SQL injection, a security risk where malicious input could manipulate database queries.  
**`app.js`:**
```
const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const wikiRoutes = require('./routes/wiki');
const profileRoutes = require('./routes/profile');
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
app.use(profileRoutes);

app.get('/', (req, res) => {
    res.render('index', { username: req.session.username, messages: req.session.messages || [] });
    req.session.messages = [];
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```
**Explanation:** The `app.js` file sets up the Express app, configures middleware (`express-session`, `express.urlencoded`, `express.static`), and mounts routers. The SQLite connection is handled in individual route files for raw SQL, ensuring modularity. **How to use:** Start the app with `node app.js`, and it will connect to `database.db` for persistent storage.
#### Refactoring with a User Class
Mixing raw SQL in routes creates repetitive code and couples business logic with database operations. A `User` class encapsulates database interactions, making routes cleaner and more maintainable.  
**`models/user.js`:**
```
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

class User {
    static db = new sqlite3.Database('./database.db');

    static async create(username, password) {
        const passwordHash = await bcrypt.hash(password, 10);
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO user (username, password_hash) VALUES (?, ?)',
                [username, passwordHash],
                function (err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    static findByUsername(username) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM user WHERE username = ?',
                [username],
                (err, user) => {
                    if (err) return reject(err);
                    resolve(user);
                }
            );
        });
    }
}

module.exports = User;
```
**`routes/auth.js` (refactored):**
```
const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register', { errors: [], messages: req.session.messages || [] });
    req.session.messages = [];
});

router.post('/register', [
    body('username').notEmpty().withMessage('Username is required').trim().isLength({ min: 3, max: 25 }),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array().map(err => ({ category: 'danger', message: err.msg }));
        return res.redirect('/register');
    }

    const { username, password } = req.body;
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
        req.session.messages = [{ category: 'danger', message: 'Username already exists!' }];
        return res.redirect('/register');
    }

    await User.create(username, password);
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
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array().map(err => ({ category: 'danger', message: err.msg }));
        return res.redirect('/login');
    }

    const { username, password } = req.body;
    const user = await User.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        req.session.messages = [{ category: 'danger', message: 'Invalid username or password.' }];
        return res.redirect('/login');
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.messages = [{ category: 'success', message: 'Login successful!' }];
    res.redirect('/profile');
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;
```
**Explanation:** The `User` class encapsulates database operations like creating a user or finding one by username. Routes call these methods instead of raw SQL, reducing duplication and separating concerns. **How to use:** The `User.create` method hashes the password and inserts a new user, while `User.findByUsername` retrieves user data for login checks. This makes it easy to add new user-related features without rewriting SQL.
#### Using Sequelize and Models
Raw SQL, even with a `User` class, ties our code to SQLite-specific syntax. Switching to another database (e.g., PostgreSQL) would require rewriting queries. **Sequelize**, an ORM, abstracts database operations into JavaScript objects, making our code database-agnostic and easier to maintain.  
**Why Sequelize?** It lets us define tables as models (e.g., `User`, `Page`), interact with rows as objects, and handles SQL generation. This separates business logic from database logic.  
**`models/user.js` (Sequelize version):**
```
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const sequelize = new Sequelize('sqlite:./database.db', { logging: false });

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(150),
        unique: true,
        allowNull: false
    },
    password_hash: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    avatar: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'user',
    timestamps: false
});

User.prototype.setPassword = async function (password) {
    this.password_hash = await bcrypt.hash(expr password, 10);
};

User.prototype.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

User.sync();

module.exports = User;
```
**`models/page.js`:**
```
const { Sequelize, DataTypes } = require('sequelize');
const User = require('./user');

const sequelize = new Sequelize('sqlite:./database.db', { logging: false });

const Page = sequelize.define('Page', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_markdown: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'page',
    timestamps: false
});

Page.belongsTo(User, { foreignKey: 'author_id' });
User.hasMany(Page, { foreignKey: 'author_id' });

Page.sync();

module.exports = Page;
```
**`routes/auth.js` (Sequelize version):**
```
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register', { errors: [], messages: req.session.messages || [] });
    req.session.messages = [];
});

router.post('/register', [
    body('username').notEmpty().withMessage('Username is required').trim().isLength({ min: 3, max: 25 }),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array().map(err => ({ category: 'danger', message: err.msg }));
        return res.redirect('/register');
    }

    const { username, password } = req.body;
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
        req.session.messages = [{ category: 'danger', message: 'Username already exists!' }];
        return res.redirect('/register');
    }

    const user = User.build({ username });
    await user.setPassword(password);
    await user.save();
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
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array().map(err => ({ category: 'danger', message: err.msg }));
        return res.redirect('/login');
    }

    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !(await user.checkPassword(password))) {
        req.session.messages = [{ category: 'danger', message: 'Invalid username or password.' }];
        return res.redirect('/login');
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.messages = [{ category: 'success', message: 'Login successful!' }];
    res.redirect('/profile');
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;
```
**`routes/profile.js` (Sequelize version):**
```
const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/user');
const { requireLogin } = require('../utils/auth');
const router = express.Router();

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

router.get('/', requireLogin, async (req, res) => {
    const user = await User.findByPk(req.session.userId);
    if (!user) {
        req.session.messages = [{ category: 'danger', message: 'User not found.' }];
        return res.redirect('/login');
    }
    res.render('profile', { user: user.toJSON(), username: req.session.username, messages: req.session.messages || [] });
    req.session.messages = [];
});

router.post('/', requireLogin, upload.single('avatar'), async (req, res) => {
    if (!req.file) {
        req.session.messages = [{ category: 'danger', message: 'No file selected or invalid file type.' }];
        return res.redirect('/profile');
    }
    const user = await User.findByPk(req.session.userId);
    user.avatar = req.file.filename;
    await user.save();
    req.session.messages = [{ category: 'success', message: 'Avatar updated!' }];
    res.redirect('/profile');
});

module.exports = router;
```

**Explanation:** Sequelize models (`User`, `Page`) define the database schema as JavaScript objects. The `setPassword` and `checkPassword` methods encapsulate `bcrypt` logic, while `Page.belongsTo(User)` establishes a relationship. Routes use model methods like `User.findOne` or `Page.create` instead of SQL, making the code portable across databases. **How to use:** Sequelize automatically syncs models with the database (`User.sync()`, `Page.sync()`). Users register and log in as before, but data is now stored persistently in SQLite.
#### Updating Wiki Routes for SQLite
To support the wiki functionality, we store pages in the `page` table, linking each page to its author via `author_id`. The `is_markdown` field distinguishes between Markdown and CKEditor content.  
**`routes/wiki.js` (Sequelize version):**
```
const express = require('express');
const { body, validationResult } = require('express-validator');
const marked = require('marked');
const { requireLogin } = require('../utils/auth');
const Page = require('../models/page');
const User = require('../models/user');
const router = express.Router();

router.get('/wiki/:pageTitle', async (req, res) => {
    const pageTitle = req.params.pageTitle;
    const page = await Page.findOne({ where: { title: pageTitle }, include: [{ model: User, attributes: ['username'] }] });
    if (!page) {
        return res.status(404).render('404', { username: req.session.username, messages: [] });
    }
    page.htmlContent = page.is_markdown ? marked(page.content) : page.content;
    res.render('wiki_page', { page: page.toJSON(), pageName: page.title, username: req.session.username, messages: [] });
});

router.get('/create', requireLogin, (req, res) => {
    res.render('create_page', { username: req.session.username, errors: [], messages: req.session.messages || [] });
    req.session.messages = [];
});

router.post('/create', requireLogin, [
    body('title').notEmpty().withMessage('Page title is required').trim(),
    body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array().map(err => ({ category: 'danger', message: err.msg }));
        return res.redirect('/create');
    }
    const { title, content } = req.body;
    try {
        await Page.create({ title, content, author_id: req.session.userId, is_markdown: true });
        res.redirect(`/wiki/${title}`);
    } catch (err) {
        req.session.messages = [{ category: 'danger', message: 'Failed to create page.' }];
        res.redirect('/create');
    }
});

router.get('/create-ck', requireLogin, (req, res) => {
    res.render('create_page_ck', { username: req.session.username, errors: [], messages: req.session.messages || [] });
    req.session.messages = [];
});

router.post('/create-ck', requireLogin, [
    body('title').notEmpty().withMessage('Page title is required').trim(),
    body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array().map(err => ({ category: 'danger', message: err.msg }));
        return res.redirect('/create-ck');
    }
    const { title, content } = req.body;
    try {
        await Page.create({ title, content, author_id: req.session.userId, is_markdown: false });
        res.redirect(`/wiki/${title}`);
    } catch (err) {
        req.session.messages = [{ category: 'danger', message: 'Failed to create page.' }];
        res.redirect('/create-ck');
    }
});

module.exports = router;
```
**`views/wiki_page.ejs` (unchanged from previous lecture):**
```
<%- include('layout') %>
<h1><%= pageName %></h1>
<p><em>By: <%= page.username %></em></p>
<hr>
<div>
    <%- page.htmlContent %>
</div>
```
**`views/create_page.ejs` (unchanged from previous lecture):**
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
**`views/create_page_ck.ejs` (unchanged from previous lecture):**
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
**Explanation:** The wiki routes store pages in the `page` table, using `author_id` to link to the `user` table. The `/wiki/:pageTitle` route fetches a page and its author’s username, rendering Markdown or CKEditor content. The `/create` and `/create-ck` routes allow logged-in users to create pages, with `is_markdown` determining the content type.   
**How to use:** Users visit `/create` to write Markdown pages or `/create-ck` for a visual editor. Pages are stored persistently and accessible via `/wiki/:pageTitle`.
### Restructuring Our Project
The modular structure ensures scalability and collaboration.  
**Why it matters:** A single `app.js` file with all logic becomes unmanageable as the app grows. By separating routes, models, and utilities, we make it easier to add features (e.g., page editing, comments) and maintain the codebase.    
**How to use:** Developers work on specific modules (e.g., routes for new features, models for database changes) without affecting other parts. Run `node app.js` to start the server, and test the app at `http://localhost:3000`.
