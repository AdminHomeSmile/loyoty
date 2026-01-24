import axios from 'axios';
import {
  OverviewMetrics,
  SalesDataPoint,
  TopProduct,
  CustomerSegment,
  RewardsActivity,
  ProductCategory,
  Filters,
} from '../types';

const API_BASE_URL = '/api/analytics';

export const analyticsService = {
  getOverviewMetrics: async (filters: Partial<Filters>): Promise<OverviewMetrics> => {
    const params = new URLSearchParams();
    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.startDate);
      params.append('endDate', filters.dateRange.endDate);
    }
    if (filters.segment) {
      params.append('segment', filters.segment);
    }
    if (filters.productId) {
      params.append('productId', filters.productId.toString());
    }

    const response = await axios.get<OverviewMetrics>(`${API_BASE_URL}/overview?${params}`);
    return response.data;
  },

  getSalesOverTime: async (filters: Partial<Filters>): Promise<SalesDataPoint[]> => {
    const params = new URLSearchParams();
    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.startDate);
      params.append('endDate', filters.dateRange.endDate);
    }
    if (filters.groupBy) {
      params.append('groupBy', filters.groupBy);
    }

    const response = await axios.get<SalesDataPoint[]>(`${API_BASE_URL}/sales-over-time?${params}`);
    return response.data;
  },

  getTopProducts: async (filters: Partial<Filters>): Promise<TopProduct[]> => {
    const params = new URLSearchParams();
    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.startDate);
      params.append('endDate', filters.dateRange.endDate);
    }
    params.append('limit', '10');

    const response = await axios.get<TopProduct[]>(`${API_BASE_URL}/top-products?${params}`);
    return response.data;
  },

  getCustomerSegmentation: async (filters: Partial<Filters>): Promise<CustomerSegment[]> => {
    const params = new URLSearchParams();
    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.startDate);
      params.append('endDate', filters.dateRange.endDate);
    }

    const response = await axios.get<CustomerSegment[]>(`${API_BASE_URL}/customer-segmentation?${params}`);
    return response.data;
  },

  getRewardsActivity: async (filters: Partial<Filters>): Promise<RewardsActivity[]> => {
    const params = new URLSearchParams();
    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.startDate);
      params.append('endDate', filters.dateRange.endDate);
    }

    const response = await axios.get<RewardsActivity[]>(`${API_BASE_URL}/rewards-activity?${params}`);
    return response.data;
  },

  getProductCategories: async (filters: Partial<Filters>): Promise<ProductCategory[]> => {
    const params = new URLSearchParams();
    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.startDate);
      params.append('endDate', filters.dateRange.endDate);
    }

    const response = await axios.get<ProductCategory[]>(`${API_BASE_URL}/product-categories?${params}`);
    return response.data;
  },
};
