export interface OverviewMetrics {
  totalSales: number;
  transactionCount: number;
  avgTransactionValue: number;
  activeCustomers: number;
  pointsIssued: number;
  pointsRedeemed: number;
  pointsBalance: number;
}

export interface SalesDataPoint {
  period: string;
  total_sales: number;
  transaction_count: number;
}

export interface TopProduct {
  id: number;
  name: string;
  category: string;
  units_sold: number;
  revenue: number;
  unique_customers: number;
}

export interface CustomerSegment {
  segment: string;
  customer_count: number;
  total_revenue: number;
  avg_transaction_value: number;
  transaction_count: number;
}

export interface RewardsActivity {
  date: string;
  action_type: string;
  points_earned: number;
  points_redeemed: number;
}

export interface ProductCategory {
  category: string;
  product_count: number;
  units_sold: number;
  revenue: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface Filters {
  dateRange: DateRange;
  segment?: string;
  productId?: number;
  groupBy?: 'day' | 'week' | 'month';
}
