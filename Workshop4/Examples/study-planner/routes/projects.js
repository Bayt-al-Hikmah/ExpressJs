import express from "express";
import { body, validationResult } from "express-validator";
import prisma from "../db/prisma.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({ where: { userId: req.session.user.id }, orderBy: { createdAt: "desc" } });
    res.render("projects/index", { title: "Projects", projects, errors: [], values: { title: "", description: "" } });
  } catch (e) { next(e); }
});

router.post("/", csrfSynchronisedProtection,
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 100 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const projects = await prisma.project.findMany({ where: { userId: req.session.user.id }, orderBy: { createdAt: "desc" } });
        return res.status(400).render("projects/index", { title: "Projects", projects, errors: errors.array(), values: { title: req.body.title || "", description: req.body.description || "" } });
      }
      await prisma.project.create({ data: { title: req.body.title.trim(), description: (req.body.description || "").trim() || null, user: { connect: { id: req.session.user.id } } } });
      res.redirect("/projects");
    } catch (e) { next(e); }
  }
);

router.get("/:projectId", async (req, res, next) => {
  try {
    const projectId = Number(req.params.projectId);
    const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.session.user.id }, include: { tasks: { orderBy: { createdAt: "desc" } } } });
    if (!project) return res.sendStatus(404);
    res.render("projects/show", { title: project.title, project, errors: [], taskValues: { title: "" } });
  } catch (e) { next(e); }
});

router.post("/:projectId/tasks", csrfSynchronisedProtection,
  body("title").trim().notEmpty().withMessage("Task title is required.").isLength({ max: 150 }),
  async (req, res, next) => {
    try {
      const projectId = Number(req.params.projectId);
      const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.session.user.id } });
      if (!project) return res.sendStatus(404);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const full = await prisma.project.findFirst({ where: { id: projectId, userId: req.session.user.id }, include: { tasks: { orderBy: { createdAt: "desc" } } } });
        return res.status(400).render("projects/show", { title: full.title, project: full, errors: errors.array(), taskValues: { title: req.body.title || "" } });
      }
      await prisma.task.create({ data: { title: req.body.title.trim(), project: { connect: { id: project.id } } } });
      res.redirect(`/projects/${project.id}`);
    } catch (e) { next(e); }
  }
);

router.post("/:projectId/tasks/:taskId/status", csrfSynchronisedProtection, async (req, res, next) => {
  try {
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);
    const task = await prisma.task.findFirst({ where: { id: taskId, project: { is: { id: projectId, userId: req.session.user.id } } } });
    if (!task) return res.sendStatus(404);
    const status = ["TODO","IN_PROGRESS","COMPLETED"].includes(req.body.status) ? req.body.status : "TODO";
    await prisma.task.update({ where: { id: task.id }, data: { status } });
    res.redirect(`/projects/${projectId}`);
  } catch (e) { next(e); }
});

router.post("/:projectId/tasks/:taskId/delete", csrfSynchronisedProtection, async (req, res, next) => {
  try {
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);
    const task = await prisma.task.findFirst({ where: { id: taskId, project: { is: { id: projectId, userId: req.session.user.id } } } });
    if (!task) return res.sendStatus(404);
    await prisma.task.delete({ where: { id: task.id } });
    res.redirect(`/projects/${projectId}`);
  } catch (e) { next(e); }
});

router.post("/:projectId/delete", csrfSynchronisedProtection, async (req, res, next) => {
  try {
    const projectId = Number(req.params.projectId);
    const result = await prisma.project.deleteMany({ where: { id: projectId, userId: req.session.user.id } });
    if (result.count === 0) return res.sendStatus(404);
    res.redirect("/projects");
  } catch (e) { next(e); }
});

export default router;
