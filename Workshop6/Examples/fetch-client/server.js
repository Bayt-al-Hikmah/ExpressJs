const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const items = [{ id: 1, title: 'Intro to APIs' }, { id: 2, title: 'Using Fetch' }];

app.get('/api/items', (req, res) => res.json({ data: { items } }));
app.post('/api/items', (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!title) return res.status(400).json({ message: 'Title is required.' });
  const item = { id: items.length + 1, title };
  items.push(item);
  res.status(201).json({ data: { item } });
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
