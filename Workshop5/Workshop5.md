## Objectives
- Understanding the shift from Server-Side Rendering to APIs.
- Building REST API with Express
## Shifting from Server-Side Rendering to APIs.
### Introduction
In our past workshops, our apps used server-side rendering. With this approach, each request returned an entire HTML page. The problem is that every time we triggered an action in the web app or navigated to a new URL, the server re-rendered the whole page. This means we ended up downloading the full HTML again, even when only a small part of the page had changed.

This is referred to as a “Hotwire-like” approach, and while it works, it can slow down the application. Often, we only need to retrieve a small piece of data and update a specific section of the page, rather than reloading everything.

To fix this, we can use an API to send and receive small chunks of data and update just the required parts of the interface.
### API
API (**Application Programming Interface**) is a layer that we add to our web app to connect the frontend with the backend. Our app uses the API to retrieve and send data to the server. The backend receives the data, saves the results, processes whatever is needed, and then returns the updated information to the frontend.   
APIs make it easier to extend our application and make it available on platforms other than the browser. For example, if we want to build a mobile application for our web app, we only need to create the user interface and connect it to our web server using the API. The same backend logic and data can be reused without any changes.

![](./api.png)


### Javascript Role
To use the API in our web application, we rely on JavaScript.  
JavaScript handles communication with the server by fetching data from the API and then dynamically updating the DOM to reflect that data.

Now, instead of submitting a full form and reloading the page, we can let the user type in an input field, click a button, and then:
1. **Catch the click event** with JavaScript
2. **Send a request** to the API    
3. **Receive the response** from the server
4. **Update the DOM** using the data from the response


This way, only the necessary part of the page changes, and our app becomes much faster and smoother.
### REST API Architecture
There are many patterns to design APIs for our web apps, but the most common and beginner friendly one is the REST API.  
REST stands for Representational State Transfer. It is named this way because the server sends a representation of the requested resource usually as JSON, and the client is responsible for handling the state of the application on its side. 
### REST Main Properties
REST APIs are defined by several **mandatory constraints** that help achieve scalability, simplicity, and performance in a web service.
#### Stateless
Each request sent to the server must contain all the information needed to process it. The server does not store any information about previous requests. 
#### Client–Server Separation
The frontend and backend are separated.  
The frontend focuses only on the user interface and user experience, while the backend handles data storage and business logic. 
#### URLs Identify Resources
REST treats everything as a resource (users, tasks, posts, products, etc.).  
Each resource is identified by a clear and meaningful URL, for example:
- `/tasks`
- `/users/1`
#### Use of Standard HTTP Methods
REST relies on standard HTTP methods to describe actions instead of custom commands:
- **GET** Retrieve data
- **POST** Create new data
- **PUT / PATCH** Update existing data
- **DELETE** Remove data

By following these conventions, REST APIs remain predictable, easy to understand, and consistent across different applications.
## Building REST API with Express
Now that we understand how REST APIs work, we will apply these concepts by building a Task Management REST API.

The API will be responsible for registering users, authenticating logins, updating user profiles (including name and profile picture), and displaying, editing, and deleting tasks associated with each user.
### Setting Our Envirenment
We start by creating a project directory and initializing a Node.js project. This will generate a package.json file to manage our project dependencies.
``` 
mkdir myapp
cd myapp
npm init -y
```
### Installing Packages
After initializing the project, it’s time to install the packages required for our Express application.

For this project, we will use **Express** as the web framework,**ejs** template engine, **iron-session** for session management, **prisma** as an ORM for database interaction, **dotenv** for environment variables, and **argon2** for secure password hashing.
```
npm install express iron-session prisma  @prisma/client sqlite3 dotenv argon2
```

### Creating Database Models 
Now we move to creating our database models. we only need two core models: the **User** model and the **Task** model.

The User model represents application users and stores their basic information such as username, password, email, and avatar. The Task model represents tasks created by users, including details like task name, description, creation time, and current state (active or done).

There is a one-to-many relationship between users and tasks:
- A user can have many tasks
- Each task belongs to exactly one user

