const express = require('express');
const { body, validationResult } = require('express-validator');
const requireLogin = require('../middlewares/loginCheck.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

router.get('/wiki/:pageName', async (req, res) => {
    const pageName = req.params.pageName;
    const username = req.session.user?.username || null;

    const page =  await prisma.page.findUnique({
      where: { title: pageName },
      include: { author: true }, 
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
    const username = req.session.user?.username || null;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.session.errors = errors.errors;
      await req.session.save();
      return res.redirect('/create');
    }

    const { title, content } = req.body;
    try{
      const user = await prisma.user.findUnique({where: { username },});

      await prisma.page.create({
        data: {
          title,
          content,
          author: user ? { connect: { id: user.id } } : undefined,
        },
      });
      req.session.messages = [{ category: 'success', message: 'Page created successfully!' }];
      await req.session.save();
      return res.redirect(`/wiki/${title}`);
    } catch(err){
      console.error(err);
      req.session.messages = [{ category: 'danger', message: 'Error creating page. It might already exist.' }];
      await req.session.save();
      return res.redirect('/create');
    }
    
    
  }
);

module.exports = router;