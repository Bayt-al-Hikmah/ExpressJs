import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
export const coverDirectory = path.resolve("storage","event-covers");
mkdirSync(coverDirectory,{recursive:true});
const storage = multer.diskStorage({ destination:(req,file,cb)=>cb(null,coverDirectory), filename:(req,file,cb)=>cb(null,randomUUID()) });
const allowed = new Set(["image/jpeg","image/png","image/webp"]);
export default multer({ storage, limits:{fileSize:5*1024*1024, files:1, fields:0, parts:1}, fileFilter:(req,file,cb)=> allowed.has(file.mimetype)?cb(null,true):cb(Object.assign(new Error('Only JPEG, PNG, WebP accepted.'),{code:'UNSUPPORTED_FILE_TYPE'})) }).single('cover');
