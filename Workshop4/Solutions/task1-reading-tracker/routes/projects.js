import express from "express";
import { body, validationResult } from "express-validator";
import prisma from "../db/prisma.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";
const router = express.Router();

router.get("/", async (req,res,next)=>{try{
  const books = await prisma.book.findMany({ where:{ userId:req.session.user.id }, orderBy:{ dateAdded:"desc" }});
  res.render("projects/index",{ title:"My Books", books, errors:[], values:{ title:"", author:"", description:"" }});
}catch(e){next(e);}});

router.post("/", csrfSynchronisedProtection,
 body("title").trim().notEmpty().withMessage("Title required").isLength({max:150}),
 body("author").trim().notEmpty().withMessage("Author required").isLength({max:100}),
 async (req,res,next)=>{try{
  const errors=validationResult(req);
  if(!errors.isEmpty()){ const books=await prisma.book.findMany({where:{userId:req.session.user.id},orderBy:{dateAdded:"desc"}}); return res.status(400).render("projects/index",{title:"My Books",books,errors:errors.array(),values:{title:req.body.title||"",author:req.body.author||"",description:req.body.description||""}});}
  await prisma.book.create({data:{ title:req.body.title.trim(), author:req.body.author.trim(), description:(req.body.description||"").trim()||null, user:{connect:{id:req.session.user.id}} }});
  res.redirect("/projects");
}catch(e){next(e);}});

router.post("/:id/status", csrfSynchronisedProtection, async (req,res,next)=>{try{
  const id=Number(req.params.id); const status=["TO_READ","READING","COMPLETED"].includes(req.body.status)?req.body.status:"TO_READ";
  const result=await prisma.book.updateMany({ where:{ id, userId:req.session.user.id }, data:{ status }});
  if(result.count===0) return res.sendStatus(404);
  res.redirect("/projects");
}catch(e){next(e);}});

router.post("/:id/delete", csrfSynchronisedProtection, async (req,res,next)=>{try{
  const result=await prisma.book.deleteMany({ where:{ id:Number(req.params.id), userId:req.session.user.id }});
  if(result.count===0) return res.sendStatus(404);
  res.redirect("/projects");
}catch(e){next(e);}});

export default router;
