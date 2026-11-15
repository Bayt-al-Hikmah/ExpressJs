import express from "express";
import prisma from "../db/prisma.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";
import { uploadImages, uploadVideo } from "../middleware/upload.js";
import { storeUploadedFiles } from "../utils/mediaStorage.js";
const router = express.Router();

async function loadOwnedEntry(req,res,next){
  try{
    const entryId=Number(req.params.entryId);
    if(!Number.isSafeInteger(entryId)||entryId<=0) return res.sendStatus(404);
    const entry=await prisma.journalEntry.findFirst({ where:{ id:entryId, trip:{ is:{ userId:req.session.user.id } } }, include:{ trip:{select:{id:true,title:true}}, media:{orderBy:{createdAt:'asc'}} } });
    if(!entry) return res.sendStatus(404);
    req.entry=entry; next();
  }catch(e){next(e);}
}

router.get('/:entryId', loadOwnedEntry, (req,res)=>res.render('entries/show',{ title:req.entry.title, entry:req.entry }));

router.post('/:entryId/images', loadOwnedEntry, uploadImages, csrfSynchronisedProtection, async (req,res,next)=>{try{
  const files=req.files||[]; if(files.length===0) return res.status(400).send('Select at least one image.');
  const caption=(req.body.caption||'').trim().slice(0,200)||null;
  await storeUploadedFiles(files,'IMAGE',req.entry.id,caption);
  res.redirect(`/entries/${req.entry.id}`);
}catch(e){next(e);}});

router.post('/:entryId/video', loadOwnedEntry, uploadVideo, csrfSynchronisedProtection, async (req,res,next)=>{try{
  if(!req.file) return res.status(400).send('Select a video.');
  const caption=(req.body.caption||'').trim().slice(0,200)||null;
  await storeUploadedFiles([req.file],'VIDEO',req.entry.id,caption);
  res.redirect(`/entries/${req.entry.id}`);
}catch(e){next(e);}});

export default router;