We will use **Prisma**  to define our models, we start by intializing it with SQLite as our database
```shell
npx prisma init --datasource-provider sqlite
```
After that we set our databse connection inside the ``.env`` file
```
SESSION_SECRET=oihgahahvaaiohaehahvaai594qqfqq61
NODE_ENV=development
DATABASE_URL="file:./database.db"
```
Now we finished configuring prisma we degine the models we need inside **`prisma/schema.prisma`**

```js
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            Int      @id @default(autoincrement())
  username      String   @unique
  email         String   @unique
  password      String   
  avatar        String?  
  tasks         Task[]
}

model Task {
  id         Int      @id @default(autoincrement())
  name       String   
  createdAt  DateTime @default(now())
  state      String   @default("active") 

  userId     Int
  user       User     @relation(fields: [userId], references: [id])
  @@map("tasks")
}


```
**User Model**
- `id`: Primary key that uniquely identifies each user
- `username`: Unique username for login and identification
- `email`: User email address (also unique)
- `password`: Stores the hashed password (never store plain text passwords)
- `avatar`: Optional field to store a profile picture URL or file path
- `tasks` attribute defines a one-to-many relationship, allowing us to access a user’s tasks using `user.tasks`.

**Task Model**
- `id`: Primary key for each task
- `name`: Task title
- `createdAt`: Timestamp automatically set when the task is created
- `state`: Represents the task status (`active` or `done`)
- `userId` field is a foreign key that links each task to its owner. This ensures that every task belongs to a valid user.

### Initialize The Database
After defining our Prisma models, run the following command to create the database and apply the initial schema:
```shell
npx prisma migrate dev --name init
```
This command:
- Creates a new SQLite database file (if it doesn’t exist).
- Applies our schema changes (models) as a migration.
- Generates the Prisma client, which we can import and use in our Node.js app.
### Session Middleware
efore creating our REST API, let’s set up a session middleware to handle user sessions. This middleware initializes an encrypted session using `iron-session`, attaches it to `req.session`, and makes it available throughout the application. We’ll use it later to store and retrieve authenticated user information after login.

**`middlewares/session.js`**
```js
const { getIronSession } = require('iron-session');
require('dotenv').config();
module.exports = async (req, res,next) => {
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
};
```
### Building the REST API
Now it’s time to build our REST API to connect our application with the server and the database. The RESTful API exposes resources as endpoints, allowing the frontend to communicate with our backend using standard HTTP methods.

For this project, we will work with two main resources:
- **Users** responsible for managing user-related actions such as updating username, password, email, and avatar.    
- **Tasks**  responsible for creating, reading, updating, and deleting tasks that belong to authenticated users.

All task-related actions require the user to be logged in. We track authentication state using **iron-session**, and the API itself is built using **Express routing and controllers** to implement RESTful endpoints.
#### Initial API Setup
We start by configuring Express, EJS, and registering our session middleware.

**``app.js``**
```js
const express = require('express');
const Session = require('./middlewares/session');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(Session);
```
In this setup, we prepare the core components of our Express application.  
We configure EJS as the template engine to render dynamic HTML views, set the **`public`** directory as the source for static assets such as CSS and images, and enable form data parsing using `express.urlencoded`. Finally, we register our session middleware, making session data available across all routes and controllers.
#### Creating Auth Resources
Now let’s start creating our API resources. We begin with the authentication resources, which are responsible for handling user registration and login. These resources manage how users create accounts, authenticate themselves, and start a session with the application.

**``api/Auth.js``**
```js
const express = require('express');
const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();


router.post('/register', async (req, res) => {
  const { username, email, password, avatar } = req.body;

  const hashedPassword = await argon2.hash(password);

  await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      avatar,
    },
  });

  res.status(201).json({ message: 'User registered successfully' });
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await argon2.verify(user.password, password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  req.session.userId = user.id;
  await req.session.save();
  res.json({ message: 'Login successful' });
});

module.exports = router;
```
We defined two authentication API routes using **Express Router**. Each route handles incoming **POST** requests and is responsible for a specific authentication action.

