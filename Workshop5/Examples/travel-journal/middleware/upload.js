import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

export const mediaDirectory = path.resolve(process.cwd(), "storage", "uploads");
mkdirSync(mediaDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, mediaDirectory),
  filename: (req, file, cb) => cb(null, randomUUID())
});

const imageMimeTypes = new Set(["image/jpeg","image/png","image/webp"]);
const videoMimeTypes = new Set(["video/mp4"]);

function createUpload({ allowedMimeTypes, fileSize, maxFiles, field }) {
  const m = multer({
    storage,
    limits: { fileSize, files: maxFiles, fields: 5, parts: maxFiles + 5 },
    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.has(file.mimetype)) { const e = new Error("Unsupported file type."); e.code="UNSUPPORTED_FILE_TYPE"; return cb(e); }
      cb(null, true);
    }
  });
  return maxFiles === 1 ? m.single(field) : m.array(field, maxFiles);
}

export const uploadImages = createUpload({ allowedMimeTypes: imageMimeTypes, fileSize: 8*1024*1024, maxFiles: 5, field: "images" });
export const uploadVideo = createUpload({ allowedMimeTypes: videoMimeTypes, fileSize: 50*1024*1024, maxFiles: 1, field: "video" });
