import { GoogleSheetsAdapter } from '../integrations/GoogleSheetsAdapter';
import { IntegrationConfig } from '../models/IntegrationConfig';

describe('GoogleSheetsAdapter', () => {
  let adapter: GoogleSheetsAdapter;

  beforeEach(() => {
    adapter = new GoogleSheetsAdapter();
  });

  describe('getRequiredCredentials', () => {
    it('should return required credentials list', () => {
      const credentials = adapter.getRequiredCredentials();
      expect(credentials).toContain('spreadsheetId');
      expect(credentials).toContain('serviceAccountEmail');
      expect(credentials).toContain('privateKey');
    });
  });

  describe('testConnection', () => {
    it('should fail with missing credentials', async () => {
      const config: IntegrationConfig = {
        businessId: 'test-business',
        enabled: true,
        platform: 'google_sheets',
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

      const result = await adapter.testConnection(config);
      expect(result).toBe(false);
    });

    it('should fail with missing spreadsheetId', async () => {
      const config: IntegrationConfig = {
        businessId: 'test-business',
        enabled: true,
        platform: 'google_sheets',
        credentials: {
          serviceAccountEmail: 'test@test.com',
          privateKey: 'test-key',
        },
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

      const result = await adapter.testConnection(config);
      expect(result).toBe(false);
    });
  });
});
