# Analytics Dashboard Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User (Business Manager)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (React Dashboard)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Metrics    │  │   Charts    │  │   Filters   │        │
│  │   Cards     │  │  (Recharts) │  │   Panel     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│              http://localhost:3000                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ API Calls (REST)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               Backend API (Express + TypeScript)             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  API Endpoints                        │  │
│  │  • GET /api/analytics/overview                       │  │
│  │  • GET /api/analytics/sales-over-time                │  │
│  │  • GET /api/analytics/top-products                   │  │
│  │  • GET /api/analytics/customer-segmentation          │  │
│  │  • GET /api/analytics/rewards-activity               │  │
│  │  • GET /api/analytics/product-categories             │  │
│  └──────────────────────────────────────────────────────┘  │
│              http://localhost:3001                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ SQL Queries
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (SQLite)                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Products  │  │ Customers  │  │Transactions│           │
│  └────────────┘  └────────────┘  └────────────┘           │
│  ┌────────────┐                                             │
│  │  Rewards   │                                             │
│  └────────────┘                                             │
│              ./backend/data/loyalty.db                       │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Interaction Flow
```
User → Filter Panel → API Request → Backend → Database → Response → Charts Update
```

### 2. Dashboard Load Sequence
```
1. User opens dashboard (http://localhost:3000)
2. Dashboard component mounts
3. Parallel API calls made:
   - getOverviewMetrics()
   - getSalesOverTime()
   - getTopProducts()
   - getCustomerSegmentation()
   - getProductCategories()
4. Loading state displayed
5. Data received and state updated
6. Charts and metrics rendered
```

### 3. Filter Application
```
1. User changes filter (date range, segment, etc.)
2. Filters state updated
3. useEffect triggered
4. New API calls with filter parameters
5. Dashboard re-renders with filtered data
```

## Key Components

### Frontend Components
- **Dashboard.tsx**: Main container component
- **MetricsCard.tsx**: Key performance indicators
- **FilterPanel.tsx**: Date range and segmentation filters
- **SalesChart.tsx**: Line chart for sales over time
- **CustomerSegmentChart.tsx**: Bar chart for customer segments
- **CategoryChart.tsx**: Pie chart for product categories
- **TopProductsTable.tsx**: Table of best-selling products

### Backend Controllers
- **analyticsController.ts**: Handles all analytics endpoints
  - getOverviewMetrics: Aggregate KPIs
  - getSalesOverTime: Time-series sales data
  - getTopProducts: Product rankings
  - getCustomerSegmentation: Customer breakdown
  - getRewardsActivity: Points issued/redeemed
  - getProductCategories: Category performance

### Database Schema
```sql
products
  - id, name, category, price, created_at

customers
  - id, name, email, phone, segment, status, created_at, last_purchase_at

transactions
  - id, customer_id, product_id, amount, quantity, points_earned, transaction_date

rewards
  - id, customer_id, points_issued, points_redeemed, balance, action_type, transaction_id, created_at
```

## API Endpoints

### Overview Metrics
**GET** `/api/analytics/overview`
- **Query Params**: `startDate`, `endDate`, `segment`, `productId`
- **Response**: Total sales, transaction count, active customers, points data

### Sales Over Time
**GET** `/api/analytics/sales-over-time`
- **Query Params**: `startDate`, `endDate`, `groupBy` (day/week/month)
- **Response**: Array of time-series sales data

### Top Products
**GET** `/api/analytics/top-products`
- **Query Params**: `startDate`, `endDate`, `limit`
- **Response**: Array of products with sales metrics

### Customer Segmentation
**GET** `/api/analytics/customer-segmentation`
- **Query Params**: `startDate`, `endDate`
- **Response**: Array of segments with metrics

### Rewards Activity
**GET** `/api/analytics/rewards-activity`
- **Query Params**: `startDate`, `endDate`
- **Response**: Array of daily points activity

### Product Categories
**GET** `/api/analytics/product-categories`
- **Query Params**: `startDate`, `endDate`
- **Response**: Array of categories with performance metrics

## Technology Choices

### Why SQLite?
- Lightweight and embedded
- No separate database server needed
- Perfect for MVP and development
- Easy to upgrade to PostgreSQL/MySQL later

### Why React + TypeScript?
- Type safety reduces bugs
- Component-based architecture
- Rich ecosystem for charts (Recharts)
- Industry standard for dashboards

### Why Express?
- Minimal and flexible
- Easy to set up REST APIs
- Good TypeScript support
- Large middleware ecosystem

### Why Recharts?
- Built for React
- Responsive by default
- Customizable and modern
- Active community

## Scalability Considerations

### Current Implementation (MVP)
- Single server
- SQLite database
- Client-side filtering
- No caching

### Future Enhancements
- Load balancing
- PostgreSQL/MySQL for production
- Redis caching layer
- Server-side pagination
- Real-time updates with WebSockets
- Materialized views for complex queries
- Background job processing for reports

## Security Considerations

### Current State
- No authentication (MVP)
- CORS enabled for development
- No rate limiting

### Production Requirements
- JWT authentication
- Role-based access control (RBAC)
- API rate limiting
- Input validation and sanitization
- HTTPS only
- SQL injection prevention (using parameterized queries)
- XSS protection
- CSRF tokens
- Audit logging

## Performance Optimization

### Query Optimization
- Indexes on foreign keys
- Date range indexes
- Aggregation caching
- Pagination for large datasets

### Frontend Optimization
- Code splitting
- Lazy loading components
- Memoization of expensive calculations
- Debounced filter updates
- Service worker for offline support

## Monitoring and Observability

### Recommended Additions
- Application performance monitoring (APM)
- Error tracking (Sentry)
- Analytics tracking
- Health check endpoints
- Logging (Winston/Pino)
- Metrics collection (Prometheus)
- Dashboard uptime monitoring
