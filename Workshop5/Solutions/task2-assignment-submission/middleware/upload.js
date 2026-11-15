import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
export const uploadDir = path.resolve("storage/uploads");
mkdirSync(uploadDir,{recursive:true});
const storage = multer.diskStorage({ destination:(req,f,cb)=>cb(null,uploadDir), filename:(req,f,cb)=>cb(null,randomUUID()) });
const allowed = new Set(["application/pdf","image/jpeg","image/png","text/plain"]);
export const uploadFiles = multer({ storage, limits:{fileSize:10*1024*1024, files:3, fields:10}, fileFilter:(req,f,cb)=> allowed.has(f.mimetype)?cb(null,true):cb(Object.assign(new Error("Unsupported file type."),{code:"UNSUPPORTED_FILE_TYPE"})) }).array("files",3);
