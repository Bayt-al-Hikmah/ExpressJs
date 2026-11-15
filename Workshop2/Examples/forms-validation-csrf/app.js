const express = require('express');
const path = require('path');
const session = require('express-session');
const { csrfSync } = require('csrf-sync');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false }
}));

const { generateToken, csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => req.body._csrf
});
app.locals.csrf = { generateToken, csrfSynchronisedProtection };

app.use('/', require('./routes/contact'));
app.use('/', require('./routes/contact-validation'));
app.use('/', require('./routes/contact-csrf'));

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Invalid or missing CSRF token. Please reload the form and try again.');
  }
  console.error(err);
  res.status(500).send('Something went wrong on the server.');
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
