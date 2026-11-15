import express from "express";
import { body, param, query, validationResult } from "express-validator";
import prisma from "../db/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";
import coverUpload from "../middleware/upload.js";
import { saveEventCover } from "../utils/mediaStorage.js";

const router = express.Router();
function check(req,res,next){ const e=validationResult(req); if(!e.isEmpty()) return res.status(400).json({message:'Validation failed',errors:e.array()}); next(); }

async function requireEventOwner(req,res,next){
  const event = await prisma.event.findUnique({ where:{id:req.params.eventId}, include:{cover:true} });
  if(!event) return res.status(404).json({message:'Event not found.'});
  if(event.organizerId !== req.session.user.id) return res.status(404).json({message:'Event not found.'});
  req.event=event; next();
}

router.get('/', query('page').optional().isInt({min:1}).toInt(), query('category').optional().isIn(['EDUCATION','SOCIAL','TECHNOLOGY','OTHER']), query('search').optional().isString(), check, async (req,res,next)=>{ try{
  const page=req.query.page||1, take=10, skip=(page-1)*take;
  const where={ status:'PUBLISHED' };
  if(req.query.category) where.category=req.query.category;
  if(req.query.search) where.OR=[{title:{contains:req.query.search, mode:'insensitive'}},{description:{contains:req.query.search, mode:'insensitive'}}];
  const [events,total]=await Promise.all([
    prisma.event.findMany({ where, orderBy:{startsAt:'asc'}, skip, take, include:{cover:true} }),
    prisma.event.count({ where })
  ]);
  res.json({ data:{ events: events.map(e=>({...e, coverUrl:e.cover?`/api/events/${e.id}/cover`:null})), page, total, totalPages: Math.max(1,Math.ceil(total/take)) }});
}catch(e){next(e);} });

router.post('/', requireAuth, csrfSynchronisedProtection,
  body('title').trim().notEmpty().isLength({max:120}),
  body('description').trim().notEmpty(),
  body('location').trim().notEmpty().isLength({max:120}),
  body('startsAt').isISO8601().toDate(),
  body('category').optional().isIn(['EDUCATION','SOCIAL','TECHNOLOGY','OTHER']),
  body('status').optional().isIn(['DRAFT','PUBLISHED']),
  check,
  async (req,res,next)=>{ try{
    const event=await prisma.event.create({ data:{ title:req.body.title, description:req.body.description, location:req.body.location, startsAt:new Date(req.body.startsAt), category:req.body.category||'OTHER', status:req.body.status||'DRAFT', organizer:{connect:{id:req.session.user.id}} } });
    res.status(201).json({data:{event}});
  }catch(e){next(e);} }
);

router.get('/:eventId', param('eventId').isInt({min:1}).toInt(), check, async (req,res,next)=>{ try{
  const event=await prisma.event.findUnique({ where:{id:req.params.eventId}, include:{cover:true} });
  if(!event) return res.status(404).json({message:'Event not found.'});
  const isOwner=req.session.user?.id===event.organizerId;
  if(event.status!=='PUBLISHED' && !isOwner) return res.status(404).json({message:'Event not found.'});
  res.json({data:{event:{...event, coverUrl:event.cover?`/api/events/${event.id}/cover`:null}}});
}catch(e){next(e);} });

router.patch('/:eventId', requireAuth, param('eventId').isInt({min:1}).toInt(), check, requireEventOwner, csrfSynchronisedProtection,
  body('title').optional().trim().notEmpty(),
  body('status').optional().isIn(['DRAFT','PUBLISHED']),
  check,
  async (req,res,next)=>{ try{
    const data={};
    ['title','description','location','category','status'].forEach(k=>{ if(req.body[k]!==undefined) data[k]=req.body[k]; });
    if(req.body.startsAt) data.startsAt=new Date(req.body.startsAt);
    const event=await prisma.event.update({ where:{id:req.event.id}, data });
    res.json({data:{event}});
  }catch(e){next(e);} }
);

router.delete('/:eventId', requireAuth, param('eventId').isInt({min:1}).toInt(), check, requireEventOwner, csrfSynchronisedProtection, async (req,res,next)=>{ try{
  await prisma.event.delete({ where:{id:req.event.id} }); res.status(204).end();
}catch(e){next(e);} });

router.put('/:eventId/cover', requireAuth, param('eventId').isInt({min:1}).toInt(), check, requireEventOwner, csrfSynchronisedProtection, coverUpload, async (req,res,next)=>{ try{
  if(!req.file) return res.status(400).json({message:'Select an image.'});
  await saveEventCover(req.file, req.event.id);
  res.json({message:'Cover uploaded.', data:{coverUrl:`/api/events/${req.event.id}/cover`}});
}catch(e){next(e);} });

router.get('/:eventId/cover', param('eventId').isInt({min:1}).toInt(), check, async (req,res,next)=>{ try{
  const event=await prisma.event.findUnique({ where:{id:req.params.eventId}, include:{cover:true} });
  if(!event||!event.cover) return res.status(404).json({message:'Cover not found.'});
  const isOwner=req.session.user?.id===event.organizerId;
  if(event.status!=='PUBLISHED' && !isOwner) return res.status(404).json({message:'Cover not found.'});
  const pathMod = await import('node:path'); const dir = (await import('../middleware/upload.js')).coverDirectory;
  res.set('X-Content-Type-Options','nosniff'); res.type(event.cover.mimeType);
  res.sendFile(pathMod.join(dir, pathMod.basename(event.cover.storageName)));
}catch(e){next(e);} });

export default router;
