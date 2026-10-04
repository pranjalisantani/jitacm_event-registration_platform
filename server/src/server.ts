import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`[JITACM Backend] Running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
  console.log(`[JITACM Backend] Health probe available at http://localhost:${env.PORT}/health`);
  console.log(`[JITACM Backend] Events API available at http://localhost:${env.PORT}/api/v1/events`);
});

// Graceful Shutdown
async function shutdown(signal: string) {
  console.log(`\n[JITACM Backend] Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('[JITACM Backend] HTTP server closed.');
    try {
      await pool.end();
      console.log('[JITACM Backend] Database pool closed.');
      process.exit(0);
    } catch (err) {
      console.error('[JITACM Backend] Error during database shutdown:', err);
      process.exit(1);
    }
  });

  // Force close after 10s timeout
  setTimeout(() => {
    console.error('[JITACM Backend] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
