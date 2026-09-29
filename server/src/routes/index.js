const express=require('express');const{pool}=require('../db/pool');const auth=require('./auth.routes');const submissions=require('./submissions.routes');const grievances=require('./grievances.routes');const catalog=require('./catalog.routes');
const router=express.Router();
router.get('/health',(req,res)=>res.json({status:'ok',service:'OfflineBridge API',time:new Date().toISOString()}));
router.get('/health/ready',async(req,res)=>{try{await pool.query('SELECT 1');res.json({status:'ready',database:'ok'});}catch{res.status(503).json({error:{code:'NOT_READY',message:'Database unavailable',details:[]}});}});
router.use('/auth',auth);router.use('/',catalog);router.use('/submissions',submissions);router.use('/grievances',grievances);
module.exports={router};
