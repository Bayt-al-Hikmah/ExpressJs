## Objectives
- Implement secure password hashing with `argon` and protect routes using middleware.
- Introduce **SQLite** as a lightweight, file-based database for persistent data storage.
- Interact with the database using raw SQL queries, a custom `User` class, and the **Sequelize** ORM.

## Hashed Passwords and Authentication

### Hashing Passwords

Storing passwords in plain text is a significant security risk, as unauthorized access to our database could expose them. Instead, we’ll hash passwords using a one-way function, ensuring that even we, as developers, cannot reverse them. When a user logs in, we hash their input and compare it to the stored hash. If they match, the login is successful.

We’ll use the argon2 library, which provides:

- argon2.hash(password): Generates a secure hash for a password.
- argon2.verify(hash, password): Verifies if a provided password matches the stored hash.

### Install Dependencies 
We begin by installing Express and the necessary packages.
```bash
npm install express ejs argon2 dotenv express-validator iron-session multer
```
### Preparing Environment Variables
We create a ``.env`` file and store the environment variables inside it.  
**`.env`**
```bash
SESSION_SECRET=oihgahahvaaiohaehahvaai594qqfqq61
NODE_ENV=development
```
### Creating middlewares
We start with creating the middleware that handle sessions.  
**`middlewares/session.js`**  
```javascript
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
This middleware initializes a secure session for each request using **Iron Session**. It loads the secret key from environment variables and sets cookie options such as security, HTTP-only access, and expiration time. The created session is then attached to `req.session`, making it available in the rest of the app, and the middleware passes control to the next handler.  
After this we create the ``404.js`` middleware to handel non existing pages  
**`middlewares/404.js`**
```javascript
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
This middleware runs when we try to access a non-existing page. We add it at the end of the middleware stack so it executes whenever a requested route doesn’t match any of the defined routes. It renders a 404 page with an error message, showing the username if the user is logged in.   
Finally we create the LoginCheck.js middleware that checks if the user is logged in or not.  
**`middlewares/loginCheck.js`:**
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
The `requireLogin` middleware checks if `req.session.user?.username` exists, indicating a logged-in user. If not, it redirects to the login page with a flash message. This middleware is applied to protected routes, keeping our code DRY.  
Finally we set the upload middleware. 
**``middlewares/upload.js``** 
```javascript
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
### Creating the routes
We’ve finished creating our middlewares. Now, we’ll set up the routes, All the routes from previous lecture stay same we need only make changes on auth route, to make it use argon2 and save hashed password instead of plain text.    
**`routes/auth.js`:**
```javascript
const express = require('express');
const argon = require('argon2');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/register', async (req, res) => {
    const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    req.session.errors = [];
    await req.session.save();
    return res.render('register', { errors, messages  ,username });
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
    hashed_password = await argon.hash(password)
    req.app.locals.users[username] = { hashed_password, avatar: null };
    req.session.messages = [{ category: 'success', message: 'Registration successful! Please log in.' }];
    await req.session.save();
    return res.redirect('/login');
});

router.get('/login', async (req, res) => {
    const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    await req.session.save();
    return res.render('login', { errors, messages ,username,errors});
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
    if (user && await argon.verify(user.hashed_password ,password)) {
        req.session.user = { username };
        req.session.messages = [{ category: 'success', message: 'Login successful!' }];
        await req.session.save();
        return res.redirect('/');
    } else {
        req.session.messages = [{ category: 'danger', message: 'Invalid username or password.' }];
        await req.session.save();
        return res.redirect('/login');
    }
});

router.get('/logout',  async  (req, res) => {
    await req.session.destroy();
    return res.redirect('/login');
});

module.exports = router;
```
**GET /register**

When the user visits `/register`:

- The server renders the **register** page (EJS, Handlebars, etc.) with any stored messages from the session (like errors or success notifications).
    
- After rendering, it clears the session messages to avoid showing old alerts again.
    

**POST /register**

When the registration form is submitted:

- The server validates the input fields:
    
    - `username` must not be empty and must be between 3 and 25 characters.
        
    - `password` must not be empty and must be at least 6 characters long.
        
- If validation fails, the user is redirected back to `/register` with error messages.    
- If validation passes:
    - The server checks if the username already exists in memory (`req.app.locals.users`).
    - If it exists: a danger message (“Username already exists!”) is stored, and the user is redirected to `/register`.
    - If it’s a new username:
        - The password is securely hashed using **Argon2** with `await argon.hash(password)`.
        - The new user is stored in memory: `req.app.locals.users[username] = { password_hash };`
        - A success message (“Registration successful! Please log in.”) is saved to the session.
        - The user is redirected to `/login`.

**GET /login**

When the user visits `/login`:

- The server renders the **login** page with any flash messages stored in the session (like “Registration successful” or “Invalid credentials”).
    
- It then clears these messages to prevent duplicates.
    

 **POST /login**

When the login form is submitted:

- The server validates that both `username` and `password` fields are filled.
- If validation fails, it redirects back to `/login` with error messages.
- If validation passes:
    - It looks up the user in memory (`req.app.locals.users[username]`).
    - **Argon2** is used to verify the password:`await argon.verify(user.password_hash, password)`
    - If the credentials are valid:
        - The user’s information is saved to the session (`req.session.username = user.username`).
        - A success message (“Login successful!”) is shown.
        - The user is redirected to `/`.
    - If invalid:
        - An error message (“Invalid username or password.”) is stored.
        - The user is redirected back to `/login`.
            
			 
**GET /logout**

When visiting `/logout`:

- The session is destroyed using `req.session.destroy()`, logging the user out.
    
- After logout, the user is redirected to `/login`. 
### Templates and Style
We use the same template that we built on our previous lecture same to layout and the partials and the styles.  
Finally we set the ``app.js``
**`app.js`**
```javascript
const express = require('express');
const authRoutes = require('./routes/auth');
const  profile = require('./routes/profile');
const  wiki = require('./routes/wiki');
const notFoundHandler = require('./middlewares/404');
const Session = require('./middlewares/session');
const app = express();
const port = 3000;

