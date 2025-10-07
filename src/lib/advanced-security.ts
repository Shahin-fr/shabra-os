/**
 * Advanced Security Features for Shabra OS
 * Implements brute force protection, audit logging, and security monitoring
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Brute force protection configuration
export const BRUTE_FORCE_CONFIG = {
  maxAttempts: 5, // Maximum failed attempts before lockout
  lockoutDuration: 15 * 60 * 1000, // 15 minutes in milliseconds
  progressiveDelay: true, // Enable progressive delays
  baseDelay: 1000, // Base delay in milliseconds
  maxDelay: 30000, // Maximum delay in milliseconds
  resetWindow: 60 * 60 * 1000, // 1 hour window for attempt counting
} as const;

// Audit log event types
export const AUDIT_EVENT_TYPES = {
  // Authentication events
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  
  // Authorization events
  ACCESS_GRANTED: 'ACCESS_GRANTED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  PERMISSION_CHANGE: 'PERMISSION_CHANGE',
  ROLE_CHANGE: 'ROLE_CHANGE',
  
  // Security events
  BRUTE_FORCE_DETECTED: 'BRUTE_FORCE_DETECTED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  IP_BLOCKED: 'IP_BLOCKED',
  IP_UNBLOCKED: 'IP_UNBLOCKED',
  
  // Data events
  DATA_CREATED: 'DATA_CREATED',
  DATA_UPDATED: 'DATA_UPDATED',
  DATA_DELETED: 'DATA_DELETED',
  DATA_EXPORTED: 'DATA_EXPORTED',
  
  // System events
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  CONFIGURATION_CHANGE: 'CONFIGURATION_CHANGE',
  SECURITY_SCAN: 'SECURITY_SCAN',
} as const;

// Security risk levels
export const SECURITY_RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

// In-memory stores for brute force protection (in production, use Redis)
const bruteForceStore = new Map<string, {
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
  progressiveDelay: number;
}>();

const ipBlocklist = new Set<string>();
const ipWhitelist = new Set<string>();

/**
 * Brute Force Protection Service
 */
export class BruteForceProtection {
  /**
   * Check if an IP or user is currently locked out
   */
  static isLocked(identifier: string): boolean {
    const entry = bruteForceStore.get(identifier);
    if (!entry) return false;
    
    if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
      return true;
    }
    
    // Clean up expired entries
    if (Date.now() - entry.lastAttempt > BRUTE_FORCE_CONFIG.resetWindow) {
      bruteForceStore.delete(identifier);
      return false;
    }
    
    return false;
  }

  /**
   * Record a failed attempt
   */
  static recordFailedAttempt(identifier: string): {
    isLocked: boolean;
    remainingAttempts: number;
    lockoutDuration?: number;
    delay?: number;
  } {
    const now = Date.now();
    const entry = bruteForceStore.get(identifier) || {
      attempts: 0,
      lastAttempt: now,
      progressiveDelay: BRUTE_FORCE_CONFIG.baseDelay,
    };

    entry.attempts += 1;
    entry.lastAttempt = now;

    // Calculate progressive delay
    if (BRUTE_FORCE_CONFIG.progressiveDelay) {
      entry.progressiveDelay = Math.min(
        BRUTE_FORCE_CONFIG.baseDelay * Math.pow(2, entry.attempts - 1),
        BRUTE_FORCE_CONFIG.maxDelay
      );
    }

    // Check if should be locked
    if (entry.attempts >= BRUTE_FORCE_CONFIG.maxAttempts) {
      entry.lockedUntil = now + BRUTE_FORCE_CONFIG.lockoutDuration;
      bruteForceStore.set(identifier, entry);
      
      // Log the lockout event
      AuditLogger.logSecurityEvent(
        AUDIT_EVENT_TYPES.ACCOUNT_LOCKED,
        {
          identifier,
          attempts: entry.attempts,
          lockoutDuration: BRUTE_FORCE_CONFIG.lockoutDuration,
        },
        SECURITY_RISK_LEVELS.HIGH
      );

      return {
        isLocked: true,
        remainingAttempts: 0,
        lockoutDuration: BRUTE_FORCE_CONFIG.lockoutDuration,
        delay: entry.progressiveDelay,
      };
    }

    bruteForceStore.set(identifier, entry);

    return {
      isLocked: false,
      remainingAttempts: BRUTE_FORCE_CONFIG.maxAttempts - entry.attempts,
      delay: entry.progressiveDelay,
    };
  }

  /**
   * Record a successful attempt (reset counter)
   */
  static recordSuccessfulAttempt(identifier: string): void {
    bruteForceStore.delete(identifier);
  }

  /**
   * Get current attempt count for an identifier
   */
  static getAttemptCount(identifier: string): number {
    const entry = bruteForceStore.get(identifier);
    return entry ? entry.attempts : 0;
  }

  /**
   * Manually unlock an identifier
   */
  static unlock(identifier: string): void {
    const entry = bruteForceStore.get(identifier);
    if (entry) {
      entry.lockedUntil = undefined;
      entry.attempts = 0;
      bruteForceStore.set(identifier, entry);
      
      AuditLogger.logSecurityEvent(
        AUDIT_EVENT_TYPES.ACCOUNT_UNLOCKED,
        { identifier },
        SECURITY_RISK_LEVELS.MEDIUM
      );
    }
  }

  /**
   * Clean up expired entries
   */
  static cleanup(): void {
    const now = Date.now();
    for (const [identifier, entry] of bruteForceStore.entries()) {
      if (now - entry.lastAttempt > BRUTE_FORCE_CONFIG.resetWindow) {
        bruteForceStore.delete(identifier);
      }
    }
  }
}

