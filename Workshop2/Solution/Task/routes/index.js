const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    Quotes = req.app.locals.QuotesDB;
    res.render('index',{ Quotes: Quotes });
});

module.exports = router;