app.locals.users = {}; // e.g., { 'username': { password: 'password123', avatar: null } }
app.locals.pages = {}; // e.g., { 'HomePage': { content: 'Welcome!', author: 'admin' } }

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(Session)


app.use(authRoutes);
app.use(profile);
app.use(wiki);
app.get('/', (req, res) => {
  const username = req.session.user?.username || null;
  const messages = req.session.messages || [];

  return res.render('index', { username, messages });

  req.session.messages = [];
});

app.use(notFoundHandler);


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```
With this setup, we’ve made our app more secure and organized. User passwords are now stored as hashed values instead of plain text, preventing sensitive data leaks.

## Working with SQLite
Storing users in memory (just in the server’s RAM) is convenient for quick prototyping, but it has a major limitation: all data is lost whenever the server restarts because RAM is volatile. For any real-world application, we need persistent storage a way to save data that survives server restarts. This is where a database comes in. A database provides a structured and reliable way to store, manage, and retrieve data, ensuring that users’ information is safe and always accessible.

We’ll use **SQLite**, a lightweight, file-based database ideal for learning and small to medium-sized applications. SQLite’s advantages include:

- **Serverless**: No separate server process is required.
- **File-Based**: Data is stored in a single file (e.g., database.db).
- **Built-in**: Available in Node.js via the sqlite3 package, requiring no additional setup.

### Creating the Database


We define a schema for our SQLite database to store user information. The schema includes a user table with fields for id, username, and password_hash.

**`schema.sql`:**

```sql
CREATE TABLE users (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    username TEXT UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    avatar TEXT

);

CREATE TABLE pages (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT UNIQUE NOT NULL,

    content TEXT NOT NULL

);
```

### Initialize the Database
First we connect and create the database file

```shell
sqlite3 database.db 
```

Now we will be inside the `sqlite` terminal , we run the following command to create our table

```shell
.read schema.sql
```

Then we quit the sqlite terminal using

```shell
.quit
```

This creates database.db with the user table, ready for use.
### Connecting Express with SQLite
The `sqlite3` package lets us connect to SQLite and execute queries.


**Install SQLite3**
```shell
npm install sqlite3
```
Now we create the middlwares to contact with the database.  
**`middlewares/dbMiddleware.js`**
```javascript
const sqlite3 = require('sqlite3').verbose();

module.exports = function () {
  return (req, res, next) => {
    if (!req.app.get('db')) {
      const db = new sqlite3.Database('database.db', (err) => {
        if (err) {
          console.error('Failed to connect to SQLite:', err);
          return next(err);
        }
        console.log('Connected to SQLite database');
      });

      req.app.set('db', db);

      const closeDb = () => {
        const db = req.app.get('db');
        if (db) {
          db.close((err) => {
            if (err) {
              console.error('Failed to close SQLite:', err);
            } else {
              console.log('SQLite database connection closed');
            }
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      };

      // Handle process termination signals
      process.on('SIGINT', closeDb);
      process.on('SIGTERM', closeDb);
    }
    next();
  };
};
```
We first imports the sqlite3 library and enables verbose mode for better debugging messages. Then, we exports a function that returns our middleware. This allows us to easily plug it into our Express app using app.use(require('./dbMiddleware')()).

Inside the middleware, we first checks if the app already has a database connection stored (`req.app.get('db')`). If it doesn’t, we creates a new SQLite connection to the file **`database.db`**.  
If there’s an error connecting, we logs it and calls `next(err)` to pass the error to Express for handling. Otherwise, we prints “Connected to SQLite database”.

Once the connection is ready, we save it inside the Express app with `req.app.set('db', db)`. This means all routes can later access it via `req.app.get('db')` so the same database connection is reused across the app instead of creating a new one every time.

Next, we defines a helper function called **`closeDb`**. This function safely closes the database connection when the application is stopped. It logs whether the close was successful or not, then exits the process.

Finally, we set our middlware to listens for two system signals `SIGINT` (like when we press Ctrl+C) and `SIGTERM` (sent by some hosting environments to shut down apps). When either happens, it calls `closeDb()` to ensure the SQLite connection closes properly before the app exits.

At the end, the middleware calls `next()` so Express continues to the next handler or route.

### Editing the routes
Now we’ll update our routes to use the database for storing and retrieving data instead of relying on local storage.
**`routes/auth.js`**
```javascript
const express = require('express');
const argon = require('argon2');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/register', async (req, res) => {
    const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    req.session.errors = [];
    await req.session.save();
    return res.render('register', { errors, messages  ,username });
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
    const db = req.app.get('db');
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err)
        resolve(row)
      })
    })

    if (existingUser) {
      req.session.messages = [{ category: 'danger', message: 'Username already exists!' }]
      await req.session.save();
      return res.redirect('/register')
    }

    hashed_password = await argon.hash(password)
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashed_password],async (err) => {
        if (err){
            req.session.messages = [{ category: 'danger', message: 'Database error.' }];
            await req.session.save();
            return res.redirect('/register')
        } 
        resolve()
      })
    })
   
    req.session.messages = [{ category: 'success', message: 'Registration successful! Please log in.' }];
          
    await req.session.save();
    return res.redirect('/login');
        
});

