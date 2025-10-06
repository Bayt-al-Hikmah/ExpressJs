## Objectives
- What is Backend Development?
- Introduction to Node.js and Express
- The Middleware-Based Architecture in Express.js
- Structure of an Express App
- Creating Our First Express Application
- Working with Routes, Parameters, and URL Arguments
## What is Backend Development?
When we interact with a website or a mobile app, we only see the front-end the buttons, text, and images displayed on our screen. But behind the scenes, there's a whole other world working to make that experience possible. This is the backend, also known as the server-side.  
Backend development is the work that goes on behind the scenes. It's responsible for everything the user doesn't see, such as:  
1. **Storing and Managing Data**: When we create a user account or post a photo, the backend saves that information in a database.
2. **Handling Business Logic**: It processes our requests, performs calculations, and enforces the rules of the application. For example, it checks if our password is correct when we try to log in.
3. **Communicating with the Front-End**: The backend receives requests from our browser (the client) and sends back the data needed to display the webpage.
4. **Authentication and Security**: It manages user sessions and protects sensitive data from unauthorized access.

Essentially, if the front-end is the part of the restaurant where we sit and eat, the backend is the kitchen where the food is prepared, cooked, and made ready to serve. We, as backend developers, are the chefs.
## Introduction to Node.js and Express
Node.js is a **runtime environment** that allows us to run JavaScript outside the browser, making it ideal for server-side development. Express is a **minimal and flexible web framework** built on top of Node.js.  
- **Node.js**: It provides the environment to execute JavaScript code on the server, handling tasks like HTTP requests, file system operations, and more.
- **Express**: A lightweight framework that simplifies building web applications and APIs by providing tools for routing, middleware, and HTTP request handling. It’s fast, unopinionated, and perfect for building scalable applications.

We choose Express when we want a lightweight, flexible framework that integrates seamlessly with the JavaScript ecosystem and allows us to build APIs or full web applications efficiently.
## The Middleware-Based Architecture in Express.js

Express.js’s architecture revolves around a **middleware-based system**, which organizes request handling into a chain of modular functions called _middleware_. This approach enhances flexibility, simplicity, and extensibility. Let’s break down its core components:
### Middleware
Middleware are functions that sit between the incoming request (from the client) and the outgoing response (from the server).
- They can **inspect** the request (for example, check if a user is logged in).
- They can **modify** the request or response (for example, parse JSON data from the body, or attach user info).
- They can **end** the request-response cycle (for example, immediately send back an error message).
- Or they can **pass control** to the next middleware function using `next()`.

Common examples include: logging every request, checking authentication, handling errors, or serving static files.
### Routing
A route is simply a rule that tells Express what to do when a client requests a certain URL.  
For example:
- A client sends `GET /about` the route for `/about` decides what response to send back.
- A client sends `POST /login` the route for `/login` runs the login logic and responds.

In Express, routes themselves are built on top of middleware. A route listens for a specific **HTTP method** (GET, POST, PUT, DELETE, etc.) and a specific **path** (like `/users`, `/products/:id`), then runs one or more middleware functions to handle the request.  
This makes routes **modular**: we can group related routes into separate files (e.g., `userRoutes.js`) and plug them into our app.

### Order of Execution

Middleware in Express runs in the order they are registered.
- If we register a logging middleware first, it will always run before routes.    
- If we put authentication middleware before protected routes, it ensures only authorized users can access them.


This **pipeline structure** gives developers fine-grained control over how requests flow through the application and when responses are sent.
### How Express Leverages Middleware

Express’s middleware system is central to its flexibility and simplicity:

#### Routes as Middleware
Since routes are middleware too, we can group related ones into a **router**.

For example, all `/users/*` endpoints (like `/users/login`, `/users/register`) can be grouped in one router and mounted in the app.
#### Reusability
Middleware functions are often reusable. Instead of rewriting logic, we can use community-provided middleware (like `morgan` for logging, `cors` for cross-origin access, or `express-session` for managing sessions).

These can also be shared across projects or published as npm packages, reducing redundant code and speeding up development.
#### API Focus
Express is very popular for building **JSON APIs**.
- Built-in middleware like `express.json()` automatically parses incoming JSON request bodies.
- Additional middleware can validate requests, enforce authentication, and handle errors in a structured way.

