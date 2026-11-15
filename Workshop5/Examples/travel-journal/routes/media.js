import express from "express";
import path from "node:path";
import prisma from "../db/prisma.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";
import { mediaDirectory } from "../middleware/upload.js";
import { deleteStoredFile } from "../utils/mediaStorage.js";
const router = express.Router();

router.get('/:mediaId', async (req,res,next)=>{try{
  const mediaId=Number(req.params.mediaId);
  if(!Number.isSafeInteger(mediaId)||mediaId<=0) return res.sendStatus(404);
  const media=await prisma.mediaAsset.findFirst({ where:{ id:mediaId, entry:{ is:{ trip:{ is:{ userId:req.session.user.id } } } } } });
  if(!media) return res.sendStatus(404);
  const fileName=path.basename(media.storageName);
  if(fileName!==media.storageName) return res.sendStatus(404);
  res.set('X-Content-Type-Options','nosniff'); res.set('Cache-Control','private, no-store'); res.type(media.mimeType);
  res.sendFile(path.join(mediaDirectory,fileName));
}catch(e){next(e);}});

router.post('/:mediaId/delete', csrfSynchronisedProtection, async (req,res,next)=>{try{
  const mediaId=Number(req.params.mediaId);
  if(!Number.isSafeInteger(mediaId)||mediaId<=0) return res.sendStatus(404);
  const media=await prisma.mediaAsset.findFirst({ where:{ id:mediaId, entry:{ is:{ trip:{ is:{ userId:req.session.user.id } } } } } });
  if(!media) return res.sendStatus(404);
  await prisma.mediaAsset.delete({ where:{ id:media.id } });
  try{ await deleteStoredFile(media.storageName); } catch(e){ console.error('Cleanup failed', e); }
  res.redirect(`/entries/${media.entryId}`);
}catch(e){next(e);}});

export default router;
