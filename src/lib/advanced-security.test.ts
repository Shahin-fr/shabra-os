import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import {
  BruteForceProtection,
  IPManagement,
  AuditLogger,
  SecurityMonitoring,
  SecurityDashboard,
  AUDIT_EVENT_TYPES,
  SECURITY_RISK_LEVELS,
  BRUTE_FORCE_CONFIG,
} from './advanced-security';
import { prisma } from '@/lib/prisma';

describe('Advanced Security Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear in-memory stores
    if ((BruteForceProtection as any).bruteForceStore) {
      (BruteForceProtection as any).bruteForceStore.clear();
    }
    if ((IPManagement as any).ipBlocklist) {
      (IPManagement as any).ipBlocklist.clear();
    }
    if ((IPManagement as any).ipWhitelist) {
      (IPManagement as any).ipWhitelist.clear();
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Brute Force Protection', () => {
    it('should allow normal attempts within limits', () => {
      const identifier = 'test-ip';
      
      for (let i = 0; i < BRUTE_FORCE_CONFIG.maxAttempts - 1; i++) {
        const result = BruteForceProtection.recordFailedAttempt(identifier);
        expect(result.isLocked).toBe(false);
        expect(result.remainingAttempts).toBe(BRUTE_FORCE_CONFIG.maxAttempts - i - 1);
      }
    });

    it('should lock after maximum attempts', () => {
      const identifier = 'test-ip';
      
      // Make maximum attempts
      for (let i = 0; i < BRUTE_FORCE_CONFIG.maxAttempts; i++) {
        BruteForceProtection.recordFailedAttempt(identifier);
      }
      
      // Next attempt should be locked
      const result = BruteForceProtection.recordFailedAttempt(identifier);
      expect(result.isLocked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
      expect(result.lockoutDuration).toBeDefined();
    });

    it('should reset attempts on successful login', () => {
      const identifier = 'test-ip-reset';
      
      // Make some failed attempts
      BruteForceProtection.recordFailedAttempt(identifier);
      BruteForceProtection.recordFailedAttempt(identifier);
      
      expect(BruteForceProtection.getAttemptCount(identifier)).toBe(2);
      
      // Record successful attempt
      BruteForceProtection.recordSuccessfulAttempt(identifier);
      
      expect(BruteForceProtection.getAttemptCount(identifier)).toBe(0);
      expect(BruteForceProtection.isLocked(identifier)).toBe(false);
    });

    it('should implement progressive delays', () => {
      const identifier = 'test-ip-delays';
      
      const result1 = BruteForceProtection.recordFailedAttempt(identifier);
      const result2 = BruteForceProtection.recordFailedAttempt(identifier);
      const result3 = BruteForceProtection.recordFailedAttempt(identifier);
      
      expect(result1.delay).toBe(BRUTE_FORCE_CONFIG.baseDelay);
      expect(result2.delay).toBe(BRUTE_FORCE_CONFIG.baseDelay * 2);
      expect(result3.delay).toBe(BRUTE_FORCE_CONFIG.baseDelay * 4);
    });

    it('should unlock manually', () => {
      const identifier = 'test-ip-unlock';
      
      // Lock the account
      for (let i = 0; i < BRUTE_FORCE_CONFIG.maxAttempts; i++) {
        BruteForceProtection.recordFailedAttempt(identifier);
      }
      
      expect(BruteForceProtection.isLocked(identifier)).toBe(true);
      
      // Unlock manually
      BruteForceProtection.unlock(identifier);
      
      expect(BruteForceProtection.isLocked(identifier)).toBe(false);
      expect(BruteForceProtection.getAttemptCount(identifier)).toBe(0);
    });
  });

  describe('IP Management', () => {
    it('should block and unblock IPs', () => {
      const ip = '192.168.1.100';
      
      expect(IPManagement.isBlocked(ip)).toBe(false);
      
      IPManagement.blockIP(ip, 'Test block');
      expect(IPManagement.isBlocked(ip)).toBe(true);
      
      IPManagement.unblockIP(ip, 'Test unblock');
      expect(IPManagement.isBlocked(ip)).toBe(false);
    });

    it('should whitelist IPs', () => {
      const ip = '192.168.1.100';
      
      expect(IPManagement.isWhitelisted(ip)).toBe(false);
      
      IPManagement.whitelistIP(ip);
      expect(IPManagement.isWhitelisted(ip)).toBe(true);
    });

    it('should get blocked and whitelisted IPs', () => {
      const blockedIPs = ['192.168.1.100', '192.168.1.101'];
      const whitelistedIPs = ['192.168.1.200', '192.168.1.201'];
      
      blockedIPs.forEach(ip => IPManagement.blockIP(ip, 'Test'));
      whitelistedIPs.forEach(ip => IPManagement.whitelistIP(ip));
      
      const blocked = IPManagement.getBlockedIPs();
      const whitelisted = IPManagement.getWhitelistedIPs();
      
      expect(blocked).toEqual(expect.arrayContaining(blockedIPs));
      expect(whitelisted).toEqual(expect.arrayContaining(whitelistedIPs));
    });
  });

  describe('Audit Logging', () => {
    it('should log security events', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await AuditLogger.logSecurityEvent(
        AUDIT_EVENT_TYPES.LOGIN_SUCCESS,
        { userId: 'user123', ip: '192.168.1.100' },
        SECURITY_RISK_LEVELS.LOW
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'AUDIT_LOG:',
        expect.objectContaining({
          eventType: AUDIT_EVENT_TYPES.LOGIN_SUCCESS,
          riskLevel: SECURITY_RISK_LEVELS.LOW,
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should log auth events', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await AuditLogger.logAuthEvent(
        AUDIT_EVENT_TYPES.LOGIN_FAILURE,
        'user123',
        '192.168.1.100',
        { reason: 'Invalid password' }
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'AUDIT_LOG:',
        expect.objectContaining({
          eventType: AUDIT_EVENT_TYPES.LOGIN_FAILURE,
          userId: 'user123',
          ip: '192.168.1.100',
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should log data events', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await AuditLogger.logDataEvent(
        AUDIT_EVENT_TYPES.DATA_CREATED,
        'user123',
        'User',
        'user456',
        { action: 'create' }
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'AUDIT_LOG:',
        expect.objectContaining({
          eventType: AUDIT_EVENT_TYPES.DATA_CREATED,
          userId: 'user123',
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should log system events', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await AuditLogger.logSystemEvent(
        AUDIT_EVENT_TYPES.SYSTEM_ERROR,
        { error: 'Database connection failed' }
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'AUDIT_LOG:',
        expect.objectContaining({
          eventType: AUDIT_EVENT_TYPES.SYSTEM_ERROR,
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should retrieve audit logs with filters', async () => {
      const mockLogs = [
        {
          id: '1',
          eventType: AUDIT_EVENT_TYPES.LOGIN_SUCCESS,
          riskLevel: SECURITY_RISK_LEVELS.LOW,
          userId: 'user123',
          timestamp: new Date(),
        },
        {
          id: '2',
          eventType: AUDIT_EVENT_TYPES.LOGIN_FAILURE,
          riskLevel: SECURITY_RISK_LEVELS.MEDIUM,
          userId: 'user456',
          timestamp: new Date(),
        },
      ];
      
      (prisma.auditLog.findMany as any).mockResolvedValue(mockLogs);
      
      const logs = await AuditLogger.getAuditLogs({
        eventType: AUDIT_EVENT_TYPES.LOGIN_SUCCESS,
        limit: 10,
      });
      
      expect(logs).toEqual(mockLogs);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          eventType: AUDIT_EVENT_TYPES.LOGIN_SUCCESS,
        },
        orderBy: { timestamp: 'desc' },
        take: 10,
      });
    });
  });

  describe('Security Monitoring', () => {
    it('should monitor events and trigger alerts', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Trigger multiple high-risk events to exceed threshold
      for (let i = 0; i < 6; i++) {
        await SecurityMonitoring.monitorEvent(
          AUDIT_EVENT_TYPES.BRUTE_FORCE_DETECTED,
          SECURITY_RISK_LEVELS.HIGH,
          { ip: '192.168.1.100' }
        );
      }
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'SECURITY_ALERT:',
        expect.objectContaining({
          type: 'SECURITY_ALERT',
          riskLevel: SECURITY_RISK_LEVELS.HIGH,
          eventType: AUDIT_EVENT_TYPES.BRUTE_FORCE_DETECTED,
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should get security metrics', () => {
      const metrics = SecurityMonitoring.getSecurityMetrics();
      
      expect(metrics).toHaveProperty('eventCounts');
      expect(metrics).toHaveProperty('blockedIPs');
      expect(metrics).toHaveProperty('lockedAccounts');
      expect(metrics).toHaveProperty('lastReset');
    });
  });

  describe('Security Dashboard', () => {
    it('should get security overview', async () => {
      const mockLogs = [
        { riskLevel: SECURITY_RISK_LEVELS.LOW },
        { riskLevel: SECURITY_RISK_LEVELS.HIGH },
        { riskLevel: SECURITY_RISK_LEVELS.CRITICAL },
      ];
      
      (prisma.auditLog.findMany as any)
        .mockResolvedValueOnce(mockLogs) // recent events
        .mockResolvedValueOnce(mockLogs); // all events
      
      const overview = await SecurityDashboard.getSecurityOverview();
      
      expect(overview).toHaveProperty('totalEvents');
      expect(overview).toHaveProperty('criticalEvents');
      expect(overview).toHaveProperty('blockedIPs');
      expect(overview).toHaveProperty('lockedAccounts');
      expect(overview).toHaveProperty('recentEvents');
      expect(overview).toHaveProperty('riskDistribution');
    });

    it('should get brute force statistics', () => {
      // Add some test data
      BruteForceProtection.recordFailedAttempt('ip1');
      BruteForceProtection.recordFailedAttempt('ip1');
      BruteForceProtection.recordFailedAttempt('ip2');
      
      const stats = SecurityDashboard.getBruteForceStats();
      
      expect(stats).toHaveProperty('totalAttempts');
      expect(stats).toHaveProperty('lockedAccounts');
      expect(stats).toHaveProperty('topOffenders');
      expect(Array.isArray(stats.topOffenders)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete brute force attack scenario', async () => {
      const ip = '192.168.1.500';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Clear any existing state for this IP
      BruteForceProtection.recordSuccessfulAttempt(ip);
      
      // Simulate brute force attack
      for (let i = 0; i < BRUTE_FORCE_CONFIG.maxAttempts + 2; i++) {
        const result = BruteForceProtection.recordFailedAttempt(ip);
        
        if (i < BRUTE_FORCE_CONFIG.maxAttempts) {
          expect(result.isLocked).toBe(false);
        } else {
          expect(result.isLocked).toBe(true);
        }
      }
      
      // Should be locked
      expect(BruteForceProtection.isLocked(ip)).toBe(true);
      
      // Block IP after excessive attempts
      if (BruteForceProtection.getAttemptCount(ip) >= 10) {
        IPManagement.blockIP(ip, 'Excessive brute force attempts');
        expect(IPManagement.isBlocked(ip)).toBe(true);
      }
      
      // Log the events
      await AuditLogger.logSecurityEvent(
        AUDIT_EVENT_TYPES.BRUTE_FORCE_DETECTED,
        { ip, attempts: BruteForceProtection.getAttemptCount(ip) },
        SECURITY_RISK_LEVELS.CRITICAL,
        undefined,
        ip
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'AUDIT_LOG:',
        expect.objectContaining({
          eventType: AUDIT_EVENT_TYPES.BRUTE_FORCE_DETECTED,
          riskLevel: SECURITY_RISK_LEVELS.CRITICAL,
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle successful login after failed attempts', async () => {
      const ip = '192.168.1.300';
      const userId = 'user123';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Make some failed attempts
      BruteForceProtection.recordFailedAttempt(ip);
      BruteForceProtection.recordFailedAttempt(ip);
      
      expect(BruteForceProtection.getAttemptCount(ip)).toBe(2);
      
      // Successful login
      BruteForceProtection.recordSuccessfulAttempt(ip);
      await AuditLogger.logAuthEvent(
        AUDIT_EVENT_TYPES.LOGIN_SUCCESS,
        userId,
        ip,
        { pathname: '/login' }
      );
      
      expect(BruteForceProtection.getAttemptCount(ip)).toBe(0);
      expect(BruteForceProtection.isLocked(ip)).toBe(false);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'AUDIT_LOG:',
        expect.objectContaining({
          eventType: AUDIT_EVENT_TYPES.LOGIN_SUCCESS,
          userId,
          ip,
        })
      );
      
      consoleSpy.mockRestore();
    });
  });
});
