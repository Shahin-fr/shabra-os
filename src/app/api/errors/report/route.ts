import { NextRequest } from 'next/server';
import { withApiErrorHandling, ApiResponse } from '@/lib/errors';
import { AuditLogger, AUDIT_EVENT_TYPES } from '@/lib/advanced-security';

interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  type: string;
  severity: string;
  context: Record<string, any>;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  retryCount: number;
  maxRetries: number;
  retryable: boolean;
}

interface ErrorReportRequest {
  reports: ErrorReport[];
}

async function handleErrorReport(request: NextRequest) {
  const body: ErrorReportRequest = await request.json();
  const { reports } = body;

  if (!Array.isArray(reports) || reports.length === 0) {
    return ApiResponse.validationError('Reports array is required and cannot be empty');
  }

  // Validate each report
  for (const report of reports) {
    if (!report.id || !report.message || !report.type || !report.severity) {
      return ApiResponse.validationError('Invalid report format: missing required fields');
    }
  }

  // Process each report
  const processedReports = [];
  for (const report of reports) {
    try {
      // Log to audit system for security-related errors
      if (report.severity === 'critical' || report.severity === 'high') {
        await AuditLogger.logSecurityEvent(
          AUDIT_EVENT_TYPES.SECURITY_SCAN,
          {
            errorId: report.id,
            message: report.message,
            type: report.type,
            severity: report.severity,
            component: report.component,
            url: report.url,
            userAgent: report.userAgent,
            userId: report.userId,
            sessionId: report.sessionId,
            retryCount: report.retryCount,
            context: report.context,
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          }
        );
      }

      // Store in database (you would implement this based on your database setup)
      // await storeErrorReport(report);

      processedReports.push({
        id: report.id,
        processed: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to process error report:', error);
      processedReports.push({
        id: report.id,
        processed: false,
        error: 'Failed to process report',
        timestamp: new Date().toISOString(),
      });
    }
  }

  return ApiResponse.success({
    processed: processedReports.length,
    total: reports.length,
    reports: processedReports,
    message: 'Error reports processed successfully',
  }, 200);
}

export const POST = withApiErrorHandling(handleErrorReport);
