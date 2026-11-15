const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { generateToken, csrfSynchronisedProtection } = require('../middlewares/csrf');

const router = express.Router();

router.get('/', async (req, res, next) => { try {
  const result = await pool.query(`SELECT id, author, content, created_at FROM quotes ORDER BY created_at DESC LIMIT 20`);
  res.render('home', { quotes: result.rows, title: 'Recent Quotes' });
} catch (e) { next(e); }});

router.get('/share', (req, res) => res.render('share', { csrfToken: generateToken(req), errors: [], values: { author: '', content: '' }, title: 'Share a Quote' }));

router.post('/share', csrfSynchronisedProtection, [
  body('author').isString().bail().trim().notEmpty().withMessage('Author name is required.').bail().isLength({ min: 3, max: 100 }).withMessage('Author name must be between 3 and 100 characters.'),
  body('content').isString().bail().trim().notEmpty().withMessage('Quote cannot be empty.').bail().isLength({ max: 300 }).withMessage('Quote must not exceed 300 characters.')
], async (req, res, next) => { try {
  const errors = validationResult(req);
  const values = { author: req.body.author || '', content: req.body.content || '' };
  if (!errors.isEmpty()) return res.status(400).render('share', { csrfToken: generateToken(req), errors: errors.array(), values, title: 'Share a Quote' });
  const result = await pool.query(`INSERT INTO quotes (author, content) VALUES ($1,$2) RETURNING id`, [values.author.trim(), values.content.trim()]);
  res.redirect(`/quotes/${result.rows[0].id}`);
} catch (e) { next(e); }});

router.get('/quotes/:id', async (req, res, next) => { try {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(404).render('404', { title: 'Page Not Found', url: req.originalUrl });
  const result = await pool.query(`SELECT id, author, content, created_at, updated_at FROM quotes WHERE id=$1`, [id]);
  if (result.rows.length === 0) return res.status(404).render('404', { title: 'Quote Not Found', url: req.originalUrl });
  res.render('show', { quote: result.rows[0], csrfToken: generateToken(req), title: 'View Quote' });
} catch (e) { next(e); }});

router.get('/quotes/:id/edit', async (req, res, next) => { try {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(404).render('404', { title: 'Quote Not Found', url: req.originalUrl });
  const result = await pool.query('SELECT * FROM quotes WHERE id=$1', [id]);
  if (result.rows.length === 0) return res.status(404).render('404', { title: 'Quote Not Found', url: req.originalUrl });
  res.render('edit', { quote: result.rows[0], csrfToken: generateToken(req), errors: [], values: { author: result.rows[0].author, content: result.rows[0].content }, title: 'Edit Quote' });
} catch (e) { next(e); }});

router.post('/quotes/:id/edit', csrfSynchronisedProtection, [
  body('author').isString().bail().trim().notEmpty().withMessage('Author name is required.').bail().isLength({ min: 3, max: 100 }).withMessage('Author name must be between 3 and 100 characters.'),
  body('content').isString().bail().trim().notEmpty().withMessage('Quote cannot be empty.').bail().isLength({ max: 300 }).withMessage('Quote must not exceed 300 characters.')
], async (req, res, next) => { try {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(404).render('404', { title: 'Quote Not Found', url: req.originalUrl });
  const existing = await pool.query('SELECT id FROM quotes WHERE id=$1', [id]);
  if (existing.rows.length === 0) return res.status(404).render('404', { title: 'Quote Not Found', url: req.originalUrl });
  const errors = validationResult(req);
  const values = { author: req.body.author || '', content: req.body.content || '' };
  if (!errors.isEmpty()) return res.status(400).render('edit', { quote: { id }, csrfToken: generateToken(req), errors: errors.array(), values, title: 'Edit Quote' });
  await pool.query(`UPDATE quotes SET author=$1, content=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3`, [values.author.trim(), values.content.trim(), id]);
  res.redirect(`/quotes/${id}`);
} catch (e) { next(e); }});

router.post('/quotes/:id/delete', csrfSynchronisedProtection, async (req, res, next) => { try {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(404).render('404', { title: 'Quote Not Found', url: req.originalUrl });
  const result = await pool.query(`DELETE FROM quotes WHERE id=$1 RETURNING id`, [id]);
  if (result.rows.length === 0) return res.status(404).render('404', { title: 'Quote Not Found', url: req.originalUrl });
  res.redirect('/');
} catch (e) { next(e); }});

router.get('/search', async (req, res, next) => { try {
  const content = typeof req.query.content === 'string' ? req.query.content.trim() : '';
  let quotes = []; let searched = false;
  if (content) {
    const result = await pool.query(`SELECT id, author, content, created_at FROM quotes WHERE content ILIKE $1 ORDER BY created_at DESC`, [`%${content}%`]);
    quotes = result.rows; searched = true;
  }
  res.render('search', { content, quotes, searched, title: 'Search Quotes' });
} catch (e) { next(e); }});

module.exports = router;
