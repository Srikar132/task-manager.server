// src/validation/task.validation.ts
import { body, query, param, ValidationChain } from 'express-validator';

export class TaskValidation {
  public static create(): ValidationChain[] {
    return [
      body('title')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),

      body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),

      body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed'])
        .withMessage('Status must be pending, in-progress, or completed'),

      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high'),

      body('dueDate')
        .optional()
        .isISO8601()
        .toDate()
        .custom((value) => {
          if (value && value <= new Date()) {
            throw new Error('Due date must be in the future');
          }
          return true;
        })
    ];
  }

  public static update(): ValidationChain[] {
    return [
      param('id')
        .isMongoId()
        .withMessage('Invalid task ID'),

      body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),

      body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),

      body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed'])
        .withMessage('Status must be pending, in-progress, or completed'),

      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high'),

      body('dueDate')
        .optional()
        .isISO8601()
        .toDate()
        .custom((value) => {
          if (value && value <= new Date()) {
            throw new Error('Due date must be in the future');
          }
          return true;
        })
    ];
  }

  public static getById(): ValidationChain[] {
    return [
      param('id')
        .isMongoId()
        .withMessage('Invalid task ID')
    ];
  }

  public static getTasks(): ValidationChain[] {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

      query('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed'])
        .withMessage('Status must be pending, in-progress, or completed'),

      query('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high'),

      query('sortBy')
        .optional()
        .isIn(['title', 'createdAt', 'updatedAt', 'dueDate', 'priority'])
        .withMessage('Invalid sort field'),

      query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc')
    ];
  }
}