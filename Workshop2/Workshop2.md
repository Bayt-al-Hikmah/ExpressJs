## Objectives
- Render HTML templates instead of simple strings or JSON.
- Serve static files like CSS and images.
- Understand and use Express middleware to process requests.
- Use the EJS templating engine for dynamic content (variables, loops, conditions).
- Create reusable page layouts with template inheritance.
- Handle user input with HTML forms, both manually and with the express-validator library.
- Add CSRF Protection to our forms
## Rendering Basic HTML Templates
In our previous session, we returned simple strings and JSON from our routes. While that's perfect for APIs, most web applications need to display rich, structured content to users, like styled web pages with dynamic data. To achieve this, we use HTML templates.  
A template is an HTML file where we can embed dynamic data before sending it to the user's browser. This approach keeps our application's logic (written in JavaScript) separate from its presentation (written in HTML), making our code cleaner, easier to maintain, and more scalable.
### The `views` Folder
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
### Using `res.render()`
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
### The `routes` Folder
As our application grows, it’s a good practice to organize our routes in a separate folder instead of keeping them all inside `app.js`. This keeps the main file clean and easier to maintain, especially as we add more features.

We’ll create a folder named `routes` in the root directory and move our route logic there. Each file inside this folder will handle a specific set of routes.

```
my_express_project/
├── node_modules/     
├── public/          # For static files, added later
├── routes/   
│   └── index.js
├── views/
│   └── index.ejs
├── package.json
└── app.js

```
**`routes/index.js`:**
```
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;
```
We First import Express and create a router instance using express.Router(). This router works like a mini Express app it can handle routes, middleware, and logic independently.

Then, we define a GET route for '/', which responds by rendering the index.ejs template using res.render('index'). This means when someone visits the homepage, Express will send back the rendered HTML from our EJS file.

Finally, we export the router with module.exports = router; so it can be imported into app.js. There, it’s connected to the main app using app.use('/', indexRoutes);, allowing our defined routes to work within the main application.

**`app.js`:**
```
const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;
// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use routes
app.use('/', require('./routes/index'));


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```
We first set up the view engine using app.set('view engine', 'ejs'), which tells Express to use EJS for rendering templates. EJS allows us to embed JavaScript into HTML, making it easy to create dynamic pages. Then, with app.set('views', path.join(__dirname, 'views')), we specify that all our template files are stored inside the views folder.

After that, we link our route file using app.use('/', require('./routes/index')). This means any request to the root path (/) will be handled by the routes defined in routes/index.js. Inside that route file, Express will render the appropriate EJS template when a matching route is accessed.  

Run the app with `node app.js`, then visit `http://localhost:3000` in your browser. You’ll see a fully rendered HTML page with a heading and paragraph, instead of just plain text. This is our first step toward building a dynamic web application!
## Working with Static Files
A website isn’t complete without styling, images, or client-side JavaScript. These are called **static files** because they don’t change dynamically like templates do. In Express, we serve static files from a folder (commonly named `public`) using the built-in `express.static` middleware. This makes files like CSS, images, and JavaScript accessible to the browser.  
Our updated project structure:
```
my_express_project/
├── public/
│   ├── css/
│   │   └── style.css
│   └── images/
│       └── logo.png
├── routes/   
│   └── index.js
├── views/
│   └── index.ejs
├── package.json
└── app.js
```
### Serving Static Files
To serve static files, we use the `express.static` middleware in `app.js`. This middleware tells Express to make all files in the `public` folder available at URLs relative to the folder. For example, `public/css/style.css` becomes accessible at `/css/style.css`.  
Update `app.js` to include the static middleware:
```
const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' folder
app.use(express.static('public'));

app.use('/', require('./routes/index'));


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
### Why Use `express.static`?
Using `app.use(express.static('public'))` is the recommended way to serve static files because:
1. **Automatic Path Resolution**: Express adjusts file paths based on the app’s deployment context. For example, if deployed to `https://example.com/my-app/`, URLs like `/css/style.css` correctly resolve to `/my-app/css/style.css`.
2. **Simplicity**: No need to write routes for each static file; Express serves everything in `public` automatically.
3. **Efficiency**: Express optimizes static file delivery with features like caching support.

This approach ensures our static assets are served reliably across different environments, whether on a local machine or a production server.
## Understanding Express Middleware
Before we dive into dynamic templating, let’s explore **middleware**, a fundamental concept in Express that powers much of its functionality. Middleware functions are the backbone of how Express processes requests and responses, and understanding them is key to building robust applications.
### What is Middleware?
Middleware functions are JavaScript functions that sit between the incoming request and the final response. They have access to the request object (`req`), the response object (`res`), and the `next` function, which passes control to the next middleware or route handler in the chain. Middleware can:

- Modify the request or response objects.
- Perform tasks like logging, authentication, or parsing data.
- End the request-response cycle by sending a response.
- Call `next()` to pass control to the next middleware.

