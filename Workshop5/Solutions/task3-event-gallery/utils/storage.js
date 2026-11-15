import path from "node:path"; import { unlink, rename } from "node:fs/promises"; import { randomUUID } from "node:crypto"; import { fileTypeFromFile } from "file-type"; import { uploadDir } from "../middleware/upload.js";
const allowed = new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"]]);
export async function storeImages(files){
  const finals=[], records=[];
  try{
    for(const f of files){ const d=await fileTypeFromFile(f.path); const ext=allowed.get(d?.mime); if(!d||!ext){ const e=new Error("Invalid image content."); e.code="INVALID_FILE_CONTENT"; throw e; } const storageName=`${randomUUID()}.${ext}`; const fp=path.join(uploadDir,storageName); await rename(f.path,fp); finals.push(fp); records.push({storageName, originalName:(f.originalname||'').slice(0,180), mimeType:d.mime, sizeBytes:f.size}); }
    return records;
  }catch(e){ await Promise.all([...files.map(f=>f.path),...finals].map(p=>unlink(p).catch(()=>{}))); throw e; }
}
export async function removeStored(name){ const safe=path.basename(name); try{ await unlink(path.join(uploadDir,safe)); }catch(e){ if(e.code!=="ENOENT") throw e; } }
