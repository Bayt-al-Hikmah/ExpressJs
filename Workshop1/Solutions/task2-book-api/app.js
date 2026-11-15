const express = require('express');

const app = express();
const port = 3000;

const booksDb = {
  '201': { id: '201', title: 'Clean Code', author: 'Robert C. Martin', price: 35 },
  '202': { id: '202', title: 'The Pragmatic Programmer', author: 'Andrew Hunt, David Thomas', price: 42 }
};

app.get('/api/books/:bookId', (req, res) => {
  const { bookId } = req.params;
  const book = booksDb[bookId];

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  if (req.query.summary === 'true') {
    return res.json({ title: book.title, author: book.author });
  }

  res.json(book);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
