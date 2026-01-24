import { IntegrationManager } from '../services/IntegrationManager';
import { IntegrationConfig } from '../models/IntegrationConfig';
import { ExternalPlatformData } from '../models/SalesData';

describe('IntegrationManager', () => {
  let manager: IntegrationManager;

  beforeEach(() => {
    manager = new IntegrationManager();
  });

  describe('getSupportedPlatforms', () => {
    it('should return list of supported platforms', () => {
      const platforms = manager.getSupportedPlatforms();
      expect(platforms).toContain('google_sheets');
      expect(platforms.length).toBeGreaterThan(0);
    });
  });

  describe('configureIntegration', () => {
    it('should reject unsupported platform', async () => {
      const config: IntegrationConfig = {
        businessId: 'test-business',
        enabled: true,
        platform: 'unsupported' as any,
        credentials: {},
        settings: {
          salesEnabled: true,
          rewardsEnabled: true,
          batchSize: 10,
          retryAttempts: 3,
          retryDelayMs: 1000,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await manager.configureIntegration(config);
      expect(result).toBe(false);
    });

    it('should reject missing credentials', async () => {
      const config: IntegrationConfig = {
        businessId: 'test-business',
        enabled: true,
        platform: 'google_sheets',
        credentials: {}, // Missing required credentials
        settings: {
          salesEnabled: true,
          rewardsEnabled: true,
          batchSize: 10,
          retryAttempts: 3,
          retryDelayMs: 1000,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await manager.configureIntegration(config);
      expect(result).toBe(false);
    });
  });

  describe('getConfig', () => {
    it('should return undefined for non-existent business', () => {
      const config = manager.getConfig('non-existent');
      expect(config).toBeUndefined();
    });
  });

  describe('disableIntegration', () => {
    it('should return false for non-existent business', () => {
      const result = manager.disableIntegration('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('submitData', () => {
    it('should return error when integration not configured', async () => {
      const data: ExternalPlatformData = {
        businessId: 'non-existent',
        submittedAt: new Date(),
        sales: {
          transactionId: 'tx-123',
          businessId: 'non-existent',
          timestamp: new Date(),
          items: [],
          totalAmount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card',
          status: 'completed',
        },
      };

      const result = await manager.submitData(data);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].errorCode).toBe('CONFIG_NOT_FOUND');
    });
  });

  describe('getQueueStatus', () => {
    it('should return empty array for business with no queue', () => {
      const queue = manager.getQueueStatus('test-business');
      expect(queue).toEqual([]);
    });
  });
});
