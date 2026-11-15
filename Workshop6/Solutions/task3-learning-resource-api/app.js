import "dotenv/config";
import express from "express";
import session from "express-session";
import path from "node:path";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import multer from "multer";

import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import { generateToken } from "./middleware/csrf.js";

const app = express();
const PORT=3000;
if(!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET is required.');

app.use(helmet({ contentSecurityPolicy:false }));
app.use(express.json());
app.use(express.urlencoded({ extended:false }));
app.use(session({ name:'sid', secret:process.env.SESSION_SECRET, resave:false, saveUninitialized:false, cookie:{ httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV==='production', maxAge:1000*60*60*24 } }));
app.use(rateLimit({ windowMs:15*60*1000, limit:200, standardHeaders:true, legacyHeaders:false }));

app.get('/api/csrf-token',(req,res)=>res.json({data:{csrfToken:generateToken(req)}}));
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

const publicDir=path.resolve('public');
app.use(express.static(publicDir,{index:false}));
app.get('/',(req,res)=>res.sendFile(path.join(publicDir,'index.html')));
app.use('/api',(req,res)=>res.status(404).json({message:'API endpoint not found.'}));

app.use((err,req,res,next)=>{
  if(res.headersSent) return next(err);
  if(err.code==='EBADCSRFTOKEN') return res.status(403).json({message:'Invalid or missing CSRF token.'});
  if(err.code==='P2002') return res.status(409).json({message:'Duplicate record.'});
  if(err instanceof multer.MulterError) return res.status(err.code==='LIMIT_FILE_SIZE'?413:400).json({message:err.code==='LIMIT_FILE_SIZE'?'File too large.':'Upload error.'});
  if(err.code==='UNSUPPORTED_FILE_TYPE'||err.code==='INVALID_FILE_CONTENT') return res.status(415).json({message:err.message});
  console.error(err); res.status(500).json({message:'Something went wrong on the server.'});
});

app.listen(PORT,()=>console.log(`Server running at http://localhost:${PORT}`));