router.get('/login', async (req, res) => {
    const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    await req.session.save();
    return res.render('login', { errors, messages ,username,errors});
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
    const db = req.app.get('db');

    const user = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err)
        resolve(row)
      })
    })

      if (user && await argon.verify(user.password_hash, password)) {
        req.session.user = { username };
        req.session.messages = [{ category: 'success', message: 'Login successful!' }];
        await req.session.save();
        return res.redirect('/');
      } else {
        req.session.messages = [{ category: 'danger', message: 'Invalid username or password.' }];
        await req.session.save();
        return res.redirect('/login');
      }
});


router.get('/logout',  async  (req, res) => {
    await req.session.destroy();
    return res.redirect('/login');
});

module.exports = router;
```
In this code, we use a real database instead of local storage to store and retrieve user data. When we register a user, we insert their information into the database using the ``db.run()`` method, and when we need to check if a username already exists or verify login credentials, we use ``db.get()`` to retrieve a single record.We use question marks (`?`) as placeholders for example, ``db.get('SELECT * FROM users WHERE username = ?', [username], ...)``. These placeholders make our queries safe from SQL injection. Instead of directly inserting user input into the SQL string, the database automatically replaces the ``?`` with the actual values from the array (like [username, hashed_password]) in a secure way. This ensures that any special characters or malicious input from users are treated as data, not as SQL commands. For example, if someone tried to enter a harmful input like ``john'); DROP TABLE users; --``, it would not break our query or damage the database because the database engine escapes it properly.

We also use Promises to make our database operations cleaner and easier to manage. Normally, database functions like ``db.get()`` and ``db.run()`` use callbacks, which can quickly make the code messy and hard to follow. To improve readability, we wrap these calls inside Promises and then use await to pause the execution until the database responds. If the operation succeeds, the Promise resolves with the result (like the retrieved row), and if there’s an error, it rejects and throws an exception. This allows us to write database logic in a more straightforward, synchronous-looking style using async/await.   
**`routes/profile.js`**
```javascript
const express = require('express');
const requireLogin = require('../middlewares/loginCheck.js');
const upload = require('../middlewares/upload.js');

const router = express.Router();

// --- Profile page ---
router.get('/profile', requireLogin, async (req, res) => {
  const username = req.session.user?.username || null;
  const db = req.app.get('db');
  const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err)
        resolve(row)
      })
    })
  

    const messages = req.session.messages || [];
    req.session.messages = [];
    await req.session.save();
    return res.render('profile', { user, username, messages });
  });


// --- Avatar upload ---
router.post('/profile', requireLogin, upload.single('avatar'), async (req, res) => {
  const username = req.session.user?.username || null;
  const db = req.app.get('db');

  if (!req.file) {
    req.session.messages = [{ category: 'danger', message: 'No file selected or invalid file type.' }];
    await req.session.save();
    return res.redirect('/profile');
  }

  const filename = req.file.filename;
  await new Promise((resolve, reject) => {
      db.run('UPDATE users SET avatar = ? WHERE username = ?', [filename, username],async (err) => {
        if (err){
            req.session.messages = [{ category: 'danger', message: 'Database error while updating avatar.' }];
            await req.session.save();
            return res.redirect('/profile')
        } 
        resolve()
      })
    })
    req.session.messages = [{ category: 'success', message: 'Avatar updated successfully!' }];
    await req.session.save();
    return res.redirect('/profile');
  
});

module.exports = router;

