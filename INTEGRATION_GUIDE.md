# External Sales Reporting Integration

This integration allows businesses to connect their Loyalty Rewards Hub to external platforms for real-time sales and rewards reporting.

## Supported Platforms

### Google Sheets
Real-time data submission to Google Sheets spreadsheets.

**Required Credentials:**
- `spreadsheetId`: The ID of the Google Sheet (from the URL)
- `serviceAccountEmail`: Service account email from Google Cloud Console
- `privateKey`: Private key from the service account JSON file

### Future Platforms
- QuickBooks (planned)
- Custom API endpoints (planned)

## Setup Guide

### 1. Create Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name (e.g., "loyalty-hub-integration")
   - Grant it "Editor" role
   - Click "Done"
5. Create a key:
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Select "JSON" format
   - Download the JSON file

### 2. Create Google Sheet

1. Create a new Google Sheet
2. Copy the Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
3. Share the spreadsheet with the service account email (from step 1)
   - Give it "Editor" permissions

### 3. Configure Integration

Use the API to configure the integration:

```bash
curl -X POST http://localhost:3000/api/integrations/configure \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "your-business-id",
    "enabled": true,
    "platform": "google_sheets",
    "credentials": {
      "spreadsheetId": "YOUR_SPREADSHEET_ID",
      "serviceAccountEmail": "SERVICE_ACCOUNT_EMAIL",
      "privateKey": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
    },
    "settings": {
      "salesEnabled": true,
      "rewardsEnabled": true,
      "batchSize": 10,
      "retryAttempts": 3,
      "retryDelayMs": 5000
    }
  }'
```

### 4. Test Connection

```bash
curl -X POST http://localhost:3000/api/integrations/your-business-id/test
```

### 5. Submit Data

Sales transaction:
```bash
curl -X POST http://localhost:3000/api/integrations/submit \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "your-business-id",
    "sales": {
      "transactionId": "tx-123",
      "businessId": "your-business-id",
      "timestamp": "2026-01-24T12:00:00Z",
      "customerId": "customer-456",
      "items": [
        {
          "productId": "prod-001",
          "productName": "Waterproof Sealant",
          "quantity": 2,
          "unitPrice": 25.00,
          "totalPrice": 50.00,
          "category": "sealants"
        }
      ],
      "totalAmount": 50.00,
      "currency": "USD",
      "paymentMethod": "credit_card",
      "status": "completed"
    }
  }'
```

Rewards update:
```bash
curl -X POST http://localhost:3000/api/integrations/submit \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "your-business-id",
    "rewards": {
      "rewardId": "rwd-789",
      "businessId": "your-business-id",
      "customerId": "customer-456",
      "transactionId": "tx-123",
      "timestamp": "2026-01-24T12:00:00Z",
      "pointsEarned": 50,
      "pointsRedeemed": 0,
      "currentBalance": 150,
      "rewardType": "earned",
      "description": "Points earned from purchase"
    }
  }'
```

## API Reference

### Configure Integration
**POST** `/api/integrations/configure`

Configure a new integration for a business.

**Request Body:**
```json
{
  "businessId": "string",
  "enabled": "boolean",
  "platform": "google_sheets | quickbooks | custom",
  "credentials": {
    "spreadsheetId": "string (Google Sheets)",
    "serviceAccountEmail": "string (Google Sheets)",
    "privateKey": "string (Google Sheets)"
  },
  "settings": {
    "salesEnabled": "boolean",
    "rewardsEnabled": "boolean",
    "batchSize": "number",
    "retryAttempts": "number",
    "retryDelayMs": "number"
  }
}
```

### Get Integration
**GET** `/api/integrations/:businessId`

Get integration configuration (sensitive credentials are masked).

### Update Integration
**PATCH** `/api/integrations/:businessId`

Update integration settings or credentials.

### Enable Integration
**POST** `/api/integrations/:businessId/enable`

Enable the integration for real-time data submission.

### Disable Integration
**POST** `/api/integrations/:businessId/disable`

Disable the integration (stops data submission).

### Test Connection
**POST** `/api/integrations/:businessId/test`

Test the connection to the external platform.

### Submit Data
**POST** `/api/integrations/submit`

Submit sales and/or rewards data in real-time.

### Get Queue Status
**GET** `/api/integrations/:businessId/queue`

Get status of retry queue for failed submissions.

### Get Supported Platforms
**GET** `/api/integrations/platforms/list`

Get list of supported external platforms.

## Error Handling

The integration includes automatic retry mechanism for failed submissions:

- Failed submissions are queued automatically
- Retries use exponential backoff
- Maximum retry attempts configurable per business
- All errors are logged with detailed information

## Data Format

### Google Sheets Output

**Sales Sheet:**
| Transaction ID | Business ID | Timestamp | Customer ID | Total Amount | Currency | Payment Method | Status | Items (JSON) |
|---------------|-------------|-----------|-------------|--------------|----------|----------------|--------|--------------|

**Rewards Sheet:**
| Reward ID | Business ID | Customer ID | Transaction ID | Timestamp | Points Earned | Points Redeemed | Current Balance | Reward Type | Description |
|-----------|-------------|-------------|----------------|-----------|---------------|-----------------|-----------------|-------------|-------------|

## Security Notes

- Private keys and tokens are never returned in API responses
- Service account should have minimal required permissions
- Use HTTPS in production
- Store credentials securely (environment variables or secrets manager)
- Regularly rotate service account keys

## Monitoring

Monitor integration health through:
- Queue status endpoint (shows pending retries)
- Submission results (success/failure rates)
- Error logs (detailed error information)

## Troubleshooting

### Connection Test Fails
- Verify service account credentials
- Check if spreadsheet is shared with service account email
- Ensure Google Sheets API is enabled in Google Cloud Console

### Data Not Appearing in Sheet
- Check if integration is enabled
- Verify settings (salesEnabled/rewardsEnabled)
- Check queue status for pending retries
- Review error logs for detailed error messages

### Authentication Errors
- Verify private key format (should include newlines)
- Check service account email is correct
- Ensure service account has Editor permissions on the sheet