This allows developers to assemble lightweight, high-performance APIs by composing different middleware functions.

## Structure of an Express App
For a simple Express application, our project structure can be minimal. We need Node.js installed, a package manager (`npm`), and a single JavaScript file to write our code.  
Our initial structure will look like this:
```
my_express_project/
├── node_modules/    # Folder for installed dependencies
├── package.json     # Project configuration and dependencies
└── app.js           # Our main Express application file
```

## Creating Our First Express App
Let’s build our first Express application. This will teach us how to set up our environment, install Express, and create a simple web server.
### Setting Up the Environment
First, ensure Node.js is installed on your system. You can download it from [nodejs.org](https://nodejs.org). Then, create a project directory and initialize it with `npm` to create a `package.json` file:
```
mkdir my_express_project
cd my_express_project
npm init -y
```
### Installing Express
With the project initialized, install Express using `npm`:
```
npm install express
```
### Creating the "Hello, World!" App
Now that we have Express installed, it’s time to build our very first application. This example may be simple, but it introduces the core concepts of how an Express server works.  
The first step is to create a new file inside our project folder called **`app.js`**. This file will serve as the main entry point of our application. It’s where we will set up Express, define the routes, and tell our server to start listening for requests.  
Open the `app.js` file in your code editor and add the following code:
```
const express = require('express');
const app = express();
const port = 3000;

// Define a route for the root URL ('/')
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```
Let’s walk through what this code does. First, we import the Express framework and create an instance of it using `express()`. This instance, stored in the variable `app`, represents our web application. Next, we define a port number in this case, `3000`. A port is like a channel through which our application communicates with the outside world. Different applications can run on different ports, and `3000` is a common choice for development.  
After setting up the application and port, we define a route. A route is simply an address on our server that clients (like a browser) can request. The route we created listens for GET requests at the root URL (`'/'`). When someone visits `http://localhost:3000/`, the function we provided will run, sending back the response `"Hello, World!"` to the client.  
Finally, we tell Express to start listening for requests using the `app.listen()` function. This launches the server and prints a message to the terminal so we know everything is working.  
Once you’ve saved this file, open your terminal, navigate to the project directory, and run the command:
```
node app.js
```
The terminal will show that the server is running at `http://localhost:3000`. If we open this URL in our browser to see "Hello, World!".
## Working with Parameters and Arguments
So far, our server has only responded with static text. While this is useful for testing, real applications almost always need to handle dynamic data for example, displaying a specific user’s profile or processing a search request. Express gives us straightforward ways to capture information directly from the URL and use it inside our routes.
### URL Parameters
One common way to handle dynamic data is through URL parameters. A parameter is simply a placeholder in the URL path that gets replaced with actual values when a user makes a request. In Express, we define parameters in routes by prefixing them with a colon (`:`).

For instance, let’s say we want to greet users by name. We can add a new route to our `app.js` file:
```
app.get('/user/:username', (req, res) => {
    const username = req.params.username;
    res.send(`Hello, ${username}!`);
});
```
In this example, `:username` is a parameter. When someone visits `http://localhost:3000/user/Alice`, Express extracts the value `"Alice"` from the URL and makes it available through `req.params.username`. The server then responds with the personalized message Hello, Alice!. If you try changing the name in the URL (for example, `/user/Bob`), the response will automatically update. This is the foundation of how dynamic pages, like user profiles, are created.
### URL Query Arguments
Another way to pass information to the server is by using query arguments. Query arguments are added to the end of a URL after a question mark (`?`). They consist of key-value pairs, such as `/search?query=express`, where `query` is the key and `express` is the value. Express automatically parses these arguments and makes them available inside `req.query`.  
Let’s create a simple search route that uses query arguments:
```
app.get('/search', (req, res) => {
    const query = req.query.query;
    if (query) {
        res.send(`You are searching for: ${query}`);
    } else {
        res.send('Please provide a search query.');
    }
});
```
With this route in place, visiting `http://localhost:3000/search?query=node+tutorials` will display the message ``You are searching for: node tutorials``. If the query string is missing (for example, if you just go to `/search`), the server will return ``Please provide a search query.``.
## Building a Simple JSON API
So far, we’ve created routes that return simple text responses, but modern web applications often need to communicate with other systems, like mobile apps or JavaScript front-ends. This is where APIs (Application Programming Interfaces) come in. APIs allow our backend to send structured data, typically in JSON (JavaScript Object Notation) format, which other applications can easily understand and use.
Our goal is to build a simple API endpoint that:
1. Accepts a product `id` as a URL parameter to identify a specific product.
2. Accepts an optional `currency` query argument to specify the currency for the product’s price.
3. Returns a JSON object containing the product’s details.

Express makes this incredibly straightforward with its built-in `res.json()` method, which automatically formats our JavaScript objects into proper JSON responses with the correct content-type headers. Let’s put everything we’ve learned together and build this API!
### Writing the API Endpoint
We’ll create a route that handles requests to `/api/products/:productId`. To simulate a real application, we’ll use a simple JavaScript object as our “database” (in a real app, you’d likely connect to a database like MongoDB or PostgreSQL). Add the following code to your `app.js` file (make sure you’ve already set up `const express = require('express');` and `const app = express();` at the top):

```
const express = require('express');
const app = express();
const port = 3000;
// Fake database to simulate product data
const productsDb = {
    "100": { name: "Laptop", price: 1200 },
    "101": { name: "Mouse", price: 25 },
    "102": { name: "Keyboard", price: 75 }
};

// API route to get product details
app.get('/api/products/:productId', (req, res) => {

    // Capture the productId from the URL
    const productId = req.params.productId;
    // Look up the product in our fake database
    const product = productsDb[productId];
    // If the product doesn’t exist, return a 404 error with a JSON message
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    // Get the optional currency query parameter, default to 'USD' if not provided
    const currency = req.query.currency || 'USD';
    // Build the response object
    const responseData = {
        id: productId,
        name: product.name,
        price: product.price,
        currency: currency
    };
    // Send the response as JSON
    res.json(responseData);

});
// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```
Let’s break down what’s happening in this code:
- **Fake Database**: We create a `productsDb` object to simulate a database with a few products. Each product has a `name` and `price`, stored under a unique ID (e.g., `"100"`).
- **Route Definition**: The `app.get('/api/products/:productId', ...)` route captures the `productId` from the URL using the `:productId` parameter.
- **Error Handling**: If the requested `productId` doesn’t exist in `productsDb`, we return a JSON error message with a **404 status code**, which tells the client the resource wasn’t found.
- **Sending JSON Response**: The line `res.json(responseData)` takes the JavaScript object we built (`responseData`) and automatically converts it into a JSON-formatted string then send it back to the client.
## Tasks
### Task 1: 
In this task, we’ll create a simple **user profile API** using Express. The goal is to simulate how a backend can provide dynamic user data in **JSON format**. Instead of using a database, we’ll work with hardcoded data to keep things simple.  

We’ll define a route `/api/profile/:username` that works as follows:
- It should return a JSON object with a fake user profile.
- It also accepts an optional query parameter `details`:
    - If `details=true`, return extended information (like email and role).
    - Otherwise, return only the basic information (just the username).
    

**Example Outputs:**
- Request: `/api/profile/Alice`  
    **Response:** `{ "username": "Alice" }`
    
- Request: `/api/profile/Alice?details=true`  
    **Response:** `{ "username": "Alice", "email": "alice@example.com", "role": "admin" }`
### Task 2: 
In this task, we’ll build a **book information API** using Express. Just like with the user profiles, we’ll simulate a small “database” using hardcoded data for different books. The goal is to demonstrate how an API can return different levels of detail depending on what the client requests.

We’ll define a route `/api/books/:bookId` that works as follows:
- It should return book details based on the `bookId` parameter.
- It also accepts an optional query parameter `summary`:
    - If `summary=true`, return only the book’s **title** and **author**.
    - Otherwise, return the full details including **title**, **author**, and **price**.
        

**Example Outputs:**
- Request: `/api/books/201`  
    **Response:** `{ "id": "201", "title": "Clean Code", "author": "Robert C. Martin", "price": 35 }`

- Request: `/api/books/201?summary=true`  
    **Response:** `{ "title": "Clean Code", "author": "Robert C. Martin" }`
