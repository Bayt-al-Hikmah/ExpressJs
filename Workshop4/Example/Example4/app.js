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