/**
 * IP Management Service
 */
export class IPManagement {
  /**
   * Block an IP address
   */
  static blockIP(ip: string, reason: string, duration?: number): void {
    ipBlocklist.add(ip);
    
    AuditLogger.logSecurityEvent(
      AUDIT_EVENT_TYPES.IP_BLOCKED,
      { ip, reason, duration },
      SECURITY_RISK_LEVELS.HIGH
    );

    // If duration is specified, unblock after that time
    if (duration) {
      setTimeout(() => {
        this.unblockIP(ip, 'Automatic unblock after duration');
      }, duration);
    }
  }

  /**
   * Unblock an IP address
   */
  static unblockIP(ip: string, reason: string): void {
    ipBlocklist.delete(ip);
    
    AuditLogger.logSecurityEvent(
      AUDIT_EVENT_TYPES.IP_UNBLOCKED,
      { ip, reason },
      SECURITY_RISK_LEVELS.MEDIUM
    );
  }

  /**
   * Check if an IP is blocked
   */
  static isBlocked(ip: string): boolean {
    return ipBlocklist.has(ip);
  }

  /**
   * Add IP to whitelist
   */
  static whitelistIP(ip: string): void {
    ipWhitelist.add(ip);
    
    AuditLogger.logSecurityEvent(
      AUDIT_EVENT_TYPES.ACCESS_GRANTED,
      { ip, action: 'WHITELISTED' },
      SECURITY_RISK_LEVELS.LOW
    );
  }

  /**
   * Check if an IP is whitelisted
   */
  static isWhitelisted(ip: string): boolean {
    return ipWhitelist.has(ip);
  }

  /**
   * Get all blocked IPs
   */
  static getBlockedIPs(): string[] {
    return Array.from(ipBlocklist);
  }

  /**
   * Get all whitelisted IPs
   */
  static getWhitelistedIPs(): string[] {
    return Array.from(ipWhitelist);
  }
}

/**
 * Comprehensive Audit Logging Service
 */
