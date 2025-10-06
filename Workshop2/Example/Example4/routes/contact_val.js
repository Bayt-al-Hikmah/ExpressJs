const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
// GET route to display the contact form
router.get('/contact_val', (req, res) => {
    res.render('contact_val', { errors: [], submittedName: null });
});

// POST route to handle form submission
router.post('/contact_val', [
    body('name').notEmpty().withMessage('Name is required').trim().isLength({ min: 3, max: 25 }).withMessage('Name must be 3-25 characters'),
    body('message').notEmpty().withMessage('Message is required').trim().isLength({ max: 200 }).withMessage('Message must be under 200 characters'),
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('contact_val', { errors: errors.array(), submittedName: null });
    }
    const { name, message } = req.body;
    console.log(`Received from ${name}: ${message}`);
    res.render('contact_val', { errors: [], submittedName: name });
});

module.exports = router;