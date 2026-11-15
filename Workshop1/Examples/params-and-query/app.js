const express = require('express');

const app = express();
const port = 3000;

app.get('/user/:username', (req, res) => {
  const { username } = req.params;
  res.send(`Hello, ${username}!`);
});

app.get('/search', (req, res) => {
  const searchTerm = req.query.query;

  if (searchTerm) {
    return res.json({ message: `You are searching for: ${searchTerm}` });
  }

  res.json({ message: 'Please provide a search query.' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
