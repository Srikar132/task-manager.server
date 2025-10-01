import "reflect-metadata";
import dotenv from "dotenv";
import { logger } from "./utils/logger";
import { App } from "./app";
import { Database } from "./config/database";


dotenv.config();

const requiredEnvVars = [
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

class Server {
    private app: App;
    private port: number

    constructor() {
        this.app = new App();
        this.port = parseInt(process.env.PORT || '8000', 10);
    }

    public async start(): Promise<void> {
        try {
            // Connect to database
            await Database.connect();

            // Start server
            this.app.getApp().listen(this.port, () => {
                logger.info(`🚀 Server is running on port ${this.port}`);
                logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
                logger.info(`📊 API v1: http://localhost:${this.port}/api/v1`);
                logger.info(`📊 API v2: http://localhost:${this.port}/api/v2`);
            });
        } catch (error: any) {
            logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    public async stop(): Promise<void> {
    try {
      await Database.disconnect();
      logger.info('Server stopped gracefully');
      process.exit(0);
    } catch (error: any) {
      logger.error('Error stopping server:', error);
      process.exit(1);
    }
  }
}

// Create and start server
const server = new Server();
server.start();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.stop();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.stop();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Promise Rejection:', reason);
  server.stop();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  server.stop();
});