The register route receives user data in JSON format from the request body, hashes the user’s password, creates a new user record in the database, and returns a JSON response confirming successful registration.

The login route also receives JSON data from the API request. It searches for the user in the database using the provided email and verifies that the password matches. If the credentials are correct, the user’s ID is stored in the session to mark the user as logged in, and a success message is returned. If the credentials are invalid, the API responds with a **401 (Unauthorized)** status code.

After defining the routes, we register them in our main application file by mounting the authentication router:
```js
const authRoutes = require('./api/Auth');
app.use('/api', authRoutes);
```
These routes are available at:
- **POST `/api/register`** Register a new user
- **POST `/api/login`** Log in an existing user

#### Creating User Resources
Now that authentication is in place, we can move on to the User resource. This resource is responsible for managing user-related actions after the user is logged in.

Through the User resource, a logged-in user can view their profile information, update their username or email, change their password, and update their avatar. All these actions require authentication, so the user must have an active session before accessing these endpoints.

**`api/User.js`**
```js
const express = require('express');
const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

router.get('/', requireLogin, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.session.userId },
  });

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  });
});

router.put('/', requireLogin, async (req, res) => {
  const { username, email, avatar } = req.body;

  await prisma.user.update({
    where: { id: req.session.userId },
    data: {
      username: username ?? undefined,
      email: email ?? undefined,
      avatar: avatar ?? undefined,
    },
  });

  res.json({ message: 'User profile updated successfully' });
});

router.patch('/password', requireLogin, async (req, res) => {
  const { password } = req.body;
  const hashedPassword = await argon2.hash(password);

  await prisma.user.update({
    where: { id: req.session.userId },
    data: { password: hashedPassword },
  });

  res.json({ message: 'Password updated successfully' });
});

module.exports = router;
```
As before, here we defined a **User API resource** using **Express Router**. This resource provides multiple HTTP methods to manage the logged-in user’s profile.

The GET route retrieves the current user’s information from the database using the user ID stored in the session and returns it as a JSON response.

The PUT route allows the logged-in user to update their profile data, such as username, email, and avatar. Only the provided fields are updated, while the rest remain unchanged.

The PATCH `/password` route is used to update sensitive data, such as the user’s password. This action also requires the user to be authenticated.

After that, we register the routes by mounting the router in `app.js`:

`app.use('/api/user', userRoutes);`

These routes will run on the following endpoints:

- **GET `/api/user`** Retrieve the logged-in user’s profile
- **PUT `/api/user`**  Update username, email, or avatar
- **PATCH `/api/user/password`** Change the user’s password

#### Creating Task Resources
Finally, we create the Task resource, which is responsible for managing all task-related actions in our application. This resource allows a logged-in user to create new tasks, view their existing tasks, update task information, and delete tasks.

Each task is linked to the currently authenticated user using the session, ensuring that users can only access and modify their own tasks. All task endpoints are protected, so the user must be logged in before performing any task operation.

**``api/Tasks.js``**
```js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

router.get('/', requireLogin, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.session.userId },
  });

  res.json(
    tasks.map(task => ({
      id: task.id,
      name: task.name,
      state: task.state,
      createdAt: task.createdAt,
    }))
  );
});

router.post('/', requireLogin, async (req, res) => {
  const { name } = req.body;

  await prisma.task.create({
    data: {
      name,
      userId: req.session.userId,
    },
  });

  res.status(201).json({ message: 'Task created successfully' });
});

router.put('/:taskId', requireLogin, async (req, res) => {
  const { taskId } = req.params;
  const { name, state } = req.body;

  const task = await prisma.task.findFirst({
    where: { id: parseInt(taskId), userId: req.session.userId },
  });

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  await prisma.task.update({
    where: { id: task.id },
    data: {
      name: name ?? undefined,
      state: state ?? undefined,
    },
  });

  res.json({ message: 'Task updated successfully' });
});

router.delete('/:taskId', requireLogin, async (req, res) => {
  const { taskId } = req.params;

  const task = await prisma.task.findFirst({
    where: { id: parseInt(taskId), userId: req.session.userId },
  });

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  await prisma.task.delete({
    where: { id: task.id },
  });

  res.json({ message: 'Task deleted successfully' });
});

module.exports = router;
```
We defined two task-related API routes using **Express Router**:
- The Task List resource handles operations on multiple tasks.
    - **GET `/api/tasks`** retrieves all tasks belonging to the logged-in user.
    - **POST `/api/tasks`** creates a new task and links it to the current user using the session.
