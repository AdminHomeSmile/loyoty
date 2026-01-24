/**
 * Integration configuration for a business
 */
export interface IntegrationConfig {
  businessId: string;
  enabled: boolean;
  platform: 'google_sheets' | 'quickbooks' | 'custom';
  credentials: PlatformCredentials;
  settings: IntegrationSettings;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Platform-specific credentials
 */
export interface PlatformCredentials {
  // Google Sheets
  spreadsheetId?: string;
  serviceAccountEmail?: string;
  privateKey?: string;
  
  // QuickBooks (future)
  clientId?: string;
  clientSecret?: string;
  realmId?: string;
  accessToken?: string;
  refreshToken?: string;
  
  // Custom API
  apiUrl?: string;
  apiKey?: string;
}

/**
 * Integration settings
 */
export interface IntegrationSettings {
  salesEnabled: boolean;
  rewardsEnabled: boolean;
  batchSize: number;
  retryAttempts: number;
  retryDelayMs: number;
  dataMapping?: Record<string, string>;
}

/**
 * Submission result
 */
export interface SubmissionResult {
  success: boolean;
  submissionId: string;
  timestamp: Date;
  recordsSubmitted: number;
  errors?: SubmissionError[];
}

/**
 * Submission error details
 */
export interface SubmissionError {
  recordId: string;
  errorCode: string;
  errorMessage: string;
  timestamp: Date;
  retryable: boolean;
}
