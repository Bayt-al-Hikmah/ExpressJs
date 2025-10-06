const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');


router.get('/', (req, res) => {
    res.render('search', { errors: [],csrfToken: req.csrfToken(), Quotes: []});
});


router.post('/',[
    body('author').notEmpty().withMessage('Name is required').trim().isLength({ min: 3,max:25}).withMessage('Name must be 3-25 characters')
], (req, res) => {
    const { author } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('search', { errors: errors.array(), csrfToken: req.csrfToken(), Quotes: []});
    }
    const Quotes =  req.app.locals.QuotesDB.filter(quote => quote.author.toLowerCase().includes(author.toLowerCase()));
    return res.render('search', { errors: errors.array(), csrfToken: req.csrfToken(), Quotes: Quotes});
});

module.exports = router;