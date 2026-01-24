import { IExternalPlatform } from '../integrations/IExternalPlatform';
import { GoogleSheetsAdapter } from '../integrations/GoogleSheetsAdapter';
import { ExternalPlatformData } from '../models/SalesData';
import { IntegrationConfig, SubmissionResult, SubmissionError } from '../models/IntegrationConfig';

/**
 * Manages external platform integrations
 */
export class IntegrationManager {
  private platforms: Map<string, IExternalPlatform>;
  private configStore: Map<string, IntegrationConfig>;
  private submissionQueue: Map<string, QueuedSubmission[]>;

  constructor() {
    this.platforms = new Map();
    this.configStore = new Map();
    this.submissionQueue = new Map();

    // Register available platforms
    this.platforms.set('google_sheets', new GoogleSheetsAdapter());
  }

  /**
   * Configure integration for a business
   */
  async configureIntegration(config: IntegrationConfig): Promise<boolean> {
    try {
      const platform = this.platforms.get(config.platform);
      if (!platform) {
        throw new Error(`Platform ${config.platform} is not supported`);
      }

      // Validate credentials
      const requiredCreds = platform.getRequiredCredentials();
      for (const cred of requiredCreds) {
        if (!config.credentials[cred as keyof typeof config.credentials]) {
          throw new Error(`Missing required credential: ${cred}`);
        }
      }

      // Test connection
      const connectionTest = await platform.testConnection(config);
      if (!connectionTest) {
        throw new Error('Connection test failed');
      }

      // Initialize platform if enabled
      if (config.enabled) {
        await platform.initialize(config);
      }

      // Store configuration
      this.configStore.set(config.businessId, config);
      
      return true;
    } catch (error) {
      console.error('Failed to configure integration:', error);
      return false;
    }
  }

  /**
   * Get integration configuration for a business
   */
  getConfig(businessId: string): IntegrationConfig | undefined {
    return this.configStore.get(businessId);
  }

  /**
   * Update integration settings
   */
  async updateIntegration(
    businessId: string,
    updates: Partial<IntegrationConfig>
  ): Promise<boolean> {
    const config = this.configStore.get(businessId);
    if (!config) {
      throw new Error('Integration not found');
    }

    const updatedConfig: IntegrationConfig = {
      ...config,
      ...updates,
      updatedAt: new Date(),
    };

    return this.configureIntegration(updatedConfig);
  }

  /**
   * Disable integration for a business
   */
  disableIntegration(businessId: string): boolean {
    const config = this.configStore.get(businessId);
    if (!config) {
      return false;
    }

    config.enabled = false;
    config.updatedAt = new Date();
    this.configStore.set(businessId, config);
    return true;
  }

  /**
   * Enable integration for a business
   */
  async enableIntegration(businessId: string): Promise<boolean> {
    const config = this.configStore.get(businessId);
    if (!config) {
      return false;
    }

    config.enabled = true;
    config.updatedAt = new Date();
    this.configStore.set(businessId, config);
    
    // Initialize platform
    const platform = this.platforms.get(config.platform);
    if (platform) {
      await platform.initialize(config);
    }
    
    return true;
  }

