const express = require('express');
const { body, validationResult } = require('express-validator');
const requireLogin = require('../middlewares/loginCheck.js');

const router = express.Router();

// Ensure the wiki table exists


// --- View a wiki page ---
router.get('/wiki/:pageName', async (req, res) => {
    const db = req.app.get('db');
    const pageName = req.params.pageName;
    const username = req.session.user?.username || null;

    const page = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM pages WHERE title = ?', [pageName], (err, row) => {
        if (err){
            reject(err)
            return res.redirect('/404');
            
        } 
        resolve(row)
      })
    })
 
    if (!page) {
      req.session.messages = [{ category: 'danger', message: 'This page don\'t exist' }];
      await req.session.save();
      return res.redirect('/404');
    }

    // Add an htmlContent property (same as old code)
    page.htmlContent = page.content;
    return res.render('wiki_page', { page, pageName, username, messages: [] });
  
});

// --- Create page form ---
router.get('/create', requireLogin, async (req, res) => {
  const messages = req.session.messages || [];
  const username = req.session.user?.username || null;
  const errors = req.session.errors || [];

  req.session.messages = [];
  req.session.errors = [];
  await req.session.save();

  return res.render('create_page', { username, errors, messages });
});

// --- Handle page creation ---
router.post(
  '/create',
  requireLogin,
  [
    body('title').notEmpty().withMessage('Page title is required').trim(),
    body('content').notEmpty().withMessage('Content is required')
  ],
  async (req, res) => {
    const db = req.app.get('db');
    const username = req.session.user?.username || null;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.session.errors = errors.errors;
      await req.session.save();
      return res.redirect('/create');
    }

    const { title, content } = req.body;
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO pages (title, content) VALUES (?, ?)', [title, content],async (err) => {
        if (err){
            if (err.message.includes('UNIQUE constraint failed')) {
            req.session.messages = [{ category: 'danger', message: 'A page with that title already exists!' }];
            } else {
            
            req.session.messages = [{ category: 'danger', message: 'Failed to create page.' }];
            }
          await req.session.save();
          return res.redirect('/create');
        } 
        resolve()
      })
    })
    req.session.messages = [{ category: 'success', message: 'Page created successfully!' }];
    await req.session.save();
    return res.redirect(`/wiki/${title}`);
    
  }
);

module.exports = router;
