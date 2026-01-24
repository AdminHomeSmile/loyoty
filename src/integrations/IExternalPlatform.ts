import { ExternalPlatformData } from '../models/SalesData';
import { IntegrationConfig, SubmissionResult } from '../models/IntegrationConfig';

/**
 * Base interface for external platform integrations
 */
export interface IExternalPlatform {
  /**
   * Test the connection to the external platform
   */
  testConnection(config: IntegrationConfig): Promise<boolean>;

  /**
   * Submit sales and/or rewards data to the platform
   */
  submitData(
    data: ExternalPlatformData,
    config: IntegrationConfig
  ): Promise<SubmissionResult>;

  /**
   * Initialize the platform (create sheets, tables, etc.)
   */
  initialize(config: IntegrationConfig): Promise<void>;

  /**
   * Get platform-specific configuration requirements
   */
  getRequiredCredentials(): string[];
}
