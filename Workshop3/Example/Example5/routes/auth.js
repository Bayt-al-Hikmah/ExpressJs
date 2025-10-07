const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/register', (req, res) => {
    
    req.session.messages = [];
    res.render('register', { errors: [], messages: req.session.messages || [] ,username: req.session.user?.username || null});
});

router.post('/register', [
    body('username').notEmpty().withMessage('Username is required').trim().isLength({ min: 3, max: 25 }),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array().map(err => ({ category: 'danger', message: err.msg }));
        await req.session.save();
        return res.redirect('/register');
    }

    const { username, password } = req.body;
    if (req.app.locals.users[username]) {
        req.session.messages = [{ category: 'danger', message: 'Username already exists!' }];
        await req.session.save();
        return res.redirect('/register');
    }

    req.app.locals.users[username] = { password, avatar: null };
    req.session.messages = [{ category: 'success', message: 'Registration successful! Please log in.' }];
    await req.session.save();
    res.redirect('/login');
});

router.get('/login', async (req, res) => {
      const messages = req.session.messages || [];
      req.session.messages = [];
      await req.session.save();
      res.render('login', { errors: [], messages ,username: req.session.user?.username || null});
});

router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array().map(err => ({ category: 'danger', message: err.msg }));
        await req.session.save();
        return res.redirect('/login');
    }

    const { username, password } = req.body;
    const user = req.app.locals.users[username];
    if (user && user.password === password) {
        req.session.user = { username };
        req.session.messages = [{ category: 'success', message: 'Login successful!' }];
        await req.session.save();
        res.redirect('/');
    } else {
        req.session.messages = [{ category: 'danger', message: 'Invalid username or password.' }];
        await req.session.save();
        res.redirect('/login');
    }
});

router.get('/logout',  async  (req, res) => {
    await req.session.destroy();
    res.redirect('/login');
});

module.exports = router;