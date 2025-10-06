const express = require('express');
const router = express.Router();

const { body, validationResult } = require('express-validator');


// GET route to show the contact form
router.get('/contact_csrf', (req, res) => {
    res.render('contact_csrf', { errors: [],csrfToken: req.csrfToken(), submittedName: null });
});

// POST route to handle form submission
router.post('/contact_csrf',[
    body('name').notEmpty().withMessage('Name is required').trim().isLength({ min: 3, max: 25 }).withMessage('Name must be 3-25 characters'),
    body('message').notEmpty().withMessage('Message is required').trim().isLength({min: 10, max: 200 }).withMessage('Message must be under 200 characters'),
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail()
], (req, res) => {
    const { name, message } = req.body;
    console.log(`Received message from ${name}: ${message}`);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('contact_csrf', { errors: errors.array(), csrfToken: req.csrfToken(), submittedName: null });
    }
    res.render('contact_csrf', { errors:[], csrfToken: req.csrfToken(), submittedName: name });
});

module.exports = router;