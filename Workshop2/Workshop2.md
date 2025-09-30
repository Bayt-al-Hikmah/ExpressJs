### Objectives
- Render HTML templates instead of simple strings or JSON.
- Serve static files like CSS and images.
- Understand and use Express middleware to process requests.
- Use the EJS templating engine for dynamic content (variables, loops, conditions).
- Create reusable page layouts with template inheritance.
- Handle user input with HTML forms, both manually and with the express-validator library.
### Rendering Basic HTML Templates
In our previous session, we returned simple strings and JSON from our routes. While that's perfect for APIs, most web applications need to display rich, structured content to users, like styled web pages with dynamic data. To achieve this, we use HTML templates.  
A template is an HTML file where we can embed dynamic data before sending it to the user's browser. This approach keeps our application's logic (written in JavaScript) separate from its presentation (written in HTML), making our code cleaner, easier to maintain, and more scalable.
#### The `views` Folder
Express doesn’t enforce a specific folder for templates, but it’s standard practice to store them in a folder called `views`. This folder should be in the root directory of our project, alongside our `app.js` file.  
Our project structure should now look like this:
```
my_express_project/
├── node_modules/
├── public/          # For static files, added later
├── views/
│   └── index.ejs
├── package.json
└── app.js
```
#### Using `res.render()`
To serve an HTML template, we use Express’s `res.render()` method. First, we need to set up a templating engine. For this lecture, we’ll use **EJS** (Embedded JavaScript), a popular and lightweight templating engine that integrates seamlessly with Express. EJS lets us embed JavaScript directly in our HTML files to create dynamic content.  
To get started, install EJS:
```
npm install ejs
```
Then, configure Express to use EJS and create a simple template.
**`views/index.ejs`:**
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First Template</title>
</head>
<body>
    <h1>Welcome to Our Website!</h1>
    <p>This page was rendered from an Express template using EJS.</p>
</body>
</html>
```
**`app.js`:**
```
const express = require('express');
const app = express();
const port = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    // Render the index.ejs template (no need to specify .ejs extension)
    res.render('index');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```
Run the app with `node app.js`, then visit `http://localhost:3000` in your browser. You’ll see a fully rendered HTML page with a heading and paragraph, instead of just plain text. This is our first step toward building a dynamic web application!
### Working with Static Files
A website isn’t complete without styling, images, or client-side JavaScript. These are called **static files** because they don’t change dynamically like templates do. In Express, we serve static files from a folder (commonly named `public`) using the built-in `express.static` middleware. This makes files like CSS, images, and JavaScript accessible to the browser.  
Our updated project structure:
```
my_express_project/
├── public/
│   ├── css/
│   │   └── style.css
│   └── images/
│       └── logo.png
├── views/
│   └── index.ejs
├── package.json
└── app.js
```
#### Serving Static Files
To serve static files, we use the `express.static` middleware in `app.js`. This middleware tells Express to make all files in the `public` folder available at URLs relative to the folder. For example, `public/css/style.css` becomes accessible at `/css/style.css`.  
Update `app.js` to include the static middleware:
```
const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

// Serve static files from the 'public' folder
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```
Now, let’s create a CSS file and link it to our template.  
**`public/css/style.css`:**
```
body {
    font-family: sans-serif;
    background-color: #f0f2f5;
    color: #333;
    text-align: center;
    margin-top: 50px;
}

img {
    width: 150px;
    border-radius: 10px;
}
```
Update **`views/index.ejs`** to include the CSS and an image:
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Styled Page</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <img src="/images/logo.png" alt="Our Logo">
    <h1>Welcome to Our Styled Website!</h1>
    <p>This page is now styled with an external CSS file.</p>
</body>
</html>
```
Restart the server and visit `http://localhost:3000`. The page will now be styled, and the image (assuming `logo.png` exists in `public/images/`) will display. If the image or CSS file is missing, you’ll see a broken image icon or unstyled content, so ensure the files are in place.
#### Why Use `express.static`?
Using `app.use(express.static('public'))` is the recommended way to serve static files because:
1. **Automatic Path Resolution**: Express adjusts file paths based on the app’s deployment context. For example, if deployed to `https://example.com/my-app/`, URLs like `/css/style.css` correctly resolve to `/my-app/css/style.css`.
2. **Simplicity**: No need to write routes for each static file; Express serves everything in `public` automatically.
3. **Efficiency**: Express optimizes static file delivery with features like caching support.

