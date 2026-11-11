/**
 * OfflineBridge — Ingestion API Client (Admin & Official)
 */

import { apiClient } from './apiClient';

/**
 * Fetch RAG & Catalogue ingestion status and storage metrics
 */
export async function getIngestionStatusApi() {
  return apiClient.get('/api/ingestion/status');
}

/**
 * Trigger seed catalogue ingestion (Admin only)
 */
export async function seedCatalogueApi() {
  return apiClient.post('/api/ingestion/seed-catalogue', {});
}

