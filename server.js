const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory database (for demo purposes)
const customers = new Map();

// Tier configuration
const TIER_CONFIG = {
  BRONZE: {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 999,
    multiplier: 1.0,
    color: '#CD7F32',
    benefits: ['Basic rewards', 'Access to promotions']
  },
  SILVER: {
    name: 'Silver',
    minPoints: 1000,
    maxPoints: 4999,
    multiplier: 1.2,
    color: '#C0C0C0',
    benefits: ['1.2x point multiplier', 'Priority support', 'Early access to sales']
  },
  GOLD: {
    name: 'Gold',
    minPoints: 5000,
    maxPoints: Infinity,
    multiplier: 1.5,
    color: '#FFD700',
    benefits: ['1.5x point multiplier', 'VIP support', 'Exclusive rewards', 'Birthday bonus']
  }
};

// Helper function to determine tier based on points
function calculateTier(totalPoints) {
  if (totalPoints >= TIER_CONFIG.GOLD.minPoints) {
    return 'GOLD';
  } else if (totalPoints >= TIER_CONFIG.SILVER.minPoints) {
    return 'SILVER';
  }
  return 'BRONZE';
}

// Helper function to calculate progress to next tier
function calculateProgress(totalPoints, currentTier) {
  const tierConfig = TIER_CONFIG[currentTier];
  
  if (currentTier === 'GOLD') {
    return {
      percentage: 100,
      pointsToNext: 0,
      nextTier: null
    };
  }
  
  const nextTierName = currentTier === 'BRONZE' ? 'SILVER' : 'GOLD';
  const nextTierConfig = TIER_CONFIG[nextTierName];
  const pointsInCurrentTier = totalPoints - tierConfig.minPoints;
  const tierRange = tierConfig.maxPoints - tierConfig.minPoints + 1;
  const percentage = Math.min(100, (pointsInCurrentTier / tierRange) * 100);
  const pointsToNext = nextTierConfig.minPoints - totalPoints;
  
  return {
    percentage: Math.round(percentage * 100) / 100,
    pointsToNext: Math.max(0, pointsToNext),
    nextTier: nextTierName
  };
}

// API Routes

// Get all customers
app.get('/api/customers', (req, res) => {
  const customerList = Array.from(customers.values());
  res.json(customerList);
});

// Get customer by ID
app.get('/api/customers/:id', (req, res) => {
  const customer = customers.get(req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

// Create new customer
app.post('/api/customers', (req, res) => {
  const { id, name, email } = req.body;
  
  if (!id || !name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (customers.has(id)) {
    return res.status(409).json({ error: 'Customer already exists' });
  }
  
  const newCustomer = {
    id,
    name,
    email,
    totalPoints: 0,
    tier: 'BRONZE',
    tierInfo: TIER_CONFIG.BRONZE,
    progress: calculateProgress(0, 'BRONZE'),
    transactions: [],
    createdAt: new Date().toISOString()
  };
  
  customers.set(id, newCustomer);
  res.status(201).json(newCustomer);
});

// Add points to customer (with tier multiplier)
app.post('/api/customers/:id/points', (req, res) => {
  const { points, description } = req.body;
  const customer = customers.get(req.params.id);
  
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  if (!points || points <= 0) {
    return res.status(400).json({ error: 'Invalid points value' });
  }
  
  const oldTier = customer.tier;
  const multiplier = TIER_CONFIG[oldTier].multiplier;
  const actualPoints = Math.round(points * multiplier);
  
  // Update points
  customer.totalPoints += actualPoints;
  
  // Calculate new tier (automatic upgrade/downgrade)
  const newTier = calculateTier(customer.totalPoints);
  const tierChanged = oldTier !== newTier;
  
  customer.tier = newTier;
  customer.tierInfo = TIER_CONFIG[newTier];
  customer.progress = calculateProgress(customer.totalPoints, newTier);
  
  // Add transaction record
  const transaction = {
    id: Date.now().toString(),
    type: 'earn',
    basePoints: points,
    multiplier: multiplier,
    actualPoints: actualPoints,
    description: description || 'Points earned',
    timestamp: new Date().toISOString(),
    oldTier,
    newTier,
    tierChanged
  };
  
  customer.transactions.unshift(transaction);
  
  res.json({
    customer,
    transaction,
    tierChanged,
    message: tierChanged ? `Congratulations! You've been upgraded to ${TIER_CONFIG[newTier].name} tier!` : null
  });
});

// Redeem points
app.post('/api/customers/:id/redeem', (req, res) => {
  const { points, description } = req.body;
  const customer = customers.get(req.params.id);
  
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  if (!points || points <= 0) {
    return res.status(400).json({ error: 'Invalid points value' });
  }
  
  if (customer.totalPoints < points) {
    return res.status(400).json({ error: 'Insufficient points' });
  }
  
  const oldTier = customer.tier;
  
  // Deduct points
  customer.totalPoints -= points;
  
  // Calculate new tier (automatic downgrade if needed)
  const newTier = calculateTier(customer.totalPoints);
  const tierChanged = oldTier !== newTier;
  
  customer.tier = newTier;
  customer.tierInfo = TIER_CONFIG[newTier];
  customer.progress = calculateProgress(customer.totalPoints, newTier);
  
  // Add transaction record
  const transaction = {
    id: Date.now().toString(),
    type: 'redeem',
    basePoints: points,
    actualPoints: -points,
    description: description || 'Points redeemed',
    timestamp: new Date().toISOString(),
    oldTier,
    newTier,
    tierChanged
  };
  
  customer.transactions.unshift(transaction);
  
  res.json({
    customer,
    transaction,
    tierChanged,
    message: tierChanged ? `Your tier has changed to ${TIER_CONFIG[newTier].name}` : null
  });
});

// Get tier configuration
app.get('/api/tiers', (req, res) => {
  res.json(TIER_CONFIG);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Loyalty Rewards Hub server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to view the application`);
});

module.exports = app;
