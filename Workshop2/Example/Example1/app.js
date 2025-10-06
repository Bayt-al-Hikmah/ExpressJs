const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;
// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
// Use routes
app.use('/', require('./routes/index'));


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});