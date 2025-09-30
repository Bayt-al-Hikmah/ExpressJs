## Objectives

- Develop a **Single-Page Application (SPA)** frontend with vanilla JavaScript, seamlessly connected to an Express.js API backend.
- Master the **Express CLI** for efficient server management and database interactions using Sequelize.
- Implement **real-time communication** with WebSockets to build a live chat application.
- Understand the professional approach to **decoupling the backend from the frontend** using React for scalable full-stack development.

## The Full-Stack Divide

Modern web development demands a shift from traditional monolithic architectures to more modular, scalable systems. So far in our course, our Express.js applications have been monolithic, meaning a single codebase manages everything—processing HTTP requests, querying databases, applying business logic, and rendering HTML templates for the browser. This approach is straightforward for simple, server-rendered websites with minimal performance requirements, where user interactions like form submissions trigger full page reloads. However, today’s web users expect dynamic, app-like experiences, such as those provided by platforms like Gmail or Trello, where content updates seamlessly without interrupting the user’s flow with page refreshes. These experiences minimize latency, enhance usability, and provide a responsive, native-app-like feel.

To achieve this, we adopt a **decoupled architecture**, dividing the application into two independent layers: the backend and the frontend. The **backend**, built with Express.js, serves as the server-side logic hub, focusing exclusively on data management. It exposes RESTful API endpoints that handle requests (e.g., POST for creating data), interact with the database to store or retrieve information, enforce security measures like authentication, and return lightweight JSON responses. By avoiding HTML rendering, the backend remains focused, reusable across platforms (e.g., mobile apps), and easier to scale horizontally through load balancing or microservices.

The **frontend**, running entirely in the user’s browser, is the client-side interface. Built with JavaScript (and later React), it handles rendering the user interface, managing local state (e.g., form inputs), and orchestrating user interactions. It communicates asynchronously with the backend via API calls using tools like Fetch or Axios, processing JSON responses to dynamically update the DOM. This eliminates page reloads, delivering a fluid, single-page experience that feels instantaneous to users.

This separation adheres to the **Single Responsibility Principle**, where each layer has a distinct role, making the codebase more maintainable. Backend developers can focus on data integrity, API design, and server optimization, while frontend developers concentrate on crafting intuitive UI/UX. This approach also enhances testing—unit tests for APIs and integration tests for the frontend—improves version control, and simplifies deployment (e.g., hosting the frontend on static servers like Netlify). However, challenges arise, such as managing cross-origin resource sharing (CORS) for API calls or ensuring data consistency across client and server. These can be addressed with best practices, such as proper CORS configuration and robust error handling.

In this lecture, we’ll build two practical applications to illustrate these concepts: a **task manager SPA** for performing CRUD (Create, Read, Update, Delete) operations and a **real-time chat app** for live user interactions. Both will incorporate secure authentication using bcrypt for password hashing to protect against data breaches, Tailwind CSS for rapid and responsive styling, express-validator for robust server-side form validation to guard against invalid inputs or attacks, and Sequelize as an ORM to abstract database queries, reducing the risk of SQL injection and enabling database-agnostic code. We’ll conclude by refactoring the frontend to use React, demonstrating how it enhances scalability and maintainability for larger applications.

## The Single-Page Application (SPA)

### Introduction

Traditional Express.js applications rely on server-side rendering, where every user action—such as adding a task, logging in, or submitting a form—initiates a full HTTP request-response cycle. This results in the browser reloading the entire page, leading to noticeable delays, especially on slower networks. These reloads can also cause loss of unsaved state, like scroll position or partially completed form inputs, resulting in a disjointed user experience that feels outdated compared to the smooth interactions of native mobile apps. As applications grow in complexity, intertwining server-side rendering with client-side logic creates a tangled codebase, making it difficult to debug, extend, or maintain without risking unintended side effects across the system.

Single-Page Applications (SPAs) address these issues by shifting rendering and interaction logic to the client side. The backend serves as a pure API, delivering data in JSON format, while the frontend, running in the browser, handles dynamic updates. This approach minimizes server load, reduces latency, and provides a seamless user experience akin to desktop or mobile applications.