- The **Task resource** handles operations on a single task.
    - **PUT `/api/tasks/:taskId`** updates task data such as name or state.
    - **DELETE `/api/tasks/:taskId`** removes a task from the database.

In all cases, tasks are first checked to ensure they belong to the logged-in user. If a task does not exist or belongs to another user, the API returns a **404 (Not Found)** response.

We register the api resources inside`app.js` using:
```js
const taskRoutes = require('./routes/Tasks');
app.use('/api/tasks', taskRoutes);
```
### Creating The Interface
Now that our API is fully functional, we need a user interface to interact with it. Instead of the server rendering HTML pages for every route, we will serve a single HTML file (Single Page Application approach) and use JavaScript to fetch data from our API and update the DOM dynamically.
#### Serving the Entry Point
We need to update our `app.js` to serve the `index.ejs` file when a user visits the root URL.

**`app.js`**
```js
// ... existing code ... 
app.get('/', (req,res) => {
  res.render('index');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```
Now, when you visit `http://127.0.0.1:3000/`, Express will serve the HTML file, and the rest of the application interaction will happen via JavaScript calling our API endpoints.
#### The HTML and CSS
We created a simple interface with two main sections: a Login section and a Dashboard section. Initially, the dashboard is hidden. After the user successfully logs in, the login section will be hidden, and the dashboard will be displayed.

We can find the HTML template and styling files inside the ``materials`` folder. The ``index.html`` file should be moved to the ``views`` folder and the ``style.css`` file should be moved to the ``public/css`` folder.
#### Client-Side Logic (JavaScript)
This is the most important part. The JavaScript file acts as the bridge between HTML events (such as clicks) and the Express REST API.

The code listens for form submissions and button clicks, then makes API calls using fetch to the corresponding endpoints. For example, when a user logs in, it sends a POST request to ``/api/login``, stores the session, and updates the view to display the user’s tasks. Similarly, task actions like creating, updating, or deleting a task are sent to the ``/api/tasks`` endpoints, and the page updates dynamically without reloading.

Helper functions handle view switching, displaying messages, and ensuring that only logged-in users can access protected sections.

The file is currently in the ``materials`` folder. We should move it  to the ``public/js`` folder so it can be served as a static asset by Express.
### Token-Based Authentication 
In the current Task Manager API, we use iron-session to manage authentication. This approach is effective for traditional web applications where the server and client are closely tied, and the browser handles session cookies automatically.

However, modern APIs often require authentication that is stateless and can be easily used by various clients (mobile apps, other servers, JavaScript frontends). This is where Token-Based Authentication comes in.
#### How Tokens Work
Instead of the server storing session data for every user (stateful), the server issues a secure, self-contained token (like a JSON Web Token or JWT) upon successful login.
1. **Client Logs In:** The user sends credentials (username/password) to the `/api/login` endpoint.
2. **Server Generates Token:** If successful, the server creates a unique token containing the user's ID, expiration time, and a secure signature. The token is returned in the response.
3. **Client Stores Token:** The frontend (e.g., JavaScript) stores this token (usually in local storage).
4. **API Access:** For every subsequent request to protected endpoints (e.g., `/api/tasks`), the client includes this token in the `Authorization` header, typically prefixed with `Bearer`.
5. **Server Verification:** The server receives the request, verifies the token's signature, extracts the user ID, and grants access. No database lookup for a session is required, making the API stateless and faster.
#### Implementing Token Authentication with Flask
While Express is flexible and lightweight, it does not provide built-in support for **JWT (JSON Web Token)** authentication. To generate, sign, and verify JWTs, we use a dedicated library such as **`jsonwebtoken`**.

