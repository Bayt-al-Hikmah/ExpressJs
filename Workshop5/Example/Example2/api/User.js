const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const upload = require('../middlewares/upload.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}


router.get('/', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId},
  });

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: 'avatars/' + user.avatar,
  });
});

router.put('/', requireAuth, upload.single('avatar'), async (req, res) => {
  const { username, email, } = req.body;
  const filename = req.file.filename;
  await prisma.user.update({
    where: { id: req.userId },
    data: {
      username: username ?? undefined,
      email: email ?? undefined,
      avatar: filename ?? undefined,
    },
  });

  res.json({ message: 'User profile updated successfully' });
});

router.patch('/password', requireAuth, async (req, res) => {
  const { password } = req.body;
  const hashedPassword = await argon2.hash(password);

  await prisma.user.update({
    where: { id: req.userId },
    data: { password: hashedPassword },
  });

  res.json({ message: 'Password updated successfully' });
});

module.exports = router;