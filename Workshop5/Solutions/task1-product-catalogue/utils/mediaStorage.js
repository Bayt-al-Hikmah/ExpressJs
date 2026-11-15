import { randomUUID } from "node:crypto";
import { rename, unlink } from "node:fs/promises";
import path from "node:path";
import { fileTypeFromFile } from "file-type";
import prisma from "../db/prisma.js";
import { mediaDirectory } from "../middleware/upload.js";
const allowed = new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"]]);
async function rm(p){ try{ await unlink(p);}catch(e){ if(e.code!=='ENOENT') throw e; } }
export async function storeImages(files, productId, makeMainIfNone=false){
  const finals=[];
  try{
    const existingMain = await prisma.productImage.findFirst({ where:{ productId, isMain:true } });
    let setMain = makeMainIfNone && !existingMain;
    const records=[];
    for(const file of files){
      const d=await fileTypeFromFile(file.path); const ext=allowed.get(d?.mime);
      if(!d||!ext){ const e=new Error("Invalid image content."); e.code="INVALID_FILE_CONTENT"; e.status=400; throw e; }
      const storageName=`${randomUUID()}.${ext}`; const finalPath=path.join(mediaDirectory,storageName);
      await rename(file.path, finalPath); finals.push(finalPath);
      records.push({ storageName, originalName:(file.originalname||'').replaceAll('\\','/').split('/').pop().slice(0,180), mimeType:d.mime, sizeBytes:file.size, isMain:setMain, productId });
      setMain=false;
    }
    await prisma.productImage.createMany({ data: records });
  }catch(e){ await Promise.all([...files.map(f=>f.path),...finals].map(p=>rm(p).catch(()=>{}))); throw e; }
}
export async function replaceImage(imageId, file){
  const d=await fileTypeFromFile(file.path); const ext=allowed.get(d?.mime);
  if(!d||!ext){ await rm(file.path).catch(()=>{}); const e=new Error("Invalid image content."); e.code="INVALID_FILE_CONTENT"; e.status=400; throw e; }
  const old=await prisma.productImage.findUnique({where:{id:imageId}}); if(!old) { await rm(file.path).catch(()=>{}); return null; }
  const storageName=`${randomUUID()}.${ext}`; const finalPath=path.join(mediaDirectory,storageName);
  await rename(file.path, finalPath);
  await prisma.productImage.update({ where:{id:imageId}, data:{ storageName, originalName:(file.originalname||'').slice(0,180), mimeType:d.mime, sizeBytes:file.size } });
  await rm(path.join(mediaDirectory, path.basename(old.storageName))).catch(()=>{});
  return true;
}
export async function removeImageFile(storageName){ await rm(path.join(mediaDirectory, path.basename(storageName))); }
