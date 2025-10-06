const express = require('express');
const router = express.Router();

const { body, validationResult } = require('express-validator');


router.get('/', (req, res) => {
    res.render('share', { errors: [],csrfToken: req.csrfToken()});
});

// POST route to handle form submission
router.post('/',[
    body('author').notEmpty().withMessage('Name is required').trim().isLength({ min: 3,max:25}).withMessage('Name must be 3-25 characters'),
    body('quote').notEmpty().withMessage('Quote is required').trim().isLength({ max: 300 }).withMessage('Quote must be under 300 characters')
], (req, res) => {
    const { author, quote } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('share', { errors: errors.array(), csrfToken: req.csrfToken()});
    }
     req.app.locals.QuotesDB.push({ author, quote });
    return res.redirect('/');
});

module.exports = router;