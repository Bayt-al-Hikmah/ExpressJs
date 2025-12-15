const express = require('express');
const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

router.get('/', requireLogin, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.session.userId },
  });

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  });
});

router.put('/', requireLogin, async (req, res) => {
  const { username, email, avatar } = req.body;

  await prisma.user.update({
    where: { id: req.session.userId },
    data: {
      username: username ?? undefined,
      email: email ?? undefined,
      avatar: avatar ?? undefined,
    },
  });

  res.json({ message: 'User profile updated successfully' });
});

router.patch('/password', requireLogin, async (req, res) => {
  const { password } = req.body;
  const hashedPassword = await argon2.hash(password);

  await prisma.user.update({
    where: { id: req.session.userId },
    data: { password: hashedPassword },
  });

  res.json({ message: 'Password updated successfully' });
});

module.exports = router;