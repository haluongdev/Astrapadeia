import { app } from './app.js';
import { env } from './config/env.js';
import { closeDatabasePool, checkDatabaseHealth } from './config/database.js';
import { Server } from 'node:http';

let server: Server;

async function bootstrap() {
  // Check initial database connectivity (warning only, don't crash in development if DB is warming up)
  const dbHealth = await checkDatabaseHealth();
  if (dbHealth.connected) {
    console.log(`✅ Connected to PostgreSQL database successfully (${dbHealth.latencyMs}ms).`);
  } else {
    console.warn(`⚠️ Warning: Could not connect to PostgreSQL: ${dbHealth.error}`);
  }

  server = app.listen(env.PORT, () => {
    console.log(`🚀 Scholyx Backend API listening at http://localhost:${env.PORT}`);
    console.log(`📌 Environment: ${env.NODE_ENV} | Frontend: ${env.FRONTEND_ORIGIN}`);
  });
}

// Graceful Shutdown Handler
function handleGracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async (err) => {
      if (err) {
        console.error('❌ Error during HTTP server close:', err);
        process.exit(1);
      }
      console.log('✅ HTTP server closed.');

      await closeDatabasePool();
      console.log('🏁 Graceful shutdown complete. Exiting process.');
      process.exit(0);
    });

    // Force close after 10 seconds if hanging
    setTimeout(() => {
      console.error('⚠️ Force shutdown timed out after 10s.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: any) => {
  console.error('❌ Unhandled Rejection at:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  handleGracefulShutdown('uncaughtException');
});

bootstrap();