```
Same as before, we use the database instead of ``local objects`` to store and retrieve user profile data. In the GET ``/profile`` route, we get the logged-in username from the session and use ``db.get('SELECT * FROM users WHERE username = ?', [username])`` to fetch the user’s information. The ``?`` acts as a placeholder that securely inserts values into the SQL query, protecting against SQL injection by treating input as data rather than executable code.

In the POST ``/profile`` route, after uploading an avatar, we update the user’s record with ``db.run('UPDATE users SET avatar = ? WHERE username = ?', [filename, username])``. Both ``db.get()`` and ``db.run()`` are wrapped in Promises so we can use async/await, making the code easier to read and manage. This approach ensures that user data is safely stored and retrieved from the database instead of being kept temporarily in memory.  
**`routes/wiki.js`**
```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const requireLogin = require('../middlewares/loginCheck.js');

const router = express.Router();

// Ensure the wiki table exists


// --- View a wiki page ---
router.get('/wiki/:pageName', async (req, res) => {
    const db = req.app.get('db');
    const pageName = req.params.pageName;
    const username = req.session.user?.username || null;

    const page = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM pages WHERE title = ?', [pageName], (err, row) => {
        if (err){
            reject(err)
            return res.redirect('/404');
            
        } 
        resolve(row)
      })
    })
 
    if (!page) {
      req.session.messages = [{ category: 'danger', message: 'This page don\'t exist' }];
      await req.session.save();
      return res.redirect('/404');
    }

    // Add an htmlContent property (same as old code)
    page.htmlContent = page.content;
    return res.render('wiki_page', { page, pageName, username, messages: [] });
  
});

// --- Create page form ---
router.get('/create', requireLogin, async (req, res) => {
  const messages = req.session.messages || [];
  const username = req.session.user?.username || null;
  const errors = req.session.errors || [];

  req.session.messages = [];
  req.session.errors = [];
  await req.session.save();

  return res.render('create_page', { username, errors, messages });
});

// --- Handle page creation ---
router.post(
  '/create',
  requireLogin,
  [
    body('title').notEmpty().withMessage('Page title is required').trim(),
    body('content').notEmpty().withMessage('Content is required')
  ],
  async (req, res) => {
    const db = req.app.get('db');
    const username = req.session.user?.username || null;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.session.errors = errors.errors;
      await req.session.save();
      return res.redirect('/create');
    }

    const { title, content } = req.body;
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO pages (title, content) VALUES (?, ?)', [title, content],async (err) => {
        if (err){
            if (err.message.includes('UNIQUE constraint failed')) {
            req.session.messages = [{ category: 'danger', message: 'A page with that title already exists!' }];
            } else {
            
            req.session.messages = [{ category: 'danger', message: 'Failed to create page.' }];
            }
          await req.session.save();
          return res.redirect('/create');
        } 
        resolve()
      })
    })
    req.session.messages = [{ category: 'success', message: 'Page created successfully!' }];
    await req.session.save();
    return res.redirect(`/wiki/${title}`);
    
  }
);

module.exports = router;
```
Finally for ``wiki.js`` file, we use the database to store and retrieve wiki pages. In the GET ``/wiki/:pageName`` route, we use ``db.get('SELECT * FROM pages WHERE title = ?', [pageName])`` to fetch the requested page from the database. The ``?`` acts as a placeholder for the page title, which keeps the query safe from SQL injection by ensuring that user input is handled as plain data, not executable SQL code.

When creating a new page in the POST ``/create route``, we use ``db.run('INSERT INTO pages (title, content) VALUES (?, ?)', [title, content])`` to insert the data into the database.  
Finally we update the `app.js` File to use the database.  
**`app.js`**
```javascript
const express = require('express');
const authRoutes = require('./routes/auth');
const  profile = require('./routes/profile');
const  wiki = require('./routes/wiki');
const notFoundHandler = require('./middlewares/404');
const Session = require('./middlewares/session');
const dbMiddleware = require('./middlewares/dbMiddleware.js');
const app = express();
const port = 3000;


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(Session)
app.use(dbMiddleware())

app.use(authRoutes);
app.use(profile);
app.use(wiki);
app.get('/', (req, res) => {
  const username = req.session.user?.username || null;
  const messages = req.session.messages || [];
  req.session.messages = [];
  return res.render('index', { username, messages });

  
});

app.use(notFoundHandler);


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```
## Refactoring with a User Class

Our SQLite-based app works well, but the current routes contain raw SQL queries, mixing database logic with request handling. This approach breaks the **DRY (Don’t Repeat Yourself)** principle and makes maintenance harder since we repeat queries like `SELECT * FROM users WHERE username = ?` in multiple places. It also couples the route logic too closely with the database structure, reducing flexibility and scalability.

To improve this, we’ll introduce `User` and `Page` classes that encapsulate all database operations. These classes will provide clean, reusable methods for actions such as creating a user, finding one by username, or managing wiki pages. By separating data access from route logic, our code becomes more organized, maintainable, and easier to extend in the future.  
### Creating the model class
We first start with creating the User class   
**``models/User.js``**
```javascript
const argon2 = require('argon2')
class User {
  static async create(db, username, password) {
    const passwordHash = await argon2.hash(password)
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash], function (err) {
        if (err) reject(err)
        resolve()
      })
    })
  }

  static async findByUsername(db, username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err)
        resolve(row)
      })
    })
  }
  static async updateAvatar(db, username, avatarFilename) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET avatar = ? WHERE username = ?',
        [avatarFilename, username],
        function (err) {
          if (err) reject(err)
          resolve()
        }
      )
    })
  }
}

