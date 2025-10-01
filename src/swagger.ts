import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'A comprehensive Task Management API with authentication and role-based access control',
      contact: {
        name: 'API Support',
        email: 'support@taskmanager.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User ID' },
            username: { type: 'string', description: 'Username' },
            email: { type: 'string', format: 'email', description: 'Email address' },
            role: { type: 'string', enum: ['user', 'admin'], description: 'User role' },
            isActive: { type: 'boolean', description: 'Account status' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation date' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update date' }
          }
        },
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Task ID' },
            title: { type: 'string', description: 'Task title' },
            description: { type: 'string', description: 'Task description' },
            status: { type: 'string', enum: ['pending', 'in-progress', 'completed'], description: 'Task status' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Task priority' },
            dueDate: { type: 'string', format: 'date-time', description: 'Due date' },
            userId: { type: 'string', description: 'User ID who owns the task' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation date' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update date' }
          }
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', description: 'Task title' },
            description: { type: 'string', description: 'Task description' },
            status: { type: 'string', enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
            dueDate: { type: 'string', format: 'date-time', description: 'Due date' }
          }
        },
        UpdateTaskRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Task title' },
            description: { type: 'string', description: 'Task description' },
            status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            dueDate: { type: 'string', format: 'date-time', description: 'Due date' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', description: 'Email address' },
            password: { type: 'string', description: 'Password' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password', 'confirmPassword'],
          properties: {
            username: { type: 'string', description: 'Username' },
            email: { type: 'string', format: 'email', description: 'Email address' },
            password: { type: 'string', description: 'Password' },
            confirmPassword: { type: 'string', description: 'Confirm password' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' }
                  }
                }
              }
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        },
        TaskStatistics: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Total number of tasks' },
            pending: { type: 'number', description: 'Number of pending tasks' },
            inProgress: { type: 'number', description: 'Number of in-progress tasks' },
            completed: { type: 'number', description: 'Number of completed tasks' },
            high: { type: 'number', description: 'Number of high priority tasks' },
            medium: { type: 'number', description: 'Number of medium priority tasks' },
            low: { type: 'number', description: 'Number of low priority tasks' },
            overdue: { type: 'number', description: 'Number of overdue tasks' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/v1/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
