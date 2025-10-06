const express = require('express');
const app = express();
const port = 3000;

const profiles = {
  Alice: { username: "Alice", email: "alice@example.com", role: "admin" },
  Bob: { username: "Bob", email: "bob@example.com", role: "user" },
  Carol: { username: "Carol", email: "carol@example.com", role: "moderator" },
  Dave: { username: "Dave", email: "dave@example.com", role: "user" },
};


app.get('/api/profile/:username', (req, res) => {
    const profile = profiles[req.params.username];
    const details = req.query.details;
    if (!profile) {
        return res.status(404).json({ error: 'Product not found' });
    }else if(details === 'true'){
        return res.status(200).json(profile);
    }
    return res.status(200).json({ username: profile.username });
    
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});