module.exports = User
```
We create a `User` class to serve as a model that represents users in our application. This class provides dedicated methods for common user operations, keeping our code organized and consistent.

The `User.create(db, username, password)` method hashes the password using **Argon2**, a secure password-hashing algorithm, and then inserts the new user into the database with `db.run()`. This ensures that we never store plain-text passwords, enhancing security.

The `User.findByUsername(db, username)` method retrieves a user’s record from the database based on their username using `db.get()`. It returns the corresponding row if the user exists.  
The `User.updateAvatar(db, username, avatarFilename)` method updates the user’s avatar in the database using `db.run()`. It replaces the existing value in the `avatar` column with the new file name for the user identified by their username.  

Both methods use **Promises** to wrap the database operations, allowing us to use `async/await` for clean, readable asynchronous code.  
**`models/Page.js`**
```javascript
class Page {
  static async create(db, title, content) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO pages (title, content) VALUES (?, ?)',
        [title, content],
        function (err) {
          if (err) reject(err)
          resolve()
        }
      )
    })
  }

  static async findByTitle(db, title) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM pages WHERE title = ?', [title], (err, row) => {
        if (err) reject(err)
        resolve(row)
      })
    })
  }
}

module.exports = Page
```
The `Page.create(db, title, content)` method inserts a new wiki page into the database using `db.run()`. It safely passes the page title and content as parameters through `?` placeholders to prevent SQL injection.

The `Page.findByTitle(db, title)` method retrieves a page record from the database whose title matches the given one, using `db.get()`. If a matching page exists, it returns the row; otherwise, it returns `undefined`.

Both methods use **Promises**, allowing us to call them with `await` in routes for cleaner asynchronous handling.
### Updating Routes
Now We update our routes file to use the database models that we built.  
**`routes/auth.js`**
```javascript
const express = require('express');
const argon = require('argon2');
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/register', async (req, res) => {
    const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    req.session.errors = [];
    await req.session.save();
    res.render('register', { errors, messages  ,username });
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
    const db = req.app.get('db');
    const existingUser = await User.findByUsername(db,username);

    if (existingUser) {
      req.session.messages = [{ category: 'danger', message: 'Username already exists!' }]
      await req.session.save();
      return res.redirect('/register')
    }

    try {
      await User.create(db, username, password);
      req.session.messages = [{ category: 'success', message: 'Registration successful! Please log in.' }];
      await req.session.save();
      return res.redirect('/login');
    } catch (err) {
      req.session.messages = [{ category: 'danger', message: 'Error creating user. Please try again.' }]
      await req.session.save();
      return res.redirect('/register')
    }      
});

router.get('/login', async (req, res) => {
    const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    await req.session.save();
    return res.render('login', { errors, messages ,username,errors});
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
    const db = req.app.get('db');

    const user =  await User.findByUsername(db,username);

      if (user && await argon.verify(user.password_hash, password)) {
        req.session.user = { username };
        req.session.messages = [{ category: 'success', message: 'Login successful!' }];
        await req.session.save();
        return res.redirect('/');
      } else {
        req.session.messages = [{ category: 'danger', message: 'Invalid username or password.' }];
        await req.session.save();
        return res.redirect('/login');
      }
});


router.get('/logout',  async  (req, res) => {
    await req.session.destroy();
    return res.redirect('/login');
});

module.exports = router;
```
We can see that we removed all the complexity of raw SQL queries and replaced them with clean method calls from our `User` model. We start by importing the `User` class from our models folder, which serves as the interface for all user-related database operations. This makes the routes much simpler and easier to read.

In the **registration route**, instead of writing SQL manually, we call `User.findByUsername(db, username)` to check if a user already exists, and `User.create(db, username, password)` to add a new user. The `User` model takes care of hashing the password and inserting the data securely into the database, keeping our route focused only on validation and user feedback.

In the **login route**, we use `User.findByUsername(db, username)` again to retrieve the stored user record, then verify the password using **Argon2**. If the password matches, we create a session for the user; otherwise, we return an error message.  

**``routes/profile.js``**
```javascript
const User = require('../models/User')
const express = require('express');
const requireLogin = require('../middlewares/loginCheck.js');
const upload = require('../middlewares/upload.js');
const router = express.Router();