This approach ensures our static assets are served reliably across different environments, whether on a local machine or a production server.
### Understanding Express Middleware
Before we dive into dynamic templating, let’s explore **middleware**, a fundamental concept in Express that powers much of its functionality. Middleware functions are the backbone of how Express processes requests and responses, and understanding them is key to building robust applications.
#### What is Middleware?
Middleware functions are JavaScript functions that sit between the incoming request and the final response. They have access to the request object (`req`), the response object (`res`), and the `next` function, which passes control to the next middleware or route handler in the chain. Middleware can:

- Modify the request or response objects.
- Perform tasks like logging, authentication, or parsing data.
- End the request-response cycle by sending a response.
- Call `next()` to pass control to the next middleware.

Think of middleware as a pipeline: each request flows through a series of middleware functions before reaching the route handler (or being sent back to the client).
#### How Middleware Works
Middleware is added using `app.use()` for global middleware (applied to all routes) or as an array of functions for specific routes. Each middleware function can process the request, modify data, or stop the pipeline early by sending a response.  
Here’s a simple example of custom middleware that logs the request method and URL:
```
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next(); // Pass control to the next middleware or route
});
```
If `next()` isn’t called, the request stops, and no further middleware or routes are processed. For example, this middleware blocks requests from a specific IP:
```
app.use((req, res, next) => {
    if (req.ip === '192.168.1.100') {
        return res.status(403).send('Access denied');
    }
    next();
});
```
#### Middleware in Our App
We’ve already used middleware without realizing it! The `express.static('public')` middleware we added earlier is a built-in Express middleware that serves static files. Another common middleware we’ll use later is `body-parser`, which parses form data so we can access it in `req.body`.  
Middleware can also be applied to specific routes. For example:
```
const logUserRoute = (req, res, next) => {
    console.log(`Accessing user route for ${req.params.name}`);
    next();
};

app.get('/profile/:name', logUserRoute, (req, res) => {
    res.render('profile', { user: { username: req.params.name } });
});
```
Here, `logUserRoute` only runs for the `/profile/:name` route, logging the accessed username before rendering the template.
#### Why Middleware Matters
Middleware is what makes Express so flexible. It allows us to:
- Add cross-cutting functionality like logging, authentication, or error handling.
- Process requests before they reach routes (e.g., parsing form data).
- Reuse code across multiple routes or the entire app.

As we proceed with templating and form handling, we’ll use middleware like `body-parser` and `express-validator` to process form submissions and validate data, showing how middleware integrates into real applications.
### Introduction to EJS Templating
Express uses **EJS** (Embedded JavaScript) as our templating engine, which lets us embed JavaScript code directly in HTML to create dynamic content. EJS is simple yet powerful, allowing us to add variables, conditionals, and loops to our templates.  
EJS has three key syntaxes:

- `<%= ... %>`: Outputs escaped data (e.g., converts `<` to `&lt;`) for safe rendering.
- `<%- ... %>`: Outputs unescaped data (e.g., for raw HTML, use with caution).
- `<% ... %>`: For control structures like `if` statements and `forEach` loops.

#### Passing Data to Templates
We can pass data from our route to the template as an object in `res.render()`. Inside the template, we use JavaScript to display or manipulate this data.  
Here’s a route that passes user details to a template:  
**`app.js`:**  
```
app.get('/profile/:name', (req, res) => {
    const userDetails = {
        username: req.params.name,
        bio: 'Loves coding in JavaScript and exploring new technologies.',
        shoppingList: ['Apples', 'Oranges', 'Bananas']
    };
    res.render('profile', { user: userDetails });
});
```
**`views/profile.ejs`:**
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>User Profile</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <h1>Hello, <%= user.username.charAt(0).toUpperCase() + user.username.slice(1) %>!</h1>
    <p><em><%= user.bio %></em></p>

    <% if (user.shoppingList.length > 0) { %>
        <p>You have <%= user.shoppingList.length %> item(s) on your shopping list:</p>
        <ul>
            <% user.shoppingList.forEach(item => { %>
                <li><%= item %></li>
            <% }); %>
        </ul>
    <% } else { %>
        <p>Your shopping list is empty!</p>
    <% } %>