### The Approach

We’ll develop a Task Manager SPA that enables authenticated users to add, view, and delete tasks in real-time without page reloads. The backend will function as a RESTful API, adhering to principles like statelessness, standard HTTP methods (GET for retrieving, POST for creating, DELETE for removing), and JSON payloads for data exchange. This ensures the backend is lightweight, extensible, and capable of serving multiple clients, such as web or mobile apps. The frontend will leverage vanilla JavaScript, using the Fetch API for asynchronous API calls, DOM manipulation for dynamic UI updates, and immediate user feedback to enhance responsiveness.

Security is paramount: we’ll implement JSON Web Tokens (JWT) for sessionless authentication, ensuring secure access to protected routes, and use bcrypt to hash passwords, safeguarding against database leaks. The project structure will be modular to adhere to the DRY (Don’t Repeat Yourself) principle, separating concerns like models, routes, and middleware for clarity and scalability. Tailwind CSS will provide rapid, utility-based styling that’s responsive across devices, while express-validator and Sequelize ensure robust form validation and safe database interactions, respectively.

This approach not only optimizes performance by minimizing data transfer to JSON payloads but also introduces core full-stack concepts: designing RESTful APIs with proper error handling (e.g., 400 for bad requests, 401 for unauthorized access), managing client-server communication, and handling state on the client side for a responsive user experience.

### The Backend: A Pure Express.js API

We’ll configure Express.js with essential middleware for database management (Sequelize), input validation (express-validator), and security (jsonwebtoken for authentication, bcrypt for hashing). Sequelize serves as an ORM, mapping JavaScript objects to database tables and generating safe SQL queries to prevent injection attacks. Express-validator validates user inputs server-side, ensuring data integrity before database operations. The modular project structure organizes code into models, middleware, and routes, reducing duplication and improving maintainability for team collaboration and future scaling.

#### Project Structure

Inspired by frameworks like NestJS, this structure promotes scalability and maintainability, allowing easy addition of new models or routes without cluttering the main application file.

```
project/
│
├── app.js             # Main Express app with middleware and routes
├── models/            # Database models
│   ├── index.js       # Sequelize setup and model imports
│   ├── user.js        # User model with authentication logic
│   ├── task.js        # Task model with relationships
├── middleware/        # Reusable logic
│   ├── auth.js        # JWT authentication middleware
├── routes/            # Route handlers
│   ├── auth.js        # Authentication routes (register, login, logout)
│   ├── tasks.js       # Task API routes (CRUD operations)
├── public/            # Static files served by Express
│   ├── js/app.js      # Client-side JavaScript for SPA
│   └── css/styles.css # Tailwind CSS (via CDN for simplicity)
├── views/             # HTML templates for initial page loads
│   ├── index.html     # SPA entry point
│   ├── login.html     # Login form template
│   ├── register.html  # Registration form template
```

#### Backend Setup

**Install Dependencies**:

```bash
npm install express sequelize sqlite3 bcrypt jsonwebtoken express-validator cors
```

These packages provide the core framework (Express.js), ORM (Sequelize), database (SQLite for development), password hashing (bcrypt), authentication tokens (jsonwebtoken), input validation (express-validator), and CORS support for cross-origin API calls.

**Database Models (`models/index.js`)**:  
Initializes Sequelize with SQLite for simplicity.

```javascript
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../spa.db'),
});

module.exports = { sequelize, Sequelize };
```

**User Model (`models/user.js`)**:  
Defines the User table with secure password hashing.

```javascript
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('./index');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(80),
    unique: true,
    allowNull: false,
  },
  password_hash: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
}, {
  tableName: 'user',
});

User.prototype.setPassword = async function(password) {
  this.password_hash = await bcrypt.hash(password, 10);
};

User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = User;
```

**Task Model (`models/task.js`)**:  
Defines the Task table with a foreign key to User for ownership.

