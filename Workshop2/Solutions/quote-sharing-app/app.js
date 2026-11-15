const express = require('express');
const path = require('path');
const session = require('express-session');

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
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }
}));

app.use('/', require('./routes/quotes'));

app.use((req, res) => res.status(404).send('Page not found'));

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
