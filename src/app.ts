import express, { Express, Request, Response } from "express"
import { SecurityConfig } from "./config/security";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import { logger } from "./utils/logger";
import v1Routes from "./routes/v1";
import v2Routes from "./routes/v2"
import { ErrorMiddleware } from "./middleware/error.middleware";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

export class App {

    public app: Express

    constructor() {
        this.app = express();
        logger.info('🚀 App constructor called - Express app initialized');
        this.configureMiddlewares();
        this.configureRoutes();
        this.configureErrorHandling();
        logger.info('✅ App configuration completed successfully');
    }

    private configureMiddlewares() {
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // CORS configuration
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'API-Version']
        }));

        // Security middleware
        SecurityConfig.apply(this.app);

        // Compression
        this.app.use(compression());

        // Logging
        if (process.env.NODE_ENV === 'development') {
            this.app.use(morgan('dev'));
        } else {
            this.app.use(morgan('combined', {
                stream: {
                    write: (message: string) => logger.info(message.trim())
                }
            }));
        }

        // Trust proxy (if behind nginx/load balancer)
        // this.app.set('trust proxy', 1);

    }

    private configureRoutes() {
        this.app.get('/', (req: Request, res: Response) => {
            res.status(200).json({
                success: true,
                message: 'Task Manager API',
                version: '1.0.0',
                documentation: '/api-docs',
                endpoints: {
                    v1: '/api/v1',
                    v2: '/api/v2'
                }
            });
        });

        // Health check endpoint for deployment platforms
        this.app.get('/health', (req: Request, res: Response) => {
            res.status(200).json({
                success: true,
                message: 'Server is healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development'
            });
        });

        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

        this.app.use('/api/v1', v1Routes);
        this.app.use('/api/v2', v2Routes);

        // 404 handler
        this.app.use(ErrorMiddleware.handle404);
    }

    private configureErrorHandling(): void {
        // Global error handler (must be last)
        this.app.use(ErrorMiddleware.handleError);
    }

    public getApp(): Express {
        return this.app;
    }
}