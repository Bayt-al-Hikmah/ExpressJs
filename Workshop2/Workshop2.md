# Workshop 2: Building Server-Rendered Web Applications with Express and EJS

## Objectives

- Render HTML templates instead of simple strings or JSON.
- Understand and serve static files like CSS, images, and JavaScript.
- Understand and use Express middleware to process requests.
- Use the EJS templating engine to generate dynamic HTML content using variables, loops, and conditions.
- Create reusable page layouts using EJS partials.
- Handle user input through HTML forms.
- Understand server-side validation and use the `express-validator` library.
- Understand and implement CSRF protection.

## Rendering Basic HTML Templates

In our previous session, we learned how to create Express routes that return simple strings or JSON responses. While this approach is useful for building APIs, most traditional web applications need to display rich, structured content to users, such as styled web pages containing text, images, and dynamic information.

To achieve this, we use **HTML templates**.

A template is an HTML file that can contain placeholders for dynamic data. Before sending the page to the client's browser, the server processes the template, inserts the required data, and generates the final HTML document.

This approach separates our application's logic, written in JavaScript, from its presentation, written in HTML. It makes our code cleaner, easier to maintain, and more organized.

### The `views` Folder

Express doesn't enforce a specific folder for storing templates, but it is standard practice to use a folder called `views`.

This folder should be located in the root directory of our project, alongside our `app.js` file.

Our project structure should now look like this:

```text
my_express_project/
├── node_modules/
├── routes/
├── views/
│   └── index.ejs
├── package.json
├── package-lock.json
└── app.js
```

### Using `res.render()`

To render an HTML template, we use Express's `res.render()` method.

First, we need to configure Express to use a templating engine.

For this workshop, we will use **EJS (Embedded JavaScript)**, a lightweight templating engine that integrates seamlessly with Express.

EJS allows us to embed JavaScript inside HTML files, making it possible to generate dynamic content based on information received or processed by our server.

To get started, install EJS:

```bash
npm install ejs
```

Since we already installed Express in the previous workshop, we only need to install EJS. If you are starting from a new project, you can install both using:

```bash
npm install express ejs
```

Now, let's create our first template.

**`views/index.ejs`:**

```html
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

### Configuring EJS in Express

Before rendering our template, we need to configure Express to use EJS as its view engine.

Open `app.js` and add the following configuration:

```javascript
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the directory containing our templates
app.set('views', path.join(__dirname, 'views'));

