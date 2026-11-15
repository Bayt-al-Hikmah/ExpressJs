# Introduction to Backend Development with Node.js and Express

## Objectives
- What is Backend Development?
- Introduction to Node.js and Express.
- Understanding the Client-Server Architecture.
- The Middleware-Based Architecture in Express.js.
- Understanding the Request-Response Lifecycle.
- Structure of an Express Application.
- Creating Our First Express Application.
- Understanding HTTP Requests and Responses.
- Working with Routes and URL Parameters.
- Working with Query Parameters.
- Building a Simple JSON API.

## What is Backend Development?

When we interact with a website or a mobile application, we only see the front-end: the buttons, text, images, and other elements displayed on our screen. But behind the scenes, there is another part working to make that experience possible. This is the **backend**, also known as the server-side.

Backend development is the work that happens behind the scenes. It is responsible for everything the user doesn't directly interact with, such as:

1. **Storing and Managing Data**: When we create a user account or post a photo, the backend saves that information in a database.
2. **Handling Business Logic**: It processes requests, performs calculations, and enforces application rules. For example, it checks whether our password is correct when we try to log in.
3. **Communicating with the Front-End**: The backend receives requests from the browser or mobile application (the client) and sends back the data needed by the front-end.
4. **Authentication and Security**: It manages user sessions, verifies identities, and protects sensitive data from unauthorized access.

Essentially, if the front-end is the part of a restaurant where customers sit and eat, the backend is the kitchen where the food is prepared, cooked, and made ready to serve. We, as backend developers, are the chefs.

### Understanding the Client-Server Architecture

To understand how the front-end and backend communicate, we first need to understand the **Client-Server Architecture**.

In this architecture, an application is divided into two main parts:

- **Client**: The application used by the user, such as a web browser or a mobile application. It sends requests to the server and displays the responses.
- **Server**: The backend application responsible for processing requests, executing business logic, interacting with databases, and sending responses back to the client.

The communication between these two parts usually happens through the HTTP protocol.

Let's consider an example. Imagine we are using an online store and want to display a list of products.

1. The client sends an HTTP request to the server asking for the products.
2. The server receives the request and processes it.
3. The server retrieves the requested information, usually from a database.
4. The server sends an HTTP response containing the product information.
5. The client receives the response and displays the products to the user.

The communication can be represented as follows:

```text
        CLIENT
   (Browser / Mobile App)
           |
           |
      HTTP Request
           |
           v
        SERVER
     (Backend App)
           |
           v
     Business Logic
           |
           v
        Database
           |
           |
      HTTP Response
           |
           v
        CLIENT
```

This is the fundamental communication model used by most modern web applications.

In this lecture, we will learn how to build the server-side part of this architecture using Node.js and Express.

## Introduction to Node.js and Express

Before building our backend application, we need to understand the technologies we will use.

### Node.js

Node.js is a **JavaScript runtime environment** that allows us to execute JavaScript code outside the browser.

Normally, JavaScript runs inside a browser to control the behavior of web pages. Node.js allows us to use the same language to build server-side applications.

It also provides built-in modules that allow us to perform different operations, such as:

- `http`: Creating HTTP servers and handling HTTP communication.
- `fs`: Reading, writing, and managing files.
- `path`: Working with file and directory paths.

This makes Node.js suitable for building backend applications, APIs, command-line tools, and other server-side programs.

### Express.js

Express is a **minimal and flexible web framework built on top of Node.js**.

While Node.js provides the environment and underlying capabilities to run JavaScript and handle HTTP communication, Express simplifies the process of building web applications and APIs.

It provides useful features such as:

- **Routing**: Defining how the server responds to different URLs and HTTP methods.
- **Middleware**: Processing incoming requests through a chain of functions.
- **Request and Response Handling**: Providing convenient methods to access request information and send responses.

Express allows us to build web applications without having to implement all the HTTP handling logic ourselves.

We choose Express when we want a lightweight and flexible framework that integrates seamlessly with the JavaScript ecosystem.

