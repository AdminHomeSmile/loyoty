import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';

const router = Router();

// Overview metrics
router.get('/overview', analyticsController.getOverviewMetrics);

// Sales over time
router.get('/sales-over-time', analyticsController.getSalesOverTime);

// Top products
router.get('/top-products', analyticsController.getTopProducts);

// Customer segmentation
router.get('/customer-segmentation', analyticsController.getCustomerSegmentation);

// Rewards activity
router.get('/rewards-activity', analyticsController.getRewardsActivity);

// Product categories
router.get('/product-categories', analyticsController.getProductCategories);

export default router;
