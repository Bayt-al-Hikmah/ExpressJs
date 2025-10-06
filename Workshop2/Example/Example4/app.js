const express = require('express');
const app = express();
const path = require('path');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));  // To parse URL-encoded form data

const csrfProtection = csrf({ cookie: true });
app.use(cookieParser());
app.use(csrfProtection);



app.use('/', require('./routes/contact'));
app.use('/', require('./routes/contact_val'));
app.use('/', require('./routes/contact_csrf'));
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});