## Objectives

- Implement user **registration, login, and logout** functionality using Express `iron-session`.
- Build a simple wiki app where users can create and view pages.
- Handle **rich text** input safely using Markdown.
- Allow users to **upload files** and manage them securely.
- Explore the evolution of CSS: from component classes to **utility-first frameworks**.

## User Authentication

User authentication is a foundational aspect of web applications, ensuring that only authorized individuals can access certain features or data. In our wiki app, authentication allows us to track who creates content, personalize experiences, and secure sensitive actions like uploading files. We'll use session-based authentication, which is straightforward for server-side apps like those built with Express.js. This method stores user information on the server and sends a session ID to the client via cookies, making it secure against common attacks when configured properly.

### Simulating Our Database

Since we’re not using a database yet, we’ll simulate user storage with a JavaScript object. In a real application, we replace this with a database like MongoDB or PostgreSQL. Simulating a database with in-memory objects is a common practice during development or for small-scale prototypes. It allows us to focus on application logic without the overhead of setting up a full database system. However, keep in mind that this data will be lost when the server restarts, so it's not suitable for production. In a real-world scenario, you'd integrate an ORM like Mongoose for MongoDB to persist data across sessions.

**`app.js`:**
To create the database we add to app.js the following lines
```javascript
app.locals.users = {}; // e.g., { 'username': { password: 'password123', avatar: null } }
app.locals.pages = {}; // e.g., { 'HomePage': { content: 'Welcome!', author: 'admin' } }

```

This simple object structure mimics key-value storage: users are indexed by username, and pages by their titles. Each user entry holds a password and an optional avatar. Pages store content, author, and later, flags for content type.  
We access them inside our routes by using `req.app.locals.users` and for pages `req.app.locals.pges`

### The Express `iron-session` Middleware

How does our app remember who’s logged in across requests? Express uses the **`iron-session`** middleware to manage **sessions**, which store encrypted user data directly in a secure cookie on the client’s browser. Unlike traditional session systems that rely on a server-side store like Redis, `iron-session` keeps the data client-side but it’s sealed using strong encryption and signing keys, so the contents cannot be read or tampered with.

We can safely store lightweight information, such as a username or user ID, inside this encrypted cookie and access it on subsequent requests. This allows our app to maintain state between HTTP requests while staying stateless on the server. `iron-session` uses a secret key (defined in our environment variables) to encrypt and sign the session cookie. It’s essential that this key be long and random to ensure security.

**Install required packages**:

```bash
npm install express iron-session ejs marked express-validator multer dotenv
```

These packages provide: Express for the web framework, iron-session for sessions, EJS for templating, marked for Markdown parsing, dotenv for accessing environment variables, express-validator for input validation, and multer for file uploads. Always install dependencies at the start to ensure your environment is ready.

### Creating the Routes
Create a `routes` folder with an `auth.js` file for authentication routes.

**`routes/auth.js`:**

```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/register', async(req, res) => {
    
    const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    req.session.errors = [];
    await req.session.save();
    res.render('register', { errors, messages , username});
});

router.post('/register', [
    body('username').notEmpty().withMessage('Username is required').trim().isLength({ min: 3, max: 25 }),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.errors;
        await req.session.save();
        return res.redirect('/register');
    }

    const { username, password } = req.body;
    if (req.app.locals.users[username]) {
        req.session.messages = [{ category: 'danger', message: 'Username already exists!' }];
        await req.session.save();
        return res.redirect('/register');
    }

    req.app.locals.users[username] = { password, avatar: null };
    req.session.messages = [{ category: 'success', message: 'Registration successful! Please log in.' }];
    await req.session.save();
    res.redirect('/login');
});

router.get('/login', async (req, res) => {
      const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    req.session.errors = [];
    await req.session.save();
      res.render('login', { errors, messages ,username});
});

router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.errors;
        await req.session.save();
        return res.redirect('/login');
    }

    const { username, password } = req.body;
    const user = req.app.locals.users[username];
    if (user && user.password === password) {
        req.session.user = { username };
        req.session.messages = [{ category: 'success', message: 'Login successful!' }];
        await req.session.save();
        res.redirect('/');
    } else {
        req.session.messages = [{ category: 'danger', message: 'Invalid username or password.' }];
        await req.session.save();
        res.redirect('/login');
    }
});

router.get('/logout',  async  (req, res) => {
    await req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
```
**GET /register**

When a user visits `/register`, the server renders the registration page using the EJS template engine.  
It also passes any **flash messages** (like “Username already exists” or “Registration successful”) stored in the session to the template.  
After rendering, these messages are cleared to avoid displaying them again on subsequent requests.  
This provides users with immediate feedback about their registration attempts or validation errors.


 **POST /register**

