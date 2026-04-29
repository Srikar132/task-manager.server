# Project Architecture & Code Organization Rules

## General Structure

- The codebase is built on **Express.js** and **TypeScript**.
- The main entrypoint is `src/server.ts`, which initializes environment variables, database, app instance, and handles global errors and graceful shutdown.
- The Express application is structured in the `src/app.ts` file.
- All key components are modularized and separated under `src/`:
    - `/controllers`: Handles business logic for routes.
    - `/routes`: All route definitions & OpenAPI documentation are placed here, grouped by API version.
    - `/middleware`: Contains custom middlewares for authentication, error handling, etc.
    - `/config`: Database, security configurations, and any custom setup like CORS, rate limiter, etc.
    - `/utils`: Utility files, e.g., logger.
    - `/validation`: Input validation logic with express-validator.
- **Swagger/OpenAPI** docs are defined alongside their respective route files.

## Routing & Versioning

- Route handlers are organized by API version, e.g., `/routes/v1` for version 1.
- Each resource/controller has its own router file.
- Every route includes both OpenAPI (swagger-jsdoc) annotations and middleware usage in sequence: authentication, authorization, security/ratelimiting.
- All endpoints use clear, RESTful patterns:
    - GET for data retrieval, POST/PUT/PATCH for mutation, DELETE for removal.
    - Example: `/api/v1/admin/users/:id` for user operations.

## Middleware & Validation

- Validation is strictly handled using `express-validator`, with re-usable validation chains under `/validation`.
- Middlewares for authentication (`AuthMiddleware`) and authorization are required on all admin and protected routes.
- Security best practices: rate limits (`SecurityConfig.apiLimiter`), strict rate limiter for mutation routes, XSS, CORS, and helmet are applied globally.
- Global error handling and 404 handling are always the last app middleware steps.

## Environment & Configuration

- All secrets & environment-specifics must be defined in an `.env` file and validated on startup. App will exit if missing essentials.
- Use `dotenv` for environment variable management.
- Supported and required env vars: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`.

## Logging

- Logging is via Winston (see `/utils/logger`), and should be invoked for:
    - App startup, request processing, server shutdown, and on all error paths.

## Graceful Shutdown & Process Safety

- `server.ts` implements graceful shutdown for SIGINT/SIGTERM, unhandled rejections, and uncaught exceptions. All these will log and clean up resources.
- Do not allow orphaned DB connections.

## API Documentation

- All major endpoints are documented using **OpenAPI/Swagger** annotations directly in the route files.
- `/api-docs` exposes live interactive Swagger UI documentation.
- Data models are referenced with component schemas for standardization.

## Error Handling

- All errors are wrapped in a standardized error response model, referenced in Swagger docs.
- Validation, authentication, authorization, and not found scenarios each have explicit handlers.

## Testing & Development

- Hot-reload during development is managed via `nodemon.json` and `ts-node`.
- All source code is Typescript (`.ts`), and tests are excluded from live reload.

## Versioning, Scripts, and Build

- Use `package.json` scripts for starting, building, cleaning, and running in development.
- Building creates a `dist` directory via Typescript compilation.

---

Adopt this architecture for any agent-driven backend project to ensure maintainability, readability, and security.