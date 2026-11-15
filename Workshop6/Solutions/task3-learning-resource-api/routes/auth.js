import express from "express";
import argon2 from "argon2";
import { body, validationResult } from "express-validator";
import prisma from "../db/prisma.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";
import { rateLimit } from "express-rate-limit";
const router = express.Router();
const loginLimiter = rateLimit({ windowMs:15*60*1000, limit:10, standardHeaders:true, legacyHeaders:false, message:{message:'Too many login attempts.'} });

function check(req,res,next){ const e=validationResult(req); if(!e.isEmpty()) return res.status(400).json({message:'Validation failed', errors:e.array()}); next(); }

router.post('/register', csrfSynchronisedProtection,
  body('email').isEmail().normalizeEmail(),
  body('username').trim().isLength({min:3,max:25}).matches(/^[a-zA-Z0-9_]+$/),
  body('password').isLength({min:12}), check,
  async (req,res,next)=>{ try{
    const passwordHash=await argon2.hash(req.body.password,{type:argon2.argon2id});
    const user=await prisma.user.create({ data:{ email:req.body.email, username:req.body.username.toLowerCase(), passwordHash }, select:{id:true,email:true,username:true} });
    res.status(201).json({data:{user}});
  }catch(e){ if(e.code==='P2002') return res.status(409).json({message:'Email or username already exists.'}); next(e); } }
);

router.post('/login', loginLimiter, csrfSynchronisedProtection,
  body('email').isEmail().normalizeEmail(), body('password').isString(), check,
  async (req,res,next)=>{ try{
    const user=await prisma.user.findUnique({where:{email:req.body.email}});
    if(!user || !(await argon2.verify(user.passwordHash, req.body.password))) return res.status(401).json({message:'Invalid credentials.'});
    req.session.regenerate(err=>{ if(err) return next(err); req.session.user={id:user.id,username:user.username}; req.session.save(e2=>e2?next(e2):res.json({data:{user:{id:user.id,username:user.username,email:user.email}}})); });
  }catch(e){next(e);} }
);

router.get('/me',(req,res)=>{ if(!req.session.user) return res.status(401).json({message:'Authentication required.'}); res.json({data:{user:req.session.user}}); });
router.post('/logout', csrfSynchronisedProtection,(req,res,next)=>{ req.session.destroy(err=>{ if(err) return next(err); res.clearCookie('sid',{path:'/'}); res.status(204).end(); }); });
export default router;
