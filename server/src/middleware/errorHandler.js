import { env } from '../config/env.js';

/**
 * Centralized Express Error Handling Middleware
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  
  // Format body-parser JSON syntax errors cleanly
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Malformed JSON payload in request body.',
        code: 'BAD_REQUEST'
      }
    });
  }

  // Format entity payload too large errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: {
        message: 'Request payload exceeds the allowed limit (1MB).',
        code: 'PAYLOAD_TOO_LARGE'
      }
    });
  }

  // Log error message safely without leaking credentials
  if (status >= 500) {
    console.error(`[ArivuNet Server Error] ${req.method} ${req.originalUrl}:`, err.message);
  }

  const response = {
    success: false,
    error: {
      message: status >= 500 && env.isProduction 
        ? 'Internal Server Error' 
        : err.message || 'An unexpected error occurred.',
      code: err.code || (status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR')
    }
  };

  // Only include stack trace in local development
  if (!env.isProduction && status >= 500 && err.stack) {
    response.error.stack = err.stack;
  }

  return res.status(status).json(response);
}
