const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const requireLogin = (req, res, next) => {
    const username = req.session.user?.username || null;
    if (!username) {
        req.session.messages = [{ category: 'danger', message: 'You must be logged in to access this page.' }];
        return res.redirect('/login');
    }
    next();
};

const upload = multer({
    dest: 'public/avatars/',
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

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