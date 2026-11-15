import path from "node:path"; import { unlink } from "node:fs/promises"; import { uploadDir } from "../middleware/upload.js";
export async function removeStored(name){ const safe=path.basename(name); if(safe!==name) return; try{ await unlink(path.join(uploadDir,safe)); }catch(e){ if(e.code!=="ENOENT") throw e; } }