```javascript
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const User = require('./user');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
});

module.exports = Task;
```

The foreign key ensures tasks are linked to users, maintaining referential integrity. In production, indexes on `username` or `user_id` would optimize query performance.

**Authentication Middleware (`middleware/auth.js`)**:  
Verifies JWT tokens for protected routes.

```javascript
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, 'your-very-secret-key-for-spas', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user_id = decoded.user_id;
    req.username = decoded.username;
    next();
  });
};

module.exports = auth;
```

This middleware extracts the JWT from the Authorization header, verifies it, and attaches user data to the request object, enabling secure access control.

**Authentication Routes (`routes/auth.js`)**:  
Handles user registration and login with validation and JWT issuance.

```javascript
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

router.post('/register', [
  check('username').isLength({ min: 4, max: 25 }).withMessage('Username must be between 4 and 25 characters'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) return res.status(400).json({ error: 'Username already exists' });

  const user = await User.create({ username });
  await user.setPassword(password);
  await user.save();

  res.status(201).json({ message: 'Registration successful' });
});

router.post('/login', [
  check('username').notEmpty().withMessage('Username is required'),
  check('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user || !(await user.checkPassword(password))) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ user_id: user.id, username }, 'your-very-secret-key-for-spas', { expiresIn: '1h' });
  res.json({ token, username });
});

router.get('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
```

Express-validator ensures input integrity (e.g., minimum length checks), while bcrypt and JWT secure user authentication. The logout route clears client-side tokens.

**Task Routes (`routes/tasks.js`)**:  
Implements CRUD operations for tasks, restricted to authenticated users.

```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/task');

router.get('/', auth, async (req, res) => {
  const tasks = await Task.findAll({ where: { user_id: req.user_id } });
  res.json(tasks);
});

router.post('/', auth, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Missing content' });

  const task = await Task.create({ content, user_id: req.user_id });
  res.status(201).json(task);
});

router.delete('/:task_id', auth, async (req, res) => {
  const task = await Task.findByPk(req.params.task_id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (task.user_id !== req.user_id) return res.status(403).json({ error: 'Forbidden' });

  await task.destroy();
  res.json({ success: true });
});

module.exports = router;
```

These routes use HTTP status codes (201 for creation, 404 for not found) for semantic responses. In production, add error handling for database failures and rate limiting to prevent abuse.

**Express Application (`app.js`)**:  
Ties together middleware, routes, and static file serving.

```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/register.html'));
});

sequelize.sync({ force: false }).then(() => {
  app.listen(3000, () => console.log('Server running on port 3000'));
});
```

CORS middleware enables cross-origin requests, while `express.json()` and `express.urlencoded()` parse incoming data. Static files and templates are served from `public` and `views`.

#### Frontend Setup

The frontend loads once and uses JavaScript to handle all interactions, leveraging the browser’s event loop for responsiveness. The SPA communicates with the backend via Fetch API, storing JWT in localStorage for authentication.

**HTML Template (`views/index.html`)**:  
The SPA’s static shell with Tailwind CSS for responsive styling.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Manager SPA</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
  <div class="container mx-auto max-w-2xl mt-10 p-8 bg-white rounded-lg shadow-xl">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">My Tasks</h1>
    <a href="/api/auth/logout" class="text-red-500 hover:text-red-700 mb-4 inline-block">Logout</a>
    <form id="task-form" class="flex mb-6">
      <input type="text" id="task-content" class="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="What needs to be done?" required>
      <button type="submit" class="bg-blue-500 text-white px-6 py-3 rounded-r-md hover:bg-blue-600 transition duration-300">Add Task</button>
    </form>
    <ul id="task-list" class="space-y-3"></ul>
  </div>
  <script src="/js/app.js"></script>
