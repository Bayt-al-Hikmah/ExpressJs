import express from "express";
import { body, validationResult } from "express-validator";
import prisma from "../db/prisma.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";
const router = express.Router();

router.get("/", async (req,res,next)=>{try{
  const recipes = await prisma.recipe.findMany({ where:{userId:req.session.user.id}, include:{ingredients:{include:{ingredient:true}}}, orderBy:{createdAt:"desc"} });
  res.render("projects/index",{ title:"Recipes", recipes, errors:[], values:{name:"",description:"",preparationTime:"",instructions:"",ingredientName:"",quantity:""} });
}catch(e){next(e);}});

router.post("/", csrfSynchronisedProtection,
  body("name").trim().notEmpty().isLength({max:120}),
  body("preparationTime").isInt({min:1}).toInt(),
  body("instructions").trim().notEmpty(),
  body("ingredientName").trim().notEmpty(),
  body("quantity").trim().notEmpty(),
  async (req,res,next)=>{try{
    const errors=validationResult(req);
    if(!errors.isEmpty()){ const recipes=await prisma.recipe.findMany({where:{userId:req.session.user.id},include:{ingredients:{include:{ingredient:true}}},orderBy:{createdAt:"desc"}}); return res.status(400).render("projects/index",{title:"Recipes",recipes,errors:errors.array(),values:req.body}); }
    const userId=req.session.user.id;
    const ingName=req.body.ingredientName.trim();
    const ingredient = await prisma.ingredient.upsert({ where:{name:ingName}, update:{}, create:{name:ingName} });
    await prisma.recipe.create({ data:{
      name:req.body.name.trim(), description:(req.body.description||"").trim()||null,
      preparationTime:Number(req.body.preparationTime), instructions:req.body.instructions.trim(),
      user:{connect:{id:userId}},
      ingredients:{ create:{ quantity:req.body.quantity.trim(), ingredient:{connect:{id:ingredient.id}} } }
    }});
    res.redirect("/projects");
  }catch(e){next(e);}}
);

router.post("/:id/delete", csrfSynchronisedProtection, async (req,res,next)=>{try{
  const result=await prisma.recipe.deleteMany({ where:{ id:Number(req.params.id), userId:req.session.user.id }});
  if(result.count===0) return res.sendStatus(404);
  res.redirect("/projects");
}catch(e){next(e);}});

export default router;
