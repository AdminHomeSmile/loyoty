# Analytics Dashboard Setup Guide

## Overview
This project implements an analytics dashboard for the Loyalty Rewards Hub, providing business performance tracking with key metrics, visualizations, and filtering capabilities.

## Features
- **Key Metrics Display**: Total sales, active customers, rewards points issued/redeemed
- **Data Visualizations**: 
  - Sales over time (line chart)
  - Customer segmentation (bar chart)
  - Product categories (pie chart)
  - Top products table
- **Filtering & Segmentation**: Filter by date range, customer segment, and product
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure
```
loyoty/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── index.ts      # Server entry point
│   │   ├── database/     # Database initialization and queries
│   │   ├── controllers/  # Analytics controllers
│   │   └── routes/       # API routes
│   └── package.json
├── frontend/             # React dashboard
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx       # Main app component
│   └── package.json
└── package.json          # Root workspace config
```

## Prerequisites
- Node.js 18+ and npm
- SQLite3 (for database)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/AdminHomeSmile/loyoty.git
cd loyoty
```

2. Install dependencies:
```bash
npm install
```

This will install dependencies for both backend and frontend workspaces.

## Running the Application

### Development Mode
Run both backend and frontend concurrently:
```bash
npm run dev
```

Or run them separately:

**Backend only:**
```bash
npm run backend
```
The API will be available at `http://localhost:3001`

**Frontend only:**
```bash
npm run frontend
```
The dashboard will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
```

## API Endpoints

### Analytics Endpoints

- `GET /api/analytics/overview` - Overview metrics
  - Query params: `startDate`, `endDate`, `segment`, `productId`
  
- `GET /api/analytics/sales-over-time` - Sales data over time
  - Query params: `startDate`, `endDate`, `groupBy` (day/week/month)
  
- `GET /api/analytics/top-products` - Top selling products
  - Query params: `startDate`, `endDate`, `limit`
  
- `GET /api/analytics/customer-segmentation` - Customer segment breakdown
  - Query params: `startDate`, `endDate`
  
- `GET /api/analytics/rewards-activity` - Rewards points activity
  - Query params: `startDate`, `endDate`
  
- `GET /api/analytics/product-categories` - Product category performance
  - Query params: `startDate`, `endDate`

## Database Schema

### Tables
- **products**: Product catalog with categories and pricing
- **customers**: Customer information with segmentation
- **transactions**: Purchase transactions with points earned
- **rewards**: Rewards points issued and redeemed

Sample data is automatically generated on first run.

## Dashboard Features

### Key Metrics Cards
- Total Sales: Sum of all transactions
- Active Customers: Number of customers with status 'active'
- Points Issued: Total reward points issued
- Points Balance: Outstanding reward points

### Charts and Visualizations
- **Sales Over Time**: Line chart showing sales trends
- **Customer Segmentation**: Bar chart comparing segments by customers and revenue
- **Product Categories**: Pie chart showing revenue distribution
- **Top Products**: Table of best-selling products with detailed metrics

### Filtering Options
- **Time Period**: Last 7/30/90 days
- **Group By**: Day, week, or month aggregation
- **Customer Segment**: Filter by customer tier (premium, regular, VIP)
- **Product**: Filter by specific product

## Technology Stack

### Backend
- Node.js + Express
- TypeScript
- SQLite3 (database)
- date-fns (date utilities)

### Frontend
- React 18
- TypeScript
- Vite (build tool)
- Recharts (data visualization)
- Axios (HTTP client)
- date-fns (date utilities)

## Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory:
```
PORT=3001
DATABASE_PATH=./data/loyalty.db
```

### Frontend Configuration
The frontend is configured to proxy API requests to the backend during development. See `frontend/vite.config.ts`.

## Testing
```bash
npm test
```

## Linting
```bash
npm run lint
```

## Accessing the Dashboard

1. Start the application with `npm run dev`
2. Open your browser to `http://localhost:3000`
3. The dashboard will load with sample data
4. Use the filter panel to adjust date ranges and groupings
5. All charts and metrics update automatically when filters change

## Admin Interface Access

The dashboard is designed to be accessible to business users via the admin interface. In a production environment, you would:

1. Integrate authentication (e.g., JWT tokens, OAuth)
2. Add role-based access control (RBAC)
3. Restrict access to users with 'admin' or 'business_manager' roles
4. Implement audit logging for sensitive data access

## Future Enhancements

- Export reports to CSV/PDF
- Email scheduled reports
- Real-time data updates with WebSockets
- Advanced filtering (multi-select, custom date ranges)
- Drill-down capabilities for detailed analysis
- Comparison views (period over period)
- Custom dashboard layouts
- Mobile app version

## Troubleshooting

### Database Issues
If you encounter database errors, delete the `backend/data/loyalty.db` file and restart the server. Sample data will be regenerated.

### Port Conflicts
If ports 3000 or 3001 are in use, you can change them:
- Backend: Edit `backend/.env` and set `PORT`
- Frontend: Edit `frontend/vite.config.ts` and change the `server.port`

### Build Errors
Ensure you're using Node.js 18+ and have all dependencies installed:
```bash
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
```

## License
MIT

## Support
For issues or questions, please open an issue on GitHub.