</body>
</html>
```

Tailwind classes provide responsive design (e.g., `max-w-2xl` for mobile/desktop) and interactive effects (e.g., `hover:bg-blue-600`).

**JavaScript (`public/js/app.js`)**:  
Handles client-side logic with async Fetch API calls and JWT authentication.

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) window.location.href = '/login';

  const taskForm = document.getElementById('task-form');
  const taskContentInput = document.getElementById('task-content');
  const taskList = document.getElementById('task-list');

  const renderTask = (task) => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm';
    li.dataset.id = task.id;
    li.innerHTML = `
      <span class="text-gray-700">${task.content}</span>
      <button class="text-red-500 hover:text-red-700 font-semibold">Delete</button>
    `;
    li.querySelector('button').addEventListener('click', async () => {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      li.remove();
    });
    taskList.appendChild(li);
  };

  const fetchTasks = async () => {
    const response = await fetch('/api/tasks', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (response.status === 401) {
      window.location.href = '/login';
      return;
    }
    const tasks = await response.json();
    taskList.innerHTML = '';
    tasks.forEach(renderTask);
  };

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = taskContentInput.value.trim();
    if (!content) return;
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    const newTask = await response.json();
    renderTask(newTask);
    taskContentInput.value = '';
  });

  fetchTasks();
});
```

This script uses event-driven programming: listeners respond to user actions, ensuring a reactive UI. Potential improvements include error handling for failed API calls or optimistic updates for faster perceived performance.

**Running the App**:

- Initialize the database: Run `node app.js` to sync Sequelize models with the database.
- Start the server: `node app.js` (runs on localhost:3000).
- Usage: Navigate to `/register`, create an account (password hashed with bcrypt), log in to receive a JWT, and manage tasks. The SPA fetches data on load and updates dynamically.

This setup delivers a secure, efficient, and user-friendly SPA. Common pitfalls include misconfigured CORS in production or unhandled network errors, which can be mitigated with proper middleware and client-side error handling.

## Managing Our App with the Express CLI

### Introduction

During development or maintenance, developers often need to inspect or manipulate database data—seeding initial users, debugging queries, or correcting erroneous entries. Building a full admin dashboard for these tasks is excessive for small projects, and raw SQL tools like `sqlite3` lack integration with the application’s models, risking errors or redundant effort. The **Express CLI** (via `sequelize-cli`) provides an enhanced Node.js REPL that loads the app’s context, granting direct access to Sequelize models, middleware, and the database connection. This allows Pythonic, object-oriented database operations, safer and faster than raw SQL, as Sequelize handles query parameterization to prevent injection.

Sequelize uses a session-like pattern where changes are staged in memory and committed atomically, ensuring transactional integrity (all changes succeed or none do). This approach streamlines development workflows, reducing errors and saving time compared to writing temporary scripts or using external database tools.

### Working with the CLI

**Open the CLI**:

```bash
npx sequelize-cli db:migrate
npx sequelize-cli shell
```

This launches a REPL with the app’s context pre-loaded, including Sequelize models and the database connection.

**Common Commands**:

```javascript
const { sequelize, User, Task } = require('./models');

// Create tables (idempotent)
await sequelize.sync();

// Add a new user
const newUser = await User.create({ username: 'admin' });
await newUser.setPassword('supersecret');
await newUser.save();

// Query all users
const users = await User.findAll();
console.log(users);

// Find a specific user
const admin = await User.findOne({ where: { username: 'admin' } });
console.log(admin.id);

// Add a task
const task = await Task.create({ content: 'Sample task', user_id: admin.id });

// Delete a task
const taskToDelete = await Task.findByPk(1);
await taskToDelete.destroy();
```

Advanced usage includes chaining queries (e.g., `User.findAll({ where: { username: { [Op.like]: '%admin%' } }, order: [['id', 'DESC']], limit: 5 })`) for filtering, sorting, or pagination. Use `sequelize.transaction` for atomic operations to ensure data consistency. Always test in a development database to avoid accidental data loss in production. The CLI reduces development friction by providing a familiar JavaScript environment for database tasks.

## Real-Time Magic with WebSockets