When the registration form is submitted, the server receives the `username` and `password` from the request body.

1. **Validation:**  
    The input fields are first validated using `express-validator`.
    
    - The username must be between 3 and 25 characters.
        
    - The password must be at least 6 characters long.  
        If any validation errors occur, they are converted into flash messages and displayed on the registration page.
        
2. **Duplicate Check:**  
    The server checks if the username already exists in the in-memory `users` store.
    
    - If it does, a danger message (“Username already exists!”) is stored in the session, and the user is redirected back to `/register`.
        
3. **Secure Password Storage:**  
    If the username is new, it will create the username with the password and save them.  
    
4. **User Creation:**  
    The new user is stored in the `req.app.locals.users` object with the  password and a placeholder for the avatar field.
    
5. **Feedback and Redirect:**  
    A success flash message (“Registration successful! Please log in.”) is saved, and the user is redirected to the `/login` page.
    

**GET /login**

When a user visits `/login`, the server renders the login page template.  
As with registration, it retrieves and displays any flash messages from the session.  
These might include errors like “Invalid username or password” or notices like “Registration successful! Please log in.”  
After rendering, messages are cleared from the session to prevent repetition.


**POST /login**

When the login form is submitted:

1. **Validation:**  
    The server ensures both `username` and `password` fields are filled.  
    If any are missing, validation errors are stored as messages, and the user is redirected back to `/login`.
    
2. **User Lookup:**  
    The server searches the `app.locals.users` object for a user matching the provided username.
    
3. **Password Verification:**  
    If the user exists, it verifies the submitted password against the stored password.
    
4. **Successful Login:**  
    If verification succeeds, a new session is created and the user’s data (only the username) is stored inside `req.session.user`.  
    A success message (“Login successful!”) is added, and the user is redirected to the home page (`/`).
    
5. **Failed Login:**  
    If verification fails, a danger message (“Invalid username or password.”) is stored, and the user is redirected back to `/login`.
    

**GET /logout**

When the user visits `/logout`:

1. The current session is **destroyed** using `await req.session.destroy()`, which removes the user’s login state from the encrypted cookie.
    
2. The user is redirected to `/login`, where they can see a message (if desired) confirming they’ve logged out.
    

This ensures the session data is fully cleared, protecting against unauthorized access if the same browser is reused.



### Create Templates
**`views/partials/_navbar.ejs`:**

```html
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


```
**`views/partials/_footer.ejs`:**
```
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
EJS templates allow embedding JavaScript in HTML for dynamic content. This layout serves as a base template, including a header with conditional navigation based on login status, a main content area for flash messages (temporary notifications) and the page body, and a footer. The `<%- body %>` tag injects child template content.

**`views/register.ejs`:**

```html
<%- include('partials/_navbar') %>
<h1 class="page-title">Create an account</h1>

