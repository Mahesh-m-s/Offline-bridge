import {
  submitGrievance,
  getMyGrievances,
  listGrievances,
  updateGrievanceStatus,
  getGrievanceById
} from './grievances.service.js';

export async function handleSubmitGrievance(req, res, next) {
  try {
    const { category, description, villagePanchayat, contactPhone, clientSubmissionId, sourceProvenance } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await submitGrievance({
      userId: req.user?.id || null,
      category,
      description,
      villagePanchayat,
      contactPhone: contactPhone || req.user?.phone || null,
      clientSubmissionId,
      sourceProvenance,
      ipAddress
    });

    const statusCode = result.isDuplicate ? 200 : 201;
    res.status(statusCode).json({
      success: true,
      isDuplicate: result.isDuplicate,
      data: result.grievance
    });
  } catch (err) {
    next(err);
  }
}

export async function handleGetMyGrievances(req, res, next) {
  try {
    const items = await getMyGrievances(req.user.id);
    res.status(200).json({ success: true, data: items, count: items.length });
  } catch (err) {
    next(err);
  }
}

export async function handleListGrievances(req, res, next) {
  try {
    const { category, status, limit, offset } = req.query;
    const result = await listGrievances({ category, status, limit, offset });
    res.status(200).json({ success: true, data: result.grievances, total: result.total });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateGrievanceStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const updated = await updateGrievanceStatus({
      grievanceId: id,
      status,
      remarks,
      officerUser: req.user,
      ipAddress
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function handleGetGrievanceById(req, res, next) {
  try {
    const grievance = await getGrievanceById(req.params.id, req.user);
    if (!grievance) {
      return res.status(404).json({
        success: false,
        error: { message: `Grievance with ID '${req.params.id}' was not found.`, code: 'NOT_FOUND' }
      });
    }
    return res.status(200).json({ success: true, data: grievance });
  } catch (err) {
    next(err);
  }
}

