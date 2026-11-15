const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.render('index', { name: 'Alice' }));

app.get('/profile/:username', (req, res) => {
  const user = {
    username: req.params.username,
    bio: 'Loves coding in JavaScript and exploring new technologies.',
    shoppingList: ['Apples', 'Oranges', 'Bananas']
  };
  res.render('profile', { user });
});

app.get('/dashboard/:status', (req, res) => {
  res.render('dashboard', { userStatus: req.params.status });
});

app.get('/tasks', (req, res) => {
  const tasks = ['Buy groceries', 'Finish Express workshop', 'Go for a run'];
  res.render('tasks', { tasks });
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
