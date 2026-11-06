import React from 'react';
import {
  FileText,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Shield
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * ApplicationStatusLifecycle
 * 
 * Implements the official 4-stage application lifecycle:
 * Draft → Submitted → Under Review → Approved (or Terminal Alternative: Rejected)
 * 
 * Rules:
 * - Draft: neutral grey (#64748b) — Saved locally on device, not official submission.
 * - Submitted: blue (#2563eb) — Server confirmed receipt & reference number.
 * - Under Review: amber/orange (#d97706) — Reviewing officer assigned.
 * - Approved: green (#16a34a) — Officially sanctioned.
 * - Rejected: red (#dc2626) — Alternative terminal outcome, not sequential after approved.
 * 
 * Does NOT fabricate approval or queue positions if backend is unavailable.
 */
export default function ApplicationStatusLifecycle({
  currentStatus = 'draft', // 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  referenceNumber = null,
  timestamps = {},
  remarks = null,
  isLocalOnly = false,
  compact = false
}) {
  const { isKannada, t } = useLanguage();

  const statusOrder = ['draft', 'submitted', 'under_review'];
  const isTerminalApproved = currentStatus === 'approved';
  const isTerminalRejected = currentStatus === 'rejected';

  const formatTime = (ts) => {
    if (!ts) return null;
    try {
      const d = new Date(ts);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return ts;
    }
  };

  const stages = [
    {
      key: 'draft',
      label: isKannada ? 'ಸ್ಥಳೀಯ ಡ್ರಾಫ್ಟ್' : 'Local Draft',
      tagline: isKannada ? 'ಸಾಧನದಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಸೇವ್ ಆಗಿದೆ' : 'Saved on this device',
      detail: isKannada
        ? 'ಬ್ರೌಸರ್ ಮೆಮೊರಿಯಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ. ಇದು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಸಲ್ಲಿಕೆಯಲ್ಲ.'
        : 'Preserved locally in browser storage. This is not an official submission.',
      icon: FileText,
      color: '#64748b',
      bgColor: '#f1f5f9',
      borderColor: '#94a3b8',
      activeColor: '#334155',
      timestamp: timestamps.draftSavedAt || timestamps.savedAt || timestamps.updatedAt
    },
    {
      key: 'submitted',
      label: isKannada ? 'ಸರ್ವರ್‌ಗೆ ಸಲ್ಲಿಕೆ' : 'Submitted to Server',
      tagline: isKannada ? 'ಸರ್ವರ್ ಸ್ವೀಕೃತಿ ಮತ್ತು ಅರ್ಜಿ ಸಂಖ್ಯೆ' : 'Server acknowledged & reference issued',
      detail: isKannada
        ? 'ಇಲಾಖೆಯ ಬ್ಯಾಕೆಂಡ್‌ಗೆ ಅರ್ಜಿ ತಲುಪಿದೆ ಮತ್ತು ಸ್ವೀಕೃತಿ ಸಂಖ್ಯೆ ನೀಡಲಾಗಿದೆ.'
        : 'Departmental backend has received and queued the application.',
      icon: Send,
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe',
      activeColor: '#1d4ed8',
      timestamp: timestamps.submittedAt
    },
    {
      key: 'under_review',
      label: isKannada ? 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ' : 'Under Review',
      tagline: isKannada ? 'ಅಧಿಕಾರಿಯ ಪರಿಶೀಲನೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ' : 'Verification in progress by authority',
      detail: isKannada
        ? 'ಸಂಬಂಧಪಟ್ಟ ಇಲಾಖಾ ಅಧಿಕಾರಿಯು ದಾಖಲೆಗಳು ಮತ್ತು ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದಾರೆ.'
        : 'Assigned scrutiny officer is examining records and field eligibility.',
      icon: Clock,
      color: '#d97706',
      bgColor: '#fffbeb',
      borderColor: '#fde68a',
      activeColor: '#b45309',
      timestamp: timestamps.underReviewAt
    }
  ];

  // Terminal branch decision stage
  const terminalStage = isTerminalRejected
    ? {
        key: 'rejected',
        label: isKannada ? 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ' : 'Application Rejected',
        tagline: isKannada ? 'ಇಲಾಖಾ ನಿರ್ಧಾರ ದಾಖಲಾಗಿದೆ' : 'Decision recorded with reasons',
        detail: remarks || (isKannada ? 'ಯಾವುದೇ ವಿವರಣೆ ಲಭ್ಯವಿಲ್ಲ.' : 'No departmental remarks provided.'),
        icon: XCircle,
        color: '#dc2626',
        bgColor: '#fef2f2',
        borderColor: '#fecaca',
        activeColor: '#b91c1c',
        timestamp: timestamps.decisionAt || timestamps.rejectedAt
      }
    : {
        key: 'approved',
        label: isKannada ? 'ಅನುಮೋದಿಸಲಾಗಿದೆ' : 'Approved',
        tagline: isKannada ? 'ಇಲಾಖೆಯಿಂದ ಅಧಿಕೃತ ಅನುಮೋದನೆ' : 'Officially sanctioned by authority',
        detail: remarks || (isKannada ? 'ಅರ್ಜಿಯನ್ನು ಅಧಿಕೃತವಾಗಿ ಮಂಜೂರು ಮಾಡಲಾಗಿದೆ.' : 'Application sanctioned by competent authority.'),
        icon: CheckCircle2,
        color: '#16a34a',
        bgColor: '#f0fdf4',
        borderColor: '#bbf7d0',
        activeColor: '#15803d',
        timestamp: timestamps.decisionAt || timestamps.approvedAt
      };

  const allStages = [...stages, terminalStage];

  // Helper to determine stage status
  const getStageStatus = (stageKey) => {
    if (isLocalOnly || currentStatus === 'draft') {
      return stageKey === 'draft' ? 'current' : 'pending';
    }

    if (currentStatus === 'submitted') {
      if (stageKey === 'draft') return 'completed';
      if (stageKey === 'submitted') return 'current';
      return 'pending';
    }

    if (currentStatus === 'under_review') {
      if (stageKey === 'draft' || stageKey === 'submitted') return 'completed';
      if (stageKey === 'under_review') return 'current';
      return 'pending';
    }

    if (currentStatus === 'approved') {
      if (stageKey === 'draft' || stageKey === 'submitted' || stageKey === 'under_review') return 'completed';
      if (stageKey === 'approved') return 'completed_terminal';
      return 'pending';
    }

    if (currentStatus === 'rejected') {
      if (stageKey === 'draft' || stageKey === 'submitted' || stageKey === 'under_review') return 'completed';
      if (stageKey === 'rejected') return 'rejected_terminal';
      return 'pending';
    }

    return 'pending';
  };

  return (
    <div className={`app-status-lifecycle ${compact ? 'compact' : ''}`} style={{
      backgroundColor: 'var(--surface-card)',
      border: '1px solid var(--border-light)',
      borderRadius: '8px',
      padding: compact ? '12px 14px' : '20px 24px',
      margin: '12px 0'
    }}>
      {/* Lifecycle Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: compact ? '12px' : '18px',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="var(--gov-blue-primary)" />
          <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: 'var(--gov-blue-dark)' }}>
            {isKannada ? 'ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆ ಮತ್ತು ಸ್ಥಿತಿ (Application Lifecycle)' : 'Application Status Lifecycle'}
          </h4>
        </div>

        {/* Current status pill */}
        <div>
          {isLocalOnly || currentStatus === 'draft' ? (
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '3px 10px',
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              ● {isKannada ? 'ಸ್ಥಳೀಯ ಡ್ರಾಫ್ಟ್ — ಸಲ್ಲಿಕೆಯಾಗಿಲ್ಲ' : 'Draft — Saved Locally (Not Submitted)'}
            </span>
          ) : currentStatus === 'submitted' ? (
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              padding: '3px 10px',
              borderRadius: '999px'
            }}>
              ● {isKannada ? 'ಸರ್ವರ್‌ಗೆ ಸಲ್ಲಿಕೆಯಾಗಿದೆ' : 'Submitted to Department Server'}
            </span>
          ) : currentStatus === 'under_review' ? (
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#fffbeb',
              color: '#b45309',
              border: '1px solid #fde68a',
              padding: '3px 10px',
              borderRadius: '999px'
            }}>
              ● {isKannada ? 'ಅಧಿಕಾರಿ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ' : 'Under Official Review'}
            </span>
          ) : currentStatus === 'approved' ? (
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              padding: '3px 10px',
              borderRadius: '999px'
            }}>
              ✓ {isKannada ? 'ಅಧಿಕೃತ ಅನುಮೋದನೆ ದೊರೆತಿದೆ' : 'Officially Sanctioned & Approved'}
            </span>
          ) : (
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '3px 10px',
              borderRadius: '999px'
            }}>
              ✕ {isKannada ? 'ಅರ್ಜಿ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ' : 'Application Rejected'}
            </span>
          )}
        </div>
      </div>

      {/* Stepper Timeline Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        position: 'relative'
      }}>
        {allStages.map((stage, idx) => {
          const status = getStageStatus(stage.key);
          const IconComp = stage.icon;

          const isCurrent = status === 'current';
          const isCompleted = status === 'completed';
          const isCompletedTerminal = status === 'completed_terminal';
          const isRejectedTerminal = status === 'rejected_terminal';
          const isPending = status === 'pending';

          const stageBg = isCurrent
            ? stage.bgColor
            : isCompleted
            ? '#f8fafc'
            : isCompletedTerminal
            ? '#f0fdf4'
            : isRejectedTerminal
            ? '#fef2f2'
            : '#f8fafc';

          const stageBorder = isCurrent
            ? `2px solid ${stage.color}`
            : isCompleted
            ? '1px solid #94a3b8'
            : isCompletedTerminal
            ? '2px solid #16a34a'
            : isRejectedTerminal
            ? '2px solid #dc2626'
            : '1px dashed #cbd5e1';

          const iconColor = isCurrent || isCompletedTerminal || isRejectedTerminal
            ? stage.color
            : isCompleted
            ? '#475569'
            : '#94a3b8';

          return (
            <div
              key={stage.key}
              style={{
                backgroundColor: stageBg,
                border: stageBorder,
                borderRadius: '6px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.2s',
                opacity: isPending ? 0.65 : 1
              }}
            >
              {/* Top row: Stage step number + icon */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: isPending ? '#94a3b8' : stage.color,
                  letterSpacing: '0.04em'
                }}>
                  {stage.key === 'rejected' ? 'Terminal: Rejected' : `Stage ${idx + 1}`}
                </span>

                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: isCurrent || isCompletedTerminal || isRejectedTerminal ? '#ffffff' : '#f1f5f9',
                  border: `1px solid ${isPending ? '#cbd5e1' : stage.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComp size={14} color={iconColor} />
                </div>
              </div>

              {/* Title */}
              <div style={{
                fontSize: '0.88rem',
                fontWeight: isCurrent ? 800 : 700,
                color: isPending ? '#64748b' : 'var(--gov-blue-dark)',
                marginBottom: '3px'
              }}>
                {stage.label}
              </div>

              {/* Subtitle / Tagline */}
              <div style={{ fontSize: '0.76rem', color: isPending ? '#94a3b8' : 'var(--text-subtle)', lineHeight: '1.3', marginBottom: '6px' }}>
                {stage.tagline}
              </div>

              {/* Timestamp if recorded */}
              {stage.timestamp && (
                <div style={{
                  fontSize: '0.72rem',
                  color: '#475569',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  marginTop: 'auto',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  {formatTime(stage.timestamp)}
                </div>
              )}

              {/* Pending indicator */}
              {isPending && !stage.timestamp && (
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', marginTop: 'auto' }}>
                  {stage.key === 'submitted'
                    ? (isKannada ? 'ಸಲ್ಲಿಕೆ ಬಾಕಿ ಇದೆ' : 'Pending Server Submission')
                    : stage.key === 'under_review'
                    ? (isKannada ? 'ಪರಿಶೀಲನೆ ಪ್ರಾರಂಭವಾಗಿಲ್ಲ' : 'Pending Scrutiny')
                    : (isKannada ? 'ನಿರ್ಧಾರ ಬಾಕಿ ಇದೆ' : 'Pending Department Decision')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Local Draft Truth in Advertising Alert */}
      {(isLocalOnly || currentStatus === 'draft') && (
        <div style={{
          marginTop: '14px',
          padding: '8px 12px',
          backgroundColor: '#f8fafc',
          borderLeft: '3px solid #64748b',
          borderRadius: '4px',
          fontSize: '0.78rem',
          color: '#475569',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          lineHeight: '1.45'
        }}>
          <Info size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Local Device Preservation Notice:</strong> This application draft is stored only in your device's browser memory. <em>It has not been received, queued, or verified by any government department yet.</em> To officially submit, an active internet connection to the departmental gateway is required.
          </span>
        </div>
      )}

      {/* Official Reference & Remarks Banner if confirmed by server */}
      {referenceNumber && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: '#eff6ff',
          borderLeft: '3px solid #2563eb',
          borderRadius: '4px',
          fontSize: '0.8rem',
          color: '#1e40af',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span>Official Department Acknowledgement: <strong>{referenceNumber}</strong></span>
          {remarks && <span>Officer Remarks: <em>{remarks}</em></span>}
        </div>
      )}
    </div>
  );
}
