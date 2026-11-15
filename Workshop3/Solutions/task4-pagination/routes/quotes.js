const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { generateToken, csrfSynchronisedProtection } = require('../middlewares/csrf');
const router = express.Router();
const PAGE_SIZE = 10;

router.get('/', async (req, res, next) => { try {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const [list, countRes] = await Promise.all([
    pool.query(`SELECT id, author, content, created_at FROM quotes ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [PAGE_SIZE, offset]),
    pool.query(`SELECT COUNT(*) FROM quotes`)
  ]);
  const total = Number(countRes.rows[0].count);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  res.render('home', { quotes: list.rows, page, totalPages, title: 'Recent Quotes' });
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
  const author = typeof req.query.author === 'string' ? req.query.author.trim() : '';
  let quotes = []; let searched = false;
  if (author) {
    const result = await pool.query(`SELECT id, author, content, created_at FROM quotes WHERE LOWER(author)=LOWER($1) ORDER BY created_at DESC`, [author]);
    quotes = result.rows; searched = true;
  }
  res.render('search', { author, quotes, searched, title: 'Search Quotes' });
} catch (e) { next(e); }});

module.exports = router;
