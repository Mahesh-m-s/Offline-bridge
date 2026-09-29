function validate(schema){return(req,res,next)=>{const parsed=schema.safeParse({body:req.body,query:req.query,params:req.params});if(!parsed.success)return res.status(400).json({error:{code:'VALIDATION_ERROR',message:'Request validation failed',details:parsed.error.issues.map(i=>({path:i.path.join('.'),message:i.message}))}});req.validated=parsed.data;next();};}
module.exports={validate};
