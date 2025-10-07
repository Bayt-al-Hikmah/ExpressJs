require('dotenv').config();
const express = require('express');
const { getIronSession } = require('iron-session');
const authRoutes = require('./routes/auth');
const wiki = require('./routes/wiki');
const profile = require('./routes/profile');
const notFoundHandler = require('./middlewares/404');

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

app.use(notFoundHandler);


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
