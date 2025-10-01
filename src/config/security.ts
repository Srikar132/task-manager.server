import rateLimit from "express-rate-limit";
import { Express } from "express";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";


export class SecurityConfig {
    public static readonly authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15min
        max: 5, // Limit each IP to 5 requests per windowMs
        message: {
            status: 429,
            error: 'Too many requests, please try again later.'
        },
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });

    public static readonly apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100, // 100 requests per 15 minutes
        message: 'Too many requests, please try again later',
        standardHeaders: true,
        legacyHeaders: false,
    });

    public static readonly strictLimiter = rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 10, // 10 requests per minute
        message: 'Rate limit exceeded',
        standardHeaders: true,
        legacyHeaders: false,
    });

    private static sanitizeObject(obj: any): any {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }

        const sanitized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const sanitizedKey = key.replace(/[$\.]/g, '_');
                sanitized[sanitizedKey] = this.sanitizeObject(obj[key]);
            }
        }

        return sanitized;
    }

    public static apply(app: Express) {

        app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                }
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            }
        }));

        app.use((req, _res, next) => {
            // Basic sanitization for request body
            if (req.body && typeof req.body === 'object') {
                req.body = this.sanitizeObject(req.body);
            }
            
            // Basic sanitization for request params
            if (req.params && typeof req.params === 'object') {
                req.params = this.sanitizeObject(req.params);
            }
            
            next();
        });
    }
}