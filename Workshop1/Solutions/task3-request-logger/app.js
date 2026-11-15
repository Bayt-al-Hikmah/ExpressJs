const express = require('express');

const app = express();
const port = 3000;

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Home page');
});

app.get('/api/books/:bookId', (req, res) => {
  res.json({ bookId: req.params.bookId });
});

app.get('/api/profile/:username', (req, res) => {
  res.json({ username: req.params.username });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
