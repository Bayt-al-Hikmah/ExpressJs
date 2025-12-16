const express = require('express');
const jwt = require('jsonwebtoken');
const { taskLimiter } = require('../middleware/limit');
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

router.get('/', requireAuth,taskLimiter , async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId },
  });

  res.json(
    tasks.map(task => ({
      id: task.id,
      name: task.name,
      state: task.state,
      createdAt: task.createdAt,
    }))
  );
});

router.post('/', requireAuth,taskLimiter , async (req, res) => {
  const { name } = req.body;

  await prisma.task.create({
    data: {
      name,
      userId: req.userId,
    },
  });

  res.status(201).json({ message: 'Task created successfully' });
});

router.put('/:taskId', requireAuth,taskLimiter , async (req, res) => {
  const { taskId } = req.params;
  const { name, state } = req.body;

  const task = await prisma.task.findFirst({
    where: { id: parseInt(taskId), userId: req.userId },
  });

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  await prisma.task.update({
    where: { id: task.id },
    data: {
      name: name ?? undefined,
      state: state ?? undefined,
    },
  });

  res.json({ message: 'Task updated successfully' });
});

router.delete('/:taskId', requireAuth,taskLimiter , async (req, res) => {
  const { taskId } = req.params;

  const task = await prisma.task.findFirst({
    where: { id: parseInt(taskId), userId: req.userId  },
  });

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  await prisma.task.delete({
    where: { id: task.id },
  });

  res.json({ message: 'Task deleted successfully' });
});

module.exports = router;