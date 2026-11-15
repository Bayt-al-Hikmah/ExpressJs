import express from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

const app = express();
const uploadDir = path.resolve("storage/uploads");
mkdirSync(uploadDir, { recursive: true });
app.use(express.static(path.resolve("public")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, randomUUID() + path.extname(file.originalname))
});
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 3 },
  fileFilter: (req, file, cb) => allowed.has(file.mimetype) ? cb(null, true) : cb(new Error("Unsupported file type."))
});

app.get("/", (req, res) => res.sendFile(path.resolve("public/index.html")));

app.post("/upload-single", upload.single("photo"), (req, res) => {
  res.json({ message: "Uploaded", file: req.file && { originalName: req.file.originalname, storedAs: req.file.filename, size: req.file.size } });
});

app.post("/upload-multiple", upload.array("photos", 3), (req, res) => {
  res.json({ message: "Uploaded", files: (req.files || []).map(f => ({ originalName: f.originalname, storedAs: f.filename })) });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ message: err.message });
  if (err) return res.status(400).json({ message: err.message });
  next();
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