</body>
</html>
```
Visit `/profile/alice` to see a page with Alice’s capitalized name, bio, and shopping list. The `charAt(0).toUpperCase() + slice(1)` mimics a capitalize function, showing how JavaScript can transform data in templates.
#### Conditional Statements (`if`, `else`)
EJS allows us to add decision-making logic to templates, just like choosing an outfit based on the weather. We can show different content based on the data passed from our route.   
**How It Works**:
- `<% if (condition) { %>`: Checks if a condition is true.
- `<% } else if (anotherCondition) { %>`: Optional additional conditions.
- `<% } else { %>`: Optional fallback for when all conditions are false.
- `<% } %>`: Required to close the block.

**Example**:  
Create a dashboard route with different messages based on user status.  
**`app.js`:**
```
app.get('/dashboard/:status', (req, res) => {
    res.render('dashboard', { userStatus: req.params.status });
});
```
**`views/dashboard.ejs`:**
```
<%- include('partials/_layout') %>
<div class="welcome-message">
    <% if (userStatus === 'admin') { %>
        <h1>Welcome, Administrator!</h1>
        <p>You have full access to the system controls.</p>
    <% } else if (userStatus === 'member') { %>
        <h1>Welcome, Valued Member!</h1>
        <p>Thank you for being a part of our community.</p>
    <% } else { %>
        <h1>Welcome, Guest!</h1>
        <p>Please sign up or log in to access member features.</p>
    <% } %>
</div>
```
Visit `/dashboard/admin`, `/dashboard/member`, or `/dashboard/visitor` to see the appropriate message based on the status.
#### Loops (`forEach`)
EJS loops let us iterate over arrays to display lists, such as tasks, users, or products.  
**How It Works**:
- `<% array.forEach(item => { %> ... <% }); %>`: Iterates over `array`, with each item available as `item`.
- Use conditionals to handle empty arrays, as EJS doesn’t have a built-in `else` for loops.

**Example**:   
Create a route to display a task list.
**`app.js`:**
```
app.get('/tasks', (req, res) => {
    const taskList = [
        'Buy groceries',
        'Finish Express workshop',
        'Go for a run'
    ];
    res.render('tasks', { tasks: taskList });
});
```
**`views/tasks.ejs`:**
```
<%- include('partials/_layout') %>
<h1>My To-Do List</h1>
<ul>
    <% if (tasks.length > 0) { %>
        <% tasks.forEach(task => { %>
            <li><%= task %></li>
        <% }); %>
    <% } else { %>
        <li>You have no tasks. Great job!</li>
    <% } %>
</ul>
```
This renders a bulleted list of tasks or a “no tasks” message if the array is empty. Try setting `taskList = []` in `app.js` to test the empty case.
### Template Inheritance
Most websites share a consistent layout—a header, footer, and navigation bar across all pages. Copying this code into every template is inefficient and hard to maintain. EJS’s `<%- include() %>` lets us create a base layout and reuse it across templates.  
Create a base layout file:  
**`views/partials/_layout.ejs`:**
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Awesome App</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header>
        <%- include('partials/_navbar') %>
    </header>
    <main>
        <%- body %>
    </main>
    <footer>
        <p>&copy; 2025 Our Company</p>
    </footer>
</body>
</html>
```
**`views/partials/_navbar.ejs`:**
```
<nav>
    <a href="/">Home</a> |
    <a href="#">About</a> |
    <a href="#">Contact</a>
</nav>
```
Update **`views/index.ejs`** to use the layout:
```
<%- include('partials/_layout') %>
<h1>Welcome to Our Website!</h1>
<p>This page was rendered from an Express template and uses a base layout.</p>
```
The `<%- body %>` in `_layout.ejs` is replaced by the content of `index.ejs`. The `<%- %>` tag renders HTML unescaped, allowing the template’s content to be inserted as HTML.
#### Including Template Snippets with `<%- include %>`  
While `<%- include %>` is used for layouts, it’s also great for smaller, reusable HTML snippets, like a navigation bar or a card component.  
In our layout, we already used `<%- include('partials/_navbar') %>` to include the navigation bar. This keeps our code DRY (Don’t Repeat Yourself) and makes updates easier—if we change `_navbar.ejs`, all pages using the layout reflect the change.
### Handling HTML Forms
Forms are the primary way users send data to our server, like submitting a contact message. We’ll explore handling forms manually and with the `express-validator` library for validation.
#### The Basic HTML Way  
We’ll create a contact form and process it using the `body-parser` middleware to parse form data into `req.body`.  
Install `body-parser`:
```
npm install body-parser
```
**`app.js`:**
```
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/contact', (req, res) => {
    res.render('contact', { submittedName: null });
});

app.post('/contact', (req, res) => {
    const name = req.body.name;
    const message = req.body.message;
    console.log(`Received message from ${name}: ${message}`);
    res.render('contact', { submittedName: name });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```