### Understanding the Relationship Between Node.js and Express

It is important to understand that Node.js and Express are not the same thing.

Node.js is responsible for executing JavaScript outside the browser, while Express provides a framework that makes building web applications and APIs easier.

Their relationship can be represented as follows:

```text
         Express.js
       (Web Framework)
              |
              v
          Node.js
   (JavaScript Runtime)
              |
              v
       Operating System
```

In other words, Express runs on Node.js and uses its capabilities to provide a simpler way of building backend applications.

## The Middleware-Based Architecture in Express.js

One of the most important characteristics of Express.js is its **middleware-based architecture**.

Express organizes request handling into a chain of functions called _middleware_. Each middleware function can perform a particular task before passing control to the next function or sending a response to the client.

This approach makes Express applications modular, flexible, and easier to maintain.

### Middleware

Middleware are functions that have access to the incoming request object (`req`), the response object (`res`), and the `next()` function.

They are executed during the request-response cycle and can perform different operations:

- **Inspect the Request**: For example, check whether a user is logged in.
- **Modify the Request or Response**: For example, parse incoming JSON data or attach user information to the request.
- **End the Request-Response Cycle**: For example, immediately send an error message to the client.
- **Pass Control to the Next Function**: Using `next()`, middleware can allow the next middleware function or route handler to execute.

Common examples of middleware include request logging, authentication, request validation, error handling, and serving static files.

### Creating a Simple Middleware

Let's understand how middleware works through a simple example.

```javascript
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};
```

Here, we define a middleware function called `logger`.

Let's understand its parameters:

- `req`: Contains information about the incoming HTTP request.
- `res`: Allows us to send an HTTP response to the client.
- `next`: A function that passes control to the next middleware or route handler.

Inside the function, we print the HTTP method and requested URL to the terminal.

However, defining a middleware function alone doesn't make Express execute it. We must register it using `app.use()`:

```javascript
app.use(logger);
```

The `app.use()` method tells Express to execute this middleware for incoming requests that match its mounting path. In this example, because we haven't specified a path, it applies to all routes.

Now, whenever a client sends a request, our middleware logs its method and URL before passing control to the next function.

For example, if someone visits:

```text
http://localhost:3000/
```

The terminal displays:

```text
GET /
```

If someone visits:

```text
http://localhost:3000/user/Alice
```

The terminal displays:

```text
GET /user/Alice
```

This is a simple example of how middleware can perform tasks that are useful across an entire application.

### Routing

A route is a rule that tells Express how to respond when a client requests a specific URL using a particular HTTP method.

For example:

- A client sends `GET /about`: The route for `/about` determines what response to send.
- A client sends `POST /login`: The route for `/login` handles the login request.

In Express, we define routes using methods such as:

- `app.get()`
- `app.post()`
- `app.put()`
- `app.delete()`

Each method corresponds to a different HTTP operation.

For example:

```javascript
app.get('/about', (req, res) => {
    res.send('About Page');
});
```

This route listens for GET requests sent to `/about` and responds with the text `About Page`.

Routes can also contain multiple middleware functions that execute in sequence.

For larger applications, we can group related routes into separate files using the Express Router. For example, all user-related routes can be placed inside a `userRoutes.js` file and mounted into the main application.

### Order of Execution

One important characteristic of Express middleware is that **it executes in the order in which it is registered**.

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

When a client sends a GET request to `/`, the terminal displays:

```text
Middleware 1
Middleware 2
Route Handler
```

This happens because the first middleware executes, calls `next()`, and passes control to the second middleware. The second middleware also calls `next()`, allowing the route handler to execute.

If a middleware sends a response without calling `next()`, the remaining middleware and route handlers in that request's execution path will not run.

For example:

```javascript
app.use((req, res, next) => {
    res.send('Request handled!');
});
```

Here, the middleware sends a response directly to the client. There is no need to call `next()` because the request-response cycle has already ended.

