function errorHandler(err,req,res,next){
  if(res.headersSent)return next(err);
  const status=err.statusCode||err.status||(err.code==='23505'?409:500);
  const code=err.code==='23505'?'CONFLICT':(status===400?'BAD_REQUEST':status===401?'UNAUTHORIZED':status===404?'NOT_FOUND':status===409?'CONFLICT':status===429?'RATE_LIMITED':'INTERNAL_ERROR');
  req.log?.error({err,requestId:req.id},'Request failed');
  res.status(status).json({error:{code,message:status>=500?'An unexpected error occurred':err.message,details:err.details||[]}});
}
module.exports=errorHandler;
