const express = require('express');
const requireLogin = require('../middlewares/loginCheck.js');
const upload = require('../middlewares/upload.js');

const router = express.Router();



router.get('/profile', requireLogin, async (req, res) => {
    const username = req.session.user?.username || null;
    const user = req.app.locals.users[username];
    await req.session.save();
    req.session.messages = [];
    res.render('profile', { user, username: username, messages: req.session.messages || [] });
});

router.post('/profile', requireLogin, upload.single('avatar'), async (req, res) => {
    const username = req.session.user?.username || null;
    if (!req.file) {
        req.session.messages = [{ category: 'danger', message: 'No file selected or invalid file type.' }];
        await req.session.save();
        return res.redirect('/profile');
    }
    const filename = req.file.filename;
    req.app.locals.users[username].avatar = filename;
    req.session.messages = [{ category: 'success', message: 'Avatar updated!' }];
    await req.session.save();
    res.redirect('/profile');
});

module.exports = router;