This pipeline structure gives developers control over how requests are processed and which operations are performed before a response is sent.

### How Express Leverages Middleware

Express uses its middleware system to provide flexibility and make application development easier.

#### Routes and Routers

Route handlers participate in Express's request-processing pipeline. We can also group related routes into a router, which acts as a modular, mountable middleware component.

For example, all `/users` endpoints, such as:

```text
/users
/users/login
/users/register
```

can be grouped inside a user router.

We can then mount this router into our application.

This allows us to organize larger applications into smaller and more manageable parts.

#### Reusability

Middleware functions are often reusable.

Instead of rewriting common functionality for every application, we can use existing middleware packages from the Node.js ecosystem.

Some common examples include:

- `morgan`: Logging HTTP requests.
- `cors`: Configuring Cross-Origin Resource Sharing.
- `express-session`: Managing user sessions.

These packages allow developers to reuse existing functionality rather than implementing everything from scratch.

#### API Focus

Express is widely used for building JSON APIs.

It provides built-in middleware such as:

```javascript
app.use(express.json());
```

This middleware parses incoming JSON request bodies and makes the resulting data available through `req.body`.

For example, when a client sends a JSON request body:

```json
{
    "username": "Alice",
    "email": "alice@example.com"
}
```

Express can parse this information so that we can access it inside our route handlers:

```javascript
req.body.username;
req.body.email;
```

This will become useful when we start building routes that accept data from clients, such as registration or product creation endpoints.

## Structure of an Express App

For a simple Express application, our project structure can be minimal.

We need Node.js installed on our system, a package manager such as npm, and a JavaScript file where we write our application code.

Our initial project structure will look like this:

```text
my_express_project/
├── node_modules/        # Installed dependencies
├── package.json         # Project configuration and dependencies
├── package-lock.json    # Exact installed dependency versions
├── app.js               # Main Express application file
└── .gitignore           # Files Git should ignore
```

Let's understand the purpose of the main files and folders:

- **node_modules**: Contains the packages and dependencies installed in our project. It is automatically generated when we install packages using npm.
- **package.json**: Contains information about our project, including its name, dependencies, and configuration.
- **package-lock.json**: Records the exact versions of installed dependencies to help ensure consistent installations.
- **app.js**: The main entry point of our application. It is where we initialize Express, define middleware, configure routes, and start the server.
- **.gitignore**: Specifies which files and folders Git should ignore. For example, we generally don't commit `node_modules` because it can be regenerated using npm.

This structure is sufficient for our first application. As our projects become larger, we will learn how to organize routes, controllers, and other application components into separate files and folders.

## Creating Our First Express App

Let's build our first Express application. This will teach us how to set up our environment, install Express, create a simple web server, and handle our first HTTP request.

### Setting Up the Environment

