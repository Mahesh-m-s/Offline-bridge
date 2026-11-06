import { processBatchSync } from './sync.service.js';

export async function handleBatchSync(req, res, next) {
  try {
    const { clientBatchId, applications, grievances } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await processBatchSync({
      userId: req.user.id,
      clientBatchId,
      applications: Array.isArray(applications) ? applications : [],
      grievances: Array.isArray(grievances) ? grievances : [],
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

