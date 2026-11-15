import "dotenv/config";
import express from "express";
import session from "express-session";
import path from "node:path";

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import requireLogin from "./middleware/requireLogin.js";
import { generateToken } from "./middleware/csrf.js";

const app = express();
if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is required.");

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  name: "sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 1000 * 60 * 60 * 24 }
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user ?? null;
  res.locals.csrfToken = generateToken(req);
  next();
});

app.get("/", (req, res) => req.session.user ? res.redirect("/projects") : res.redirect("/login"));
app.use(authRoutes);
app.use("/projects", requireLogin, projectRoutes);

app.use((req, res) => res.status(404).render("404", { title: "Not Found" }));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.code === "EBADCSRFTOKEN") return res.status(403).render("error", { title: "Forbidden", message: "Invalid or missing CSRF token." });
  console.error(err);
  res.status(500).render("error", { title: "Server Error", message: "Something went wrong." });
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
