/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Ingestion Controller
 */

import {
  ingestDocument,
  ingestFileDocument,
  seedSchemesCatalogue,
  getIngestionStatus
} from './ingestion.service.js';

export async function handleIngestDocument(req, res, next) {
  try {
    const { schemeId, title, content, format, sourceUrl, department, provenance } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const doc = await ingestDocument({
      schemeId,
      title,
      content,
      format,
      sourceUrl,
      department,
      provenance,
      actorUser: req.user,
      ipAddress
    });

    res.status(201).json({
      success: true,
      data: doc
    });
  } catch (err) {
    next(err);
  }
}

export async function handleIngestFile(req, res, next) {
  try {
    const { fileBase64, filename, title, department, schemeId, sourceUrl, provenance } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    if (!fileBase64 || typeof fileBase64 !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'fileBase64 (base64 encoded string) is required.', code: 'INVALID_FILE_BASE64' }
      });
    }

    const buffer = Buffer.from(fileBase64, 'base64');

    const result = await ingestFileDocument({
      buffer,
      filename,
      title,
      department,
      schemeId,
      sourceUrl,
      provenance,
      actorUser: req.user,
      ipAddress
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function handleSeedCatalogue(req, res, next) {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const result = await seedSchemesCatalogue({
      actorUser: req.user,
      ipAddress
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function handleGetStatus(req, res, next) {
  try {
    const status = await getIngestionStatus();
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (err) {
    next(err);
  }
}
