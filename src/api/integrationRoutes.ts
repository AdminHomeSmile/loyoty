import express, { Request, Response } from 'express';
import { IntegrationManager } from '../services/IntegrationManager';
import { IntegrationConfig } from '../models/IntegrationConfig';
import { ExternalPlatformData } from '../models/SalesData';

const router = express.Router();
const integrationManager = new IntegrationManager();

/**
 * Configure integration for a business
 * POST /api/integrations/configure
 */
router.post('/configure', async (req: Request, res: Response) => {
  try {
    const config: IntegrationConfig = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const success = await integrationManager.configureIntegration(config);
    
    if (success) {
      res.json({
        success: true,
        message: 'Integration configured successfully',
        businessId: config.businessId,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to configure integration',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get integration configuration
 * GET /api/integrations/:businessId
 */
router.get('/:businessId', (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const config = integrationManager.getConfig(businessId);
    
    if (!config) {
      res.status(404).json({
        success: false,
        message: 'Integration not found',
      });
      return;
    }

    // Remove sensitive credentials from response
    const safeConfig = {
      ...config,
      credentials: {
        spreadsheetId: config.credentials.spreadsheetId,
        // Don't return private keys or tokens
      },
    };

    res.json({
      success: true,
      config: safeConfig,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Update integration settings
 * PATCH /api/integrations/:businessId
 */
router.patch('/:businessId', async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const updates = req.body;
    
    const success = await integrationManager.updateIntegration(businessId, updates);
    
    if (success) {
      res.json({
        success: true,
        message: 'Integration updated successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update integration',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Enable integration
 * POST /api/integrations/:businessId/enable
 */
router.post('/:businessId/enable', async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const success = await integrationManager.enableIntegration(businessId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Integration enabled successfully',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Integration not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Disable integration
 * POST /api/integrations/:businessId/disable
 */
router.post('/:businessId/disable', (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const success = integrationManager.disableIntegration(businessId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Integration disabled successfully',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Integration not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Test connection
 * POST /api/integrations/:businessId/test
 */
router.post('/:businessId/test', async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const success = await integrationManager.testConnection(businessId);
    
    res.json({
      success,
      message: success ? 'Connection test passed' : 'Connection test failed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Submit data to external platform
 * POST /api/integrations/submit
 */
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const data: ExternalPlatformData = {
      ...req.body,
      submittedAt: new Date(),
    };

    const result = await integrationManager.submitData(data);
    
    res.json({
      success: result.success,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get retry queue status
 * GET /api/integrations/:businessId/queue
 */
router.get('/:businessId/queue', (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const queue = integrationManager.getQueueStatus(businessId);
    
    res.json({
      success: true,
      queueLength: queue.length,
      items: queue.map(item => ({
        attempts: item.attempts,
        nextRetry: item.nextRetry,
        errors: item.errors.length,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get supported platforms
 * GET /api/integrations/platforms
 */
router.get('/platforms/list', (_req: Request, res: Response) => {
  try {
    const platforms = integrationManager.getSupportedPlatforms();
    res.json({
      success: true,
      platforms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
export { integrationManager };
