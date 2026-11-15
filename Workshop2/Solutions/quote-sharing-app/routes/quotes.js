const express = require('express');
const { body, validationResult } = require('express-validator');
const { csrfSync } = require('csrf-sync');

const router = express.Router();
const { generateToken, csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => req.body._csrf
});

// In-memory storage (resets on server restart)
const quotes = [];

router.get('/', (req, res) => {
  const recentQuotes = [...quotes].reverse().slice(0, 20);
  res.render('home', { title: 'Home', quotes: recentQuotes });
});

router.get('/share', (req, res) => {
  res.render('share', {
    title: 'Share a Quote',
    csrfToken: generateToken(req),
    errors: [],
    values: { author: '', content: '' },
    submittedName: null
  });
});

router.post('/share',
  csrfSynchronisedProtection,
  [
    body('author').trim().notEmpty().withMessage('Author name is required.').bail()
      .isLength({ min: 3 }).withMessage('Author name must contain at least 3 characters.'),
    body('content').trim().notEmpty().withMessage('Quote text is required.').bail()
      .isLength({ max: 300 }).withMessage('Quote text must not exceed 300 characters.')
  ],
  (req, res) => {
    const errors = validationResult(req);
    const values = {
      author: typeof req.body.author === 'string' ? req.body.author : '',
      content: typeof req.body.content === 'string' ? req.body.content : ''
    };

    if (!errors.isEmpty()) {
      return res.status(400).render('share', {
        title: 'Share a Quote',
        csrfToken: generateToken(req),
        errors: errors.array(),
        values,
        submittedName: null
      });
    }

    quotes.push({ author: values.author, content: values.content, createdAt: new Date() });
    res.render('share', {
      title: 'Share a Quote',
      csrfToken: generateToken(req),
      errors: [],
      values: { author: '', content: '' },
      submittedName: values.author
    });
  }
);

router.get('/search', (req, res) => {
  const author = typeof req.query.author === 'string' ? req.query.author.trim() : '';
  let results = [];
  let searched = false;

  if (author) {
    searched = true;
    const term = author.toLowerCase();
    results = quotes.filter(q => q.author.toLowerCase().includes(term));
  } else if (req.query.author !== undefined) {
    searched = true;
  }

  res.render('search', { title: 'Search Quotes', author, quotes: results, searched });
});

module.exports = router;
