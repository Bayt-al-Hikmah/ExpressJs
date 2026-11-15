const express = require('express');
const router = express.Router();

router.get('/contact', (req, res) => {
  res.render('contact', { errors: [], values: { name: '', message: '' }, submittedName: null, title: 'Contact Us' });
});

router.post('/contact', (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  const errors = [];
  if (!name) errors.push('Name is required.');
  else if (name.length < 3 || name.length > 25) errors.push('Name must be between 3 and 25 characters.');
  if (!message) errors.push('Message is required.');
  else if (message.length > 200) errors.push('Message must not exceed 200 characters.');
  if (errors.length > 0) {
    return res.status(400).render('contact', { errors, values: { name, message }, submittedName: null, title: 'Contact Us' });
  }
  console.log(`Received message from ${name}: ${message}`);
  res.render('contact', { errors: [], values: { name: '', message: '' }, submittedName: name, title: 'Contact Us' });
});

module.exports = router;
