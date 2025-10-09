const express = require('express');
const requireLogin = require('../middlewares/loginCheck.js');
const upload = require('../middlewares/upload.js');

const router = express.Router();

// --- Profile page ---
router.get('/profile', requireLogin, async (req, res) => {
  const username = req.session.user?.username || null;
  const db = req.app.get('db');
  const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err)
        resolve(row)
      })
    })
  

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
  await new Promise((resolve, reject) => {
      db.run('UPDATE users SET avatar = ? WHERE username = ?', [filename, username],async (err) => {
        if (err){
            req.session.messages = [{ category: 'danger', message: 'Database error while updating avatar.' }];
            await req.session.save();
            return res.redirect('/profile')
        } 
        resolve()
      })
    })
    req.session.messages = [{ category: 'success', message: 'Avatar updated successfully!' }];
    await req.session.save();
    return res.redirect('/profile');
  
});

module.exports = router;
