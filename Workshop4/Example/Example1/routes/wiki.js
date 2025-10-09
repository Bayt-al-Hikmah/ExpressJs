const express = require('express');
const { body, validationResult } = require('express-validator');
const requireLogin = require('../middlewares/loginCheck.js');

const router = express.Router();

router.get('/wiki/:pageName', async (req, res) => {
    const pageName = req.params.pageName;
    const page = req.app.locals.pages[pageName];
    const username = req.session.user?.username || null;
    if (!page) {
      req.session.messages = [{ category: 'danger', message: 'This page don\'t exist' }];
      await req.session.save();
      return res.redirect('/404');
    }
    page.htmlContent = page.content;
    return res.render('wiki_page', { page, pageName, username: username, messages: [] });
});

router.get('/create', requireLogin, async (req, res) => {
     const messages = req.session.messages || [];
    const username = req.session.user?.username || null
    const errors = req.session.errors || []
    req.session.messages = [];
    req.session.errors = [];
    return res.render('create_page', { username, errors, messages });
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
    return res.redirect(`/wiki/${title}`);
});
module.exports = router;