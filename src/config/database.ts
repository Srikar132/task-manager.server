import mongoose from "mongoose";
import { logger } from "../utils/logger";


export class Database {
    public static async connect(): Promise<void> {
        try {
            const mongoUri = process.env.MONGODB_URI!;

            const options: mongoose.ConnectOptions = {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                bufferCommands: false,
                // bufferMaxEntries: 0
            };


            await mongoose.connect(mongoUri, options);

            logger.info("✅ MongoDB connected successfully");
        } catch (error) {
            logger.error('❌ MongoDB connection error:', error);
            process.exit(1);
        }
    }

    public static async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            logger.info('MongoDB disconnected successfully');
        } catch (error) {
            logger.error('Error disconnecting MongoDB:', error);
        }   
    }
}


mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.info('Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await Database.disconnect();
  process.exit(0);
});