<form method="POST" class="form-card">
    <label for="username">Username</label>
    <input id="username" name="username" type="text" required>
    <% errors.forEach(error => { %>
        <% if (error.path === 'username') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <label for="password">Password</label>
    <input id="password" name="password" type="password" required>
    <% errors.forEach(error => { %>
        <% if (error.path === 'password') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <div class="form-actions">
        <button type="submit" class="btn btn-primary">Register</button>
        <a href="/login" class="btn btn-link">Already have an account?</a>
    </div>
</form>
<%- include('partials/_footer') %>
```

This template extends the layout and provides a registration form. It displays field-specific errors inline, improving user experience by highlighting issues directly. The 'required' attribute adds client-side validation, but server-side checks are essential for security.

**`views/login.ejs`:**

```html
<%- include('partials/_navbar') %>
<h1 class="page-title">Log in</h1>

<form method="POST" class="form-card">
    <label for="username">Username</label>
    <input id="username" name="username" type="text" required>
    <% errors.forEach(error => { %>
        <% if (error.path === 'username') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <label for="password">Password</label>
    <input id="password" name="password" type="password" required>
    <% errors.forEach(error => { %>
        <% if (error.path === 'password') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <div class="form-actions">
        <button type="submit" class="btn btn-success">Login</button>
        <a href="/register" class="btn btn-link">Create account</a>
    </div>
</form>
<%- include('partials/_footer') %>
```

Similar to registration, this login form uses EJS to show errors and includes a link to register, guiding new users seamlessly.  

And finally we create the ``index.ejs`` template.  
**`views/index.ejs`:**

```html
<%- include('partials/_navbar') %>
<h1 class="page-title">Welcome to MyApp</h1>
<p>Create and view wiki pages!</p>
<%- include('partials/_footer') %>
```
### Adding Styles
For this lecture, we will use the style file from the ``materials`` folder. We create ``public/css`` Folder and we place The ``style.css`` file inside it. 

### Configure The app.js files

**`app.js`:**

```javascript
require('dotenv').config();
const express = require('express');
const { getIronSession } = require('iron-session');
const authRoutes = require('./routes/auth');

const app = express();
const port = 3000;

app.locals.users = {}; // e.g., { 'username': { password: 'password123', avatar: null } }
app.locals.pages = {}; // e.g., { 'HomePage': { content: 'Welcome!', author: 'admin' } }

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
   const session = await getIronSession(req, res, {
    cookieName: 'session',
    password: process.env.SESSION_SECRET || 'a-very-long-random-secret-key-change-this!',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production', // only over HTTPS in production
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60,
    },
  })
  req.session = session; 
  next();
});


app.use(authRoutes);

app.get('/', (req, res) => {
  const username = req.session.user?.username || null;
  const messages = req.session.messages || [];

  res.render('index', { username, messages });

  req.session.messages = [];
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

```
There are many security risks when storing and managing sessions in web applications. Poor session handling can expose users to attacks like XSS (Cross-Site Scripting), CSRF (Cross-Site Request Forgery), session hijacking, and session fixation. For example, if session tokens are stored in localStorage or accessible JavaScript variables, an attacker could steal them through malicious scripts or browser extensions. Similarly, without proper cookie configuration, attackers could trick the browser into sending valid session cookies from another site.

To prevent these risks, we configure iron-session with strict cookie and encryption options. The session data is encrypted and signed using a secret key, so even if someone gains access to the cookie, they can’t read or modify it. All sensitive data stays protected on the client side in an unreadable, tamper-proof form.  

- **`httpOnly: true`** → protects against XSS by preventing scripts from reading the cookie.
- **`sameSite: 'lax'`** → helps prevent CSRF by limiting when cookies are sent in cross-site requests.
- **`secure: true`** → ensures cookies are only sent over HTTPS, protecting them from being intercepted.
- **`maxAge`** → keeps sessions short-lived, reducing the risk if a token is ever compromised.
- **`password`** → encrypts and signs session data so it cannot be tampered with or decrypted without the secret key.

This main file sets up the Express app, configures the view engine (EJS for dynamic HTML), serves static files from 'public', initializes sessions, and parses URL-encoded form data. Routes are mounted, and the root route renders an index page with session-based username and messages. The server listens on port 3000, a common development port.
### Environment Variables
Environment variables are used to store sensitive configuration data outside your source code, keeping your application both secure and flexible.

In this project, the session’s secret key is stored in an environment variable named SESSION_SECRET. It should be at least 32 characters long to ensure security.

We also use another environment variable, NODE_ENV, to specify the current environment whether the server is running in development or production mode.  
We create a file called .env and define our variables inside it:
**``.env``**
```
SESSION_SECRET=your-very-secure-random-key
NODE_ENV=development
```
The line ``require('dotenv').config();`` loads these environment variables from the .env file and makes them accessible in our application through ``process.env``.

## Rich Text and Pages

A wiki needs to support **rich text** for formatted content like headings, bold text, and lists. Instead of allowing raw HTML (which is insecure), we’ll use **Markdown** and convert it to HTML on the server using the `marked` library. Rich text enhances user-generated content by allowing formatting without compromising security. Raw HTML inputs can lead to XSS (Cross-Site Scripting) attacks, where malicious scripts are injected. Markdown is a lightweight markup language that's easy to learn and safe when parsed correctly it converts plain text to HTML while sanitizing potential threats.

**Install `marked`:**

```bash
npm install marked
```

The `marked` library is a fast, reliable Markdown parser that outputs HTML. It's configurable for custom rendering if needed.

**`routes/wiki.js`:**

```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const requireLogin = async (req, res, next) => {
    const username = req.session.user?.username || null;
    if (!username) {
        req.session.messages = [{ category: 'danger', message: 'You must be logged in to access this page.' }];
        await req.session.save();
        return res.redirect('/login');
    }
    next();
};

router.get('/wiki/:pageName', async (req, res) => {
    const { marked } = await import('marked');
    const pageName = req.params.pageName;
    const page = req.app.locals.pages[pageName];
    const username = req.session.user?.username || null;
    if (!page) {
        return res.status(404).render('404', { username: username, messages: [] });
    }
    page.htmlContent = page.isMarkdown ? marked(page.content) : page.content;
    res.render('wiki_page', { page, pageName, username: username, messages: [] });
});

router.get('/create', requireLogin, async (req, res) => {
    const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    req.session.errors = [];
    await req.session.save();
    res.render('create_page', { username, errors, messages});
});

router.post('/create', requireLogin, [
    body('title').notEmpty().withMessage('Page title is required').trim(),
    body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
    const username = req.session.user?.username || null;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.errors;
        await req.session.save();
        return res.redirect('/create');
    }
    const { title, content } = req.body;
    req.app.locals.pages[title] = { content, author: username, isMarkdown: true };
    res.redirect(`/wiki/${title}`);
});

module.exports = router;
```
We can notice that for marked, we import it using const { marked } = await import('marked');. This is because it uses the ES Module (ESM) system instead of CommonJS (CJS). In ESM, we use the import keyword to load modules, while in CJS we use require(). The await import() form allows dynamic importing, meaning the module is loaded only when needed rather than at the start of the program. This makes the code more flexible and compatible with modern JavaScript standards.  

**GET /wiki/:pageName**

When a user visits `/wiki/:pageName`, the server:

-  Extracts the `pageName` from the URL parameters.
    
-  Looks up the page in `req.app.locals.pages`.
    
-  If the page doesn’t exist, it responds with a 404 page.
    
-  If the page exists and is marked as Markdown (`page.isMarkdown`), `marked(page.content)` converts the Markdown text into HTML. If not, it renders the content as-is.
    
-  Finally, the server renders the `wiki_page` template, passing the HTML content, page name, username from the session, and any messages.
    


**GET /create**

When a logged-in user visits `/create`:

-  The `requireLogin` middleware ensures that only authenticated users can access the page.
    
    - If the user is not logged in, a flash message is stored in the session, and the user is redirected to `/login`.
        
-  The session messages are cleared before rendering.
    
-  The server renders the `create_page` template, passing the username, any validation errors, and messages.
    

**POST /create**

When a logged-in user submits the form to create a new wiki page:
- **Validation:**
    
    - `title` and `content` are required.
        
    - `express-validator` checks these fields and collects errors if they are missing.
        
    - Validation errors are converted into session flash messages and the user is redirected back to `/create` if any exist.
        
- **Page Creation:**
    
    - If validation passes, a new entry is added to the `pages` object.
        
    - The page stores:
        
        - `content` (user-submitted text),
            
        - `author` (current username from the session),
            
        - `isMarkdown` (true, indicating the content should be parsed by `marked`).
            
- **Redirect to the Page:**
    
    - The user is redirected to `/wiki/:title` where the new page is displayed with the Markdown converted to HTML.

#### Now We create the templates
**`views/wiki_page.ejs`:**

```html
<%- include('partials/_navbar') %>
<h1><%= pageName %></h1>
<p><em>By: <%= page.author %></em></p>
<hr>
<div>
    <%- page.htmlContent %>
</div>
<%- include('partials/_footer') %>
```

This template displays the page title, author, and rendered HTML content. The `<%- %>` tag is used for unescaped output, trusting the sanitized HTML from `marked`.

**`views/create_page.ejs`:**

```html
<%- include('partials/_navbar') %>
<h1 class="page-title">Create a Wiki Page</h1>

<form method="POST" class="form-card">
    <label for="title">Page Title</label>
    <input id="title" name="title" type="text" required>
    <% errors.forEach(error => { %>
        <% if (error.path === 'title') { %>
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
        <% if (error.path === 'content') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <div class="form-actions">
        <button type="submit" class="btn btn-primary">Create Page</button>
    </div>
</form>


<%- include('partials/_footer') %>
```

The creation form includes a textarea with a placeholder demonstrating Markdown syntax. A quick reference card educates users, making the app more user-friendly for beginners.
#### Updating app.js
Now we update our app.js so we include the new routes
```
require('dotenv').config();
const express = require('express');
const { getIronSession } = require('iron-session');
const authRoutes = require('./routes/auth');
const wiki = require('./routes/wiki');

const app = express();
const port = 3000;

app.locals.users = {}; // e.g., { 'username': { password: 'password123', avatar: null } }
app.locals.pages = {}; // e.g., { 'HomePage': { content: 'Welcome!', author: 'admin' } }

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
   const session = await getIronSession(req, res, {
    cookieName: 'session',
    password: process.env.SESSION_SECRET || 'a-very-long-random-secret-key-change-this!',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production', // only over HTTPS in production
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60,
    },
  })
  req.session = session; 
  next();
});


app.use(authRoutes);
app.use(wiki);

app.get('/', (req, res) => {
  const username = req.session.user?.username || null;
  const messages = req.session.messages || [];

  res.render('index', { username, messages });

  req.session.messages = [];
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

```

### Using CKEditor in Express

Markdown is great, but some users prefer a visual editor. **CKEditor** provides a WYSIWYG (What You See Is What You Get) interface, outputting HTML directly. We’ll use the CKEditor 5 editor. WYSIWYG editors like CKEditor allow non-technical users to format text visually, similar to word processors. It generates HTML under the hood, but we must sanitize outputs to prevent XSS. CKEditor includes built-in security features, but always validate on the server.  
First we install it using 
**Install CKEditor**:
We first download the copy `ckeditor.js` from `materials` folder and store it inside ``public/script`` folder.  
Now, let’s create a reusable layout file for the CKEditor setup.  
This will make it easy to include the editor wherever it’s needed for example, on our “create_page.ejs” page.
**`views/partials/_ckeditor.ejs`**
```
<script src="script/ckeditor.js"> </script>
 <script >
 
    let editorInstance;
    ClassicEditor.create(document.querySelector('#content'))
      .then(editor => {
        editorInstance = editor;
      })
      .catch(console.error);

    document.querySelector('#editorForm').addEventListener('submit', e => {
      document.querySelector('#content').value = editorInstance.getData();
    });
  </script>
```
This script initializes **CKEditor 5** on a text area and ensures its HTML content is sent to the server when the form is submitted. The line `<script src="script/ckeditor.js"> </script>` loads the CKEditor 5 build from your `public/script` folder. Then, `ClassicEditor.create(document.querySelector('#editor'))` replaces the textarea with a full-featured rich text editor. When the editor is ready, its instance is stored in `editorInstance`. Before submitting the form, the script takes the HTML content generated by CKEditor using `editorInstance.getData()` and assigns it to the hidden field named `content`. This way, the form sends clean, ready-to-use HTML to your Express backend without needing extra parsing or conversion.  

Now we can include the CKEditor partial in our form view. we just include it using  `<%- include('partials/_ckeditor') %>`
**`views/create_page.ejs`: (updated)**

```html
<%- include('partials/_navbar') %>
<h1 class="page-title">Create a Wiki Page (CKEditor)</h1>

<form id="editorForm" method="POST" class="form-card">
    <label for="title">Page Title</label>
    <input id="title" name="title" type="text" required>
    <% errors.forEach(error => { %>
        <% if (error.path === 'title') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <label for="content">Content</label>
    <textarea id="content" name="content"></textarea>
    <% errors.forEach(error => { %>
        <% if (error.path === 'content') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <div class="form-actions">
        <button type="submit" class="btn btn-primary">Create Page</button>
    </div>
</form>

<%- include('partials/_ckeditor') %>

<%- include('partials/_footer') %>
```

This template replaces the textarea with CKEditor via JavaScript, transforming it into a rich editor.
Finally we fix the wiki.js route  
**`routes/wiki.js`:**

```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const requireLogin = async (req, res, next) => {
    const username = req.session.user?.username || null;
    if (!username) {
        req.session.messages = [{ category: 'danger', message: 'You must be logged in to access this page.' }];
        await req.session.save();
        return res.redirect('/login');
    }
    next();
};

router.get('/wiki/:pageName', (req, res) => {
    const pageName = req.params.pageName;
    const page = req.app.locals.pages[pageName];
    const username = req.session.user?.username || null;
    if (!page) {
        return res.status(404).render('404', { username: username, messages: [] });
    }
    page.htmlContent = page.content;
    res.render('wiki_page', { page, pageName, username: username, messages: [] });
});

router.get('/create', requireLogin, async (req, res) => {
    const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    req.session.errors = [];
    await req.session.save();
    res.render('create_page', { username, errors, messages});
});

router.post('/create', requireLogin, [
    body('title').notEmpty().withMessage('Page title is required').trim(),
    body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
    const username = req.session.user?.username || null;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.errors;
        await req.session.save();
        return res.redirect('/create');
    }
    const { title, content } = req.body;
    req.app.locals.pages[title] = { content, author: username};
    res.redirect(`/wiki/${title}`);
});

module.exports = router;
```
Since CKEditor 5 outputs fully formatted HTML, there’s no need to parse or convert the content (e.g., using marked). Our ``app.js`` remains the same and doesn’t require any changes.
## File Uploads

Let’s allow users to upload profile pictures (avatars) using the `multer` middleware for secure file handling. File uploads are essential for features like avatars or attachments, but they introduce risks like server overload or malicious files. Multer handles multipart/form-data, parses files, and allows custom storage and filtering.

**Install multer**:

```bash
npm install multer
```
Now we create the route that serve uploading files
**`routes/profile.js`:**

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const requireLogin = (req, res, next) => {
    const username = req.session.user?.username || null;
    if (!username) {
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

router.get('/profile', requireLogin, async (req, res) => {
    const username = req.session.user?.username || null;
    const user = req.app.locals.users[username];
    const messages = req.session.messages || []
    req.session.messages = [];
    await req.session.save()
    res.render('profile', { user, username, messages });
});

router.post('/profile', requireLogin, upload.single('avatar'), async (req, res) => {
    const username = req.session.user?.username || null;
    if (!req.file) {
        req.session.messages = [{ category: 'danger', message: 'No file selected or invalid file type.' }];
        await req.session.save();
        return res.redirect('/profile');
    }
    const filename = req.file.filename;
    req.app.locals.users[username].avatar = filename;
    req.session.messages = [{ category: 'success', message: 'Avatar updated!' }];
    await req.session.save();
    res.redirect('/profile');
});

module.exports = router;
```


 **GET /profile**

When a user visits `/profile`, the server first ensures that the user is logged in before granting access to their profile page.

1. **Access Control (Middleware):**  
    The `requireLogin` middleware checks if `req.session.user?.username` exists.
    
    - If **no active session** is found (meaning the user isn’t logged in), a **danger message** (`"You must be logged in to access this page."`) is stored in the session.
        
    - The user is then redirected to the `/login` page.
        
2. **Profile Rendering:**  
    If the user is logged in, the server retrieves the user’s data from the in-memory `users` object using their session username (`users[req.session.username]`).
    
3. **Flash Messages:**  
    Any messages stored in the session (like success or error notifications) are passed to the template and displayed on the profile page.  
    After rendering, the message list is cleared to prevent repetition.
    
4. **Response:**  
    Finally, the profile page (`profile.ejs`) is rendered with the following data:
    
    - The `user` object (containing info like avatar filename)
        
    - The logged-in `username`
        
    - Any temporary `messages`
        

This ensures that only authenticated users can access their personal profile page and view any feedback messages.


**POST /profile**

When the user submits the form to update their avatar, the server processes the uploaded image and updates the user’s profile.

- **Access Control (Middleware):**  
    Just like the GET route, the `requireLogin` middleware ensures that only logged-in users can upload avatars.
    
- **File Upload Handling (Multer Configuration):**  
    The route uses **Multer**, a Node.js middleware for handling file uploads.  
    It is configured as follows:
    
    - **Destination:**  
        Files are temporarily stored in the `public/avatars/` directory.  
        This allows avatars to be publicly accessible through static file serving.
        
    - **File Filter:**  
        A custom file filter checks the uploaded file’s extension using `path.extname()`.  
        Only image files with extensions `.png`, `.jpg`, `.jpeg`, or `.gif` are accepted.  
        If another type of file is uploaded (e.g., `.exe`, `.pdf`), Multer rejects it and triggers an error: ``Only images are allowed``
        
    This configuration ensures the server only accepts valid image formats and prevents uploading potentially harmful files.
    
- **File Upload Execution:**  
    `upload.single('avatar')` processes a **single file** from the form field named `avatar`.  
    The uploaded file’s metadata (e.g., filename, destination, size) becomes available in `req.file`.
    
- **Validation:**  
    After the upload:
    
    - If no file was uploaded or the file type was invalid, a **danger message** (`"No file selected or invalid file type."`) is stored, and the user is redirected back to `/profile`.
        
- **Profile Update:**  
    If the upload is successful, the filename (`req.file.filename`) is saved to the logged-in user’s record in the `users` object:
    
    `users[username].avatar = filename;`
    
- **Feedback and Redirect:**  
    A **success message** (“Avatar updated!”) is stored in the session, and the user is redirected back to `/profile`, where the new avatar will be displayed.

**`views/profile.ejs`:**

```html
<%- include('partials/_navbar') %>
<div class="container">
    <h1>Welcome, <%= username %></h1>

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
<%- include('partials/_footer') %>
```

The form uses `enctype="multipart/form-data"` to support file uploads. Conditional rendering shows the avatar if available. The `enctype="multipart/form-data"` attribute is crucial for file uploads. `multer` sanitizes and saves files securely, and the `fileFilter` ensures only images are accepted.  

Now we edit or ``app.js`` to include the new route.  
**``app.js``**
```
require('dotenv').config();
const express = require('express');
const { getIronSession } = require('iron-session');
const authRoutes = require('./routes/auth');
const wiki = require('./routes/wiki');
const profile = require('./routes/profile');


const app = express();
const port = 3000;

app.locals.users = {}; // e.g., { 'username': { password: 'password123', avatar: null } }
app.locals.pages = {}; // e.g., { 'HomePage': { content: 'Welcome!', author: 'admin' } }

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
   const session = await getIronSession(req, res, {
    cookieName: 'session',
    password: process.env.SESSION_SECRET || 'a-very-long-random-secret-key-change-this!',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production', // only over HTTPS in production
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60,
    },
  })
  req.session = session; 
  next();
});


app.use(authRoutes);
app.use(wiki);
app.use(profile);
app.get('/', (req, res) => {
  const username = req.session.user?.username || null;
  const messages = req.session.messages || [];

  res.render('index', { username, messages });

  req.session.messages = [];
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```
### Creating the Mildware folder
We noticed that the requireLogin middleware is declared in both ``wiki.js`` and ``profile.js``, which means we’re repeating ourselves. To follow the DRY (Don’t Repeat Yourself) principle, we can refactor this by creating a dedicated middlewares folder.  
Inside this folder, we’ll add a new file (for example, ``logincheck.js``) and move the requireLogin function there. Then, we can simply import it wherever it’s needed, such as in ``wiki.js`` and ``profile.js``.  
**``middlewares/loginCheck.js``**

```javascript
const requireLogin = async (req, res, next) => {
    const username = req.session.user?.username || null;
    if (!username) {
        req.session.messages = [
            { category: 'danger', message: 'You must be logged in to access this page.' }
        ];
        await req.session.save();
        return res.redirect('/login');
    }
    next();
};

module.exports = requireLogin;
```
We can also move the `multer` configuration into the `middleware` folder to keep our codebase cleaner and more organized.    
To do this, we’ll create a new file named **`middleware/upload.js`** that will contain all the upload-related logic.

**`middlewares/upload.js`**
```
const multer = require('multer');
const path = require('path');

// Configure storage and file filtering
const upload = multer({
    dest: 'public/avatars/', // You can make this dynamic if needed
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

module.exports = upload;

```
Now, we update the ``wiki.js`` and ``profile.js`` files we remove the duplicate ``requireLogin`` and ``multer`` setup code from both files and replace them with imports of the middleware functions we created earlier.  
This makes our routes easier to read, reduces repetition, and ensures consistent behavior across the application.  
**`routes/wiki.js`:**
```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const requireLogin = require('../middlewares/loginCheck.js');

const router = express.Router();

router.get('/wiki/:pageName', (req, res) => {
    const pageName = req.params.pageName;
    const page = req.app.locals.pages[pageName];
    const username = req.session.user?.username || null;
    if (!page) {
        return res.status(404).render('404', { username: username, messages: [] });
    }
    page.htmlContent = page.content;
    res.render('wiki_page', { page, pageName, username: username, messages: [] });
});

router.get('/create', requireLogin, async (req, res) => {
    const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    req.session.errors = [];
    await req.session.save();
    res.render('create_page', { username, errors, messages});
});

router.post('/create', requireLogin, [
    body('title').notEmpty().withMessage('Page title is required').trim(),
    body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
    const username = req.session.user?.username || null;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.errors;
        await req.session.save();
        return res.redirect('/create');
    }
    const { title, content } = req.body;
    req.app.locals.pages[title] = { content, author: username};
    res.redirect(`/wiki/${title}`);
});
module.exports = router;
```
**`routes/profile.js`:**
```javascript
const express = require('express');
const requireLogin = require('../middlewares/loginCheck.js');
const upload = require('../middlewares/upload.js');

const router = express.Router();

router.get('/profile', requireLogin, async (req, res) => {
    const username = req.session.user?.username || null;
    const user = req.app.locals.users[username];
    const messages = req.session.messages || []
    req.session.messages = [];
    await req.session.save()
    res.render('profile', { user, username, messages });
});

router.post('/profile', requireLogin, upload.single('avatar'), async (req, res) => {
    const username = req.session.user?.username || null;
    if (!req.file) {
        req.session.messages = [{ category: 'danger', message: 'No file selected or invalid file type.' }];
        await req.session.save();
        return res.redirect('/profile');
    }
    const filename = req.file.filename;
    req.app.locals.users[username].avatar = filename;
    req.session.messages = [{ category: 'success', message: 'Avatar updated!' }];
    await req.session.save();
    res.redirect('/profile');
});

module.exports = router;
```
### Handling Unknown Routes
Our app works great so far, but there’s still a small problem what happens if a user tries to visit a random, non-existing route like `/random-route`?  
By default, **Express** will return the following HTML page as a response:

```
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot GET /roundom-route</pre>
</body>
</html>
```

This is good  the app doesn’t crash and clearly indicates that the route doesn’t exist.  
However, in a web application, we usually want to show a more user-friendly 404 page instead of this default message.

We can override this default behavior by adding a middleware at the end of our route stack to handle unknown routes.

**``middlewares/404.js``**  
First, create a new middleware file that renders a custom 404 page:
```
module.exports = (req, res) => {
const username = req.session.user?.username || null;
  res.status(404).render('404', {
    username:username,
    messages:[{ category: 'danger', message: 'Page don\'t exist' }],
    title: 'Page Not Found',
    url: req.originalUrl
  });
};
```
**``views/404.ejs``**  
Next, create a `404.ejs` view to display a friendly message to the user:
```
<%- include('partials/_navbar') %>
  <h1>404 - Page Not Found</h1>
  <p>Sorry, the page "<%= url %>" doesn’t exist.</p>
  <a href="/">Go back to Home</a>
<%- include('partials/_footer') %>
```
Finally, import and use this middleware at the very end of your middleware stack in **`app.js`**:

```
const notFoundHandler = require('./middlewares/404');

// ... all other routes and middleware here ...

// Handle unknown routes
app.use(notFoundHandler);
```
With this in place, visiting a non-existent page such as `/random-url` will render your custom `404.ejs` template instead of the default plain HTML page.  
This improves the overall user experience and keeps the app’s design consistent across all pages.
## A Journey Through CSS Styling
### Act I: The Specific Approach (Class-per-Element)
When we first begin styling our web pages, the natural instinct is to give each element its own class and style it directly. For example:

**Example CSS (not used in our app):**

```css
.login-page-button {
  background-color: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
}
```

**HTML:**

```html
<button class="login-page-button">Login</button>
```

At first, this feels simple and organized every element gets its own “label,” and we know exactly where its style lives.

But very quickly, a problem appears:

- The Register button will need almost the same styles as the Login button.
    
- Input fields across different pages also share similar styling.
    
- Suddenly, we’re copying and pasting the same rules over and over.
    

This creates duplication and makes our CSS harder to maintain. Imagine having 5 different button classes scattered around your project if you want to change the padding, you’d need to edit all of them.

To fix this, we need to step back and notice patterns. Many elements aren’t unique snowflakes they belong to the same component family. Buttons share common traits, inputs share common traits. Instead of treating them as separate cases, we can extract those shared features and place them into special reusable classes.

This shift in thinking is what leads us toward the reusable component approach in Act II.

### Act II: The Reusable Component (Shared Classes)

To fix the duplication problem from Act I, we need to change how we see our elements. Instead of thinking about each button or input as a one-off element, we treat them as components.  
A component is simply a reusable piece of UI like a button, an input box, or a card. Each component has a base style that defines its common features. For example, all buttons might share padding, border-radius, and font weight.  
On top of that, we can add variations (or modifiers) that adjust the base style like giving one button a blue background (.btn-primary) and another a gray background (.btn-secondary).  
This way, our CSS is not about styling individual elements, but about describing what type of component the element is. When we create new elements in our HTML, we don’t invent a new class each time we simply apply the right combination of existing component classes.  
Here’s what that looks like in practice:

**Our `style.css` (already implemented):**

```css
.btn {
  padding: 9px 14px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}
.btn-primary {
  background: var(--accent);
  color: white;
  border-color: rgba(43,124,255,0.1);
}
```

**HTML in Templates:**

```html
<button class="btn btn-primary">Register</button>
```

This is exactly the approach that **Bootstrap** and other frameworks popularized. They provide base classes (`.btn`, `.form-control`, `.card`) and variations (`.btn-primary`, `.btn-danger`, `.btn-outline`), letting developers build entire UIs just by combining classes.

### Act III: The Utility-First Revolution

The component approach from Act II is a big improvement over one-class-per-element, but it isn’t perfect. Components come with predefined styles for things like padding, margin, and borders.  
But what if you need a button with slightly less padding? Or an input field with a custom margin? Suddenly, we’re stuck. we either:

- Override the existing class (which feels messy), or
    
- Create a brand-new variation (like .btn-small or .btn-wide) amnd before long, we’re back to the duplication problem from Act I.
    

To solve this, a new idea emerged: instead of making classes for components, why not make classes for single styling functions?

For example:

- p-4 → padding
    
- m-10 → margin
    
- text-lg → font size
    
- bg-blue-500 → background color
    

With this approach, we’re not writing CSS to describe components—we’re building components directly in the HTML by stacking utility classes together.

This is the philosophy behind utility-first frameworks like Tailwind CSS.

**Example with Tailwind (hypothetical):**

```html
<button class="bg-blue-500 text-white p-4 rounded-md">Register</button>
```

Here, every class is doing one small job: background, text color, padding, border radius. Together, they form a complete button. It’s like snapping LEGO bricks together each brick is tiny and simple, but combined, they make something powerful.

This approach has huge benefits:

- No need for CSS overrides we control spacing, sizing, and colors directly in the markup.
    
- Less CSS file bloat → most styles come from the framework.
    
- Faster prototyping we can build and tweak designs instantly without creating new CSS classes.
    

However, it does come with one small drawback: your HTML can look crowded with classes. A single element may end up with 6–10 classes, which feels like “class spam.” Some developers love this tradeoff, others find it messy.
