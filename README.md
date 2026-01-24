# Loyalty Rewards Hub

Loyalty Rewards Hub is a loyalty and reporting platform that enables small businesses to sell waterproofing and sealant products, let customers scan receipts to earn rewards, and share real-time sales insights with external partners.

## 🎯 Product goal
Deliver a usable end-to-end app that supports the real workflow of store owners, customers, and partner platforms.

## 📊 Analytics Dashboard (Current Implementation)

This repository now includes a comprehensive **Analytics Dashboard** for business performance tracking with:

- **Key Business Metrics**: Total sales, active customers, rewards points issued/redeemed
- **Data Visualizations**: Sales over time, customer segmentation, product categories, top products
- **Filtering & Segmentation**: Filter by date range (7/30/90 days), customer segment, and product
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Quick Start

1. **Clone and Install**:
```bash
git clone https://github.com/AdminHomeSmile/loyoty.git
cd loyoty
./setup.sh
```

2. **Run the Application**:
```bash
npm run dev
```

3. **Access the Dashboard**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

See [SETUP.md](SETUP.md) for detailed setup instructions and API documentation.

### Technology Stack
- **Backend**: Node.js, Express, TypeScript, SQLite
- **Frontend**: React, TypeScript, Vite, Recharts
- **Database**: SQLite with sample data

## Core user flows
1. **Store owner** registers a business, adds products, and shares a unique QR code at checkout.
2. **Customer** scans the QR code, uploads a receipt, and earns points once the purchase is verified.
3. **Backend** validates receipts, updates rewards balances, and publishes sales/rewards data to partner platforms.
4. **Business manager** accesses the analytics dashboard to track performance and make data-driven decisions.

## MVP scope (what to build first)
- **Customer experience**: receipt upload, rewards balance, points redemption history.
- **Merchant dashboard**: product catalog, sales summary, reward liability, customer activity.
- **Analytics Dashboard** ✅: Business performance tracking with key metrics and visualizations
- **Operations & reporting**: receipt verification queue, fraud flags, exportable reports, partner API webhooks.
- **Security & compliance**: role-based access, audit logs, basic PII handling.

## Next milestones
- Add real-time notifications for reward approvals.
- Enable partner integrations with OAuth and signed webhooks.
- Support multi-branch businesses with consolidated reporting.
- Add authentication and role-based access control to the analytics dashboard.
- Implement export capabilities (CSV, PDF) for reports.
