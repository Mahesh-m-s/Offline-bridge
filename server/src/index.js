require('dotenv').config();
const {app}=require('./app');const{pool}=require('./db/pool');const{migrate}=require('./migrations/migrate');const{seed}=require('./migrations/seed');
let server;
let shutdownPromise;
async function start(){if(process.env.NODE_ENV!=='test'&&process.env.USE_MOCK_DB!=='true'){await migrate();await seed();}server=app.listen(Number(process.env.PORT||5000),()=>console.log(`OfflineBridge API listening on ${process.env.PORT||5000}`));}
function shutdown(){
  if(shutdownPromise)return shutdownPromise;
  shutdownPromise=(async()=>{
    if(server)await new Promise(resolve=>server.close(resolve));
    await pool.end();
  })();
  return shutdownPromise;
}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
if(require.main===module)start().catch(error=>{console.error('Server startup failed',error);process.exit(1);});
module.exports={start,shutdown};
