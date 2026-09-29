const { z } = require('zod');
const envSchema = z.object({
  NODE_ENV:z.enum(['development','test','production']).default('development'),
  PORT:z.coerce.number().int().positive().default(5000),
  DATABASE_URL:z.string().url().optional(),
  JWT_SECRET:z.string().min(32),
  CORS_ORIGIN:z.string().default('http://localhost:5173'),
  USE_MOCK_DB:z.enum(['true','false']).default('false')
}).superRefine((env,ctx)=>{
  if(env.NODE_ENV!=='test' && env.USE_MOCK_DB!=='true' && !env.DATABASE_URL) ctx.addIssue({code:z.ZodIssueCode.custom,path:['DATABASE_URL'],message:'DATABASE_URL is required outside tests'});
});
function validateEnv(){const parsed=envSchema.safeParse(process.env);if(!parsed.success){console.error('Invalid environment configuration',parsed.error.flatten().fieldErrors);process.exit(1);}Object.assign(process.env,{PORT:String(parsed.data.PORT),NODE_ENV:parsed.data.NODE_ENV,CORS_ORIGIN:parsed.data.CORS_ORIGIN,USE_MOCK_DB:parsed.data.USE_MOCK_DB});}
module.exports={validateEnv,envSchema};
