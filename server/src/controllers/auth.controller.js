const {auth}=require('../services');
const AuthController={register:async(req,res,next)=>{try{const result=await auth.register(req.body);res.status(201).json({...result,success:true});}catch(e){next(e);}},login:async(req,res,next)=>{try{res.json({...await auth.login(req.body),success:true});}catch(e){next(e);}},me:async(req,res,next)=>{try{const user=await auth.me(req.user.id);res.json({data:user,user,success:true});}catch(e){next(e);}}};
module.exports=AuthController;
