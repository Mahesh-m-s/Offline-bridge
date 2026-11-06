import { submitApplication } from '../applications/applications.service.js';
import { submitGrievance } from '../grievances/grievances.service.js';
import { recordAuditLog } from '../audit/audit.service.js';

export async function processBatchSync({
  userId,
  clientBatchId = null,
  applications = [],
  grievances = [],
  ipAddress = null
}) {
  const applicationResults = [];
  const grievanceResults = [];

  // 1. Process applications sequentially
  for (const item of applications) {
    try {
      const res = await submitApplication({
        userId,
        schemeId: item.schemeId,
        localDraftId: item.localDraftId,
        formData: item.formData,
        clientSubmissionId: item.clientSubmissionId,
        sourceProvenance: item.sourceProvenance || { syncedViaBatch: clientBatchId },
        ipAddress
      });

      applicationResults.push({
        clientSubmissionId: item.clientSubmissionId,
        serverId: res.application.id,
        status: 'synced',
        isDuplicate: res.isDuplicate
      });
    } catch (err) {
      applicationResults.push({
        clientSubmissionId: item.clientSubmissionId,
        status: 'failed',
        error: { message: err.message, code: err.code || 'SYNC_ERROR' }
      });
    }
  }

  // 2. Process grievances sequentially
  for (const item of grievances) {
    try {
      const res = await submitGrievance({
        userId,
        category: item.category,
        description: item.description,
        villagePanchayat: item.villagePanchayat,
        contactPhone: item.contactPhone,
        clientSubmissionId: item.clientSubmissionId,
        sourceProvenance: item.sourceProvenance || { syncedViaBatch: clientBatchId },
        ipAddress
      });

      grievanceResults.push({
        clientSubmissionId: item.clientSubmissionId,
        serverId: res.grievance.id,
        status: 'synced',
        isDuplicate: res.isDuplicate
      });
    } catch (err) {
      grievanceResults.push({
        clientSubmissionId: item.clientSubmissionId,
        status: 'failed',
        error: { message: err.message, code: err.code || 'SYNC_ERROR' }
      });
    }
  }

  await recordAuditLog({
    actorId: userId,
    actorRole: 'citizen',
    action: 'BATCH_SYNC_PROCESSED',
    resourceType: 'sync_batch',
    resourceId: clientBatchId,
    ipAddress,
    metadata: {
      applicationsCount: applications.length,
      grievancesCount: grievances.length,
      appSuccess: applicationResults.filter((r) => r.status === 'synced').length,
      grievanceSuccess: grievanceResults.filter((r) => r.status === 'synced').length
    }
  });

  return {
    clientBatchId,
    syncedApplications: applicationResults,
    syncedGrievances: grievanceResults
  };
}

