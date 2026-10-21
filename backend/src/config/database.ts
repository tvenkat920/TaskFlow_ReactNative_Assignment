import mongoose from 'mongoose';
import { config } from './env';

export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    if (config.nodeEnv !== 'production') {
      console.warn(`[Database] Could not connect to '${config.mongodbUri}'. Falling back to embedded in-memory MongoDB...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const memoryServer = await MongoMemoryServer.create();
        const uri = memoryServer.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`[Database] Embedded MongoDB Server Running & Connected: ${uri}`);
        return conn;
      } catch (memError) {
        console.error('[Database] Embedded MongoDB fallback failed:', memError);
      }
    }
    console.error('[Database] Connection Error:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB Connection Closed');
  } catch (error) {
    console.error('[Database] Disconnect Error:', error);
  }
};
