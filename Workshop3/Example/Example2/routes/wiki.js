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

router.get('/wiki/:pageName', async (req, res) => {
    const { marked } = await import('marked');
    const pageName = req.params.pageName;
    const page = req.app.locals.pages[pageName];
    const username = req.session.user?.username || null;
    if (!page) {
        return res.status(404).render('404', { username: username, messages: [] });
    }
    page.htmlContent = page.isMarkdown ? marked(page.content) : page.content;
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
    req.app.locals.pages[title] = { content, author: username, isMarkdown: true };
    res.redirect(`/wiki/${title}`);
});

module.exports = router;