**`views/contact.ejs`:**
```
<%- include('partials/_layout') %>
<h1>Contact Us</h1>
<form action="/contact" method="POST">
    <label for="name">Name:</label><br>
    <input type="text" id="name" name="name" required><br><br>
    <label for="message">Message:</label><br>
    <textarea id="message" name="message" required></textarea><br><br>
    <button type="submit">Submit</button>
</form>
<% if (submittedName) { %>
    <h2>Thanks for your message, <%= submittedName %>!</h2>
<% } %>
```
The `body-parser` middleware parses URL-encoded form data into `req.body`. The `GET` route displays the form, and the `POST` route processes the submission, logging the data and re-rendering the form with a confirmation message.
#### The express-validator Way
Manual form handling is straightforward but can be error-prone for validation and security. The `express-validator` library simplifies form validation and sanitization, offering a robust alternative to manual checks.  
Install `express-validator`:
```
npm install express-validator
```
**`app.js`:**
```
const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/contact-val', (req, res) => {
    res.render('contact_val', { errors: [], submittedName: null });
});

app.post('/contact-val', [
    body('name').notEmpty().withMessage('Name is required').trim().isLength({ min: 3, max: 25 }).withMessage('Name must be 3-25 characters'),
    body('message').notEmpty().withMessage('Message is required').trim().isLength({ max: 200 }).withMessage('Message must be under 200 characters'),
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('contact_val', { errors: errors.array(), submittedName: null });
    }
    const { name, message } = req.body;
    console.log(`Received from ${name}: ${message}`);
    res.render('contact_val', { errors: [], submittedName: name });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```
**`views/contact_val.ejs`:**
```
<%- include('partials/_layout') %>
<h1>Contact Us (Validated)</h1>
<form method="POST" action="/contact-val">
    <label for="name">Name:</label><br>
    <input type="text" id="name" name="name" value="<%= submittedName || '' %>"><br>
    <% errors.forEach(error => { %>
        <% if (error.param === 'name') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <label for="email">Email:</label><br>
    <input type="email" id="email" name="email"><br>
    <% errors.forEach(error => { %>
        <% if (error.param === 'email') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <label for="message">Message:</label><br>
    <textarea id="message" name="message"></textarea><br>
    <% errors.forEach(error => { %>
        <% if (error.param === 'message') { %>
            <span style="color:red;"><%= error.msg %></span><br>
        <% } %>
    <% }) %>

    <button type="submit">Submit</button>
</form>
<% if (submittedName && errors.length === 0) { %>
    <h2>Thanks for your message, <%= submittedName %>!</h2>
<% } %>
```
#### Why Use express-validator?
- **Validation**: Ensures fields meet rules (e.g., `notEmpty()`, `isEmail()`, `isLength()`).
- **Sanitization**: Cleans input (e.g., `trim()` removes whitespace, `normalizeEmail()` standardizes email formats).
- **Error Handling**: Provides clear error messages for display in templates.
- **Security**: Reduces risks like injection by sanitizing inputs.

**Note on CSRF**: `express-validator` doesn’t include CSRF protection by default. For production apps, add the `csurf` middleware:
```
npm install csurf
```
Then, configure it:
```
const csurf = require('csurf');
app.use(csurf());
```
Add a CSRF token to forms:
```
<input type="hidden" name="_csrf" value="<%= csrfToken %>">
```