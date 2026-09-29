const pino = require('pino');
const pinoHttp = require('pino-http');
const logger=pino({level:process.env.LOG_LEVEL||'info',redact:['req.headers.authorization','req.headers.cookie']});
module.exports={loggerMiddleware:pinoHttp({logger,customProps:req=>({requestId:req.id})}),logger};
