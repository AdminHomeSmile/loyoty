# Loyalty Rewards Hub

Loyalty Rewards Hub is a loyalty and reporting platform that enables small businesses to sell waterproofing and sealant products, let customers scan receipts to earn rewards, and share real-time sales insights with external partners.

## Product goal
Deliver a usable end-to-end app that supports the real workflow of store owners, customers, and partner platforms.

## Core user flows
1. **Store owner** registers a business, adds products, and shares a unique QR code at checkout.
2. **Customer** scans the QR code, uploads a receipt, and earns points once the purchase is verified.
3. **Backend** validates receipts, updates rewards balances, and publishes sales/rewards data to partner platforms.

## MVP scope (what to build first)
- **Customer experience**: receipt upload, rewards balance, points redemption history.
- **Merchant dashboard**: product catalog, sales summary, reward liability, customer activity.
- **Operations & reporting**: receipt verification queue, fraud flags, exportable reports, partner API webhooks.
- **Security & compliance**: role-based access, audit logs, basic PII handling.

## Features

### External Sales Reporting Integration ✅
Real-time integration with external platforms for sales and rewards data reporting.

**Supported Platforms:**
- Google Sheets - Real-time data submission to spreadsheets
- QuickBooks (planned)
- Custom API endpoints (planned)

**Key Capabilities:**
- Configure integrations per business with secure credentials
- Enable/disable integrations on demand
- Real-time data submission for sales transactions and rewards
- Automatic retry mechanism with exponential backoff
- Comprehensive error logging and reporting
- Test connection before enabling
- Queue status monitoring for failed submissions

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for detailed setup instructions and [EXAMPLES.md](EXAMPLES.md) for usage examples.

## Getting Started

### Installation

```bash
npm install
```

### Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
# Edit .env with your configuration
```

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Start the Server

```bash
npm start
```

The API will be available at `http://localhost:3000`

### API Endpoints

- **Health Check**: `GET /health`
- **List Platforms**: `GET /api/integrations/platforms/list`
- **Configure Integration**: `POST /api/integrations/configure`
- **Get Integration**: `GET /api/integrations/:businessId`
- **Update Integration**: `PATCH /api/integrations/:businessId`
- **Enable Integration**: `POST /api/integrations/:businessId/enable`
- **Disable Integration**: `POST /api/integrations/:businessId/disable`
- **Test Connection**: `POST /api/integrations/:businessId/test`
- **Submit Data**: `POST /api/integrations/submit`
- **Get Queue Status**: `GET /api/integrations/:businessId/queue`

## Documentation

- [Integration Guide](INTEGRATION_GUIDE.md) - Detailed setup and configuration guide
- [Examples](EXAMPLES.md) - Code examples and usage patterns

## Next milestones
- Add real-time notifications for reward approvals.
- Enable partner integrations with OAuth and signed webhooks.
- Support multi-branch businesses with consolidated reporting.
- Expand external platform support (QuickBooks, Xero, etc.)
