# TypeScript & Express.js Style Guide (Srikar132/task-manager.server)

## Folder Structure

A clear folder organization ensures code is maintainable, easy to navigate, and scalable. The canonical structure for this project is:

```
src/
├── app.ts
├── server.ts
├── config/
│   ├── database.ts
│   ├── security.ts
│   └── ...
├── controllers/
│   ├── admin.controller.ts
│   └── ...
├── middleware/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── ...
├── routes/
│   ├── v1/
│   │   └── admin.router.ts
│   ├── v2/
│   └── ...
├── utils/
│   └── logger.ts
├── validation/
│   └── auth.validation.ts
└── swagger.ts
```

- **app.ts/server.ts**: App composition & server startup.
- **config/**: Project configuration (security, DB, CORS, etc).
- **controllers/**: Core request/response business logic by domain area.
- **middleware/**: Middleware for authentication, authorization, errors, etc.
- **routes/**: Route definitions, grouped by API version and resource.
- **utils/**: General-purpose utilities (e.g., logging).
- **validation/**: Input validation logic and schemas.
- **swagger.ts**: API documentation spec and setup.

## Naming Conventions

- Classes: PascalCase (`UserController`)
- Functions/variables: camelCase
- Env vars: UPPER_SNAKE_CASE
- Files: kebab-case or dot notation (e.g., `admin.router.ts`)

[...]  

---

## Complete Endpoint Example: User Status Update (Admin Only)

_Example endpoint:_  
PATCH `/api/v1/admin/users/:id/status`  
**Action:** Toggle a user’s active/inactive status by admin users.

### 1. Request Entry

The request arrives at the Express app, and is routed as defined in `src/routes/v1/admin.router.ts`:

```typescript
router.patch(
  '/users/:id/status',
  SecurityConfig.strictLimiter,
  adminController.toggleUserStatus.bind(adminController)
);
```

**Notes:**
- The path is versioned and organized under a dedicated router.
- The route method PATCH is used for partial updates.
- OpenAPI docs annotate the endpoint for clarity and API docs.

### 2. Middleware Chain

1. **Authentication:**  
   Applied earlier in the file via:
   ```typescript
   router.use(AuthMiddleware.authenticate); // checks JWT, attaches user info
   router.use(AuthMiddleware.authorize('admin')); // ensures user has admin role
   ```
2. **Security:**  
   `SecurityConfig.strictLimiter`: throttles requests for abuse prevention.

### 3. Validation (if needed)

- If the route requires body validation, it will use a validation chain from the relevant file in `/validation/`.  
- In this case, no specific body params are required (toggle only), but any PATCH body would be validated before controller logic.

### 4. Controller Handler

```typescript
async toggleUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id;
    // (Database update logic)
    logger.info(`Admin ${req.user.id} toggled status for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: updatedUser
    });
  } catch (error) {
    logger.error('Error updating user status:', error);
    next(error);
  }
}
```

**Process:**
- Extract path parameters and authenticate context from request.
- Perform relevant database operations (toggle active flag).
- Log action using the shared logger with user and event context.
- All thrown errors go to the `next(error)` for error middleware.

### 5. Error Handling

The global error handler in `middleware/error.middleware.ts` is always the final .use:

```typescript
static handleError(err, req, res, next) { ... }
```

- Catches all errors, formats a standardized error response.
- Logs errors with sufficient context, never leaks sensitive data.

### 6. Logging

Key events are always logged:
- Route entry, database mutations, failures.
- All logs use the shared `/utils/logger`.

---

#### Summary Flow

1. **Route Definition** → `routes/v1/admin.router.ts`
2. **Authentication/Authorization** → `middleware/auth.middleware.ts`
3. **Security (rate limiter)** → `config/security.ts`
4. **Validation** (if present) → `validation/*.ts`
5. **Controller** (business logic & logging) → `controllers/admin.controller.ts`
6. **Global Error Handling** → `middleware/error.middleware.ts`
7. **Consistent Logging** → `utils/logger.ts`

**Always:**
- Document with OpenAPI in route files.
- Use async/await for all IO.
- Responses must be clear and standardized.

---

Adopt this structure and flow for every endpoint:
- Place route in the correct router file (per version/resource).
- Chain required middlewares in the right order.
- Validate request input before controller.
- Keep controller logic slim, focusing on a single responsibility.
- Log significant events and errors.
- Handle all errors in the central middleware for robust and predictable API responses.