// Define the homepage route
app.get('/', (req, res) => {
    res.render('index');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

Let's understand what we have added.

First:

```javascript
app.set('view engine', 'ejs');
```

This tells Express to use EJS whenever we render a template. It also allows us to omit the `.ejs` extension when calling `res.render()`.

Next:

```javascript
app.set('views', path.join(__dirname, 'views'));
```

This specifies where Express should look for our template files.

Here, `__dirname` represents the directory containing the current JavaScript file, while `path.join()` constructs the appropriate filesystem path.

After configuring the view engine, we define our homepage route:

```javascript
app.get('/', (req, res) => {
    res.render('index');
});
```

Instead of sending a simple string using `res.send()`, we use `res.render('index')` to render the `index.ejs` template and send the generated HTML to the client.

Finally, we start our server using `app.listen()` as we did in the previous workshop.

### Running Our Application

Save the file and run:

```bash
node app.js
```

Now, visit:

```text
http://localhost:3000
```

You should see our HTML page displayed in the browser.

This is our first step toward building server-rendered web applications using Express and EJS.

### The `routes` Folder

As our application grows, keeping all our routes inside `app.js` can make the file difficult to maintain.

It is good practice to organize related routes into separate files.

We will create a folder named `routes` in the root directory and move our homepage route into a separate file.

Our project structure becomes:

```text
my_express_project/
├── node_modules/
├── routes/
│   └── index.js
├── views/
│   └── index.ejs
├── package.json
├── package-lock.json
└── app.js
```

**`routes/index.js`:**

```javascript
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;
```

Let's understand what is happening here.

First, we import Express and create a router instance using:

```javascript
const router = express.Router();
```

An Express Router works like a small, modular application. It allows us to define routes and middleware independently of the main application.

Then, we define a GET route for `/`:

```javascript
router.get('/', (req, res) => {
    res.render('index');
});
```

When someone visits the homepage, this route renders the `index.ejs` template.

Finally, we export the router:

```javascript
module.exports = router;
```

This allows us to import it into `app.js` and connect it to our main application.

**`app.js`:**

```javascript
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Register the homepage routes
app.use('/', require('./routes/index'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

Notice that we use:

```javascript
app.use('/', require('./routes/index'));
```

This mounts our router into the main Express application.

The `/` prefix means that the routes defined inside this router are mounted under the root path.

For example, if our router contains:

```javascript
router.get('/about', (req, res) => {
    res.send('About Page');
});
```

The corresponding URL will be:

```text
http://localhost:3000/about
```

This approach allows us to organize our application into multiple route files without keeping all the route definitions inside `app.js`.

## Working with Static Files

A website isn't complete without styling, images, and client-side JavaScript.

These files are called **static files** because they are served directly to the browser without being processed by our server-side templating engine.

Examples include:

- CSS files used to style our pages.
- Images such as logos, icons, and illustrations.
- JavaScript files executed by the browser.

In Express, we serve static files using the built-in `express.static()` middleware.

This middleware makes files inside a specified directory accessible through URLs.

Our updated project structure will look like this:

```text
my_express_project/
├── node_modules/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── images/
│   │   └── logo.png
│   └── js/
├── routes/
│   └── index.js
├── views/
│   └── index.ejs
├── package.json
├── package-lock.json
└── app.js
```

We use the `public` folder to store files that the browser needs to access directly.

### Serving Static Files

To serve static files, we use the `express.static()` middleware in `app.js`.

Add the following line before registering our routes:

```javascript
app.use(express.static(path.join(__dirname, 'public')));
```

This tells Express to serve files from the `public` directory.

For example:

```text
public/css/style.css
```

becomes accessible through:

```text
http://localhost:3000/css/style.css
```

And:

```text
public/images/logo.png
```

becomes accessible through:

```text
http://localhost:3000/images/logo.png
```

Notice that the `public` directory itself isn't included in the URL.

Now let's create a CSS file and connect it to our template.

**`public/css/style.css`:**

```css
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

Update **`views/index.ejs`**:

```html
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

Let's understand this line:

```html
<link rel="stylesheet" href="/css/style.css">
```

The browser requests `/css/style.css` from our server, and Express uses the static middleware to find the corresponding file inside the `public` directory.

Similarly, the image:

```html
<img src="/images/logo.png" alt="Our Logo">
```

is served from `public/images/logo.png`.

Restart the server if necessary and visit:

```text
http://localhost:3000
```

The page should now display the CSS styling and logo.

Make sure the image file actually exists inside `public/images/`, otherwise the browser will display a broken image.

### Why Use `express.static()`?

Using `express.static()` provides several advantages:

1. **Simplicity:** We don't need to define individual routes for every CSS file, image, or JavaScript file.
2. **Automatic File Serving:** Express maps URLs to files inside the specified directory.
3. **Caching Support:** Static file serving supports HTTP caching mechanisms, which can improve performance by reducing unnecessary downloads.

We can also mount the static directory under a custom URL prefix:

```javascript
app.use('/static', express.static(path.join(__dirname, 'public')));
```

In this case, the CSS file would be available at:

```text
http://localhost:3000/static/css/style.css
```

For our workshop, we will continue using the default root mapping.

**An important distinction:** EJS templates are processed by the server before being sent to the browser, while static files are served directly from the `public` folder.

## Understanding Express Middleware

Before diving deeper into dynamic templating, let's revisit an important concept in Express: **middleware**.

In the previous workshop, we introduced middleware as functions that participate in processing incoming requests.

Now that we have started building a real web application, we can see that middleware is used for much more than logging requests.

It allows us to process incoming data, serve static files, manage sessions, validate user input, and implement security mechanisms.

### What is Middleware?

Middleware functions are JavaScript functions that have access to three important arguments:

- `req`: The incoming request object.
- `res`: The response object.
- `next`: A function used to pass control to the next middleware or route handler.

Middleware functions can perform different operations:

- **Inspect Requests:** For example, check whether a user is logged in.
- **Modify Requests or Responses:** For example, parse submitted data or attach information to the request.
- **End the Request-Response Cycle:** For example, immediately send an error response to the client.
- **Pass Control:** Call `next()` to allow the next middleware or route handler to execute.

Think of middleware as a pipeline through which every incoming request can pass before reaching its corresponding route handler.

### How Middleware Works

Middleware can be registered globally using `app.use()` or applied to specific routes.

Let's create a simple middleware function that logs information about every incoming request:

```javascript
app.use((req, res, next) => {
    console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.url}`
    );

    next();
});
```

Here, we use:

- `req.method` to retrieve the HTTP method.
- `req.url` to retrieve the requested URL.
- `next()` to pass control to the next function.

For example, when someone visits:

```text
http://localhost:3000/
```

The terminal displays something similar to:

```text
[2026-11-15T10:00:00.000Z] GET /
```

And when someone visits:

```text
http://localhost:3000/about
```

The terminal displays:

```text
[2026-11-15T10:01:00.000Z] GET /about
```

Notice that this middleware doesn't generate a response. Instead, it performs its logging operation and passes control to the next function.

### Understanding `next()`

One important characteristic of middleware is that it must either:

- Send a response to the client.
- Pass control to the next middleware or route handler.
- Pass an error to Express using `next(error)`.

For example:

```javascript
app.use((req, res, next) => {
    console.log('Request received');
    next();
});
```

Here, `next()` allows the application to continue processing the request.

However, consider this example:

```javascript
app.use((req, res, next) => {
    console.log('Request received');
});
```

This middleware neither sends a response nor calls `next()`.

As a result, the request remains pending, and the browser continues waiting for a response.

We can also use middleware to stop a request when a particular condition is met:

```javascript
app.use((req, res, next) => {
    if (req.ip === '192.168.1.100') {
        return res.status(403).send('Access denied');
    }

    next();
});
```

If the request comes from the specified IP address, the middleware sends a `403 Forbidden` response and stops further processing.

Otherwise, it calls `next()` and allows the request to continue.

### Global and Route-Specific Middleware

Middleware can be registered globally or applied to individual routes.

**Global Middleware**

Global middleware is registered using `app.use()` and applies to all requests that match its mounting path and method behavior.

For example:

```javascript
app.use((req, res, next) => {
    console.log('Global middleware executed');
    next();
});
```

This middleware runs for incoming requests throughout the application.

**Route-Specific Middleware**

Sometimes, we only want to execute middleware for a particular route.

For example:

```javascript
const logUserRoute = (req, res, next) => {
    console.log(`Accessing user route for ${req.params.name}`);
    next();
};

app.get('/profile/:name', logUserRoute, (req, res) => {
    res.render('profile', {
        user: {
            username: req.params.name
        }
    });
});
```

Here, `logUserRoute` is executed only when a request matches `/profile/:name`.

It logs the accessed username and then passes control to the route handler.

### Middleware in Our App

We have already used middleware without necessarily realizing it.

For example:

```javascript
app.use(express.static(path.join(__dirname, 'public')));
```

The `express.static()` function is built-in Express middleware responsible for serving static files.

Soon, we will also use:

```javascript
app.use(express.urlencoded({ extended: true }));
```

This middleware parses incoming form data and makes it accessible through `req.body`.

Another example is `express-validator`, which provides validation chains that work as middleware.

This demonstrates how middleware is integrated into different parts of an Express application.

### Middleware Execution Order

One important characteristic of Express middleware is that it executes in the order in which it is registered.

Consider the following example:

```javascript
app.use((req, res, next) => {
    console.log('Middleware 1');
    next();
});

app.use((req, res, next) => {
    console.log('Middleware 2');
    next();
});

app.get('/', (req, res) => {
    console.log('Route Handler');
    res.send('Hello, World!');
});
```

When someone visits the homepage, the terminal displays:

```text
Middleware 1
Middleware 2
Route Handler
```

This happens because the first middleware executes and calls `next()`, allowing the second middleware to run.

The second middleware also calls `next()`, allowing Express to continue to the route handler.

The request-processing pipeline can be represented as follows:

```text
       HTTP REQUEST
            |
            v
     Global Middleware
            |
            v
   Route-Specific Middleware
            |
            v
       Route Handler
            |
            v
      HTTP RESPONSE
```

Understanding middleware and its execution order is important because we will rely on it throughout the remaining workshop, especially when handling forms, validating data, and implementing CSRF protection.

## Introduction to EJS Templating

Now that we understand how Express renders HTML templates, let's explore how to make those templates dynamic.

As mentioned earlier, EJS (Embedded JavaScript) allows us to embed JavaScript directly into HTML.

This makes it possible to generate different pages depending on the information passed from our routes.

For example, instead of creating a separate HTML page for every user, we can create one EJS template and pass different user information to it.

EJS provides three important syntaxes:

| Syntax | Purpose |
|---|---|
| `<%= ... %>` | Outputs a value after escaping HTML-sensitive characters. |
| `<%- ... %>` | Outputs a value without HTML escaping. |
| `<% ... %>` | Executes JavaScript code without directly outputting its result. |

For example:

```ejs
<h1><%= username %></h1>
```

Displays the value of `username`.

```ejs
<% if (isAdmin) { %>
    <p>Administrator</p>
<% } %>
```

Executes a conditional statement.

```ejs
<%- include('partials/navbar') %>
```

Includes another EJS template inside the current one.

An important security consideration is that `<%=` escapes HTML-sensitive characters, while `<%-` outputs raw HTML.

When displaying information submitted by users, we should normally use `<%=` to reduce the risk of Cross-Site Scripting (XSS).

We will see why this matters when building our final project.

### Passing Data to Templates

We can pass data from our routes to EJS templates through the second argument of `res.render()`.

This argument is an object containing the data we want to make available inside the template.

Let's create a route that passes user information to a template.

**`routes/profile.js`:**

```javascript
const express = require('express');
const router = express.Router();

router.get('/profile/:name', (req, res) => {

    const userDetails = {
        username: req.params.name,
        bio: 'Loves coding in JavaScript and exploring new technologies.',
        shoppingList: ['Apples', 'Oranges', 'Bananas']
    };

    res.render('profile', {
        user: userDetails
    });

});

module.exports = router;
```

Here, we create a `userDetails` object containing information about the user.

Then, we pass this object to the template through:

```javascript
res.render('profile', {
    user: userDetails
});
```

This makes the object accessible inside our EJS template through the variable `user`.

Now, let's create the template.

**`views/profile.ejs`:**

```html
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

    <h2>Shopping List</h2>

    <% if (user.shoppingList.length > 0) { %>

        <p>
            You have <%= user.shoppingList.length %> item(s)
            on your shopping list:
        </p>

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

Notice how we use `<%= ... %>` to display information from the `user` object.

We also use JavaScript inside EJS to transform the username, check whether the shopping list contains items, and iterate through the array.

Now, mount the new router inside `app.js`:

```javascript
app.use('/', require('./routes/profile'));
```

Visit:

```text
http://localhost:3000/profile/alice
```

You should see a page containing Alice's capitalized name, biography, and shopping list.

If you change the URL to:

```text
http://localhost:3000/profile/bob
```

the username will change automatically.

This demonstrates how one template can display different content depending on the data received from the server.

### Conditional Statements (`if`, `else`)

EJS allows us to use JavaScript conditional statements to control which parts of a page are displayed.

This is useful when we want to show different content depending on the information passed from our routes.

For example, imagine a dashboard where different users have different roles.

An administrator should see a different welcome message from a regular member or a guest.

Let's implement this example.

**`routes/dashboard.js`:**

```javascript
const express = require('express');
const router = express.Router();

router.get('/dashboard/:status', (req, res) => {

    res.render('dashboard', {
        userStatus: req.params.status
    });

});

module.exports = router;
```

**`views/dashboard.ejs`:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>

    <div class="welcome-message">

        <% if (userStatus === 'admin') { %>

            <h1>Welcome, Administrator!</h1>
            <p>You have full access to the system controls.</p>

        <% } else if (userStatus === 'member') { %>

            <h1>Welcome, Valued Member!</h1>
            <p>Thank you for being part of our community.</p>

        <% } else { %>

            <h1>Welcome, Guest!</h1>
            <p>Please sign up or log in to access member features.</p>

        <% } %>

    </div>

</body>
</html>
```

Let's understand the syntax:

- `<% if (condition) { %>`: Executes the code inside the block when the condition is true.
- `<% } else if (condition) { %>`: Checks another condition if the previous one was false.
- `<% } else { %>`: Executes the fallback block when none of the previous conditions are true.
- `<% } %>`: Closes the conditional block.

After mounting the dashboard router:

```javascript
app.use('/', require('./routes/dashboard'));
```

Visit the following URLs:

```text
http://localhost:3000/dashboard/admin
http://localhost:3000/dashboard/member
http://localhost:3000/dashboard/visitor
```

Each URL displays a different message based on the value received from the route parameter.

This demonstrates how EJS allows us to generate different page content without creating separate templates for every possible condition.

### Loops (`forEach`)

Another useful feature of EJS is the ability to iterate over arrays and generate repeated HTML elements.

This is particularly useful when displaying collections of information, such as products, users, tasks, or articles.

For example, imagine we want to display a list of tasks.

Let's create a route that passes an array of tasks to our template.

**`routes/tasks.js`:**

```javascript
const express = require('express');
const router = express.Router();

router.get('/tasks', (req, res) => {

    const taskList = [
        'Buy groceries',
        'Finish Express workshop',
        'Go for a run'
    ];

    res.render('tasks', {
        tasks: taskList
    });

});

module.exports = router;
```

**`views/tasks.ejs`:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Tasks</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>

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

</body>
</html>
```

Here, we use:

```ejs
<% tasks.forEach(task => { %>
    <li><%= task %></li>
<% }); %>
```

The `forEach()` method iterates through the array.

For every element, EJS generates a new `<li>` containing the corresponding task.

We also use a conditional statement to check whether the array is empty.

If there are no tasks, we display a message instead.

Mount the new router inside `app.js`:

```javascript
app.use('/', require('./routes/tasks'));
```

Visit:

```text
http://localhost:3000/tasks
```

You should see all three tasks displayed as a list.

Try setting:

```javascript
const taskList = [];
```

You will see the alternative message.

This is how we can use EJS loops and conditions together to generate dynamic page content.

## Reusable Layouts with EJS Partials

Most websites share a consistent design across their pages.

For example, they commonly have:

- A navigation bar.
- A header or logo.
- A footer.
- Common styles and other layout elements.

Copying this HTML structure into every template is inefficient and makes maintenance difficult.

Imagine changing the navigation bar of a website containing twenty pages. Without reusable components, we would need to update the same HTML in every single page.

To avoid this, we can use **EJS partials**.

A partial is a smaller EJS template that can be included inside other templates.

EJS provides the `include()` function, which allows us to reuse HTML components across different pages.

This approach is sometimes called template composition. Unlike some other templating engines, EJS does not provide a native block-based inheritance system.

### Creating Reusable Components

Let's create a folder called `partials` inside our `views` directory.

Our updated project structure will look like this:

```text
views/
├── partials/
│   ├── _header.ejs
│   ├── _navbar.ejs
│   └── _footer.ejs
├── index.ejs
├── profile.ejs
├── dashboard.ejs
└── tasks.ejs
```

We will separate the common page structure into three reusable components.

**`views/partials/_header.ejs`:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title><%= title || 'My Awesome App' %></title>

    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
```

This partial contains the beginning of our HTML document, its metadata, and the common stylesheet.

Notice that we use:

```ejs
<%= title || 'My Awesome App' %>
```

This allows us to pass a different page title from each route. If no title is provided, we use the default value.

**`views/partials/_navbar.ejs`:**

```html
<header>
    <nav>
        <a href="/">Home</a> |
        <a href="/about">About</a> |
        <a href="/contact">Contact</a>
    </nav>
</header>
```

This partial contains our navigation links.

**`views/partials/_footer.ejs`:**

```html
<footer>
    <p>&copy; 2026 Our Company</p>
</footer>

</body>
</html>
```

This partial contains the footer and closes the HTML document.

### Using Partials in Our Templates

Now we can update our `index.ejs` template to use these reusable components.

**`views/index.ejs`:**

```ejs
<%- include('partials/_header', { title: 'Home' }) %>

<%- include('partials/_navbar') %>

<main>
    <h1>Welcome to Our Website!</h1>

    <p>
        This page was rendered using Express and EJS
        with reusable components.
    </p>
</main>

<%- include('partials/_footer') %>
```

Let's understand what happens here.

The following line:

```ejs
<%- include('partials/_header', { title: 'Home' }) %>
```

includes the `_header.ejs` template and passes it a title.

Similarly:

```ejs
<%- include('partials/_navbar') %>
```

includes our navigation component.

Finally:

```ejs
<%- include('partials/_footer') %>
```

includes the footer and closes the document.

Notice that we use `<%- ... %>` rather than `<%= ... %>` when including partials.

This is because an included template returns HTML that we want the browser to interpret as markup, not escaped text.

We should only use this unescaped output for trusted template content, not for arbitrary user-submitted data.

Now, any other page can reuse the same components.

For example, our profile page can simply become:

```ejs
<%- include('partials/_header', { title: 'User Profile' }) %>

<%- include('partials/_navbar') %>

<main>
    <h1>
        Hello,
        <%= user.username.charAt(0).toUpperCase() + user.username.slice(1) %>!
    </h1>

    <p><%= user.bio %></p>
</main>

<%- include('partials/_footer') %>
```

This keeps our templates clean and avoids repeating the same HTML structure.

If we change the navigation or footer, all pages that include those components automatically reflect the changes.

This is an important principle in web development: **Don't Repeat Yourself (DRY).**

## Handling HTML Forms

So far, we have focused on displaying information to users.

However, most web applications also need to receive information from users.

For example:

- A contact form allows users to send messages.
- A registration form allows users to create accounts.
- A search form allows users to find information.
- A product form allows administrators to submit new products.

Forms are one of the most common ways browsers send information to backend applications.

In this section, we will learn how to create HTML forms, receive their submitted data, validate user input, and protect our forms against CSRF attacks.

### Understanding Form Submission

HTML forms commonly use two HTTP methods to communicate with a server: GET and POST.

**GET Method**

GET is primarily used to request information from the server.

For example, a search form can use GET because searching doesn't normally modify server-side data.

```html
<form action="/search" method="GET">

    <input type="text" name="author">

    <button type="submit">Search</button>

</form>
```

When the user submits the form, the browser sends the form values as query parameters.

For example:

```text
/search?author=Alice
```

We can access the submitted value using:

```javascript
req.query.author
```

**POST Method**

POST is commonly used to submit information to the server when we want to process or modify server-side data.

For example, a contact form could use:

```html
<form action="/contact" method="POST">

    <input type="text" name="name">

    <textarea name="message"></textarea>

    <button type="submit">Submit</button>

</form>
```

When the form is submitted, the browser sends the information inside the request body instead of placing it in the URL.

We access these values through:

```javascript
req.body
```

However, Express needs middleware to parse this form data before we can use it.

### Parsing Form Data

When a browser submits a traditional HTML form using POST, its data is commonly sent using the `application/x-www-form-urlencoded` format.

For example:

```text
name=Alice&message=Hello
```

Express provides built-in middleware called `express.urlencoded()` to parse this data.

Add the following line to `app.js`:

```javascript
app.use(express.urlencoded({ extended: true }));
```

This middleware converts the submitted form data into a JavaScript object and makes it accessible through `req.body`.

For example, the submitted data:

```text
name=Alice&message=Hello
```

becomes:

```javascript
{
    name: 'Alice',
    message: 'Hello'
}
```

We must register this middleware before our routes so that the request body is parsed before the route handlers attempt to access it.

### The Basic HTML Way

Let's build a simple contact form that allows users to submit their names and messages.

We will first handle the submitted information manually, without using any external validation library.

This will help us understand what happens when a form is submitted and how server-side validation works.

#### Creating the Contact Routes

First, create a new file inside the `routes` folder.

**`routes/contact.js`:**

```javascript
const express = require('express');
const router = express.Router();

// GET route to display the contact form
router.get('/contact', (req, res) => {

    res.render('contact', {
        errors: [],
        values: {
            name: '',
            message: ''
        },
        submittedName: null
    });

});

// POST route to handle form submission
router.post('/contact', (req, res) => {

    // Extract and trim the submitted values
    const name = typeof req.body.name === 'string'
        ? req.body.name.trim()
        : '';

    const message = typeof req.body.message === 'string'
        ? req.body.message.trim()
        : '';

    // Store validation errors
    const errors = [];

    // Validate the name
    if (!name) {
        errors.push('Name is required.');
    } else if (name.length < 3 || name.length > 25) {
        errors.push('Name must be between 3 and 25 characters.');
    }

    // Validate the message
    if (!message) {
        errors.push('Message is required.');
    } else if (message.length > 200) {
        errors.push('Message must not exceed 200 characters.');
    }

    // If validation fails, display the errors
    if (errors.length > 0) {

        return res.status(400).render('contact', {
            errors,
            values: {
                name,
                message
            },
            submittedName: null
        });

    }

    // Process the valid data
    console.log(`Received message from ${name}: ${message}`);

    res.render('contact', {
        errors: [],
        values: {
            name: '',
            message: ''
        },
        submittedName: name
    });

});

module.exports = router;
```

Let's understand what is happening here.

**The GET Route**

The GET route displays the contact form by rendering `contact.ejs`.

We also pass three values:

- `errors`: An empty array because there are no validation errors when the form is first displayed.
- `values`: An object containing the initial values of the form fields.
- `submittedName`: Initially set to `null` because no form has been submitted.

**The POST Route**

The POST route handles the form submission.

We first extract the submitted name and message from `req.body`.

We also use `.trim()` to remove unnecessary whitespace from the beginning and end of the submitted values.

Next, we manually validate the information.

For example, we check whether the name is empty or whether its length is within the required limits.

If any validation rule fails, we store the corresponding error message inside the `errors` array.

Then:

```javascript
return res.status(400).render('contact', {
    errors,
    values: {
        name,
        message
    },
    submittedName: null
});
```

We return the contact page with a `400 Bad Request` status code and pass the validation errors back to the template.

Notice that we also preserve the submitted values. This allows users to correct their mistakes without having to re-enter everything.

If the submitted data passes validation, we process it and display a confirmation message.

This demonstrates the basic steps involved in handling a form:

1. Receive the submitted data.
2. Extract the values.
3. Validate the input.
4. Return errors if the data is invalid.
5. Process the data if it is valid.

#### Configuring `app.js`

Now we need to register the middleware and connect our contact routes.

Add the following configuration to `app.js`:

```javascript
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/contact'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

Notice that we register `express.urlencoded()` before mounting the contact routes.

This ensures the form data is available through `req.body` when the POST route executes.

#### Creating the Contact Template

Now, let's create the HTML form.

**`views/contact.ejs`:**

```ejs
<%- include('partials/_header', { title: 'Contact Us' }) %>

<%- include('partials/_navbar') %>

<main>

    <h1>Contact Us</h1>

    <% errors.forEach(error => { %>
        <p class="error"><%= error %></p>
    <% }); %>

    <form action="/contact" method="POST">

        <label for="name">Name:</label>

        <input
            type="text"
            id="name"
            name="name"
            value="<%= values.name %>"
            required
        >

        <label for="message">Message:</label>

        <textarea
            id="message"
            name="message"
            required
        ><%= values.message %></textarea>

        <button type="submit">Submit</button>

    </form>

    <% if (submittedName) { %>

        <h2>Thanks for your message, <%= submittedName %>!</h2>

    <% } %>

</main>

<%- include('partials/_footer') %>
```

Here, we use an HTML form with the POST method to submit the user's information to `/contact`.

We also use EJS to display validation errors and preserve the previously entered values.

For example:

```ejs
value="<%= values.name %>"
```

This inserts the submitted name back into the input field.

The `required` attribute provides basic browser-side validation, but we still need server-side validation because clients can bypass browser validation and submit requests directly.

Now, visit:

```text
http://localhost:3000/contact
```

Try submitting the form with missing or invalid information.

You should see the corresponding error messages.

When the information is valid, the server displays a confirmation message.

This is a simple example of how HTML forms communicate with our Express application.

### The `express-validator` Way

Manually validating every field can become repetitive and difficult to maintain, especially when forms contain many inputs.

For example, imagine a registration form containing:

- Username.
- Email.
- Password.
- Phone number.
- Address.

We would need to write validation logic for every field ourselves.

To simplify this process, we can use a third-party library called **express-validator**.

It provides reusable validation and sanitization functions that can be integrated directly into Express routes as middleware.

Before implementing it, let's understand two important concepts.

**Validation**

Validation checks whether submitted data satisfies specific requirements.

For example:

- A name must not be empty.
- An email must follow a valid email format.
- A password must contain a minimum number of characters.

**Sanitization**

Sanitization transforms input data into a more consistent or expected format.

For example:

- `trim()` removes unnecessary whitespace.
- `normalizeEmail()` normalizes email addresses.

Validation and sanitization help improve data quality, but they are not a complete security solution. Applications still need appropriate output escaping, authorization, and database protections.

#### Installing express-validator

Install the package using npm:

```bash
npm install express-validator
```

#### Creating the Validated Contact Routes

Let's create another contact route that uses `express-validator`.

**`routes/contact-validation.js`:**

```javascript
const express = require('express');
const router = express.Router();

const {
    body,
    validationResult
} = require('express-validator');

// GET route to display the form
router.get('/contact_val', (req, res) => {

    res.render('contact_val', {
        errors: [],
        values: {
            name: '',
            email: '',
            message: ''
        },
        submittedName: null
    });

});

// POST route to handle form submission
router.post('/contact_val', [

    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required.')
        .bail()
        .isLength({ min: 3, max: 25 })
        .withMessage('Name must be between 3 and 25 characters.'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required.')
        .bail()
        .isEmail()
        .withMessage('Invalid email format.')
        .normalizeEmail(),

    body('message')
        .trim()
        .notEmpty()
        .withMessage('Message is required.')
        .bail()
        .isLength({ max: 200 })
        .withMessage('Message must not exceed 200 characters.')

], (req, res) => {

    // Collect validation errors
    const errors = validationResult(req);

    // Preserve submitted values
    const values = {
        name: typeof req.body.name === 'string' ? req.body.name : '',
        email: typeof req.body.email === 'string' ? req.body.email : '',
        message: typeof req.body.message === 'string' ? req.body.message : ''
    };

    // If validation fails
    if (!errors.isEmpty()) {

        return res.status(400).render('contact_val', {
            errors: errors.array(),
            values,
            submittedName: null
        });

    }

    // Process valid data
    const { name, email, message } = req.body;

    console.log(`Received from ${name} (${email}): ${message}`);

    res.render('contact_val', {
        errors: [],
        values: {
            name: '',
            email: '',
            message: ''
        },
        submittedName: name
    });

});

module.exports = router;
```

Let's understand what is happening in this code.

First, we import the required functions:

```javascript
const { body, validationResult } = require('express-validator');
```

- `body()` allows us to define validation and sanitization rules for fields inside the request body.
- `validationResult()` collects the errors generated by these rules.

**The GET Route**

Just like our previous example, the GET route renders the form.

We also initialize:

```javascript
errors: [],
values: {
    name: '',
    email: '',
    message: ''
}
```

This allows the template to display validation errors and preserve previously entered information.

**The POST Route**

The POST route contains an array of validation chains:

```javascript
router.post('/contact_val', [
    // Validation rules
], (req, res) => {
    // Route handler
});
```

Each validation chain acts as middleware.

This means Express executes the validation rules before calling our final route handler.

Let's examine the rules.

**Name Validation**

```javascript
body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .bail()
    .isLength({ min: 3, max: 25 })
    .withMessage('Name must be between 3 and 25 characters.')
```

Here:

- `body('name')` selects the name field from the request body.
- `trim()` removes whitespace from the beginning and end.
- `notEmpty()` checks whether the resulting value is empty.
- `withMessage()` defines the error message when validation fails.
- `bail()` stops the remaining validation chain if the preceding validation fails.
- `isLength()` checks that the name contains between 3 and 25 characters.

Notice that we apply `trim()` before `notEmpty()`.

This is important because a value containing only spaces should be considered empty.

**Email Validation**

```javascript
body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .bail()
    .isEmail()
    .withMessage('Invalid email format.')
    .normalizeEmail()
```

Here, we first remove unnecessary whitespace, check that the field isn't empty, and then verify that it follows a valid email format.

Finally, `normalizeEmail()` normalizes the email address.

**Message Validation**

```javascript
body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required.')
    .bail()
    .isLength({ max: 200 })
    .withMessage('Message must not exceed 200 characters.')
```

This ensures that the message isn't empty and doesn't exceed 200 characters.

**Collecting Validation Errors**

Inside our route handler, we use:

```javascript
const errors = validationResult(req);
```

This retrieves the validation results generated by the middleware.

We then check:

```javascript
if (!errors.isEmpty()) {
    // Return the form with errors
}
```

If any validation rule fails, we render the form again and pass the errors to the template.

We also preserve the submitted values so the user doesn't have to re-enter the entire form.

If the data passes all validation rules, we process it normally.

#### Updating `app.js`

Now we need to mount our new router.

Add:

```javascript
app.use('/', require('./routes/contact-validation'));
```

Our application now has two contact forms:

```text
/contact
/contact_val
```

The first uses manual validation, while the second uses `express-validator`.

#### Creating the Validated Contact Template

**`views/contact_val.ejs`:**

```ejs
<%- include('partials/_header', { title: 'Validated Contact Form' }) %>

<%- include('partials/_navbar') %>

<main>

    <h1>Contact Us (Validated)</h1>

    <form method="POST" action="/contact_val">

        <label for="name">Name:</label>

        <input
            type="text"
            id="name"
            name="name"
            value="<%= values.name %>"
            required
        >

        <% errors.forEach(error => { %>
            <% if (error.path === 'name') { %>
                <p class="error"><%= error.msg %></p>
            <% } %>
        <% }); %>


        <label for="email">Email:</label>

        <input
            type="email"
            id="email"
            name="email"
            value="<%= values.email %>"
            required
        >

        <% errors.forEach(error => { %>
            <% if (error.path === 'email') { %>
                <p class="error"><%= error.msg %></p>
            <% } %>
        <% }); %>


        <label for="message">Message:</label>

        <textarea
            id="message"
            name="message"
            required
        ><%= values.message %></textarea>

        <% errors.forEach(error => { %>
            <% if (error.path === 'message') { %>
                <p class="error"><%= error.msg %></p>
            <% } %>
        <% }); %>

        <button type="submit">Submit</button>

    </form>

    <% if (submittedName && errors.length === 0) { %>
        <h2>Thanks for your message, <%= submittedName %>!</h2>
    <% } %>

</main>

<%- include('partials/_footer') %>
```

Notice that we display errors only beside their corresponding fields.

We also use `<%=` when displaying the submitted values.

This ensures that user-provided content is HTML-escaped before being inserted into the page.

### Why Use express-validator?

The `express-validator` library provides several advantages:

1. **Validation:** Checks whether submitted values meet our requirements.
2. **Sanitization:** Transforms input into a consistent format.
3. **Error Handling:** Collects validation errors and allows us to display meaningful messages.
4. **Reusability:** Validation rules can be organized and reused across different routes.

It makes form validation easier to maintain, especially as our applications become more complex.

However, remember that validation is only one part of application security. We must also consider how data is stored, processed, and displayed.

## Adding CSRF Protection to Our Forms

Now that we know how to receive and validate user input, let's introduce another important security concept: **CSRF (Cross-Site Request Forgery)**.

### What is CSRF?

CSRF is a type of web attack where a malicious website tricks a user's browser into sending an unwanted request to another website where the user is already authenticated.

To understand this, imagine a user is logged into an online banking application.

The browser stores an authentication cookie that is automatically included when the user sends requests to the banking website.

Now imagine the user visits a malicious website containing code that attempts to submit a request to the banking application.

Because the browser automatically attaches the authentication cookie, the banking application might receive a request that appears to come from the authenticated user.

The attacker is exploiting the trust the application places in the user's browser.

The important point is that the malicious website doesn't necessarily need to know the user's password or authentication cookie. The browser may send the cookie automatically.

### How Do We Protect Against CSRF?

One common solution is to use **CSRF tokens**.

A CSRF token is a unique, unpredictable value generated by the server and associated with the user's session.

When the server renders a form, it includes this token inside a hidden input field.

When the user submits the form, the token is sent back to the server.

The server then verifies that the submitted token matches the token associated with the user's session.

If the token is missing or invalid, the request is rejected.

The process can be represented as follows:

```text
       USER REQUESTS FORM
               |
               v
        EXPRESS SERVER
               |
               v
       GENERATE CSRF TOKEN
               |
               v
        RENDER HTML FORM
       (Hidden CSRF Token)
               |
               v
         USER SUBMITS FORM
               |
               v
       TOKEN SENT TO SERVER
               |
               v
       VALIDATE CSRF TOKEN
               |
          +----+----+
          |         |
        VALID   INVALID
          |         |
          v         v
       PROCESS    REJECT
       REQUEST    REQUEST
```

This makes it much harder for another website to submit a valid request on behalf of the user.

CSRF tokens are especially important when applications use cookies for authentication because browsers automatically attach those cookies to matching requests.

CSRF protection is not a replacement for input validation, authentication, authorization, or XSS protection. Each mechanism addresses a different security problem.

### Choosing a CSRF Protection Library

In Express, you may encounter the `csurf` middleware in older tutorials.

However, `csurf` has been deprecated by the Express Technical Committee and its repository is archived.

For our workshop, we will use **`csrf-sync`**, which implements the Synchronizer Token Pattern and works with Express sessions.

This approach is suitable for our server-rendered EJS application because we can associate the CSRF token with each user's server-side session.

### Installing the Required Packages

We need two packages:

- `express-session`: Manages user sessions.
- `csrf-sync`: Generates and validates CSRF tokens.

Install them using:

```bash
npm install express-session csrf-sync
```

We don't need `cookie-parser` for this implementation. `express-session` manages its session cookie directly.

### Understanding Sessions

Before configuring CSRF protection, let's understand what a session is.

A session allows a server to maintain information associated with a particular user's browser across multiple HTTP requests.

HTTP is fundamentally stateless, meaning each request is independent. Without an additional mechanism, the server doesn't automatically remember information about previous requests.

Sessions solve this problem by assigning a session identifier to the browser.

The browser stores this identifier in a cookie and sends it with subsequent requests.

The server uses that identifier to retrieve the corresponding session data.

For our CSRF implementation, we will use the session to store the generated CSRF token.

Notice that a session doesn't necessarily require the user to log in. We can create anonymous sessions for visitors who are simply using our website.

### Configuring Sessions and CSRF Protection

First, we need to configure `express-session` and `csrf-sync` in `app.js`.

We also need a secret used to sign session cookies.

Generate a random secret using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set the generated value as an environment variable before starting the application.

On Linux or macOS:

```bash
export SESSION_SECRET="paste-your-generated-secret-here"
node app.js
```

On Windows PowerShell:

```powershell
$env:SESSION_SECRET = "paste-your-generated-secret-here"
node app.js
```

Now update `app.js`:

```javascript
const express = require('express');
const path = require('path');
const session = require('express-session');
const { csrfSync } = require('csrf-sync');

const app = express();
const PORT = 3000;

// Require a session secret
if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required.');
}

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Configure sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Configure CSRF protection
const {
    generateToken,
    csrfSynchronisedProtection
} = csrfSync({
    getTokenFromRequest: (req) => req.body._csrf
});

// Register routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/contact'));
app.use('/', require('./routes/contact-validation'));
app.use('/', require('./routes/contact-csrf'));

// Handle errors
app.use((err, req, res, next) => {

    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).send(
            'Invalid or missing CSRF token. Please reload the form and try again.'
        );
    }

    console.error(err);

    res.status(500).send('Something went wrong on the server.');

});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

Let's understand the important parts.

**Configuring Sessions**

```javascript
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));
```

Here:

- `secret` is used to sign the session identifier cookie.
- `resave: false` avoids unnecessarily saving unchanged sessions.
- `saveUninitialized: false` avoids storing new sessions until they contain data.
- `httpOnly: true` prevents browser-side JavaScript from reading the session cookie.
- `sameSite: 'lax'` provides an additional browser-level defense against some cross-site requests.
- `secure` ensures that the cookie is sent only over HTTPS when the application runs in production.

For local development, our application uses ordinary HTTP, so `secure` is false.

In a production environment, the application should use HTTPS and the appropriate proxy configuration when deployed behind a reverse proxy.

**Configuring CSRF Protection**

```javascript
const {
    generateToken,
    csrfSynchronisedProtection
} = csrfSync({
    getTokenFromRequest: (req) => req.body._csrf
});
```

Here, we initialize the CSRF middleware.

The library provides two important functions:

- `generateToken()`: Generates a token and associates it with the current session.
- `csrfSynchronisedProtection`: Middleware that validates submitted tokens for protected requests.

We also configure:

```javascript
getTokenFromRequest: (req) => req.body._csrf
```

This tells the library to retrieve the submitted token from the `_csrf` field in the HTML form.

This is why our form will contain a hidden input named `_csrf`.

**Error Handling**

At the bottom of `app.js`, we register error-handling middleware.

If someone submits a form with an invalid or missing CSRF token, the CSRF middleware passes an error to Express.

Our error handler recognizes that error and returns a `403 Forbidden` response.

This demonstrates another important use of middleware: handling errors generated by other middleware functions.

For this workshop, the session's default in-memory store is sufficient for local learning. It should not be used in production because it isn't designed for production workloads. A production application needs a suitable persistent session store.

### Creating the CSRF-Protected Contact Route

Now we can create a contact form that uses both `express-validator` and CSRF protection.

Create the following file:

**`routes/contact-csrf.js`:**

```javascript
const express = require('express');
const router = express.Router();

const {
    body,
    validationResult
} = require('express-validator');

const {
    generateToken,
    csrfSynchronisedProtection
} = require('csrf-sync');

// GET route to display the protected form
router.get('/contact_csrf', (req, res) => {

    const csrfToken = generateToken(req);

    res.render('contact_csrf', {
        errors: [],
        csrfToken,
        values: {
            name: '',
            email: '',
            message: ''
        },
        submittedName: null
    });

});

// POST route to handle form submission
router.post('/contact_csrf',

    // Validate the CSRF token first
    csrfSynchronisedProtection,

    // Validate submitted form fields
    [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required.')
            .bail()
            .isLength({ min: 3, max: 25 })
            .withMessage('Name must be between 3 and 25 characters.'),

        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required.')
            .bail()
            .isEmail()
            .withMessage('Invalid email format.')
            .normalizeEmail(),

        body('message')
            .trim()
            .notEmpty()
            .withMessage('Message is required.')
            .bail()
            .isLength({ min: 10, max: 200 })
            .withMessage('Message must be between 10 and 200 characters.')
    ],

    (req, res) => {

        // Collect validation errors
        const errors = validationResult(req);

        // Preserve submitted values
        const values = {
            name: typeof req.body.name === 'string' ? req.body.name : '',
            email: typeof req.body.email === 'string' ? req.body.email : '',
            message: typeof req.body.message === 'string' ? req.body.message : ''
        };

        // Return the form if validation fails
        if (!errors.isEmpty()) {

            return res.status(400).render('contact_csrf', {
                errors: errors.array(),
                csrfToken: generateToken(req),
                values,
                submittedName: null
            });

        }

        // Process valid data
        const { name, email, message } = req.body;

        console.log(`Received message from ${name} (${email}): ${message}`);

        res.render('contact_csrf', {
            errors: [],
            csrfToken: generateToken(req),
            values: {
                name: '',
                email: '',
                message: ''
            },
            submittedName: name
        });

    }
);

module.exports = router;
```

Let's understand the important parts.

**The GET Route**

When a user requests `/contact_csrf`, we generate a CSRF token:

```javascript
const csrfToken = generateToken(req);
```

This function generates the token and stores it in the user's session.

Then, we pass the generated token to our EJS template:

```javascript
res.render('contact_csrf', {
    errors: [],
    csrfToken,
    values: {
        name: '',
        email: '',
        message: ''
    },
    submittedName: null
});
```

This makes the token available inside the HTML form.

**The POST Route**

The POST route starts with:

```javascript
csrfSynchronisedProtection
```

This middleware executes before our validation rules and the final route handler.

It retrieves the token submitted through `req.body._csrf` and compares it with the token associated with the user's session.

If the token is missing or invalid, the middleware rejects the request and passes an error to Express.

The route handler will not process that submission.

If the token is valid, Express continues executing the remaining middleware, including our validation rules.

This means that we only process the submitted information after the CSRF token has been verified.

The remaining validation logic works in the same way as our previous `express-validator` example.

If validation fails, we return the form with the errors, preserve the submitted values, and provide a CSRF token.

If everything is valid, we process the information and display a confirmation message.

### Updating the Contact Template

Now, let's create the corresponding EJS template.

**`views/contact_csrf.ejs`:**

```ejs
<%- include('partials/_header', { title: 'CSRF Protected Contact Form' }) %>

<%- include('partials/_navbar') %>

<main>

    <h1>Contact Us (CSRF Protected)</h1>

    <form method="POST" action="/contact_csrf">

        <!-- CSRF Token -->
        <input
            type="hidden"
            name="_csrf"
            value="<%= csrfToken %>"
        >

        <label for="name">Name:</label>

        <input
            type="text"
            id="name"
            name="name"
            value="<%= values.name %>"
            required
        >

        <% errors.forEach(error => { %>
            <% if (error.path === 'name') { %>
                <p class="error"><%= error.msg %></p>
            <% } %>
        <% }); %>


        <label for="email">Email:</label>

        <input
            type="email"
            id="email"
            name="email"
            value="<%= values.email %>"
            required
        >

        <% errors.forEach(error => { %>
            <% if (error.path === 'email') { %>
                <p class="error"><%= error.msg %></p>
            <% } %>
        <% }); %>


        <label for="message">Message:</label>

        <textarea
            id="message"
            name="message"
            required
        ><%= values.message %></textarea>

        <% errors.forEach(error => { %>
            <% if (error.path === 'message') { %>
                <p class="error"><%= error.msg %></p>
            <% } %>
        <% }); %>

        <button type="submit">Submit</button>

    </form>

    <% if (submittedName && errors.length === 0) { %>

        <h2>Thanks for your message, <%= submittedName %>!</h2>

    <% } %>

</main>

<%- include('partials/_footer') %>
```

The most important addition is:

```html
<input
    type="hidden"
    name="_csrf"
    value="<%= csrfToken %>"
>
```

This hidden input contains the CSRF token generated by the server.

When the browser submits the form, the token is included in the request body alongside the other form fields.

The CSRF middleware then validates it before allowing the request to reach our route handler.

### Testing Our CSRF Protection

Make sure your server is running with the session secret configured.

Visit:

```text
http://localhost:3000/contact_csrf
```

Submit the form normally.

The server should accept the request if both the CSRF token and the form data are valid.

Now, let's understand what happens when the token is missing or invalid.

For testing purposes, open the browser's developer tools and modify or remove the hidden `_csrf` input before submitting the form.

The server should reject the request and return:

```text
403 Forbidden
```

This demonstrates how CSRF middleware protects our form submissions.

Through this example, we have combined several important concepts:

- Sessions.
- Middleware.
- Hidden form fields.
- CSRF tokens.
- Input validation.
- Error handling.

Notice that we applied CSRF protection specifically to the `/contact_csrf` POST route for demonstration.

In a real application, every state-changing browser route that relies on automatically attached authentication cookies should receive appropriate CSRF protection.

## Task: Quote Sharing Web Application

Now that we understand how to render dynamic templates, serve static files, handle forms, validate user input, and implement CSRF protection, let's combine everything into a small web application.

In this project, we will build a **Quote Sharing Web Application** using Express and EJS.

The application will allow users to submit quotes, browse submitted quotes, and search for quotes written by specific authors.

Users won't need to create accounts or authenticate themselves. They will simply provide an author's display name alongside the quote.

To keep the project focused on the concepts introduced in this workshop, we will initially store the quotes in a JavaScript array instead of using a database.

This means the submitted quotes will remain available while the server is running but will disappear when the server restarts.

### Functional Requirements

#### Homepage (`/`)

The homepage should:

- Display a welcome message.
- Show a list of recently submitted quotes.
- Retrieve the quotes from the server.
- Use an EJS loop to render multiple quotes dynamically.
- Display an appropriate message when no quotes have been submitted.

#### Quote Submission (`/share`)

Create a page containing a form with two fields:

- **Author Name:** A text input containing the author's display name.
- **Quote Text:** A textarea containing the quote.

The form should submit its information using the POST method.

**Validation Requirements:**

- Author name is required.
- Author name must contain at least 3 characters.
- Quote text is required.
- Quote text must not exceed 300 characters.

Additional requirements:

- Use `express-validator` to validate and sanitize the submitted information.
- Display appropriate error messages when validation fails.
- Preserve previously submitted values when displaying validation errors.
- Include CSRF protection using a hidden form token.
- Display a confirmation message or redirect the user after a successful submission.

#### Search Quotes (`/search`)

Create a search page that allows users to find quotes by entering an author's name.

The search should:

- Use the GET method.
- Receive the author's name through a query parameter.
- Find all quotes associated with that author.
- Perform case-insensitive matching.
- Ignore unnecessary whitespace around the search term.

For example:

```text
/search?author=Albert%20Einstein
```

If matching quotes exist, display them.

Otherwise, display:

```text
No quotes found for author.
```

The page should also handle an empty search input appropriately.

#### Partials and Reusable Layouts

Organize the common page components using EJS partials.

Create:

- `_header.ejs` for the common HTML document structure.
- `_navbar.ejs` containing navigation links to Home, Share, and Search.
- `_footer.ejs` containing the page footer and closing HTML elements.

All pages should include these reusable components instead of repeating the same HTML structure.

#### Static Assets

Create a `public` directory containing:

```text
public/
├── css/
│   └── style.css
└── images/
    └── logo.png
```

The application should:

- Use `style.css` to provide consistent styling across all pages.
- Display the logo in the navigation or header.
- Serve CSS and image files using `express.static()`.

#### Suggested Project Structure

Your final project should be organized as follows:

```text
quote_sharing_app/
├── node_modules/
├── public/
│   ├── css/
│   │   └── style.css
│   └── images/
│       └── logo.png
├── routes/
│   └── quotes.js
├── views/
│   ├── partials/
│   │   ├── _header.ejs
│   │   ├── _navbar.ejs
│   │   └── _footer.ejs
│   ├── home.ejs
│   ├── share.ejs
│   └── search.ejs
├── package.json
├── package-lock.json
└── app.js
```

You can organize the three main pages in a single `quotes.js` router because they all work with the same collection of quotes.

The router can maintain an in-memory array shared by its homepage, submission, and search routes.

Remember to:

- Render user-submitted quotes using escaped EJS output (`<%=`).
- Validate data on the server, not only in the browser.
- Protect the quote submission POST route against CSRF.
- Display appropriate messages for empty results and invalid submissions.

### Expected Learning Outcome

By completing this project, you should be able to build a small server-rendered web application from scratch using Express and EJS.

You will combine routing, middleware, static files, dynamic templates, reusable components, form processing, validation, and CSRF protection into one practical application.

This project will also prepare you for the next step: connecting our Express application to a real database so that submitted information can be stored permanently.
## References

- [EJS Documentation](https://ejs.co/#docs)
- [Express: Using Template Engines](https://expressjs.com/en/guide/using-template-engines.html)
- [Express: Serving static files](https://expressjs.com/en/starter/static-files.html)
- [express-validator Documentation](https://express-validator.github.io/docs/)
- [express-session Documentation](https://expressjs.com/en/resources/middleware/session.html)
- [csrf-sync (npm)](https://www.npmjs.com/package/csrf-sync)
- [OWASP: Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
