const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/contact_val', (req, res) => {
  res.render('contact_val', { errors: [], values: { name: '', email: '', message: '' }, submittedName: null, title: 'Validated Contact Form' });
});

router.post('/contact_val', [
  body('name').trim().notEmpty().withMessage('Name is required.').bail().isLength({ min: 3, max: 25 }).withMessage('Name must be between 3 and 25 characters.'),
  body('email').trim().notEmpty().withMessage('Email is required.').bail().isEmail().withMessage('Invalid email format.').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Message is required.').bail().isLength({ max: 200 }).withMessage('Message must not exceed 200 characters.')
], (req, res) => {
  const errors = validationResult(req);
  const values = {
    name: typeof req.body.name === 'string' ? req.body.name : '',
    email: typeof req.body.email === 'string' ? req.body.email : '',
    message: typeof req.body.message === 'string' ? req.body.message : ''
  };
  if (!errors.isEmpty()) {
    return res.status(400).render('contact_val', { errors: errors.array(), values, submittedName: null, title: 'Validated Contact Form' });
  }
  console.log(`Received from ${req.body.name} (${req.body.email}): ${req.body.message}`);
  res.render('contact_val', { errors: [], values: { name: '', email: '', message: '' }, submittedName: req.body.name, title: 'Validated Contact Form' });
});

module.exports = router;
