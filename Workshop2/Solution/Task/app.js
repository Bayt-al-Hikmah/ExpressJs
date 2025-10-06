const express = require('express');
const path = require('path');
const app = express();
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const port = 3000;
const csrfProtection = csrf({ cookie: true });

// Storing quotes in memory for simplicity
app.locals.QuotesDB = [];

// Middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.use(csrfProtection);


// Use routes
app.use('/', require('./routes/index'));
app.use('/share',require('./routes/share'));
app.use('/search',require('./routes/search'));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});