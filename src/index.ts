import express from 'express';
import integrationRoutes from './api/integrationRoutes';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/integrations', integrationRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Start server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Loyalty Rewards Hub API running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`API docs: http://localhost:${port}/api/integrations/platforms/list`);
  });
}

export default app;
