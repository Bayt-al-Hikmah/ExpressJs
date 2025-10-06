const express = require('express');
const router = express.Router();

router.get('/profile/:name', (req, res) => {
    const userDetails = {
        username: req.params.name,
        bio: 'Loves coding in JavaScript and exploring new technologies.',
        shoppingList: ['Apples', 'Oranges', 'Bananas']
    };
    res.render('profile', { user: userDetails });
});

module.exports = router;