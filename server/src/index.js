import app from './app.js';
import { env } from './config/env.js';
import { closePool } from './db/pool.js';

const server = app.listen(env.port, () => {
  console.log('======================================================');
  console.log(`[ArivuNet Server] Server running in ${env.nodeEnv} mode`);
  console.log(`[ArivuNet Server] Port: ${env.port}`);
  console.log(`[ArivuNet Server] Health check: http://localhost:${env.port}/api/health`);
  console.log(`[ArivuNet Server] Allowed Origins: ${env.allowedOrigins.join(', ')}`);
  console.log('======================================================');
});

// Graceful shutdown handling
async function shutdown(signal) {
  console.log(`\n[ArivuNet Server] Received ${signal}. Shutting down gracefully...`);
  
  server.close(async () => {
    console.log('[ArivuNet Server] HTTP listener closed.');
    await closePool();
    process.exit(0);
  });

  // Force close if graceful shutdown exceeds 5s
  setTimeout(() => {
    console.error('[ArivuNet Server] Forcing shutdown after timeout.');
    process.exit(1);
  }, 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default server;
