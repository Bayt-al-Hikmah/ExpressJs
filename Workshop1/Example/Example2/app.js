const express = require('express');
const app = express();
const port = 3000;

// Define a route for the root URL ('/')
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.get('/user/:username', (req, res) => {
    const username = req.params.username;
    res.send(`Hello, ${username}!`);
});

app.get('/search', (req, res) => {
    const query = req.query.query;
    if (query) {
        res.send(`You are searching for: ${query}`);
    } else {
        res.send('Please provide a search query.');
    }
});
// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});