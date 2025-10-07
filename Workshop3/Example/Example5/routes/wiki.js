const express = require('express');
const { body, validationResult } = require('express-validator');
const requireLogin = require('../middlewares/loginCheck.js');

const router = express.Router();

router.get('/wiki/:pageName', (req, res) => {
    const pageName = req.params.pageName;
    const page = req.app.locals.pages[pageName];
    const username = req.session.user?.username || null;
    if (!page) {
        return res.status(404).render('404', { username: username, messages: [] });
    }
    page.htmlContent = page.content;
    res.render('wiki_page', { page, pageName, username: username, messages: [] });
});

router.get('/create', requireLogin, async (req, res) => {
    const username = req.session.user?.username || null;
    req.session.messages = [];
    await req.session.save();
    res.render('create_page', { username: username, errors: [], messages: req.session.messages || [] });
});

router.post('/create', requireLogin, [
    body('title').notEmpty().withMessage('Page title is required').trim(),
    body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
    const username = req.session.user?.username || null;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array().map(err => ({ category: 'danger', message: err.msg }));
        await req.session.save();
        return res.redirect('/create');
    }
    const { title, content } = req.body;
    req.app.locals.pages[title] = { content, author: username};
    res.redirect(`/wiki/${title}`);
});
module.exports = router;