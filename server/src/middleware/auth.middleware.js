const jwt=require('jsonwebtoken');
const JWT_SECRET=()=>process.env.JWT_SECRET;
const fail=(res,code,message,status=401)=>res.status(status).json({error:{code,message,details:[]}});
const requireAuth=(req,res,next)=>{const token=req.get('authorization')?.match(/^Bearer (.+)$/)?.[1];if(!token)return fail(res,'UNAUTHORIZED','Authentication required');try{req.user=jwt.verify(token,JWT_SECRET());next();}catch{return fail(res,'UNAUTHORIZED','Invalid or expired token');}};
const optionalAuth=(req,res,next)=>{const token=req.get('authorization')?.match(/^Bearer (.+)$/)?.[1];if(token){try{req.user=jwt.verify(token,JWT_SECRET());}catch{return fail(res,'UNAUTHORIZED','Invalid or expired token');}}next();};
module.exports={requireAuth,optionalAuth};
