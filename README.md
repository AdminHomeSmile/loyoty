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

## Tiered Rewards System ✨

The application now features a comprehensive **three-tier rewards system** that automatically assigns customers to tiers based on their accumulated points and provides increasing benefits at higher tiers.

### Tier Levels

| Tier | Point Range | Multiplier | Benefits |
|------|-------------|------------|----------|
| 🥉 **Bronze** | 0 - 999 | 1.0x | Basic rewards, Access to promotions |
| 🥈 **Silver** | 1,000 - 4,999 | 1.2x | 1.2x point multiplier, Priority support, Early access to sales |
| 🥇 **Gold** | 5,000+ | 1.5x | 1.5x point multiplier, VIP support, Exclusive rewards, Birthday bonus |

### Key Features

✅ **Automatic Tier Assignment**: Customers are automatically assigned to a tier based on their total points  
✅ **Automatic Upgrades/Downgrades**: Tiers update automatically when points are earned or redeemed  
✅ **Point Multipliers**: Higher tier members earn bonus points on all transactions (Silver: 1.2x, Gold: 1.5x)  
✅ **Progress Tracking**: Visual progress bars show advancement toward the next tier  
✅ **Tier Benefits**: Each tier unlocks additional perks and rewards  
✅ **Transaction History**: Complete history with tier change notifications  

### Business Rules

- **Tier Assignment**: Based solely on total accumulated points
- **Point Multipliers**: Applied at the time of earning points (based on current tier)
- **Upgrades**: Instant when reaching the minimum points for the next tier
- **Downgrades**: Instant when falling below the minimum points for the current tier
- **Progress Calculation**: Shows percentage progress within current tier and points needed for next tier

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AdminHomeSmile/loyoty.git
cd loyoty
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Running Tests

Run the tier system tests:
```bash
npm test
```

## API Endpoints

### Customer Management

- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
  ```json
  {
    "id": "C001",
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

### Points Management

- `POST /api/customers/:id/points` - Add points (with tier multiplier)
  ```json
  {
    "points": 100,
    "description": "Purchase"
  }
  ```

- `POST /api/customers/:id/redeem` - Redeem points
  ```json
  {
    "points": 50,
    "description": "Reward redemption"
  }
  ```

### Tier Information

- `GET /api/tiers` - Get tier configuration

### Health Check

- `GET /api/health` - Server health check

## Technology Stack

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Storage**: In-memory (for demo purposes)
- **API**: RESTful JSON API

## Project Structure

```
loyoty/
├── server.js           # Express server with tier logic
├── public/
│   ├── index.html     # Customer dashboard UI
│   ├── styles.css     # Responsive styling
│   └── app.js         # Frontend JavaScript
├── test.js            # Tier system tests
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## Screenshots

### Customer Dashboard with Silver Tier
![Silver Tier Dashboard](https://github.com/user-attachments/assets/e8816bda-f1e3-4e0e-a147-cfe066c65a9e)

### Customer Dashboard with Gold Tier
![Gold Tier Dashboard](https://github.com/user-attachments/assets/a73abf34-c5fa-461d-aae2-061d769eefc4)

## Next milestones
- Add real-time notifications for reward approvals.
- Enable partner integrations with OAuth and signed webhooks.
- Support multi-branch businesses with consolidated reporting.
- Add persistent database storage (PostgreSQL/MongoDB).
- Implement receipt scanning and verification.
- Add merchant dashboard for business analytics.