JWT authentication allows us to build **stateless APIs**, where the server does not store session data. Instead, the authentication state is stored inside a token that is sent with each request.  

We start by installing the required packages:
```shell
npm install jsonwebtoken
```
#### Configuring Our App
Now, instead of using sessions, we configure our Express application to use JWT-based authentication.  

First, we define a secret key* used to sign and verify tokens, along with token expiration settings. These values are usually stored in environment variables.
**`.env`**
```
JWT_SECRET = aaavoapoq9852e29f22à¨bè^.^én
JWT_EXPIRES_IN = '1h'
```
We remove the session middleware as we don't need it anymore and also we remove it from the ``app.js`` file. 
#### Editing Login EndPoint
Now we need to edit our  **`api/Auth.py`**, we modify the ``login`` route to generate and return a token instead of setting a session variable:
```js
const jwt = require('jsonwebtoken');


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await argon2.verify(user.password, password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    message: 'Login successful',
    access_token:token
  });
});
```
We returning access token to our front end, we can save them and send them in our requests.

#### Applying The JWT on Task and User EndPoint
Finally we add protection to `/api/Tasks` and `/api/Users`  , we use the `jwt.verify` to verify the token in the request header, and if valid, makes the user's identity available via `payload.userId`:
**``api/User.js``**
```js
const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

router.get('/', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId},
  });

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  });
});

router.put('/', requireAuth, async (req, res) => {
  const { username, email, avatar } = req.body;
  await prisma.user.update({
    where: { id: req.userId },
    data: {
      username: username ?? undefined,
      email: email ?? undefined,
      avatar: avatar ?? undefined,
    },
  });
  res.json({ message: 'User profile updated successfully' });
});

router.patch('/password', requireAuth, async (req, res) => {
  const { password } = req.body;
  const hashedPassword = await argon2.hash(password);
  await prisma.user.update({
    where: { id: req.userId },
    data: { password: hashedPassword },
  });
  res.json({ message: 'Password updated successfully' });
});
module.exports = router;
```
**``api/Task.js``**
```js
const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

router.get('/', requireAuth, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId },

  });
  res.json(
    tasks.map(task => ({
      id: task.id,
      name: task.name,
      state: task.state,
      createdAt: task.createdAt,
    }))
  );
});

router.post('/', requireAuth, async (req, res) => {
  const { name } = req.body;
  await prisma.task.create({
    data: {
      name,
      userId: req.userId,
    },
  });
  res.status(201).json({ message: 'Task created successfully' });
});

router.put('/:taskId', requireAuth, async (req, res) => {
  const { taskId } = req.params;
  const { name, state } = req.body;
  const task = await prisma.task.findFirst({
    where: { id: parseInt(taskId), userId: req.userId },
  });
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  await prisma.task.update({
    where: { id: task.id },
    data: {
      name: name ?? undefined,
      state: state ?? undefined,
    },
  });
  res.json({ message: 'Task updated successfully' });

});

router.delete('/:taskId', requireAuth, async (req, res) => {
  const { taskId } = req.params;
  const task = await prisma.task.findFirst({
    where: { id: parseInt(taskId), userId: req.userId  },
  });

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  await prisma.task.delete({
    where: { id: task.id },
  });
  res.json({ message: 'Task deleted successfully' });
});
module.exports = router;
```
This simple change moves the application from stateful (session) to stateless (token) authentication, which is the standard for building high-performance APIs.
#### Editing the Javascript
Now we update our JavaScript to work with JWT authentication. When a user logs in, the backend returns a token, which we store in the browser using:
```javascript
localStorage.setItem('token', data.access_token);
```
For every subsequent API request, we need to include this token in the Authorization header so the backend can verify the user. This is done by adding:
```js
'Authorization': `Bearer ${localStorage.getItem('token')}` 
```
to the headers of each `fetch` request. This ensures that only authenticated users can access protected endpoints.