While the SPA excels at on-demand data fetching via HTTP (a stateless, request-response protocol), it’s inefficient for scenarios requiring instant server-pushed updates, such as chat applications. Polling (repeated client requests) consumes bandwidth, drains battery life, and scales poorly with many users. Long-polling or server-sent events improve this but still rely on HTTP’s unidirectional nature. **WebSockets** establish a persistent, full-duplex TCP connection, allowing the server to push data to clients without requests, enabling true real-time features like live messaging.

We’ll use **Socket.IO** with Express.js, which wraps WebSockets with fallbacks for older browsers and features like rooms and automatic reconnection. Messages will be persisted in Sequelize for history, and JWT authentication will ensure only authorized users participate. WebSockets reduce latency by eliminating HTTP overhead but require careful connection management (e.g., closing idle connections) to optimize resources.

### Setup

**Install Dependencies**:

```bash
npm install socket.io
```

**Project Structure**:  
Extends the SPA structure with chat-specific files, reusing authentication and models.

```
project/
├── app.js
├── models/
│   ├── index.js
│   ├── user.js
│   ├── task.js
│   ├── message.js  # New Message model
├── middleware/
├── routes/
├── public/
│   ├── js/chat.js  # Client-side Socket.IO logic
├── views/
│   ├── chat.html   # Chat UI template
```

**Update Models (`models/message.js`)**:  
Adds a Message model for chat history.

```javascript
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const User = require('./user');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.fn('now'),
  },
});

module.exports = Message;
```

**Backend with Socket.IO (`app.js`)**:  
Integrates Socket.IO with Express.js, handling real-time events.

```javascript
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const Message = require('./models/message');
const User = require('./models/user');
const jwt = require('jsonwebtoken');

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/chat.html'));
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token?.split(' ')[1];
  if (!token) return next(new Error('Authentication error'));

  jwt.verify(token, 'your-very-secret-key-for-spas', (err, decoded) => {
    if (err) return next(new Error('Invalid token'));
    socket.user_id = decoded.user_id;
    socket.username = decoded.username;
    next();
  });
});

io.on('connection', async (socket) => {
  const messages = await Message.findAll({ order: [['timestamp', 'ASC']] });
  for (const msg of messages) {
    const user = await User.findByPk(msg.user_id);
    socket.emit('message_received', { username: user.username, text: msg.content });
  }

  socket.on('new_message', async (data) => {
    const msg = await Message.create({ content: data.text, user_id: socket.user_id });
    io.emit('message_received', { username: socket.username, text: data.text });
  });
});

sequelize.sync({ force: false }).then(() => {
  server.listen(3000, () => console.log('Server running on port 3000'));
});
```

Socket.IO authenticates connections with JWT, fetches message history on connect, and broadcasts new messages to all clients.

**Frontend Setup**  
**HTML Template (`views/chat.html`)**:  
Chat UI with Tailwind and Socket.IO client library.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Live Chat</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.js"></script>
</head>
<body class="bg-gray-200">
  <div class="container mx-auto max-w-3xl mt-10 flex flex-col h-[80vh]">
    <h1 class="text-3xl font-bold mb-4 text-center">Express Live Chat</h1>
    <a href="/api/auth/logout" class="text-red-500 hover:text-red-700 mb-4">Logout</a>
    <div id="messages" class="flex-grow bg-white p-4 rounded-t-lg shadow-inner overflow-y-auto"></div>
    <form id="chat-form" class="flex">
      <input id="message-input" class="flex-grow p-3 border border-gray-300 focus:outline-none" autocomplete="off" placeholder="Type a message...">
      <button class="bg-green-500 text-white px-6 py-3 hover:bg-green-600">Send</button>
    </form>
  </div>
  <script src="/js/chat.js"></script>
</body>
</html>
```

**JavaScript (`public/js/chat.js`)**:  
Handles client-side WebSocket events.

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) window.location.href = '/login';

  const socket = io({ auth: { token: `Bearer ${token}` } });
  const chatForm = document.getElementById('chat-form');
  const messageInput = document.getElementById('message-input');
  const messagesDiv = document.getElementById('messages');

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (text) {
      socket.emit('new_message', { text });
      messageInput.value = '';
    }
  });

  socket.on('message_received', (msg) => {
    const msgElement = document.createElement('div');
    msgElement.className = 'mb-2';
    msgElement.innerHTML = `<strong class="text-blue-600">${msg.username}:</strong> <span>${msg.text}</span>`;
    messagesDiv.appendChild(msgElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
});
```

