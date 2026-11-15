import express from "express";
import prisma from "../db/prisma.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";
const router = express.Router();

router.get('/', async (req,res,next)=>{try{
  const trips = await prisma.trip.findMany({ where:{userId:req.session.user.id}, include:{entries:{orderBy:{createdAt:'desc'}}}, orderBy:{createdAt:'desc'} });
  res.render('trips/index',{ title:'My Trips', trips });
}catch(e){next(e);}});

router.post('/', csrfSynchronisedProtection, async (req,res,next)=>{try{
  const title = typeof req.body.title==='string'?req.body.title.trim():'';
  if(!title || title.length>100) return res.status(400).send('Trip title 1-100 chars required.');
  await prisma.trip.create({ data:{ title, destination:(req.body.destination||'').trim()||null, user:{connect:{id:req.session.user.id}} }});
  res.redirect('/trips');
}catch(e){next(e);}});

router.post('/:tripId/entries', csrfSynchronisedProtection, async (req,res,next)=>{try{
  const tripId=Number(req.params.tripId); const title=(req.body.title||'').trim();
  if(!Number.isSafeInteger(tripId)||tripId<=0||!title) return res.status(400).send('Invalid input.');
  const trip=await prisma.trip.findFirst({ where:{id:tripId,userId:req.session.user.id} });
  if(!trip) return res.sendStatus(404);
  const entry=await prisma.journalEntry.create({ data:{ title, story:(req.body.story||'').trim()||null, trip:{connect:{id:trip.id}} }});
  res.redirect(`/entries/${entry.id}`);
}catch(e){next(e);}});
export default router;
