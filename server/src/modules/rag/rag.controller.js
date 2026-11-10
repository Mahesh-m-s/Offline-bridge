/**
 * ArivuNet (ಅರಿವುನೆಟ್) — RAG Controller
 */

import { chatWithKnowledgeBase, queryKnowledgeBase } from './rag.service.js';

/**
 * POST /api/rag/chat
 * Dedicated grounded RAG chatbot endpoint
 */
export async function handleChat(req, res, next) {
  try {
    const { question, language, conversationId } = req.body;
    const result = await chatWithKnowledgeBase({
      question,
      language,
      conversationId
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/rag/query
 * Legacy search endpoint
 */
export async function handleQuery(req, res, next) {
  try {
    const { query, schemeId, limit } = req.body;
    const result = await queryKnowledgeBase({ query, schemeId, limit });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
