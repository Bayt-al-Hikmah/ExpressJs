import express from "express";
import path from "node:path";
import prisma from "../db/prisma.js";
import requireLogin from "../middleware/requireLogin.js";
import { csrfSynchronisedProtection } from "../middleware/csrf.js";
import { uploadImages, uploadOne, mediaDirectory } from "../middleware/upload.js";
import { storeImages, replaceImage, removeImageFile } from "../utils/mediaStorage.js";
const router=express.Router();

// Public: view products and galleries
router.get('/', async (req,res,next)=>{try{ const products=await prisma.product.findMany({include:{images:true}, orderBy:{id:'desc'}}); res.render('products/index',{title:'Products',products}); }catch(e){next(e);} });
router.get('/:id', async (req,res,next)=>{try{ const id=Number(req.params.id); const product=await prisma.product.findUnique({where:{id}, include:{images:true}}); if(!product) return res.status(404).render('error',{title:'Not Found',message:'Product not found.'}); res.render('products/show',{title:product.name,product}); }catch(e){next(e);} });
// Public image serving (product images treated as public gallery)
router.get('/images/:imageId/file', async (req,res,next)=>{try{ const image=await prisma.productImage.findUnique({where:{id:Number(req.params.imageId)}}); if(!image) return res.sendStatus(404); res.set('X-Content-Type-Options','nosniff'); res.type(image.mimeType); res.sendFile(path.join(mediaDirectory, path.basename(image.storageName))); }catch(e){next(e);} });

// Admin/owner management (requires login + ownership)
router.get('/manage/mine', requireLogin, async (req,res,next)=>{try{ const products=await prisma.product.findMany({where:{ownerId:req.session.user.id}, include:{images:true}, orderBy:{id:'desc'}}); res.render('products/manage',{title:'Manage Products',products}); }catch(e){next(e);} });
router.post('/', requireLogin, csrfSynchronisedProtection, async (req,res,next)=>{try{ await prisma.product.create({data:{ name:(req.body.name||'').trim(), description:(req.body.description||'').trim()||null, price:req.body.price||'0', category:(req.body.category||'').trim()||'General', owner:{connect:{id:req.session.user.id}} }}); res.redirect('/products/manage/mine'); }catch(e){next(e);} });
router.post('/:id/images', requireLogin, uploadImages, csrfSynchronisedProtection, async (req,res,next)=>{try{ const id=Number(req.params.id); const p=await prisma.product.findFirst({where:{id, ownerId:req.session.user.id}}); if(!p) return res.sendStatus(404); if(!req.files?.length) return res.status(400).send('Select images'); await storeImages(req.files, id, req.body.main==='true'); res.redirect('/products/manage/mine'); }catch(e){next(e);} });
router.post('/images/:imageId/replace', requireLogin, uploadOne, csrfSynchronisedProtection, async (req,res,next)=>{try{ const img=await prisma.productImage.findUnique({where:{id:Number(req.params.imageId)}, include:{product:true}}); if(!img||img.product.ownerId!==req.session.user.id) return res.sendStatus(404); if(!req.file) return res.status(400).send('Select image'); await replaceImage(img.id, req.file); res.redirect('/products/manage/mine'); }catch(e){next(e);} });
router.post('/images/:imageId/delete', requireLogin, csrfSynchronisedProtection, async (req,res,next)=>{try{ const img=await prisma.productImage.findUnique({where:{id:Number(req.params.imageId)}, include:{product:true}}); if(!img||img.product.ownerId!==req.session.user.id) return res.sendStatus(404); await prisma.productImage.delete({where:{id:img.id}}); await removeImageFile(img.storageName).catch(()=>{}); res.redirect('/products/manage/mine'); }catch(e){next(e);} });
router.post('/:id/delete', requireLogin, csrfSynchronisedProtection, async (req,res,next)=>{try{ const id=Number(req.params.id); const p=await prisma.product.findFirst({where:{id, ownerId:req.session.user.id}, include:{images:true}}); if(!p) return res.sendStatus(404); await prisma.product.delete({where:{id}}); for(const img of p.images){ await removeImageFile(img.storageName).catch(()=>{}); } res.redirect('/products/manage/mine'); }catch(e){next(e);} });
export default router;