This script establishes a WebSocket connection, sends messages, and updates the UI on new messages. Socket.IO’s heartbeats ensure connection reliability.

**Running the App**:

- Initialize database: `node app.js` (syncs tables).
- Start server: `node app.js`.
- Usage: Log in, navigate to `/chat`, send/receive messages in real-time.

This demonstrates WebSockets’ efficiency for collaborative apps. Extensions could include typing indicators or private rooms using Socket.IO’s features.

## Decoupling with React

While our vanilla JavaScript SPA is functional, it scales poorly as features grow. Manual DOM manipulation becomes error-prone, state management scatters across functions, and code reuse is limited. **React** introduces a declarative, component-based paradigm, where UIs are built from reusable components managing their own state and props. Hooks like `useState` and `useEffect` handle state and side effects, while JSX blends HTML and JavaScript for intuitive rendering. React’s virtual DOM optimizes updates by diffing changes, improving performance. The Express API remains unchanged, while React handles routing (via React Router) and state management.

This decoupling allows the backend to focus on data and APIs, while the frontend scales independently. Benefits include better organization, automatic re-rendering on state changes, and a rich ecosystem (e.g., Redux for global state). For deeper applications, server-side rendering with Next.js could enhance SEO and initial load times, but we focus on client-side rendering here.

### The Approach

We’ll refactor the task manager into React, reusing the Express API. Components encapsulate logic and UI, with reactive state management. The chat app can follow similarly, using `useEffect` for WebSocket connections.

**Setup React**:

```bash
npx create-react-app frontend
npm install axios react-router-dom tailwindcss
```

Configure Tailwind in `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**React Frontend Structure**:

```
frontend/
├── src/
│   ├── components/
│   │   ├── TaskManager.jsx  # Task management component
│   │   ├── Login.jsx        # Login form
│   │   ├── Register.jsx     # Registration form
│   ├── App.jsx              # Routing setup
│   ├── index.js             # Renders App to DOM
│   └── index.css            # Tailwind styles
```

**TaskManager Component (`src/components/TaskManager.jsx`)**:  
Uses hooks for state and API calls.

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [content, setContent] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data);
      } catch (error) {
        if (error.response.status === 401) window.location.href = '/login';
      }
    };
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    const response = await axios.post('/api/tasks', { content }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks([...tasks, response.data]);
    setContent('');
  };

  const deleteTask = async (id) => {
    await axios.delete(`/api/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="container mx-auto max-w-2xl mt-10 p-8 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Tasks</h1>
      <a href="/api/auth/logout" className="text-red-500 hover:text-red-700 mb-4 inline-block">Logout</a>
      <form onSubmit={addTask} className="flex mb-6">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What needs to be done?"
        />
        <button type="submit" className="bg-blue-500 text-white px-6 py-3 rounded-r-md hover:bg-blue-600">Add Task</button>
      </form>
      <ul className="space-y-3">
        {tasks.map(task => (
          <li key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm">
            <span className="text-gray-700">{task.content}</span>
            <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-700 font-semibold">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskManager;
```

**Routing (`src/App.jsx`)**:  
Sets up client-side navigation.

```jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TaskManager from './components/TaskManager';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TaskManager />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
```

**Deployment**:

- **Backend**: Deploy to Heroku or Vercel, configuring environment variables for secrets (e.g., JWT key).
- **Frontend**: Run `npm run build` to generate optimized static files, serve via Nginx or Netlify, and proxy `/api/*` to the backend.
- **CORS**: The `cors` middleware allows frontend access, preventing browser security blocks.

This React frontend is maintainable and performant. For larger apps, consider Redux for global state or TypeScript for type safety.