router.get('/profile', requireLogin, async (req, res) => {
  const username = req.session.user?.username || null;
  const db = req.app.get('db');
  const user =  await User.findByUsername(db,username);
  

    const messages = req.session.messages || [];
    req.session.messages = [];
    await req.session.save();
    return res.render('profile', { user, username, messages });
  });

router.post('/profile', requireLogin, upload.single('avatar'), async (req, res) => {
  const username = req.session.user?.username || null;
  const db = req.app.get('db');

  if (!req.file) {
    req.session.messages = [{ category: 'danger', message: 'No file selected or invalid file type.' }];
    await req.session.save();
    return res.redirect('/profile');
  }

  const filename = req.file.filename;
  try {
    await User.updateAvatar(db, username, filename);
    req.session.messages = [{ category: 'success', message: 'Avatar updated successfully!' }];
    await req.session.save();
    return res.redirect('/profile');
  } catch (err) {
    req.session.messages = [{ category: 'danger', message: 'Error updating avatar. Please try again.' }];
    await req.session.save();
    return res.redirect('/profile');
  }
  
});

module.exports = router;
```
Same as before, we start by importing the `User` model, which handles all user-related database operations. We use `User.findByUsername(db, username)` to fetch the user’s data from the database, and when we want to update the avatar, we use `User.updateAvatar(db, username, filename)` from our model to update the avatar in the database, eliminating the need for raw SQL statements.  

**`routes/wiki.js`**
```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const requireLogin = require('../middlewares/loginCheck.js');
const Page = require('../models/Page');
const router = express.Router();


router.get('/wiki/:pageName', async (req, res) => {
    const db = req.app.get('db');
    const pageName = req.params.pageName;
    const username = req.session.user?.username || null;
    const page = await Page.findByTitle(db, pageName);
 
    if (!page) {
      req.session.messages = [{ category: 'danger', message: 'This page don\'t exist' }];
      await req.session.save();
      return res.redirect('/404');
    }
    page.htmlContent = page.content;
    return res.render('wiki_page', { page, pageName, username, messages: [] });
  
});

router.get('/create', requireLogin, async (req, res) => {
  const messages = req.session.messages || [];
  const username = req.session.user?.username || null;
  const errors = req.session.errors || [];

  req.session.messages = [];
  req.session.errors = [];
  await req.session.save();

  return res.render('create_page', { username, errors, messages });
});

router.post(
  '/create',
  requireLogin,
  [
    body('title').notEmpty().withMessage('Page title is required').trim(),
    body('content').notEmpty().withMessage('Content is required')
  ],
  async (req, res) => {
    const db = req.app.get('db');
    const username = req.session.user?.username || null;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.session.errors = errors.errors;
      await req.session.save();
      return res.redirect('/create');
    }

    const { title, content } = req.body;
    try{
      await Page.create(db, title, content);
      req.session.messages = [{ category: 'success', message: 'Page created successfully!' }];
      await req.session.save();
      return res.redirect(`/wiki/${title}`);
    } catch(err){
      req.session.messages = [{ category: 'danger', message: 'Error creating page. It might already exist.' }];
      await req.session.save();
      return res.redirect('/create');
    }
     
  }
);

module.exports = router;
```
Finally for ``wiki.js`` route, we usethe `Page` model, which manages all database operations related to wiki pages. Instead of writing raw SQL queries, we now use methods from the model to handle data interactions.

We use `Page.findByTitle(db, pageName)` to retrieve a page’s content from the database and display it to the user. When creating a new page, we call `Page.create(db, title, content)` to insert the page into the database.  

We didn’t need to make any changes to the `app.js` file.

With this new structure, our code becomes much more readable, easier to maintain, and more scalable. By separating raw SQL queries from the route logic, we achieve a clear separation of concerns  our JavaScript files now focus on application flow, while the models handle all database operations in a clean and reusable way.
## Using Prisma
While the `User` class helped organize our code, we were still manually writing SQL queries, which can quickly become difficult to maintain as the application grows. Switching to another database system like PostgreSQL or MySQL would require rewriting most of those queries. Managing relationships, such as linking users to their wiki pages, also introduces extra complexity and repetitive SQL.

This is where **Prisma**, a modern **TypeScript- and JavaScript-friendly ORM**, comes in. Prisma lets us define our database structure using a clean schema file and automatically generates a powerful client for interacting with our data. Instead of writing raw SQL, we use intuitive, object-oriented methods like `prisma.user.create()` or `prisma.page.findUnique()`. This makes database operations safer, easier to read, and portable across multiple database engines, while also providing built-in validation, type safety, and relationship management.
### Updating Our Project

We’ll begin by removing the old files `models/User.js`, `models/Page.js`, and `middlewares/dbMiddleware.js`  since Prisma will handle all database interactions for us.

**Install Prisma**  
Next, we install Prisma 
```bash
npm install prisma @prisma/client
```
Now we initialize it with SQLite as our database:
```bash
npx prisma init --datasource-provider sqlite
```
This creates a new `prisma/` folder with a `schema.prisma` file where we’ll define our database models (such as `User` and `Page`), and a `.env` file that stores our database connection URL.  
**``.env``**
```bash
SESSION_SECRET=oihgahahvaaiohaehahvaai594qqfqq61
NODE_ENV=development
DATABASE_URL="file:./database.db"
```
### Define Our Prisma models
Prisma uses its own **Prisma Schema Language (PSL)** to describe the structure of our database including models, their fields, and relationships.

To create and define our models, we open the `prisma/schema.prisma` file. Here, we can define tables like `User` and `Page` as models, specifying their columns, data types, and how they relate to one another. Prisma will then use this schema to generate the corresponding database tables and a fully type-safe client for interacting with them.
**`prisma/schema.prisma`**
```prisma
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
  password_hash String   
  avatar        String?  
  pages         Page[]
}

