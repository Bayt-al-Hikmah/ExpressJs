import express from "express";
import argon2 from "argon2";
import { body, validationResult } from "express-validator";
import prisma from "../db/prisma.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";

const router = express.Router();

router.get("/register", (req, res) => res.render("auth/register", { title: "Register", errors: [], values: { username: "" } }));

router.post("/register", csrfSynchronisedProtection,
  body("username").isString().bail().trim().isLength({ min: 3, max: 25 }).withMessage("Username must be 3-25 chars.").matches(/^[a-zA-Z0-9_]+$/).withMessage("Letters, numbers, underscore only."),
  body("password").isString().bail().isLength({ min: 12 }).withMessage("Password must be at least 12 characters."),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).render("auth/register", { title: "Register", errors: errors.array(), values: { username: req.body.username || "" } });
      const username = String(req.body.username).trim().toLowerCase();
      const passwordHash = await argon2.hash(String(req.body.password), { type: argon2.argon2id });
      await prisma.user.create({ data: { username, passwordHash } });
      res.redirect("/login");
    } catch (error) {
      if (error.code === "P2002") return res.status(409).render("auth/register", { title: "Register", errors: [{ msg: "This username is already taken." }], values: { username: req.body.username || "" } });
      next(error);
    }
  }
);

router.get("/login", (req, res) => res.render("auth/login", { title: "Login", error: null }));

router.post("/login", csrfSynchronisedProtection,
  body("username").isString().bail().trim(),
  body("password").isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).render("auth/login", { title: "Login", error: "Please enter valid credentials." });
      const username = String(req.body.username).trim().toLowerCase();
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user || !(await argon2.verify(user.passwordHash, String(req.body.password)))) {
        return res.status(401).render("auth/login", { title: "Login", error: "Invalid username or password." });
      }
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.user = { id: user.id, username: user.username };
        req.session.save((err2) => err2 ? next(err2) : res.redirect("/projects"));
      });
    } catch (error) { next(error); }
  }
);

router.post("/logout", csrfSynchronisedProtection, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("sid", { path: "/" });
    res.redirect("/login");
  });
});

export default router;
