const express = require('express');
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
  const tasks = await prisma.task.findMany({
    where: { userId: req.session.userId },
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

router.post('/', requireLogin, async (req, res) => {
  const { name } = req.body;

  await prisma.task.create({
    data: {
      name,
      userId: req.session.userId,
    },
  });

  res.status(201).json({ message: 'Task created successfully' });
});

router.put('/:taskId', requireLogin, async (req, res) => {
  const { taskId } = req.params;
  const { name, state } = req.body;

  const task = await prisma.task.findFirst({
    where: { id: parseInt(taskId), userId: req.session.userId },
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

router.delete('/:taskId', requireLogin, async (req, res) => {
  const { taskId } = req.params;

  const task = await prisma.task.findFirst({
    where: { id: parseInt(taskId), userId: req.session.userId },
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