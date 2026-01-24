import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import {
  OverviewMetrics,
  SalesDataPoint,
  TopProduct,
  CustomerSegment,
  ProductCategory,
  Filters,
} from '../types';
import MetricsCard from './MetricsCard';
import SalesChart from './SalesChart';
import TopProductsTable from './TopProductsTable';
import CustomerSegmentChart from './CustomerSegmentChart';
import CategoryChart from './CategoryChart';
import FilterPanel from './FilterPanel';
import './Dashboard.css';

interface DashboardProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ filters, setFilters }) => {
  const [loading, setLoading] = useState(true);
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetrics | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [overview, sales, products, segments, categories] = await Promise.all([
        analyticsService.getOverviewMetrics(filters),
        analyticsService.getSalesOverTime(filters),
        analyticsService.getTopProducts(filters),
        analyticsService.getCustomerSegmentation(filters),
        analyticsService.getProductCategories(filters),
      ]);

      setOverviewMetrics(overview);
      setSalesData(sales);
      setTopProducts(products);
      setCustomerSegments(segments);
      setProductCategories(categories);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <FilterPanel filters={filters} setFilters={setFilters} />

      {overviewMetrics && (
        <div className="metrics-grid">
          <MetricsCard
            title="Total Sales"
            value={`$${overviewMetrics.totalSales.toFixed(2)}`}
            subtitle={`${overviewMetrics.transactionCount} transactions`}
            icon="💰"
          />
          <MetricsCard
            title="Active Customers"
            value={overviewMetrics.activeCustomers.toString()}
            subtitle={`Avg: $${overviewMetrics.avgTransactionValue.toFixed(2)} per transaction`}
            icon="👥"
          />
          <MetricsCard
            title="Points Issued"
            value={overviewMetrics.pointsIssued.toString()}
            subtitle={`${overviewMetrics.pointsRedeemed} redeemed`}
            icon="🎁"
          />
          <MetricsCard
            title="Points Balance"
            value={overviewMetrics.pointsBalance.toString()}
            subtitle="Outstanding rewards"
            icon="⭐"
          />
        </div>
      )}

      <div className="charts-grid">
        <div className="chart-container full-width">
          <h2>Sales Over Time</h2>
          <SalesChart data={salesData} />
        </div>

        <div className="chart-container">
          <h2>Customer Segmentation</h2>
          <CustomerSegmentChart data={customerSegments} />
        </div>

        <div className="chart-container">
          <h2>Product Categories</h2>
          <CategoryChart data={productCategories} />
        </div>

        <div className="chart-container full-width">
          <h2>Top Products</h2>
          <TopProductsTable products={topProducts} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
