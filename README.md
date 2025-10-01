# Task Manager API 📝

A robust and secure REST API for managing tasks, built with Node.js, Express, TypeScript, and MongoDB. This API provides comprehensive task management capabilities with user authentication, role-based access control, and admin functionality.

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with refresh tokens
- **Task Management**: Complete CRUD operations for tasks
- **User Roles**: Support for regular users and administrators
- **Security**: Built-in security measures including rate limiting, input sanitization, and helmet protection
- **Validation**: Comprehensive request validation with detailed error messages
- **Logging**: Structured logging with Winston for better debugging and monitoring

### Task Features
- Create, read, update, and delete tasks
- Task status tracking (pending, in-progress, completed)
- Priority levels (low, medium, high)
- Due date management
- Task statistics and analytics
- Pagination and filtering support

### Admin Features
- User management (view, update roles, activate/deactivate)
- System statistics
- User administration capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd task-manager-api/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the server directory:
   ```env
   # Server Configuration
   PORT=8000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/taskmanager
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   
   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

### Base URLs
- **API v1**: `http://localhost:8000/api/v1`
- **API v2**: `http://localhost:8000/api/v2` (Future versions)

### Authentication Endpoints

#### Register a new user
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Get user profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <your-jwt-token>
```

### Task Endpoints

#### Get all tasks (with filtering)
```http
GET /api/v1/tasks?page=1&limit=10&status=pending&priority=high&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <your-jwt-token>
```

#### Create a new task
```http
POST /api/v1/tasks
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "priority": "high",
  "dueDate": "2025-12-31T23:59:59.000Z"
}
```

#### Update a task
```http
PATCH /api/v1/tasks/:id
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "status": "completed",
  "priority": "medium"
}
```

### Admin Endpoints (Admin role required)

#### Get system statistics
```http
GET /api/v1/admin/statistics
Authorization: Bearer <admin-jwt-token>
```

#### Get all users
```http
GET /api/v1/admin/users
Authorization: Bearer <admin-jwt-token>
```

## 🛡️ Security Features

- **Rate Limiting**: Different limits for auth endpoints (5 req/15min) and API endpoints (100 req/15min)
- **Helmet**: Security headers for protection against common vulnerabilities
- **Input Sanitization**: Protection against NoSQL injection attacks
- **CORS**: Configurable cross-origin resource sharing
- **JWT Security**: Secure token-based authentication with refresh token rotation
- **Password Requirements**: Strong password validation with complexity requirements

## 📁 Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts             # Server entry point
├── config/
│   ├── database.ts       # MongoDB connection setup
│   └── security.ts       # Security middleware configuration
├── controllers/
│   ├── auth.controller.ts    # Authentication logic
│   ├── task.controller.ts    # Task management logic
│   └── admin.controller.ts   # Admin functionality
├── interfaces/
│   ├── User.interface.ts     # User type definitions
│   └── Task.interface.ts     # Task type definitions
├── middleware/
│   ├── auth.middleware.ts        # JWT authentication
│   ├── error.middleware.ts       # Global error handling
│   ├── ownership.middleware.ts   # Resource ownership checks
│   └── validation.middleware.ts  # Request validation
├── models/
│   ├── User.model.ts     # User database schema
│   └── Task.model.ts     # Task database schema
├── routes/
│   └── v1/
│       ├── auth.route.ts     # Authentication routes
│       ├── tasks.route.ts    # Task management routes
│       └── admin.router.ts   # Admin routes
├── utils/
│   ├── AppError.ts       # Custom error class
│   ├── jwt.ts           # JWT utility functions
│   ├── logger.ts        # Winston logger configuration
│   └── response.ts      # Standardized API responses
└── validation/
    ├── auth.validation.ts    # Authentication validation rules
    └── task.validation.ts    # Task validation rules
```

## 🧪 Testing with Postman

I've included Postman collection and environment files in the `postman/` directory:

1. **Import Collection**: `postman/Task-Manager-API.postman_collection.json`
2. **Import Environment**: `postman/Task-Manager-API.postman_environment.json`

The collection includes:
- All API endpoints with proper authentication
- Pre-configured request bodies
- Automatic token management
- Environment variables for easy testing

## 🔧 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build the project
npm run build

# Start production server
npm start

# Run tests (when implemented)
npm test
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` |

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the `MONGODB_URI` in your `.env` file
   - Verify database permissions

2. **JWT Errors**
   - Make sure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
   - Use strong, unique secrets in production

3. **Rate Limiting**
   - If you're hitting rate limits during development, they reset every 15 minutes
   - You can temporarily increase limits in `src/config/security.ts`

4. **CORS Issues**
   - Update `ALLOWED_ORIGINS` in `.env` to include your frontend URL

## 📈 Performance Considerations

- **Database Indexing**: Ensure proper indexes on frequently queried fields
- **Caching**: Consider implementing Redis for session storage in production
- **Rate Limiting**: Adjust limits based on your usage patterns
- **Logging**: Use appropriate log levels in production

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique JWT secrets
- [ ] Configure proper MongoDB connection with authentication
- [ ] Set up proper logging and monitoring
- [ ] Configure reverse proxy (nginx) if needed
- [ ] Set up SSL/HTTPS
- [ ] Configure environment-specific CORS origins

### Docker Support (Future Enhancement)

Docker configuration can be added for containerized deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the package.json file for details.

## 👨‍💻 Author

Built with ❤️ by Srikar

---

## 📞 Support

If you have any questions or issues, please:
1. Check the troubleshooting section above
2. Look through existing issues
3. Create a new issue with detailed description

**Happy coding! 🎉**