  /**
   * Submit data to external platform in real-time
   */
  async submitData(data: ExternalPlatformData): Promise<SubmissionResult> {
    const config = this.configStore.get(data.businessId);
    
    if (!config) {
      return this.createErrorResult('CONFIG_NOT_FOUND', 'Integration not configured');
    }

    if (!config.enabled) {
      return this.createErrorResult('INTEGRATION_DISABLED', 'Integration is disabled');
    }

    const platform = this.platforms.get(config.platform);
    if (!platform) {
      return this.createErrorResult('PLATFORM_NOT_FOUND', 'Platform not supported');
    }

    try {
      const result = await platform.submitData(data, config);
      
      // Log submission
      this.logSubmission(data.businessId, result);
      
      // Queue for retry if failed
      if (!result.success && result.errors) {
        await this.queueForRetry(data, config, result.errors);
      }
      
      return result;
    } catch (error) {
      const errorResult = this.createErrorResult(
        'SUBMISSION_ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      // Queue for retry
      await this.queueForRetry(data, config, errorResult.errors || []);
      
      return errorResult;
    }
  }

  /**
   * Queue failed submission for retry
   */
  private async queueForRetry(
    data: ExternalPlatformData,
    config: IntegrationConfig,
    errors: SubmissionError[]
  ): Promise<void> {
    const retryableErrors = errors.filter(e => e.retryable);
    
    if (retryableErrors.length === 0) {
      return;
    }

    if (!this.submissionQueue.has(data.businessId)) {
      this.submissionQueue.set(data.businessId, []);
    }

    const queue = this.submissionQueue.get(data.businessId)!;
    queue.push({
      data,
      config,
      errors: retryableErrors,
      attempts: 0,
      nextRetry: new Date(Date.now() + config.settings.retryDelayMs),
    });
  }

  /**
   * Process retry queue
   */
  async processRetryQueue(businessId: string): Promise<void> {
    const queue = this.submissionQueue.get(businessId);
    if (!queue || queue.length === 0) {
      return;
    }

    const now = new Date();
    const itemsToRetry = queue.filter(item => item.nextRetry <= now);

    for (const item of itemsToRetry) {
      if (item.attempts >= item.config.settings.retryAttempts) {
        // Max retries reached, log and remove
        console.error('Max retry attempts reached for submission:', item.data);
        this.removeFromQueue(businessId, item);
        continue;
      }

      const platform = this.platforms.get(item.config.platform);
      if (!platform) {
        this.removeFromQueue(businessId, item);
        continue;
      }

      try {
        const result = await platform.submitData(item.data, item.config);
        
        if (result.success) {
          // Success, remove from queue
          this.removeFromQueue(businessId, item);
          this.logSubmission(businessId, result);
        } else {
          // Failed again, update retry time
          item.attempts++;
          item.nextRetry = new Date(
            Date.now() + item.config.settings.retryDelayMs * Math.pow(2, item.attempts)
          );
        }
      } catch (error) {
        item.attempts++;
        item.nextRetry = new Date(
          Date.now() + item.config.settings.retryDelayMs * Math.pow(2, item.attempts)
        );
      }
    }
  }

  /**
   * Remove item from retry queue
   */
  private removeFromQueue(businessId: string, item: QueuedSubmission): void {
    const queue = this.submissionQueue.get(businessId);
    if (queue) {
      const index = queue.indexOf(item);
      if (index > -1) {
        queue.splice(index, 1);
      }
    }
  }

  /**
   * Get retry queue status
   */
  getQueueStatus(businessId: string): QueuedSubmission[] {
    return this.submissionQueue.get(businessId) || [];
  }

  /**
   * Log successful submission
   */
  private logSubmission(businessId: string, result: SubmissionResult): void {
    console.log(`[${businessId}] Submission ${result.submissionId}:`, {
      success: result.success,
      recordsSubmitted: result.recordsSubmitted,
      timestamp: result.timestamp,
      errors: result.errors?.length || 0,
    });
  }

  /**
   * Create error result
   */
  private createErrorResult(errorCode: string, errorMessage: string): SubmissionResult {
    return {
      success: false,
      submissionId: `error_${Date.now()}`,
      timestamp: new Date(),
      recordsSubmitted: 0,
      errors: [
        {
          recordId: 'GENERAL',
          errorCode,
          errorMessage,
          timestamp: new Date(),
          retryable: false,
        },
      ],
    };
  }

  /**
   * Test connection for a business
   */
  async testConnection(businessId: string): Promise<boolean> {
    const config = this.configStore.get(businessId);
    if (!config) {
      return false;
    }

    const platform = this.platforms.get(config.platform);
    if (!platform) {
      return false;
    }

    return platform.testConnection(config);
  }

  /**
   * Get list of supported platforms
   */
  getSupportedPlatforms(): string[] {
    return Array.from(this.platforms.keys());
  }
}

/**
 * Queued submission for retry
 */
interface QueuedSubmission {
  data: ExternalPlatformData;
  config: IntegrationConfig;
  errors: SubmissionError[];
  attempts: number;
  nextRetry: Date;
}