model Page {
  id        Int      @id @default(autoincrement())
  title     String   @unique
  content   String
  authorId  Int?
  author    User?    @relation(fields: [authorId], references: [id])
}
```
This Prisma schema defines our database structure and how Prisma connects to it.

The **`datasource`** block specifies the database we’re using here, it’s SQLite, stored in a file named `database.db`.  
The **`generator`** block tells Prisma to generate a JavaScript client (`@prisma/client`), which we’ll use in our code to interact with the database.

The **`User` model** represents our users table. Each user has:
- `id`: a unique identifier that auto-increments.
- `username`: a unique string for login.
- `password_hash`: the hashed password.
- `avatar`: an optional string field for storing the avatar filename.
- `pages`: a one-to-many relation showing that each user can have multiple pages.

The **`Page` model** represents wiki pages. Each page has:
- `id`: a unique, auto-incrementing identifier.
- `title`: a unique string for the page title.
- `content`: the page’s text content.
- `authorId`: a foreign key linking the page to its author.
- `author`: a relation connecting the page back to its corresponding user (`User`).
    

Together, these models define a **one-to-many relationship**  one `User` can have many `Page` entries  while Prisma automatically manages the relationships and underlying foreign keys for us.    

After defining our Prisma models, run the following command to create the database and apply the initial schema:
```bash
npx prisma migrate dev --name init
```
This command:

- Creates a new SQLite database file (if it doesn’t exist).
- Applies our schema changes (models) as a migration.
- Generates the Prisma client, which we can import and use in our Node.js app.

### Updating The routes
Now we update the routes to work prisma.  
**``routes/auth.js``**
```javascript
const express = require('express');
const argon = require('argon2');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/register', async (req, res) => {
    const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    req.session.errors = [];
    await req.session.save();
    res.render('register', { errors, messages  ,username });
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
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      req.session.messages = [{ category: 'danger', message: 'Username already exists!' }]
      await req.session.save();
      return res.redirect('/register')
    }

    try {
      const password_hash = await argon.hash(password)
      await prisma.user.create({
      data: { username, password_hash },
    });
      req.session.messages = [{ category: 'success', message: 'Registration successful! Please log in.' }];
      await req.session.save();
      return res.redirect('/login');
    } catch (err) {
      req.session.messages = [{ category: 'danger', message: 'Error creating user. Please try again.' }]
      await req.session.save();
      return res.redirect('/register')
    }      
});

router.get('/login', async (req, res) => {
    const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    await req.session.save();
    return res.render('login', { errors, messages ,username,errors});
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
    const user = await prisma.user.findUnique({
      where: { username },
    });

      if (user && await argon.verify(user.password_hash, password)) {
        req.session.user = { username };
        req.session.messages = [{ category: 'success', message: 'Login successful!' }];
        await req.session.save();
        return res.redirect('/');
      } else {
        req.session.messages = [{ category: 'danger', message: 'Invalid username or password.' }];
        await req.session.save();
        return res.redirect('/login');
      }
});


router.get('/logout',  async  (req, res) => {
    await req.session.destroy();
    return res.redirect('/login');
});

module.exports = router;
```
We now use **Prisma** as our database layer instead of manually writing SQL queries or using custom models. Prisma automatically generates a **client** (`@prisma/client`) based on the schema we defined earlier, giving us a clean, type-safe API to interact with the database.

We first import `PrismaClient` using `const { PrismaClient } = require('@prisma/client');` then we create client object with `const prisma = new PrismaClient();` ,after that we use `prisma.user.findUnique()` to check if a username already exists, and `prisma.user.create()` to add new users. Prisma handles table creation, data mapping, and relationships behind the scenes making the code more concise, consistent, and easier to maintain as the app grows.  

**``routes/profile.js``**
```javascript
const express = require('express');
const requireLogin = require('../middlewares/loginCheck.js');
const upload = require('../middlewares/upload.js');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// --- Profile page ---
router.get('/profile', requireLogin, async (req, res) => {
  const username = req.session.user?.username || null;
  const user= await prisma.user.findUnique({
      where: { username },
    });

    const messages = req.session.messages || [];
    req.session.messages = [];
    await req.session.save();
    return res.render('profile', { user, username, messages });
  });


