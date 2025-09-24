import { logger } from '@/lib/logger';

// Types for the action center API
export interface ActionCenterRequest {
  id: string;
  type: 'LEAVE' | 'OVERTIME' | 'EXPENSE_CLAIM' | 'GENERAL';
  details: Record<string, any>;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    roles: string;
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ActionCenterResponse {
  requests: ActionCenterRequest[];
  subordinates: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  stats: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

export interface ActionCenterFilters {
  type?: string;
  status?: string;
  employeeId?: string;
}

/**
 * Action Center Service
 * Handles fetching and managing actionable requests for admins and managers
 */
export class ActionCenterService {
  /**
   * Fetch actionable requests from the action center API
   * Falls back to user's own requests if admin access is not available
   */
  static async getActionableRequests(filters: ActionCenterFilters = {}): Promise<ActionCenterResponse> {
    try {
      // Build query parameters
      const searchParams = new URLSearchParams();
      if (filters.type) searchParams.set('type', filters.type);
      if (filters.status) searchParams.set('status', filters.status);
      if (filters.employeeId) searchParams.set('employeeId', filters.employeeId);

      const queryString = searchParams.toString();
      const adminUrl = `/api/admin/action-center${queryString ? `?${queryString}` : ''}`;
      const userUrl = `/api/requests${queryString ? `?${queryString}` : ''}`;

      logger.info('Fetching actionable requests', {
        filters,
        adminUrl,
        userUrl,
        operation: 'ActionCenterService.getActionableRequests',
      });

      // Try admin endpoint first
      let response = await fetch(adminUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      // If admin endpoint fails with 403 (Forbidden), fall back to user endpoint
      if (!response.ok && response.status === 403) {
        logger.info('Admin access denied, falling back to user requests', {
          status: response.status,
          operation: 'ActionCenterService.getActionableRequests',
        });

        response = await fetch(userUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `Failed to fetch actionable requests: ${response.status} ${errorText}`;
        logger.error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Transform user requests data to match admin response format if needed
      let transformedData = data;
      if (data.data && !data.requests) {
        // This is user requests format, transform to admin format
        transformedData = {
          requests: data.data.map((request: any) => ({
            ...request,
            user: {
              id: request.userId,
              firstName: 'کاربر',
              lastName: 'فعلی',
              email: '',
              avatar: null,
              roles: 'USER',
            },
          })),
          subordinates: [],
          stats: {
            total: data.data.length,
            byType: {},
            byStatus: {},
          },
        };
      }
      
      logger.info('Actionable requests fetched successfully', {
        requestCount: transformedData.requests?.length || 0,
        isAdminData: !!data.requests,
        operation: 'ActionCenterService.getActionableRequests',
      });

      return transformedData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error(`Error fetching actionable requests: ${errorMessage}`, error as Error);
      throw error;
    }
  }

  /**
   * Approve or reject a request
   */
  static async processRequest(
    requestId: string, 
    action: 'APPROVE' | 'REJECT', 
    rejectionReason?: string
  ): Promise<void> {
    try {
      logger.info('Processing request action', {
        requestId,
        action,
        rejectionReason,
        operation: 'ActionCenterService.processRequest',
      });

      const response = await fetch(`/api/admin/action-center/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action,
          rejectionReason,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to process request: ${response.status} ${errorText}`);
      }

      logger.info('Request processed successfully', {
        requestId,
        action,
        operation: 'ActionCenterService.processRequest',
      });
    } catch (error) {
      logger.error(`Error processing request ${requestId}: ${error instanceof Error ? error.message : 'Unknown error'}`, error as Error);
      throw error;
    }
  }

  /**
   * Transform action center request to actionable inbox item format
   */
  static transformToActionableInboxItem(request: ActionCenterRequest) {
    // Map request types to actionable inbox types
    const typeMapping: Record<string, string> = {
      'LEAVE': 'leave_request',
      'OVERTIME': 'task_assignment',
      'EXPENSE_CLAIM': 'budget_request',
      'GENERAL': 'project_approval',
    };

    // Map request status to actionable inbox status
    const statusMapping: Record<string, string> = {
      'PENDING': 'pending',
      'APPROVED': 'approved',
      'REJECTED': 'rejected',
      'CANCELLED': 'rejected',
    };

    // Determine priority based on request type and age
    const createdAt = new Date(request.createdAt);
    const daysSinceCreated = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    let priority: 'high' | 'medium' | 'low' = 'medium';
    if (request.type === 'LEAVE' && daysSinceCreated > 3) priority = 'high';
    else if (request.type === 'EXPENSE_CLAIM' && daysSinceCreated > 7) priority = 'high';
    else if (daysSinceCreated > 14) priority = 'high';
    else if (daysSinceCreated > 7) priority = 'medium';
    else priority = 'low';

    // Generate title and description based on request type
    let title = '';
    let description = '';

    switch (request.type) {
      case 'LEAVE': {
        const leaveDetails = request.details as any;
        title = `درخواست مرخصی - ${request.user.firstName} ${request.user.lastName}`;
        description = `درخواست مرخصی از ${leaveDetails.startDate} تا ${leaveDetails.endDate} - ${request.reason}`;
        break;
      }
      case 'OVERTIME': {
        const overtimeDetails = request.details as any;
        title = `درخواست اضافه کار - ${request.user.firstName} ${request.user.lastName}`;
        description = `اضافه کار در تاریخ ${overtimeDetails.date} از ${overtimeDetails.startTime} تا ${overtimeDetails.endTime} - ${request.reason}`;
        break;
      }
      case 'EXPENSE_CLAIM': {
        const expenseDetails = request.details as any;
        title = `درخواست هزینه - ${request.user.firstName} ${request.user.lastName}`;
        description = `درخواست بازپرداخت ${expenseDetails.amount} ${expenseDetails.currency} - ${request.reason}`;
        break;
      }
      case 'GENERAL': {
        const generalDetails = request.details as any;
        title = `درخواست عمومی - ${request.user.firstName} ${request.user.lastName}`;
        description = `${generalDetails.subject || 'درخواست عمومی'} - ${request.reason}`;
        break;
      }
      default:
        title = `درخواست - ${request.user.firstName} ${request.user.lastName}`;
        description = request.reason;
    }

    return {
      id: parseInt(request.id.replace(/\D/g, ''), 10) || Math.random(), // Convert string ID to number for compatibility
      type: typeMapping[request.type] || 'project_approval',
      title,
      description,
      employee: `${request.user.firstName} ${request.user.lastName}`,
      priority,
      timestamp: request.createdAt,
      status: statusMapping[request.status] || 'pending',
      originalRequest: request, // Keep original request for reference
    };
  }
}