export class AuditLogger {
  /**
   * Log a security event
   */
  static async logSecurityEvent(
    eventType: string,
    details: Record<string, any>,
    riskLevel: string = SECURITY_RISK_LEVELS.LOW,
    userId?: string,
    ip?: string
  ): Promise<void> {
    const auditEntry = {
      eventType,
      details,
      riskLevel,
      userId,
      ip,
      timestamp: new Date(),
      userAgent: details.userAgent || 'unknown',
      sessionId: details.sessionId || null,
    };

    try {
      // In production, this would be stored in a database
      // For now, we'll use console logging with structured data
      if (process.env.NODE_ENV === 'production') {
        console.warn('AUDIT_LOG:', JSON.stringify(auditEntry));
        
        // Store in database if available
        if (prisma) {
          await prisma.auditLog.create({
            data: {
              eventType,
              details: JSON.stringify(details),
              riskLevel,
              userId,
              ip,
              userAgent: auditEntry.userAgent,
              sessionId: auditEntry.sessionId,
            },
          }).catch(() => {
            // Silently fail if database is not available
          });
        }
      } else {
        console.log('AUDIT_LOG:', auditEntry);
      }
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  /**
   * Log authentication events
   */
  static async logAuthEvent(
    eventType: string,
    userId: string,
    ip: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.logSecurityEvent(
      eventType,
      { ...details, userId, ip },
      eventType.includes('FAILURE') ? SECURITY_RISK_LEVELS.MEDIUM : SECURITY_RISK_LEVELS.LOW,
      userId,
      ip
    );
  }

  /**
   * Log data access events
   */
  static async logDataEvent(
    eventType: string,
    userId: string,
    resourceType: string,
    resourceId: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.logSecurityEvent(
      eventType,
      { ...details, resourceType, resourceId },
      SECURITY_RISK_LEVELS.LOW,
      userId
    );
  }

  /**
   * Log system events
   */
  static async logSystemEvent(
    eventType: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.logSecurityEvent(
      eventType,
      details,
      eventType.includes('ERROR') ? SECURITY_RISK_LEVELS.HIGH : SECURITY_RISK_LEVELS.LOW
    );
  }

  /**
   * Get audit logs with filtering
   */
  static async getAuditLogs(filters: {
    eventType?: string;
    userId?: string;
    riskLevel?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}): Promise<any[]> {
    try {
      if (prisma) {
        return await prisma.auditLog.findMany({
          where: {
            ...(filters.eventType && { eventType: filters.eventType }),
            ...(filters.userId && { userId: filters.userId }),
            ...(filters.riskLevel && { riskLevel: filters.riskLevel }),
            ...(filters.startDate && { timestamp: { gte: filters.startDate } }),
            ...(filters.endDate && { timestamp: { lte: filters.endDate } }),
          },
          orderBy: { timestamp: 'desc' },
          take: filters.limit || 100,
        });
      }
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
    }
    
    return [];
  }
}

/**
 * Security Monitoring Service
 */
export class SecurityMonitoring {
  private static alertThresholds = {
    [SECURITY_RISK_LEVELS.CRITICAL]: 1,
    [SECURITY_RISK_LEVELS.HIGH]: 5,
    [SECURITY_RISK_LEVELS.MEDIUM]: 10,
    [SECURITY_RISK_LEVELS.LOW]: 50,
  };

  private static eventCounts = new Map<string, number>();
  private static lastReset = Date.now();

  /**
   * Monitor security events and trigger alerts
   */
  static async monitorEvent(
    eventType: string,
    riskLevel: string,
    details: Record<string, any>
  ): Promise<void> {
    const now = Date.now();
    const windowSize = 5 * 60 * 1000; // 5 minutes

    // Reset counters every window
    if (now - this.lastReset > windowSize) {
      this.eventCounts.clear();
      this.lastReset = now;
    }

    // Count events by risk level
    const key = `${riskLevel}:${eventType}`;
    const count = (this.eventCounts.get(key) || 0) + 1;
    this.eventCounts.set(key, count);

    // Check if we should trigger an alert
    const threshold = this.alertThresholds[riskLevel as keyof typeof this.alertThresholds];
    if (count >= threshold) {
      await this.triggerAlert(riskLevel, eventType, count, details);
    }
  }

  /**
   * Trigger security alert
   */
  private static async triggerAlert(
    riskLevel: string,
    eventType: string,
    count: number,
    details: Record<string, any>
  ): Promise<void> {
    const alert = {
      type: 'SECURITY_ALERT',
      riskLevel,
      eventType,
      count,
      details,
      timestamp: new Date(),
    };

    // In production, this would send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      console.error('SECURITY_ALERT:', JSON.stringify(alert));
    } else {
      console.warn('SECURITY_ALERT:', alert);
    }

    // Log the alert
    await AuditLogger.logSystemEvent('SECURITY_ALERT_TRIGGERED', alert);
  }

  /**
   * Get security metrics
   */
  static getSecurityMetrics(): {
    eventCounts: Record<string, number>;
    blockedIPs: number;
    lockedAccounts: number;
    lastReset: number;
  } {
    return {
      eventCounts: Object.fromEntries(this.eventCounts),
      blockedIPs: IPManagement.getBlockedIPs().length,
      lockedAccounts: bruteForceStore.size,
      lastReset: this.lastReset,
    };
  }
}

/**
 * Security Dashboard Service
 */
export class SecurityDashboard {
  /**
   * Get security overview
   */
  static async getSecurityOverview(): Promise<{
    totalEvents: number;
    criticalEvents: number;
    blockedIPs: number;
    lockedAccounts: number;
    recentEvents: any[];
    riskDistribution: Record<string, number>;
  }> {
    const recentEvents = await AuditLogger.getAuditLogs({ limit: 10 });
    const allEvents = await AuditLogger.getAuditLogs({ limit: 1000 });
    
    const riskDistribution = allEvents.reduce((acc, event) => {
      acc[event.riskLevel] = (acc[event.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: allEvents.length,
      criticalEvents: riskDistribution[SECURITY_RISK_LEVELS.CRITICAL] || 0,
      blockedIPs: IPManagement.getBlockedIPs().length,
      lockedAccounts: bruteForceStore.size,
      recentEvents,
      riskDistribution,
    };
  }

  /**
   * Get brute force statistics
   */
  static getBruteForceStats(): {
    totalAttempts: number;
    lockedAccounts: number;
    topOffenders: Array<{ identifier: string; attempts: number }>;
  } {
    const topOffenders = Array.from(bruteForceStore.entries())
      .map(([identifier, data]) => ({ identifier, attempts: data.attempts }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 10);

    return {
      totalAttempts: Array.from(bruteForceStore.values()).reduce((sum, data) => sum + data.attempts, 0),
      lockedAccounts: Array.from(bruteForceStore.values()).filter(data => data.lockedUntil).length,
      topOffenders,
    };
  }
}

// Cleanup expired entries periodically
setInterval(() => {
  BruteForceProtection.cleanup();
}, 5 * 60 * 1000); // Every 5 minutes
