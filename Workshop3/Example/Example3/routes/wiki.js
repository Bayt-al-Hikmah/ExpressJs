const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const requireLogin = async (req, res, next) => {
    const username = req.session.user?.username || null;
    if (!username) {
        req.session.messages = [{ category: 'danger', message: 'You must be logged in to access this page.' }];
        await req.session.save();
        return res.redirect('/login');
    }
    next();
};

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
    const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    req.session.errors = [];
    await req.session.save();
    res.render('create_page', { username, errors, messages});
});

router.post('/create', requireLogin, [
    body('title').notEmpty().withMessage('Page title is required').trim(),
    body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
    const username = req.session.user?.username || null;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.errors;
        await req.session.save();
        return res.redirect('/create');
    }
    const { title, content } = req.body;
    req.app.locals.pages[title] = { content, author: username};
    res.redirect(`/wiki/${title}`);
});
module.exports = router;