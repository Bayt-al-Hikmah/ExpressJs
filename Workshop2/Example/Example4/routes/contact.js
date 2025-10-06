const express = require('express');
const router = express.Router();

// GET route to display the contact form
router.get('/contact', (req, res) => {
    res.render('contact', { submittedName: null });
});

// POST route to handle form submission
router.post('/contact', (req, res) => {
    const name = req.body.name;
    const message = req.body.message;
    console.log(`Received message from ${name}: ${message}`);
    res.render('contact', { submittedName: name });
});

module.exports = router;