// --- Avatar upload ---
router.post('/profile', requireLogin, upload.single('avatar'), async (req, res) => {
  const username = req.session.user?.username || null;
  

  if (!req.file) {
    req.session.messages = [{ category: 'danger', message: 'No file selected or invalid file type.' }];
    await req.session.save();
    return res.redirect('/profile');
  }

  const filename = req.file.filename;
  try {
    await prisma.user.update({
      where: { username },
      data: { avatar: filename },
    });
    req.session.messages = [{ category: 'success', message: 'Avatar updated successfully!' }];
    await req.session.save();
    return res.redirect('/profile');
  } catch (err) {
    req.session.messages = [{ category: 'danger', message: 'Error updating avatar. Please try again.' }];
    await req.session.save();
    return res.redirect('/profile');
  }
  
});

module.exports = router;
```
We updated our profile route to use **Prisma** instead of the custom `User` model. again `prisma.user.findUnique()` retrieves the user’s data, and `prisma.user.update()` updates the avatar in the database.  

**``routes/wiki.js``**
```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const requireLogin = require('../middlewares/loginCheck.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

router.get('/wiki/:pageName', async (req, res) => {
    const pageName = req.params.pageName;
    const username = req.session.user?.username || null;

    const page =  await prisma.page.findUnique({
      where: { title: pageName },
      include: { author: true }, 
    })
    if (!page) {
      req.session.messages = [{ category: 'danger', message: 'This page don\'t exist' }];
      await req.session.save();
      return res.redirect('/404');
    }

    // Add an htmlContent property (same as old code)
    page.htmlContent = page.content;
    return res.render('wiki_page', { page, pageName, username, messages: [] });
  
});

// --- Create page form ---
router.get('/create', requireLogin, async (req, res) => {
  const messages = req.session.messages || [];
  const username = req.session.user?.username || null;
  const errors = req.session.errors || [];

  req.session.messages = [];
  req.session.errors = [];
  await req.session.save();

  return res.render('create_page', { username, errors, messages });
});

// --- Handle page creation ---
router.post(
  '/create',
  requireLogin,
  [
    body('title').notEmpty().withMessage('Page title is required').trim(),
    body('content').notEmpty().withMessage('Content is required')
  ],
  async (req, res) => {
    const username = req.session.user?.username || null;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.session.errors = errors.errors;
      await req.session.save();
      return res.redirect('/create');
    }

    const { title, content } = req.body;
    try{
      const user = await prisma.user.findUnique({where: { username },});

      await prisma.page.create({
        data: {
          title,
          content,
          author: user ? { connect: { id: user.id } } : undefined,
        },
      });
      req.session.messages = [{ category: 'success', message: 'Page created successfully!' }];
      await req.session.save();
      return res.redirect(`/wiki/${title}`);
    } catch(err){
      console.error(err);
      req.session.messages = [{ category: 'danger', message: 'Error creating page. It might already exist.' }];
      await req.session.save();
      return res.redirect('/create');
    }
    
    
  }
);

module.exports = router;

```
Finally for the `wiki.js` file. When a user visits a wiki page, `prisma.page.findUnique()` searches the database for a page with the given title and automatically includes the related author data thanks to the `include: { author: true }` option. This makes it easy to fetch both the page content and its creator in a single, clean query.

When creating a new page, we use `prisma.user.findUnique()` to get the currently logged-in user and then call `prisma.page.create()` to insert the new page into the database. Prisma’s relational mapping lets us directly connect the new page to its author using `{ connect: { id: user.id } }`  no need to manually manage foreign keys or write SQL statements.
### Updating The app.js file
Now we do finall update on the `app.js` file, we remove the use of the ``dbMiddleware``    
**``app.js``**
```javascript
const express = require('express');
const authRoutes = require('./routes/auth');
const  profile = require('./routes/profile');
const  wiki = require('./routes/wiki');
const notFoundHandler = require('./middlewares/404');
const Session = require('./middlewares/session');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(Session)

app.use(authRoutes);
app.use(profile);
app.use(wiki);
app.get('/', (req, res) => {
  const username = req.session.user?.username || null;
  const messages = req.session.messages || [];

  res.render('index', { username, messages });

  req.session.messages = [];
});

app.use(notFoundHandler);
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```

### Using Controllers
As your Express.js app grows, you’ll quickly notice that the **route files become cluttered** with many endpoints and all their logic written directly inside the same file. This makes it harder to debug, update, or extend functionality, especially when multiple routes share similar operations. To solve this, we introduce a controllers folder. Each controller file groups functions that handle specific endpoints for a given resource (e.g., users, wikis, or profiles). For example, `Profile.js` can contain `getProfile`and `updateProfile` functions, each responsible for one endpoint’s logic. Then, the route file simply maps HTTP requests to these controller functions. This separation of concerns keeps the project clean, modular, and easier to maintain when an issue arises, you’ll immediately know where to look: in the controller that handles that specific route.