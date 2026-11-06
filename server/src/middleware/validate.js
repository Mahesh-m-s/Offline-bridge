/**
 * Clean Request Validation Middleware
 */

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const SCHEME_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;
export const PHONE_REGEX = /^[0-9+() -]{8,20}$/;

/**
 * Validates request payload against a schema specification.
 * 
 * @param {Object} schema Spec with 'body', 'params', and/or 'query' validators
 */
export function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    // 1. Validate Body
    if (schema.body) {
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid request body. Expected a JSON object.',
            code: 'INVALID_PAYLOAD'
          }
        });
      }

      for (const [field, rules] of Object.entries(schema.body)) {
        const val = req.body[field];

        if (rules.required && (val === undefined || val === null || val === '')) {
          errors.push({ field, message: `Field '${field}' is required.` });
          continue;
        }

        if (val !== undefined && val !== null) {
          if (rules.type && typeof val !== rules.type) {
            errors.push({ field, message: `Field '${field}' must be of type ${rules.type}.` });
          }
          if (rules.minLength && typeof val === 'string' && val.trim().length < rules.minLength) {
            errors.push({ field, message: `Field '${field}' must be at least ${rules.minLength} characters.` });
          }
          if (rules.maxLength && typeof val === 'string' && val.trim().length > rules.maxLength) {
            errors.push({ field, message: `Field '${field}' cannot exceed ${rules.maxLength} characters.` });
          }
          if (rules.enum && !rules.enum.includes(val)) {
            errors.push({ field, message: `Field '${field}' must be one of: ${rules.enum.join(', ')}.` });
          }
          if (rules.pattern && typeof val === 'string' && !rules.pattern.test(val)) {
            errors.push({ field, message: rules.patternMessage || `Field '${field}' format is invalid.` });
          }
        }
      }
    }

    // 2. Validate Params
    if (schema.params) {
      for (const [param, rules] of Object.entries(schema.params)) {
        const val = req.params[param];

        if (rules.required && !val) {
          errors.push({ param, message: `Route parameter '${param}' is required.` });
          continue;
        }

        if (val) {
          if (rules.isUuid && !UUID_REGEX.test(val)) {
            errors.push({ param, message: `Route parameter '${param}' must be a valid UUID.` });
          }
          if (rules.isSchemeId && !SCHEME_ID_REGEX.test(val)) {
            errors.push({ param, message: `Route parameter '${param}' must be a valid scheme identifier.` });
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Request validation failed.',
          code: 'VALIDATION_ERROR',
          details: errors
        }
      });
    }

    next();
  };
}

