const express=require('express');const{z}=require('zod');const{validate}=require('../middleware/validate');const{requireAuth}=require('../middleware/auth.middleware');const controller=require('../controllers/grievances.controller');
const router=express.Router();const uuid=z.string().uuid();const grievance=z.object({client_uuid:uuid,category:z.string().trim().max(100).optional(),description:z.string().trim().min(1).max(10000),created_at:z.string().datetime().optional(),updated_at:z.string().datetime().optional()});
router.post('/bulk-sync',requireAuth,validate(z.object({body:z.object({items:z.array(grievance).min(1).max(100)})})),controller.bulk);
router.post('/',requireAuth,validate(z.object({body:grievance})),controller.create);
router.get('/',requireAuth,validate(z.object({query:z.object({page:z.coerce.number().int().positive().optional(),limit:z.coerce.number().int().positive().max(100).optional(),status:z.enum(['open','in_progress','resolved','rejected']).optional()})})),controller.list);
router.get('/:id',requireAuth,validate(z.object({params:z.object({id:uuid})})),controller.get);module.exports=router;
