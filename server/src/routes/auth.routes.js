const express=require('express');const{z}=require('zod');const{validate}=require('../middleware/validate');const{requireAuth}=require('../middleware/auth.middleware');const controller=require('../controllers/auth.controller');
const router=express.Router();const body=(schema)=>validate(z.object({body:schema}));
router.post('/register',body(z.object({name:z.string().trim().min(2).max(120),phone:z.string().regex(/^\+?[0-9]{10,15}$/),password:z.string().min(8).max(72),role:z.enum(['citizen']).optional()})),controller.register);
router.post('/login',body(z.object({phone:z.string().min(10).max(16),password:z.string().min(1).max(72)})),controller.login);
router.get('/me',requireAuth,controller.me);module.exports=router;
