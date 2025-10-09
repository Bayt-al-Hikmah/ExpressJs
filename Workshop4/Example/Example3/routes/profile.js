const User = require('../models/User')
const express = require('express');
const requireLogin = require('../middlewares/loginCheck.js');
const upload = require('../middlewares/upload.js');

const router = express.Router();

// --- Profile page ---
router.get('/profile', requireLogin, async (req, res) => {
  const username = req.session.user?.username || null;
  const db = req.app.get('db');
  const user =  await User.findByUsername(db,username);
  

    const messages = req.session.messages || [];
    req.session.messages = [];
    await req.session.save();
    return res.render('profile', { user, username, messages });
  });


// --- Avatar upload ---
router.post('/profile', requireLogin, upload.single('avatar'), async (req, res) => {
  const username = req.session.user?.username || null;
  const db = req.app.get('db');

  if (!req.file) {
    req.session.messages = [{ category: 'danger', message: 'No file selected or invalid file type.' }];
    await req.session.save();
    return res.redirect('/profile');
  }

  const filename = req.file.filename;
  try {
    await User.updateAvatar(db, username, filename);
    req.session.messages = [{ category: 'success', message: 'Avatar updated successfully!' }];
    await req.session.save();
    return res.redirect('/profile');
  } catch (err) {
    req.session.messages = [{ category: 'danger', message: 'Error updating avatar. Please try again.' }];
    await req.session.save();
    return res.redirect('/profile');
  }
  
});

module.exports = router;