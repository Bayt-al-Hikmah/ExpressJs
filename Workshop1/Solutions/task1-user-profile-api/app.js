const express = require('express');

const app = express();
const port = 3000;

const usersDb = {
  alice: { username: 'Alice', email: 'alice@example.com', role: 'admin' },
  bob: { username: 'Bob', email: 'bob@example.com', role: 'member' }
};

app.get('/api/profile/:username', (req, res) => {
  const key = req.params.username.toLowerCase();
  const user = usersDb[key];

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (req.query.details === 'true') {
    return res.json({ username: user.username, email: user.email, role: user.role });
  }

  res.json({ username: user.username });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
