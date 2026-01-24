import { Request, Response } from 'express';
import { runQuery, runQuerySingle } from '../database/init';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export const getOverviewMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, segment, productId } = req.query;

    let dateFilter = '';
    const params: any[] = [];

    if (startDate && endDate) {
      dateFilter = ' AND transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Total sales
    let salesQuery = `
      SELECT 
        COALESCE(SUM(amount), 0) as total_sales,
        COUNT(*) as transaction_count,
        COALESCE(AVG(amount), 0) as avg_transaction_value
      FROM transactions
      WHERE 1=1 ${dateFilter}
    `;

    if (productId) {
      salesQuery += ' AND product_id = ?';
      params.push(productId);
    }

    const salesData = await runQuerySingle(salesQuery, params);

    // Active customers
    let customerQuery = `
      SELECT COUNT(DISTINCT c.id) as active_customers
      FROM customers c
      INNER JOIN transactions t ON c.id = t.customer_id
      WHERE c.status = 'active' ${dateFilter}
    `;

    const customerParams = [...params];
    if (segment) {
      customerQuery += ' AND c.segment = ?';
      customerParams.push(segment);
    }

    const customerData = await runQuerySingle(customerQuery, customerParams);

    // Rewards points
    let rewardsQuery = `
      SELECT 
        COALESCE(SUM(points_issued), 0) as points_issued,
        COALESCE(SUM(points_redeemed), 0) as points_redeemed,
        COALESCE(SUM(balance), 0) as points_balance
      FROM rewards
      WHERE 1=1
    `;

    let rewardsParams: any[] = [];
    if (startDate && endDate) {
      rewardsQuery += ' AND created_at BETWEEN ? AND ?';
      rewardsParams = [startDate, endDate];
    }

    const rewardsData = await runQuerySingle(rewardsQuery, rewardsParams);

    res.json({
      totalSales: salesData.total_sales,
      transactionCount: salesData.transaction_count,
      avgTransactionValue: salesData.avg_transaction_value,
      activeCustomers: customerData.active_customers,
      pointsIssued: rewardsData.points_issued,
      pointsRedeemed: rewardsData.points_redeemed,
      pointsBalance: rewardsData.points_balance,
    });
  } catch (error) {
    console.error('Error fetching overview metrics:', error);
    res.status(500).json({ error: 'Failed to fetch overview metrics' });
  }
};

export const getSalesOverTime = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'week') {
      dateFormat = '%Y-%W';
    } else if (groupBy === 'month') {
      dateFormat = '%Y-%m';
    }

    const params: any[] = [];
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = 'WHERE transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        strftime('${dateFormat}', transaction_date) as period,
        SUM(amount) as total_sales,
        COUNT(*) as transaction_count
      FROM transactions
      ${dateFilter}
      GROUP BY period
      ORDER BY period ASC
    `;

    const data = await runQuery(query, params);

    res.json(data);
  } catch (error) {
    console.error('Error fetching sales over time:', error);
    res.status(500).json({ error: 'Failed to fetch sales over time' });
  }
};

export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    const params: any[] = [];
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = 'WHERE t.transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        p.id,
        p.name,
        p.category,
        SUM(t.quantity) as units_sold,
        SUM(t.amount) as revenue,
        COUNT(DISTINCT t.customer_id) as unique_customers
      FROM products p
      INNER JOIN transactions t ON p.id = t.product_id
      ${dateFilter}
      GROUP BY p.id
      ORDER BY revenue DESC
      LIMIT ?
    `;

    params.push(limit);
    const data = await runQuery(query, params);

    res.json(data);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
};

export const getCustomerSegmentation = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const params: any[] = [];
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = 'AND t.transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        c.segment,
        COUNT(DISTINCT c.id) as customer_count,
        SUM(t.amount) as total_revenue,
        AVG(t.amount) as avg_transaction_value,
        COUNT(t.id) as transaction_count
      FROM customers c
      LEFT JOIN transactions t ON c.id = t.customer_id
      WHERE c.status = 'active' ${dateFilter}
      GROUP BY c.segment
      ORDER BY total_revenue DESC
    `;

    const data = await runQuery(query, params);

    res.json(data);
  } catch (error) {
    console.error('Error fetching customer segmentation:', error);
    res.status(500).json({ error: 'Failed to fetch customer segmentation' });
  }
};

export const getRewardsActivity = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const params: any[] = [];
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        strftime('%Y-%m-%d', created_at) as date,
        action_type,
        SUM(CASE WHEN action_type = 'earned' THEN points_issued ELSE 0 END) as points_earned,
        SUM(CASE WHEN action_type = 'redeemed' THEN points_redeemed ELSE 0 END) as points_redeemed
      FROM rewards
      ${dateFilter}
      GROUP BY date, action_type
      ORDER BY date ASC
    `;

    const data = await runQuery(query, params);

    res.json(data);
  } catch (error) {
    console.error('Error fetching rewards activity:', error);
    res.status(500).json({ error: 'Failed to fetch rewards activity' });
  }
};

export const getProductCategories = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const params: any[] = [];
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = 'WHERE t.transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        p.category,
        COUNT(DISTINCT p.id) as product_count,
        SUM(t.quantity) as units_sold,
        SUM(t.amount) as revenue
      FROM products p
      INNER JOIN transactions t ON p.id = t.product_id
      ${dateFilter}
      GROUP BY p.category
      ORDER BY revenue DESC
    `;

    const data = await runQuery(query, params);

    res.json(data);
  } catch (error) {
    console.error('Error fetching product categories:', error);
    res.status(500).json({ error: 'Failed to fetch product categories' });
  }
};
