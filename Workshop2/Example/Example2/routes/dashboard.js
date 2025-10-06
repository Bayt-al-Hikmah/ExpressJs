const express = require('express');
const router = express.Router();

router.get('/dashboard/:status', (req, res) => {
    res.render('dashboard', { userStatus: req.params.status });
});

module.exports = router;