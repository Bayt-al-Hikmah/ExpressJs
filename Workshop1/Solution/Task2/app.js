const express = require('express');
const app = express();
const port = 3000;

const books = {
    '201': { id: '201', title: 'Clean Code', author: 'Robert C. Martin', price: 35 },
    '202': { id: '202', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', price: 45 },
    '203': { id: '203', title: 'Design Patterns', author: 'Erich Gamma', price: 55 }
};


app.get('/api/books/:bookId', (req, res) => {


    const bookIdId = req.params.bookId;
    const book = books[bookIdId];
    const summary = req.query.summary === 'true';
    if (!book) {
        return res.status(404).json({ error: 'Product not found' });
    }else if(summary){
        return res.json({ title: book.title ,author: book.author});
    }

    res.json(book);

});
// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});