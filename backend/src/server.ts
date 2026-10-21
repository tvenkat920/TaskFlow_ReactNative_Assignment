import { createApp } from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';

const startServer = async () => {
  try {
    await connectDatabase();
    const app = createApp();

    // Listen on 0.0.0.0 so local network (LAN) and Android emulator (10.0.2.2) can access it
    const server = app.listen(config.port, '0.0.0.0', () => {
      console.log(`===============================================`);
      console.log(`🚀 TaskFlow Backend running in ${config.nodeEnv} mode`);
      console.log(`📡 Local address:    http://localhost:${config.port}`);
      console.log(`📱 Android Emulator: http://10.0.2.2:${config.port}`);
      console.log(`🌐 Health check:     http://localhost:${config.port}/api/health`);
      console.log(`===============================================`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Graceful shutdown initiated...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
