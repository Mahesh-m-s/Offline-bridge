import {
  submitApplication,
  updateApplicationStatus,
  getApplicationById,
  getMyApplications,
  listApplications
} from './applications.service.js';

export async function handleSubmitApplication(req, res, next) {
  try {
    const { schemeId, localDraftId, formData, clientSubmissionId, sourceProvenance } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await submitApplication({
      userId: req.user.id,
      schemeId,
      localDraftId,
      formData,
      clientSubmissionId,
      sourceProvenance,
      ipAddress
    });

    const statusCode = result.isDuplicate ? 200 : 201;
    res.status(statusCode).json({
      success: true,
      isDuplicate: result.isDuplicate,
      message: result.isDuplicate
        ? 'Application submission already received and recorded (idempotent duplicate).'
        : 'Application submitted successfully.',
      data: result.application
    });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await updateApplicationStatus({
      applicationId: id,
      newStatus: status,
      remarks,
      officerUser: req.user,
      ipAddress
    });

    res.status(200).json({
      success: true,
      message: `Application status updated to '${status}'.`,
      data: result.application,
      historyEntry: result.historyEntry
    });
  } catch (err) {
    next(err);
  }
}

export async function handleGetMyApplications(req, res, next) {
  try {
    const applications = await getMyApplications(req.user.id);
    res.status(200).json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (err) {
    next(err);
  }
}

export async function handleGetApplicationById(req, res, next) {
  try {
    const { id } = req.params;
    const app = await getApplicationById(id, req.user);

    if (!app) {
      return res.status(404).json({
        success: false,
        error: { message: `Application with ID '${id}' was not found.`, code: 'NOT_FOUND' }
      });
    }

    res.status(200).json({
      success: true,
      data: app
    });
  } catch (err) {
    next(err);
  }
}

export async function handleListApplications(req, res, next) {
  try {
    const { status, schemeId, limit, offset } = req.query;
    const result = await listApplications({ status, schemeId, limit, offset });
    res.status(200).json({
      success: true,
      data: result.applications,
      total: result.total
    });
  } catch (err) {
    next(err);
  }
}

