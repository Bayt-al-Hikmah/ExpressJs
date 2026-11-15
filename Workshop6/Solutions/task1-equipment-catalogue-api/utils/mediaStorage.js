import { randomUUID } from "node:crypto";
import { rename, unlink } from "node:fs/promises";
import path from "node:path";
import { fileTypeFromFile } from "file-type";
import prisma from "../db/prisma.js";
import { coverDirectory } from "../middleware/upload.js";
const allowed = new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"]]);
async function rm(p){ try{ await unlink(p);}catch(e){ if(e.code!=='ENOENT') throw e; } }
export async function saveEventCover(file, eventId){
  let final;
  try{
    const detected=await fileTypeFromFile(file.path); const ext=allowed.get(detected?.mime);
    if(!detected||!ext){ const e=new Error('Uploaded file is not a supported image.'); e.status=415; e.code='INVALID_FILE_CONTENT'; throw e; }
    const storageName=`${randomUUID()}.${ext}`; final=path.join(coverDirectory,storageName); await rename(file.path, final);
    const prev=await prisma.mediaAsset.findUnique({where:{eventId}});
    const asset=await prisma.mediaAsset.upsert({ where:{eventId}, create:{storageName, originalName:file.originalname.slice(0,180), mimeType:detected.mime, sizeBytes:file.size, eventId}, update:{storageName, originalName:file.originalname.slice(0,180), mimeType:detected.mime, sizeBytes:file.size} });
    if(prev) await rm(path.join(coverDirectory, path.basename(prev.storageName))).catch(()=>{});
    return asset;
  }catch(e){ await Promise.all([file.path, final].filter(Boolean).map(p=>rm(p).catch(()=>{}))); throw e; }
}
