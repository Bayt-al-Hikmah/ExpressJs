import express from "express";
import { body, validationResult } from "express-validator";
import prisma from "../db/prisma.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";
const router = express.Router();

router.get("/", async (req,res,next)=>{try{
  const events = await prisma.event.findMany({ include:{ organiser:true, registrations:true }, orderBy:{ date:"asc" } });
  res.render("projects/index",{ title:"Events", events, errors:[], values:{title:"",description:"",location:"",date:""}, me:req.session.user.id });
}catch(e){next(e);}});

router.post("/", csrfSynchronisedProtection,
  body("title").trim().notEmpty().isLength({max:120}),
  body("location").trim().notEmpty().isLength({max:120}),
  body("date").isISO8601().toDate(),
  async (req,res,next)=>{try{
    const errors=validationResult(req);
    if(!errors.isEmpty()){ const events=await prisma.event.findMany({include:{organiser:true,registrations:true},orderBy:{date:"asc"}}); return res.status(400).render("projects/index",{title:"Events",events,errors:errors.array(),values:req.body,me:req.session.user.id}); }
    await prisma.event.create({ data:{ title:req.body.title.trim(), description:(req.body.description||"").trim()||null, location:req.body.location.trim(), date:new Date(req.body.date), organiser:{connect:{id:req.session.user.id}} }});
    res.redirect("/projects");
  }catch(e){next(e);}}
);

router.post("/:id/register", csrfSynchronisedProtection, async (req,res,next)=>{try{
  const eventId=Number(req.params.id); const userId=req.session.user.id;
  const event=await prisma.event.findUnique({where:{id:eventId}});
  if(!event) return res.sendStatus(404);
  await prisma.registration.upsert({ where:{ userId_eventId:{ userId, eventId } }, update:{}, create:{ userId, eventId } }); // prevents duplicates
  res.redirect("/projects");
}catch(e){next(e);}});

router.post("/:id/delete", csrfSynchronisedProtection, async (req,res,next)=>{try{
  const result=await prisma.event.deleteMany({ where:{ id:Number(req.params.id), organiserId:req.session.user.id } }); // organiser only
  if(result.count===0) return res.sendStatus(404);
  res.redirect("/projects");
}catch(e){next(e);}});

export default router;
