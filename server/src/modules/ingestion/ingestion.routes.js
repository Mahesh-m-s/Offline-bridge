import { Router } from 'express';
import {
  handleIngestDocument,
  handleIngestFile,
  handleSeedCatalogue,
  handleGetStatus
} from './ingestion.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

const ingestSchema = {
  body: {
    title: { required: true, type: 'string', minLength: 3, maxLength: 255 },
    content: { required: true, type: 'string', minLength: 10 },
    sourceUrl: { required: false, type: 'string' },
    schemeId: { required: false, type: 'string' },
    format: { required: false, type: 'string' }
  }
};

// Admin only: Ingest verified departmental documents and guidelines
router.post('/ingestion/documents', authenticate, requireRole('admin'), validate(ingestSchema), handleIngestDocument);

// Admin only: Ingest document file (PDF, text, markdown via base64)
router.post('/ingestion/file', authenticate, requireRole('admin'), handleIngestFile);

// Admin only: Seed official schemes catalogue into knowledge base
router.post('/ingestion/seed-catalogue', authenticate, requireRole('admin'), handleSeedCatalogue);

// Admin / Official: View knowledge base ingestion statistics
router.get('/ingestion/status', authenticate, requireRole('admin', 'official'), handleGetStatus);

export default router;
