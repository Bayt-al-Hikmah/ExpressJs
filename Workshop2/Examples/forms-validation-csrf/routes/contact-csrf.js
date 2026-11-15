const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/contact_csrf', (req, res) => {
  const { generateToken } = req.app.locals.csrf;
  res.render('contact_csrf', { errors: [], csrfToken: generateToken(req), values: { name: '', email: '', message: '' }, submittedName: null, title: 'CSRF Protected Contact Form' });
});

router.post('/contact_csrf',
  (req, res, next) => req.app.locals.csrf.csrfSynchronisedProtection(req, res, next),
  [
    body('name').trim().notEmpty().withMessage('Name is required.').bail().isLength({ min: 3, max: 25 }).withMessage('Name must be between 3 and 25 characters.'),
    body('email').trim().notEmpty().withMessage('Email is required.').bail().isEmail().withMessage('Invalid email format.').normalizeEmail(),
    body('message').trim().notEmpty().withMessage('Message is required.').bail().isLength({ min: 10, max: 200 }).withMessage('Message must be between 10 and 200 characters.')
  ],
  (req, res) => {
    const { generateToken } = req.app.locals.csrf;
    const errors = validationResult(req);
    const values = {
      name: typeof req.body.name === 'string' ? req.body.name : '',
      email: typeof req.body.email === 'string' ? req.body.email : '',
      message: typeof req.body.message === 'string' ? req.body.message : ''
    };
    if (!errors.isEmpty()) {
      return res.status(400).render('contact_csrf', { errors: errors.array(), csrfToken: generateToken(req), values, submittedName: null, title: 'CSRF Protected Contact Form' });
    }
    console.log(`Received message from ${req.body.name} (${req.body.email}): ${req.body.message}`);
    res.render('contact_csrf', { errors: [], csrfToken: generateToken(req), values: { name: '', email: '', message: '' }, submittedName: req.body.name, title: 'CSRF Protected Contact Form' });
  }
);

module.exports = router;
