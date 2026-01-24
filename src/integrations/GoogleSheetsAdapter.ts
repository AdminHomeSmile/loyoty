import { google, sheets_v4 } from 'googleapis';
import { IExternalPlatform } from './IExternalPlatform';
import { ExternalPlatformData, SalesTransaction, RewardsData } from '../models/SalesData';
import { IntegrationConfig, SubmissionResult, SubmissionError } from '../models/IntegrationConfig';

/**
 * Google Sheets integration adapter
 */
export class GoogleSheetsAdapter implements IExternalPlatform {
  private sheets: sheets_v4.Sheets | null = null;

  /**
   * Get authenticated Google Sheets client
   */
  private async getClient(config: IntegrationConfig): Promise<sheets_v4.Sheets> {
    if (!config.credentials.privateKey || !config.credentials.serviceAccountEmail) {
      throw new Error('Google Sheets credentials are missing');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.credentials.serviceAccountEmail,
        private_key: config.credentials.privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    return google.sheets({ version: 'v4', auth: authClient as any });
  }

  /**
   * Test connection to Google Sheets
   */
  async testConnection(config: IntegrationConfig): Promise<boolean> {
    try {
      const sheets = await this.getClient(config);
      
      if (!config.credentials.spreadsheetId) {
        throw new Error('Spreadsheet ID is required');
      }

      // Try to read spreadsheet metadata
      await sheets.spreadsheets.get({
        spreadsheetId: config.credentials.spreadsheetId,
      });

      return true;
    } catch (error) {
      console.error('Google Sheets connection test failed:', error);
      return false;
    }
  }

  /**
   * Initialize Google Sheets with required tabs
   */
  async initialize(config: IntegrationConfig): Promise<void> {
    const sheets = await this.getClient(config);
    const spreadsheetId = config.credentials.spreadsheetId;

    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required');
    }

    try {
      // Create Sales sheet
      await this.createSheetIfNotExists(sheets, spreadsheetId, 'Sales', [
        'Transaction ID',
        'Business ID',
        'Timestamp',
        'Customer ID',
        'Total Amount',
        'Currency',
        'Payment Method',
        'Status',
        'Items',
      ]);

      // Create Rewards sheet
      await this.createSheetIfNotExists(sheets, spreadsheetId, 'Rewards', [
        'Reward ID',
        'Business ID',
        'Customer ID',
        'Transaction ID',
        'Timestamp',
        'Points Earned',
        'Points Redeemed',
        'Current Balance',
        'Reward Type',
        'Description',
      ]);
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Create sheet if it doesn't exist
   */
  private async createSheetIfNotExists(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    sheetName: string,
    headers: string[]
  ): Promise<void> {
    try {
      // Check if sheet exists
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
      const existingSheet = spreadsheet.data.sheets?.find(
        (sheet) => sheet.properties?.title === sheetName
      );

      if (!existingSheet) {
        // Create new sheet
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetName,
                  },
                },
              },
            ],
          },
        });
      }

      // Write headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers],
        },
      });
    } catch (error) {
      console.error(`Failed to create/update sheet ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Submit data to Google Sheets
   */
  async submitData(
    data: ExternalPlatformData,
    config: IntegrationConfig
  ): Promise<SubmissionResult> {
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const errors: SubmissionError[] = [];
    let recordsSubmitted = 0;

    try {
      const sheets = await this.getClient(config);
      const spreadsheetId = config.credentials.spreadsheetId;

      if (!spreadsheetId) {
        throw new Error('Spreadsheet ID is required');
      }

      // Submit sales data if present and enabled
      if (data.sales && config.settings.salesEnabled) {
        try {
          await this.submitSalesData(sheets, spreadsheetId, data.sales);
          recordsSubmitted++;
        } catch (error) {
          errors.push({
            recordId: data.sales.transactionId,
            errorCode: 'SALES_SUBMISSION_FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
            retryable: true,
          });
        }
      }

      // Submit rewards data if present and enabled
      if (data.rewards && config.settings.rewardsEnabled) {
        try {
          await this.submitRewardsData(sheets, spreadsheetId, data.rewards);
          recordsSubmitted++;
        } catch (error) {
          errors.push({
            recordId: data.rewards.rewardId,
            errorCode: 'REWARDS_SUBMISSION_FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
            retryable: true,
          });
        }
      }

      return {
        success: errors.length === 0,
        submissionId,
        timestamp: new Date(),
        recordsSubmitted,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        submissionId,
        timestamp: new Date(),
        recordsSubmitted,
        errors: [
          {
            recordId: 'GENERAL',
            errorCode: 'SUBMISSION_FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
            retryable: true,
          },
        ],
      };
    }
  }

  /**
   * Submit sales transaction to Google Sheets
   */
  private async submitSalesData(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    sales: SalesTransaction
  ): Promise<void> {
    const itemsJson = JSON.stringify(sales.items);
    
    const row = [
      sales.transactionId,
      sales.businessId,
      sales.timestamp.toISOString(),
      sales.customerId || '',
      sales.totalAmount,
      sales.currency,
      sales.paymentMethod,
      sales.status,
      itemsJson,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sales!A:I',
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });
  }

  /**
   * Submit rewards data to Google Sheets
   */
  private async submitRewardsData(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    rewards: RewardsData
  ): Promise<void> {
    const row = [
      rewards.rewardId,
      rewards.businessId,
      rewards.customerId,
      rewards.transactionId || '',
      rewards.timestamp.toISOString(),
      rewards.pointsEarned,
      rewards.pointsRedeemed,
      rewards.currentBalance,
      rewards.rewardType,
      rewards.description || '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Rewards!A:J',
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });
  }

  /**
   * Get required credentials for Google Sheets
   */
  getRequiredCredentials(): string[] {
    return ['spreadsheetId', 'serviceAccountEmail', 'privateKey'];
  }
}