Think of middleware as a pipeline: each request flows through a series of middleware functions before reaching the route handler (or being sent back to the client).
### How Middleware Works
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
### Middleware in Our App
We’ve already used middleware without realizing it! The `express.static('public')` middleware we added earlier is a built-in Express middleware that serves static files. Another common middleware we’ll use later is `express-validator`, which validate and sanitize user input.  
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
### Why Middleware Matters
Middleware is what makes Express so flexible. It allows us to:
- Add cross-cutting functionality like logging, authentication, or error handling.
- Process requests before they reach routes (e.g., parsing form data).
- Reuse code across multiple routes or the entire app.

As we proceed with templating and form handling, we’ll use middleware like `express-validator` to validate and sanitize user input, showing how middleware integrates into real applications.
## Introduction to EJS Templating
Express uses **EJS** (Embedded JavaScript) as our templating engine, which lets us embed JavaScript code directly in HTML to create dynamic content. EJS is simple yet powerful, allowing us to add variables, conditionals, and loops to our templates.  
EJS has three key syntaxes:

- `<%= ... %>`: Outputs escaped data (e.g., converts `<` to `&lt;`) for safe rendering.
- `<%- ... %>`: Outputs unescaped data (e.g., for raw HTML, use with caution).
- `<% ... %>`: For control structures like `if` statements and `forEach` loops.

### Passing Data to Templates
We can pass data from our route to the template as an object in `res.render()`. Inside the template, we use JavaScript to display or manipulate this data.  
Here’s a route that passes user details to a template:  
**`routes/profile.js`:**  
```
const express = require('express');
const router = express.Router();

route.get('/profile/:name', (req, res) => {
    const userDetails = {
        username: req.params.name,
        bio: 'Loves coding in JavaScript and exploring new technologies.',
        shoppingList: ['Apples', 'Oranges', 'Bananas']
    };
    res.render('profile', { user: userDetails });
});

module.exports = router;
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
### Conditional Statements (`if`, `else`)
EJS allows us to add decision-making logic to templates, just like choosing an outfit based on the weather. We can show different content based on the data passed from our route.   
**How It Works**:
- `<% if (condition) { %>`: Checks if a condition is true.
- `<% } else if (anotherCondition) { %>`: Optional additional conditions.
- `<% } else { %>`: Optional fallback for when all conditions are false.
- `<% } %>`: Required to close the block.

**Example**:  
Create a dashboard route with different messages based on user status.  
**`routes/dashboard .js`:**
```
const express = require('express');
const router = express.Router();

router.get('/dashboard/:status', (req, res) => {
    res.render('dashboard', { userStatus: req.params.status });
});

module.exports = router;
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
### Loops (`forEach`)
EJS loops let us iterate over arrays to display lists, such as tasks, users, or products.  
**How It Works**:
- `<% array.forEach(item => { %> ... <% }); %>`: Iterates over `array`, with each item available as `item`.
- Use conditionals to handle empty arrays, as EJS doesn’t have a built-in `else` for loops.

**Example**:   
Create a route to display a task list.
**`routes/task.js`:**
```
const express = require('express');
const router = express.Router();

router.get('/tasks', (req, res) => {
    const taskList = [
        'Buy groceries',
        'Finish Express workshop',
        'Go for a run'
    ];
    res.render('tasks', { tasks: taskList });
});
module.exports = router;
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
Most websites share a consistent layout a header, footer, and navigation bar across all pages. Copying this code into every template is inefficient and hard to maintain. EJS’s `<%- include() %>` lets us create a base layout and reuse it across templates.  
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
### Including Template Snippets with `<%- include %>`  
While `<%- include %>` is used for layouts, it’s also great for smaller, reusable HTML snippets, like a navigation bar or a card component.  
In our layout, we already used `<%- include('partials/_navbar') %>` to include the navigation bar. This keeps our code DRY (Don’t Repeat Yourself) and makes updates easier if we change `_navbar.ejs`, all pages using the layout reflect the change.
## Handling HTML Forms
Forms are the primary way users send data to our server, like submitting a contact message. We’ll explore handling forms manually and with the `express-validator` library for validation.
### The Basic HTML Way  
We’ll create a contact form and process it using the express built-in middleware to parse form data into `req.body`.  
we first start by creating a contact route to display a contact form for the users
 **`routes/contact.js`**
 ```
const express = require('express');
const router = express.Router();

// GET route to display the contact form
router.get('/', (req, res) => {
    res.render('contact', { submittedName: null });
});

// POST route to handle form submission
router.post('/', (req, res) => {
    const name = req.body.name;
    const message = req.body.message;
    console.log(`Received message from ${name}: ${message}`);
    res.render('contact', { submittedName: name });
});

module.exports = router;

 ```
The GET (`router.get()`) route displays the contact form by rendering the contact.ejs view and setting submittedName to null, meaning no name has been submitted yet.  
The POST (`router.postt()`) route processes the form submission. It reads the user’s name and message from req.body, logs the message to the console, and re-renders the contact.ejs view while passing the submitted name to display a confirmation
**`app.js`:**
```
const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));  // To parse URL-encoded form data

