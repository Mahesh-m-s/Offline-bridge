import { Router } from 'express';
import { handleChat, handleQuery } from './rag.controller.js';
import { validate } from '../../middleware/validate.js';
import { createRateLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// Rate limit: 60 queries per 5 minutes per client
const ragRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 60,
  message: 'Too many RAG chatbot queries from this IP. Please wait a moment before asking again.',
  code: 'RAG_RATE_LIMIT_EXCEEDED'
});

const ragChatSchema = {
  body: {
    question: { required: true, type: 'string', minLength: 2, maxLength: 1000 },
    language: { required: false, type: 'string' },
    conversationId: { required: false, type: 'string' }
  }
};

const ragQuerySchema = {
  body: {
    query: { required: true, type: 'string', minLength: 2, maxLength: 500 },
    schemeId: { required: false, type: 'string' },
    limit: { required: false, type: 'number' }
  }
};

// Dedicated Grounded RAG Chatbot Endpoint
router.post('/rag/chat', ragRateLimiter, validate(ragChatSchema), handleChat);

// Legacy search endpoint
router.post('/rag/query', validate(ragQuerySchema), handleQuery);

export default router;