First, ensure Node.js is installed on your system. You can download it from [nodejs.org](https://nodejs.org).

After installing Node.js, open your terminal and check that Node.js and npm are available:

```bash
node -v
npm -v
```

Next, create a project directory and initialize it using npm:

```bash
mkdir my_express_project
cd my_express_project
npm init -y
```

The `npm init -y` command initializes a new Node.js project and creates a `package.json` file with default configuration.

### Installing Express

With the project initialized, we can install Express using npm:

```bash
npm install express
```

This command downloads Express and its required dependencies into the `node_modules` folder and adds Express to our project's dependencies in `package.json`.

It also generates the `package-lock.json` file.

### Creating the "Hello, World!" App

Now that we have Express installed, it's time to build our first application.

The first step is to create a new file inside our project folder called **`app.js`**.

This file will serve as the main entry point of our application. It is where we will initialize Express, register middleware, define routes, and tell our server to start listening for requests.

Open the `app.js` file in your code editor and add the following code:

```javascript
const express = require('express');
const app = express();
const port = 3000;

// Register a simple logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Define a route for the root URL ('/')
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```

Let's walk through what this code does.

First, we import the Express framework:

```javascript
const express = require('express');
```

The `require()` function loads the Express package so that we can use it in our application.

Next, we create an Express application:

```javascript
const app = express();
```

The `express()` function creates an application instance. We store it in the `app` variable because we will use it to configure middleware, define routes, and start our server.

Then, we define a port number:

```javascript
const port = 3000;
```

A port is a communication endpoint that allows applications to receive network traffic. Our server will listen for incoming HTTP requests on port `3000`.

After that, we register our logging middleware:

```javascript
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
```

This middleware runs when a request reaches our application. It displays the HTTP method and requested URL in the terminal, then calls `next()` to allow the next function to execute.

Next, we define a route:

```javascript
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
```

The `app.get()` method registers a route that listens for GET requests sent to the root URL (`/`).

When someone visits `http://localhost:3000/`, Express matches the incoming request with this route and executes its callback function.

The callback receives two important objects:

- `req`: Represents the incoming request.
- `res`: Represents the response that our server will send back.

We use `res.send()` to send the text `Hello, World!` back to the client.

Finally, we start our server:

```javascript
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```

The `app.listen()` method starts the server and tells it to listen for incoming requests on the specified port.

Once the server starts successfully, the callback function executes and displays a message in the terminal.

### Running Our Application

After saving the file, open your terminal, navigate to the project directory, and run:

```bash
node app.js
```

The terminal should display:

```text
Server running at http://localhost:3000
```

Now, open your browser and visit:

```text
http://localhost:3000
```

You should see:

```text
Hello, World!
```

At the same time, the terminal should display:

```text
GET /
```

This means our application successfully received an HTTP request, processed it through our logging middleware, matched the appropriate route, and sent a response back to the client.

To stop the server, return to the terminal and press `Ctrl + C`.

### Understanding the Request-Response Lifecycle

Now that we have built our first Express application, let's connect everything we have learned about middleware, routing, and HTTP requests.

When a client visits:

```text
http://localhost:3000/
```

the following steps take place:

**1. The client sends an HTTP request.**

The browser sends a GET request to our server, requesting the root URL (`/`).

**2. Express receives the request.**

Our Express application receives the incoming request and starts processing it.

**3. Middleware executes.**

The logging middleware runs first because it was registered before the route.

It prints:

```text
GET /
```

Then, it calls `next()` to pass control forward.

**4. Express matches the route.**

Express checks the registered routes and finds one matching the incoming GET request to `/`.

**5. The route handler executes.**

The callback function associated with the route executes and calls:

```javascript
res.send('Hello, World!');
```

**6. The server sends a response.**

Express sends the response back to the browser, which displays:

```text
Hello, World!
```

The complete process can be represented as follows:

```text
        CLIENT
           |
           | GET /
           |
           v
    EXPRESS APPLICATION
           |
           v
       MIDDLEWARE
       (Logging)
           |
           | next()
           v
     ROUTE MATCHING
           |
           v
      ROUTE HANDLER
           |
           | res.send()
           v
     HTTP RESPONSE
           |
           v
        CLIENT
```

This is the fundamental request-response lifecycle in Express.

Understanding this process is essential because almost everything we build with Express follows the same pattern.

## Understanding HTTP Requests and Responses

Before working with more advanced routes, let's take a closer look at the two main objects we use when handling HTTP communication: `req` and `res`.

### The Request Object (`req`)

The request object contains information sent by the client to the server.

It provides access to several useful properties, including:

- `req.method`: The HTTP method used in the request, such as GET or POST.
- `req.url`: The requested URL.
- `req.params`: The parameters defined in the route path.
- `req.query`: The query parameters included in the URL.
- `req.body`: The data sent in the request body, usually available after registering appropriate parsing middleware such as `express.json()`.

### The Response Object (`res`)

The response object provides methods that allow us to construct and send a response back to the client.

Some commonly used methods include:

- `res.send()`: Sends a response containing text, HTML, a buffer, or other supported data.
- `res.json()`: Sends a JSON response.
- `res.status()`: Sets the HTTP status code of the response.

For example:

```javascript
app.get('/example', (req, res) => {
    res.status(200).json({
        message: 'Request successful'
    });
});
```

Here, we set the response status to `200` and send a JSON object to the client.

### Understanding HTTP Status Codes

HTTP status codes describe the result of processing a client's request.

Some commonly used status codes include:

| Status Code | Meaning | Description |
|---|---|---|
| 200 | OK | The request was processed successfully. |
| 201 | Created | A new resource was successfully created. |
| 400 | Bad Request | The request contains invalid or incorrect data. |
| 404 | Not Found | The requested resource could not be found. |
| 500 | Internal Server Error | An unexpected error occurred on the server. |

For example, when a client requests a product that doesn't exist, returning a `404` status code is more appropriate than sending a normal successful response.

We will use this behavior when building our first JSON API.

## Working with Parameters and Query Parameters

So far, our server has only responded with static text. While this is useful for testing, real applications almost always need to handle dynamic data.

For example, imagine an application that displays user profiles or allows users to search for products.

The server needs a way to receive additional information from the client so that it knows what data to retrieve or how to process the request.

Express provides two common ways to pass this information through a URL:

- URL Parameters.
- Query Parameters.

Let's understand each one.

### URL Parameters

One common way to handle dynamic data is through **URL parameters**.

A URL parameter is a variable part of the URL path that allows the client to identify a specific resource.

In Express, we define URL parameters in routes by prefixing their names with a colon (`:`).

For instance, let's say we want to greet users by name.

We can add the following route to our `app.js` file:

```javascript
app.get('/user/:username', (req, res) => {
    const username = req.params.username;

    res.send(`Hello, ${username}!`);
});
```

In this example, `:username` is a URL parameter.

When someone visits:

```text
http://localhost:3000/user/Alice
```

Express extracts the value `Alice` from the URL and makes it available through:

```javascript
req.params.username
```

The server then responds with:

```text
Hello, Alice!
```

If we change the name in the URL, for example:

```text
http://localhost:3000/user/Bob
```

the response automatically changes to:

```text
Hello, Bob!
```

This is the foundation of how dynamic resources, such as user profiles and product pages, are accessed through a backend.

### Query Parameters

Another way to pass information to the server is through **query parameters**.

Query parameters are added to the end of a URL after a question mark (`?`). They usually consist of key-value pairs.

For example:

```text
/search?query=express
```

Here:

- `query` is the parameter name.
- `express` is its value.

We can include multiple query parameters by separating them with an ampersand (`&`):

```text
/products?category=electronics&sort=price
```

Here, we have two query parameters:

- `category=electronics`
- `sort=price`

Express automatically parses query parameters and makes them available through the `req.query` object.

Let's create a simple search route:

```javascript
app.get('/search', (req, res) => {
    const searchTerm = req.query.query;

    if (searchTerm) {
        res.json({
            message: `You are searching for: ${searchTerm}`
        });
    } else {
        res.json({
            message: 'Please provide a search query.'
        });
    }
});
```

With this route in place, visiting:

```text
http://localhost:3000/search?query=node%20tutorials
```

will return the following JSON response:

```json
{
    "message": "You are searching for: node tutorials"
}
```

If the query parameter is missing and we simply visit:

```text
http://localhost:3000/search
```

the server returns:

```json
{
    "message": "Please provide a search query."
}
```

Notice that we access query parameters using `req.query`, whereas URL parameters are accessed using `req.params`.

### URL Parameters vs Query Parameters

Both methods allow us to pass information through a URL, but they are commonly used for different purposes.

| URL Parameters | Query Parameters |
|---|---|
| Part of the URL path. | Added after the question mark (`?`). |
| Commonly used to identify a specific resource. | Commonly used to filter, sort, or customize results. |
| Accessed through `req.params`. | Accessed through `req.query`. |
| Example: `/users/10` | Example: `/users?role=admin` |

For example, if we want to retrieve a specific product, we could use:

```text
/api/products/100
```

Here, `100` identifies the product.

If we want to retrieve products belonging to a particular category, we could use:

```text
/api/products?category=electronics
```

Here, the query parameter specifies which products we want to retrieve.

An important detail is that values received through URL parameters and query parameters come from the client. We should always validate them before using them in application logic.

## Building a Simple JSON API

So far, we have created routes that return simple text responses and learned how to extract information from URLs.

However, modern web applications often need to communicate with other systems, such as mobile applications or JavaScript front-ends.

This is where **APIs (Application Programming Interfaces)** become important.

An API provides a way for different applications to communicate and exchange information.

For example, imagine we are building an online store with a web application and a mobile application.

Instead of implementing product management separately in both applications, we can create a backend API that provides product information.

Both the web and mobile applications can then send requests to the same API and receive product data in a structured format, usually JSON.

This allows different clients to communicate with the same backend without needing to know how the data is stored or processed internally.

### Understanding JSON Responses

JSON (JavaScript Object Notation) is a lightweight data format commonly used to exchange information between applications.

For example, our server could return the following JSON response:

```json
{
    "id": "100",
    "name": "Laptop",
    "price": 1200
}
```

This response contains information about a product in a structured format that different applications can easily understand and process.

Express provides the `res.json()` method to send JSON responses.

For example:

```javascript
res.json({
    id: '100',
    name: 'Laptop',
    price: 1200
});
```

The `res.json()` method serializes the JavaScript value into JSON and sends it as an HTTP response, setting the appropriate `Content-Type` header.

### Writing the API Endpoint

Let's build a simple product API using everything we have learned so far.

Our goal is to create an endpoint that:

1. Accepts a product `id` as a URL parameter to identify a specific product.
2. Accepts an optional query parameter called `includeStock` to determine whether stock availability should be included in the response.
3. Returns a JSON object containing the requested product information.

To simulate a real application, we will use a simple JavaScript object as our fake database.

In a real application, this information would usually come from a database such as PostgreSQL or MongoDB.

Add the following code to your existing `app.js` file. We will only add the new product data and route; we don't need to declare Express, the application instance, or the port again.

```javascript
// Fake database to simulate product data
const productsDb = {
    "100": {
        name: "Laptop",
        price: 1200,
        inStock: true
    },
    "101": {
        name: "Mouse",
        price: 25,
        inStock: true
    },
    "102": {
        name: "Keyboard",
        price: 75,
        inStock: false
    }
};

// API route to get product details
app.get('/api/products/:productId', (req, res) => {

    // Capture the product ID from the URL
    const productId = req.params.productId;

    // Look up the product in our fake database
    const product = productsDb[productId];

    // Check whether the product exists
    if (!product) {
        return res.status(404).json({
            error: 'Product not found'
        });
    }

    // Check whether the client requested stock information
    const includeStock = req.query.includeStock === 'true';

    // Build the response object
    const responseData = {
        id: productId,
        name: product.name,
        price: product.price,
        currency: 'USD'
    };

    // Include stock information only when requested
    if (includeStock) {
        responseData.inStock = product.inStock;
    }

    // Send the JSON response
    res.json(responseData);
});
```

Let's break down what is happening in this code.

- **Fake Database**: We create a `productsDb` object to simulate a database. Each product has a unique ID, a name, a price, and stock information.

- **Route Definition**: The `app.get('/api/products/:productId', ...)` route listens for GET requests to the specified URL pattern. It uses the `:productId` parameter to identify which product the client wants.

- **Accessing the Product ID**: We retrieve the ID using `req.params.productId` and use it to look up the corresponding product in our fake database.

- **Error Handling**: If the product doesn't exist, we return a JSON error message with a `404` status code. This tells the client that the requested resource could not be found.

- **Reading Query Parameters**: We use `req.query.includeStock` to determine whether the client wants additional stock information. Notice that query parameter values are strings, so we compare the value with `'true'`.

- **Building the Response**: We create a JavaScript object containing the product's information. If the client requested stock availability, we include the `inStock` property.

- **Sending JSON**: Finally, `res.json(responseData)` serializes the object and sends it back to the client as a JSON response.

### Testing Our API

Make sure your Express server is running:

```bash
node app.js
```

Now we can test our API using the browser.

**Example 1: Requesting a product**

Request:

```text
http://localhost:3000/api/products/100
```

Response:

```json
{
    "id": "100",
    "name": "Laptop",
    "price": 1200,
    "currency": "USD"
}
```

**Example 2: Requesting a product with stock information**

Request:

```text
http://localhost:3000/api/products/100?includeStock=true
```

Response:

```json
{
    "id": "100",
    "name": "Laptop",
    "price": 1200,
    "currency": "USD",
    "inStock": true
}
```

**Example 3: Requesting a product that doesn't exist**

Request:

```text
http://localhost:3000/api/products/999
```

Response:

```json
{
    "error": "Product not found"
}
```

In this case, the server also returns the HTTP status code `404`.

Through this example, we have combined URL parameters, query parameters, conditional logic, and JSON responses to create a simple but functional API endpoint.

This is the foundation of how real-world backend APIs retrieve and provide information to different clients.

## Tasks

Now that we understand the basic concepts of Express, let's practice building APIs ourselves.

### Task 1: User Profile API

In this task, we will create a simple **user profile API** using Express.

The goal is to simulate how a backend can provide dynamic user information in JSON format.

Instead of using a database, we will work with hardcoded data to keep things simple.

We will define a route:

```text
/api/profile/:username
```

The endpoint should work as follows:

- It should return a JSON object containing a fake user profile.
- It should accept an optional query parameter called `details`.
    - If `details=true`, return extended information, such as the user's email and role.
    - Otherwise, return only the basic information, such as the username.
- If the requested user doesn't exist, return a `404` status code with an appropriate error message.

**Example Outputs:**

Request:

```text
/api/profile/Alice
```

Response:

```json
{
    "username": "Alice"
}
```

Request:

```text
/api/profile/Alice?details=true
```

Response:

```json
{
    "username": "Alice",
    "email": "alice@example.com",
    "role": "admin"
}
```

### Task 2: Book Information API

In this task, we will build a **book information API** using Express.

Just like with the user profiles, we will simulate a small database using hardcoded data for different books.

The goal is to demonstrate how an API can return different levels of detail depending on what the client requests.

We will define a route:

```text
/api/books/:bookId
```

The endpoint should work as follows:

- It should return book details based on the `bookId` URL parameter.
- It should accept an optional query parameter called `summary`.
    - If `summary=true`, return only the book's title and author.
    - Otherwise, return the full details, including the book's ID, title, author, and price.
- If the requested book doesn't exist, return a `404` status code with an appropriate error message.

**Example Outputs:**

Request:

```text
/api/books/201
```

Response:

```json
{
    "id": "201",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "price": 35
}
```

Request:

```text
/api/books/201?summary=true
```

Response:

```json
{
    "title": "Clean Code",
    "author": "Robert C. Martin"
}
```

### Task 3: Request Logger Middleware

In this task, we will create a reusable middleware function that logs information about every incoming HTTP request.

The goal is to understand how middleware processes requests before they reach their corresponding route handlers.

Create a middleware function that:

- Displays the HTTP method used in the request.
- Displays the requested URL.
- Calls `next()` to allow the next middleware or route handler to execute.

For example, when the server receives the following requests:

```text
GET /
GET /api/books/201
GET /api/profile/Alice
```

The terminal should display:

```text
GET /
GET /api/books/201
GET /api/profile/Alice
```

Register your middleware using `app.use()` so that it runs for all incoming routes.
## References

- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [Express Documentation](https://expressjs.com/)
- [Express: Routing](https://expressjs.com/en/guide/routing.html)
- [Express: Writing Middleware](https://expressjs.com/en/guide/writing-middleware.html)
- [MDN: An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
- [MDN: HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)
- [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