app.use('/contact', require('./routes/contact'));


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
The line app.use(express.urlencoded({ extended: true })) allows Express to parse form data that users submit through an HTML form. When a form is sent using the POST method, the data arrives in a URL-encoded format (for example, name=John&age=25). This middleware converts that data into a JavaScript object and stores it in req.body, so we can easily access it in our routes.
### The express-validator Way
Manual form handling is straightforward but can be error-prone for validation and security. The `express-validator` library simplifies form validation and sanitization, offering a robust alternative to manual checks.  
Install `express-validator`:
```
npm install express-validator
```
**`routes/contact_val.js`**
The new route for validated form become: 
```
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
// GET route to display the contact form
app.get('/contact-val', (req, res) => {
    res.render('contact_val', { errors: [], submittedName: null });
});

// POST route to handle form submission
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

module.exports = router;
```
The **GET route** displays the form by rendering the `contact_val.ejs` view, initializing `errors` as an empty array and `submittedName` as `null`. This means no errors or submitted data are shown initially.

The **POST route** uses an array of **validation rules** before the route handler runs. Each `body()` check validates and sanitizes a specific field:
- `name` must not be empty, trimmed, and between 3–25 characters.
- `message` must not be empty, trimmed, and no longer than 200 characters.
- `email` must be in a valid email format and normalized.
    

Inside the route handler, `validationResult(req)` collects any validation errors. If errors exist, the form is re-rendered with the `errors` array so the user can see what went wrong.

If the data passes validation, the input is read from `req.body`, logged to the console, and the form is re-rendered showing the submitted name as confirmation.

This setup ensures that **all user input is checked and sanitized** before processing, keeping the app secure and user-friendly.  
**`app.js`:**
```
const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use('/contact_val', require('./routes/contact-val'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```
**`views/contact_val.ejs`:**
```
<%- include('partials/_layout') %>
<h1>Contact Us (Validated)</h1>
<form method="POST" action="/contact_val">
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

### Adding CSRF protection: 
CSRF (Cross-Site Request Forgery) is a type of web attack where a malicious site tricks a user’s browser into performing unwanted actions on another site where the user is authenticated.

For example, if a user is logged into a banking site, a CSRF attack could make their browser unknowingly submit a request to transfer money without their consent. The attacker exploits the trust the site has in the user’s browser session.

To defend against CSRF attacks, we use the csurf middleware in Express. It generates a unique CSRF token for each session or form request. This token must be included in all POST, PUT, or DELETE requests. The server checks the token and rejects any request without a valid one, preventing malicious cross-site submissions.
```
npm install csurf
```
Then, configure it on our route:
**`routes/contact_csrf`**
```
const express = require('express');
const router = express.Router();

const { body, validationResult } = require('express-validator');


// GET route to show the contact form
router.get('/', (req, res) => {
    res.render('contact_csrf', { errors: [],csrfToken: req.csrfToken(), submittedName: null });
});

// POST route to handle form submission
router.post('/',[
    body('name').notEmpty().withMessage('Name is required').trim().isLength({ min: 3, max: 25 }).withMessage('Name must be 3-25 characters'),
    body('message').notEmpty().withMessage('Message is required').trim().isLength({ max: 200 }).withMessage('Message must be under 200 characters'),
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail()
], (req, res) => {
    const { name, message } = req.body;
    console.log(`Received message from ${name}: ${message}`);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('contact_csrf', { errors: errors.array(), csrfToken: req.csrfToken(), submittedName: null });
    }
    res.render('contact_csrf', { errors:[], csrfToken: req.csrfToken(), submittedName: name });
});

module.exports = router;
```
This route adds both **form validation** and **CSRF protection** to the contact form. The **GET route** renders the form and includes a unique CSRF token using `req.csrfToken()`. This token is added as a hidden field inside the form, ensuring that only genuine submissions from our website are accepted.

The **POST route** not only validates the form inputs using `express-validator` checking that the name, message, and email meet the required rules but also verifies the CSRF token automatically through the `csurf` middleware. When the form is submitted, the token sent with it is compared to the one stored on the server. If they match, the request is trusted and processed. If not, it’s rejected to prevent any malicious submission.

If validation fails, the form is re-rendered with error messages and a new CSRF token. If everything is valid, the user’s data is logged, and a confirmation message is displayed.

This setup ensures that **form data is both validated and protected**, keeping the app safe from CSRF attacks and invalid input.  
**`app.js`:**  
we update the app.js and add the csurf middleware
```
const express = require('express');
const csrf = require('csurf');


const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
// adding csurf middleware
const csrfProtection = csrf();
app.use(csrfProtection);


app.use('/contact_csrf', require('./routes/contact_csrf'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```
**`views/contact_csrf.ejs`**  
We add hidden input with the csrf token `` <input type="hidden" name="_csrf" value="<%= csrfToken %>">``
```
<%- include('partials/_layout') %>
<h1>Contact Us (CSRF Protected)</h1>
<form method="POST" action="/contact_csrf">
    <input type="hidden" name="_csrf" value="<%= csrfToken %>">
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
