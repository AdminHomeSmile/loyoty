# Example: Configuring Google Sheets Integration

This example demonstrates how to set up and use the Google Sheets integration.

## Prerequisites

1. Google Cloud Project with Sheets API enabled
2. Service Account with JSON key file
3. Google Sheet created and shared with service account

## Configuration Example

```javascript
const config = {
  businessId: "acme-hardware-store",
  enabled: true,
  platform: "google_sheets",
  credentials: {
    spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    serviceAccountEmail: "loyalty-hub@my-project.iam.gserviceaccount.com",
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7vxZ...
-----END PRIVATE KEY-----`
  },
  settings: {
    salesEnabled: true,
    rewardsEnabled: true,
    batchSize: 10,
    retryAttempts: 3,
    retryDelayMs: 5000,
    dataMapping: {}
  }
};
```

## Using the Integration Manager

```typescript
import { IntegrationManager } from './services/IntegrationManager';
import { ExternalPlatformData } from './models/SalesData';

const manager = new IntegrationManager();

// Configure integration
await manager.configureIntegration(config);

// Test connection
const isConnected = await manager.testConnection('acme-hardware-store');
console.log('Connection status:', isConnected);

// Submit sales data
const salesData: ExternalPlatformData = {
  businessId: 'acme-hardware-store',
  submittedAt: new Date(),
  sales: {
    transactionId: 'tx-20260124-001',
    businessId: 'acme-hardware-store',
    timestamp: new Date(),
    customerId: 'cust-12345',
    items: [
      {
        productId: 'WS-100',
        productName: 'Premium Waterproof Sealant',
        quantity: 1,
        unitPrice: 29.99,
        totalPrice: 29.99,
        category: 'Sealants'
      },
      {
        productId: 'WS-200',
        productName: 'Waterproofing Spray',
        quantity: 2,
        unitPrice: 15.99,
        totalPrice: 31.98,
        category: 'Spray'
      }
    ],
    totalAmount: 61.97,
    currency: 'USD',
    paymentMethod: 'credit_card',
    status: 'completed'
  }
};

const result = await manager.submitData(salesData);
console.log('Submission result:', result);

// Submit rewards data
const rewardsData: ExternalPlatformData = {
  businessId: 'acme-hardware-store',
  submittedAt: new Date(),
  rewards: {
    rewardId: 'rwd-20260124-001',
    businessId: 'acme-hardware-store',
    customerId: 'cust-12345',
    transactionId: 'tx-20260124-001',
    timestamp: new Date(),
    pointsEarned: 62, // 1 point per dollar
    pointsRedeemed: 0,
    currentBalance: 562, // Previous balance: 500
    rewardType: 'earned',
    description: 'Points earned from purchase #tx-20260124-001'
  }
};

const rewardsResult = await manager.submitData(rewardsData);
console.log('Rewards submission result:', rewardsResult);

// Check retry queue
const queueStatus = manager.getQueueStatus('acme-hardware-store');
console.log('Queue status:', queueStatus);

// Disable integration
manager.disableIntegration('acme-hardware-store');

// Enable integration
await manager.enableIntegration('acme-hardware-store');
```

## Real-time Webhook Integration

```typescript
import express from 'express';
import { integrationManager } from './api/integrationRoutes';

const app = express();
app.use(express.json());

// Webhook for sales events
app.post('/webhooks/sales', async (req, res) => {
  const { businessId, transaction } = req.body;
  
  const data: ExternalPlatformData = {
    businessId,
    submittedAt: new Date(),
    sales: transaction
  };
  
  const result = await integrationManager.submitData(data);
  
  res.json({
    success: result.success,
    submissionId: result.submissionId
  });
});

// Webhook for rewards events
app.post('/webhooks/rewards', async (req, res) => {
  const { businessId, reward } = req.body;
  
  const data: ExternalPlatformData = {
    businessId,
    submittedAt: new Date(),
    rewards: reward
  };
  
  const result = await integrationManager.submitData(data);
  
  res.json({
    success: result.success,
    submissionId: result.submissionId
  });
});

// Background job to process retry queue
setInterval(async () => {
  const businesses = ['acme-hardware-store', 'other-business'];
  
  for (const businessId of businesses) {
    await integrationManager.processRetryQueue(businessId);
  }
}, 60000); // Every minute

app.listen(3000);
```

## Environment Variables

Create a `.env` file:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Google Sheets Configuration (if not stored in database)
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_SERVICE_ACCOUNT_EMAIL=loyalty-hub@my-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Integration Settings
DEFAULT_RETRY_ATTEMPTS=3
DEFAULT_RETRY_DELAY_MS=5000
DEFAULT_BATCH_SIZE=10
```

## Testing

Run the tests:

```bash
npm test
```

Test specific integration:

```bash
npm test -- GoogleSheetsAdapter.test
```

## Production Checklist

- [ ] Store credentials in secure secrets manager (not in code)
- [ ] Enable HTTPS for all API endpoints
- [ ] Set up monitoring and alerting for failed submissions
- [ ] Configure appropriate rate limits
- [ ] Set up log aggregation for error tracking
- [ ] Implement authentication/authorization for API endpoints
- [ ] Regular backup of configuration data
- [ ] Set up periodic retry queue processing
- [ ] Monitor Google Sheets API quota usage
- [ ] Document runbook for common issues
