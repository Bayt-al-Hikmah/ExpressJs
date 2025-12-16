const express = require('express');
const argon2 = require('argon2');
const upload = require('../middlewares/upload.js');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();


router.post('/register',upload.single('avatar'), async (req, res) => {
  const { username, email, password } = req.body;
  const filename = req.file.filename;
  const hashedPassword = await argon2.hash(password);

  await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      avatar:filename,
    },
  });

  res.status(201).json({ message: 'User registered successfully' });
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await argon2.verify(user.password, password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  req.session.userId = user.id;
  await req.session.save();
  res.json({ message: 'Login successful' });
});

module.exports = router;