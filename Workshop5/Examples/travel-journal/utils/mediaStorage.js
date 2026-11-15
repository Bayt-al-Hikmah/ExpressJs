import { randomUUID } from "node:crypto";
import { rename, unlink } from "node:fs/promises";
import path from "node:path";
import { fileTypeFromFile } from "file-type";
import prisma from "../db/prisma.js";
import { mediaDirectory } from "../middleware/upload.js";

const allowedTypes = {
  IMAGE: new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"]]),
  VIDEO: new Map([["video/mp4","mp4"]])
};

async function removeFile(p){ try{ await unlink(p); } catch(e){ if(e.code!=="ENOENT") throw e; } }
function safeOriginalName(n){ return (n||"").replaceAll("\\","/").split("/").pop().slice(0,180); }

export async function storeUploadedFiles(files, kind, entryId, caption=null){
  const finalPaths=[];
  try{
    const records=[];
    for(const file of files){
      const detected = await fileTypeFromFile(file.path);
      const ext = allowedTypes[kind].get(detected?.mime);
      if(!detected || !ext){ const e=new Error("The uploaded file content is not an accepted media type."); e.code="INVALID_FILE_CONTENT"; e.status=400; throw e; }
      const storageName = `${randomUUID()}.${ext}`;
      const finalPath = path.join(mediaDirectory, storageName);
      await rename(file.path, finalPath); finalPaths.push(finalPath);
      records.push({ storageName, originalName:safeOriginalName(file.originalname), mimeType:detected.mime, sizeBytes:file.size, kind, caption:caption||null, entryId });
    }
    await prisma.mediaAsset.createMany({ data: records });
    return records;
  }catch(error){
    await Promise.all([...files.map(f=>f.path), ...finalPaths].map(p=>removeFile(p).catch(()=>{})));
    throw error;
  }
}

export async function deleteStoredFile(storageName){
  const safe = path.basename(storageName);
  if(safe !== storageName) throw new Error("Invalid storage name.");
  await removeFile(path.join(mediaDirectory, safe));
}
