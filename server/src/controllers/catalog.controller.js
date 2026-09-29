const{catalog}=require('../services');
const cache=(res)=>res.set('Cache-Control','public, max-age=300, stale-while-revalidate=600');
const formView=(row)=>({...row,service_type:row.service_key});
module.exports={forms:async(req,res,next)=>{try{cache(res);const data=(await catalog.forms()).map(formView);res.json({data,forms:data});}catch(e){next(e);}},form:async(req,res,next)=>{try{cache(res);const data=formView(await catalog.form(req.params.serviceKey));res.json({data,form:data});}catch(e){next(e);}},schemes:async(req,res,next)=>{try{cache(res);const data=await catalog.schemes();res.json({data,schemes:data});}catch(e){next(e);}}};
