require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const pool = require('./db/pool');

const app = express();
const PORT = 3000;

if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET is required.');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 }
}));

app.use('/', require('./routes/quotes'));

app.use((req, res) => res.status(404).render('404', { title: 'Page Not Found', url: req.originalUrl }));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.code === 'EBADCSRFTOKEN') return res.status(403).render('error', { title: 'Invalid Submission', message: 'Invalid or missing CSRF token. Please reload and try again.' });
  console.error(err);
  res.status(500).render('error', { title: 'Server Error', message: 'Something went wrong while processing your request.' });
});

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected successfully!');
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error('Unable to connect to PostgreSQL:', error.message);
    process.exit(1);
  }
}

startServer();
