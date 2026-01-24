const assert = require('assert');

// Tier configuration (same as in server.js)
const TIER_CONFIG = {
  BRONZE: {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 999,
    multiplier: 1.0
  },
  SILVER: {
    name: 'Silver',
    minPoints: 1000,
    maxPoints: 4999,
    multiplier: 1.2
  },
  GOLD: {
    name: 'Gold',
    minPoints: 5000,
    maxPoints: Infinity,
    multiplier: 1.5
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

// Test suite
function runTests() {
  console.log('Running Tiered Rewards System Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Bronze tier assignment
  try {
    assert.strictEqual(calculateTier(0), 'BRONZE', 'Tier should be BRONZE for 0 points');
    assert.strictEqual(calculateTier(500), 'BRONZE', 'Tier should be BRONZE for 500 points');
    assert.strictEqual(calculateTier(999), 'BRONZE', 'Tier should be BRONZE for 999 points');
    console.log('✓ Test 1: Bronze tier assignment - PASSED');
    passed++;
  } catch (error) {
    console.log('✗ Test 1: Bronze tier assignment - FAILED:', error.message);
    failed++;
  }
  
  // Test 2: Silver tier assignment
  try {
    assert.strictEqual(calculateTier(1000), 'SILVER', 'Tier should be SILVER for 1000 points');
    assert.strictEqual(calculateTier(2500), 'SILVER', 'Tier should be SILVER for 2500 points');
    assert.strictEqual(calculateTier(4999), 'SILVER', 'Tier should be SILVER for 4999 points');
    console.log('✓ Test 2: Silver tier assignment - PASSED');
    passed++;
  } catch (error) {
    console.log('✗ Test 2: Silver tier assignment - FAILED:', error.message);
    failed++;
  }
  
  // Test 3: Gold tier assignment
  try {
    assert.strictEqual(calculateTier(5000), 'GOLD', 'Tier should be GOLD for 5000 points');
    assert.strictEqual(calculateTier(10000), 'GOLD', 'Tier should be GOLD for 10000 points');
    console.log('✓ Test 3: Gold tier assignment - PASSED');
    passed++;
  } catch (error) {
    console.log('✗ Test 3: Gold tier assignment - FAILED:', error.message);
    failed++;
  }
  
  // Test 4: Tier multipliers
  try {
    assert.strictEqual(TIER_CONFIG.BRONZE.multiplier, 1.0, 'Bronze multiplier should be 1.0x');
    assert.strictEqual(TIER_CONFIG.SILVER.multiplier, 1.2, 'Silver multiplier should be 1.2x');
    assert.strictEqual(TIER_CONFIG.GOLD.multiplier, 1.5, 'Gold multiplier should be 1.5x');
    console.log('✓ Test 4: Tier multipliers - PASSED');
    passed++;
  } catch (error) {
    console.log('✗ Test 4: Tier multipliers - FAILED:', error.message);
    failed++;
  }
  
  // Test 5: Progress calculation for Bronze tier
  try {
    const progress = calculateProgress(500, 'BRONZE');
    assert.strictEqual(progress.nextTier, 'SILVER', 'Next tier should be SILVER');
    assert.strictEqual(progress.pointsToNext, 500, 'Points to next tier should be 500');
    assert.strictEqual(progress.percentage, 50, 'Progress percentage should be 50%');
    console.log('✓ Test 5: Progress calculation for Bronze tier - PASSED');
    passed++;
  } catch (error) {
    console.log('✗ Test 5: Progress calculation for Bronze tier - FAILED:', error.message);
    failed++;
  }
  
  // Test 6: Progress calculation for Silver tier
  try {
    const progress = calculateProgress(3000, 'SILVER');
    assert.strictEqual(progress.nextTier, 'GOLD', 'Next tier should be GOLD');
    assert.strictEqual(progress.pointsToNext, 2000, 'Points to next tier should be 2000');
    console.log('✓ Test 6: Progress calculation for Silver tier - PASSED');
    passed++;
  } catch (error) {
    console.log('✗ Test 6: Progress calculation for Silver tier - FAILED:', error.message);
    failed++;
  }
  
  // Test 7: Progress calculation for Gold tier (max tier)
  try {
    const progress = calculateProgress(10000, 'GOLD');
    assert.strictEqual(progress.nextTier, null, 'Next tier should be null for Gold');
    assert.strictEqual(progress.pointsToNext, 0, 'Points to next tier should be 0');
    assert.strictEqual(progress.percentage, 100, 'Progress percentage should be 100%');
    console.log('✓ Test 7: Progress calculation for Gold tier - PASSED');
    passed++;
  } catch (error) {
    console.log('✗ Test 7: Progress calculation for Gold tier - FAILED:', error.message);
    failed++;
  }
  
  // Test 8: Tier upgrade scenario
  try {
    let points = 900;
    let tier = calculateTier(points);
    assert.strictEqual(tier, 'BRONZE', 'Initial tier should be BRONZE');
    
    points += 200; // Add 200 points, total = 1100
    tier = calculateTier(points);
    assert.strictEqual(tier, 'SILVER', 'Tier should upgrade to SILVER');
    
    points += 4000; // Add 4000 points, total = 5100
    tier = calculateTier(points);
    assert.strictEqual(tier, 'GOLD', 'Tier should upgrade to GOLD');
    
    console.log('✓ Test 8: Tier upgrade scenario - PASSED');
    passed++;
  } catch (error) {
    console.log('✗ Test 8: Tier upgrade scenario - FAILED:', error.message);
    failed++;
  }
  
  // Test 9: Tier downgrade scenario
  try {
    let points = 5100;
    let tier = calculateTier(points);
    assert.strictEqual(tier, 'GOLD', 'Initial tier should be GOLD');
    
    points -= 1000; // Redeem 1000 points, total = 4100
    tier = calculateTier(points);
    assert.strictEqual(tier, 'SILVER', 'Tier should downgrade to SILVER');
    
    points -= 3500; // Redeem 3500 points, total = 600
    tier = calculateTier(points);
    assert.strictEqual(tier, 'BRONZE', 'Tier should downgrade to BRONZE');
    
    console.log('✓ Test 9: Tier downgrade scenario - PASSED');
    passed++;
  } catch (error) {
    console.log('✗ Test 9: Tier downgrade scenario - FAILED:', error.message);
    failed++;
  }
  
  // Test 10: Point multiplier application
  try {
    const bronzeMultiplier = TIER_CONFIG.BRONZE.multiplier;
    const silverMultiplier = TIER_CONFIG.SILVER.multiplier;
    const goldMultiplier = TIER_CONFIG.GOLD.multiplier;
    
    assert.strictEqual(Math.round(100 * bronzeMultiplier), 100, 'Bronze: 100 points should yield 100');
    assert.strictEqual(Math.round(100 * silverMultiplier), 120, 'Silver: 100 points should yield 120');
    assert.strictEqual(Math.round(100 * goldMultiplier), 150, 'Gold: 100 points should yield 150');
    
    console.log('✓ Test 10: Point multiplier application - PASSED');
    passed++;
  } catch (error) {
    console.log('✗ Test 10: Point multiplier application - FAILED:', error.message);
    failed++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));
  
  if (failed === 0) {
    console.log('\n✓ All tests passed!');
    return 0;
  } else {
    console.log('\n✗ Some tests failed!');
    return 1;
  }
}

// Run tests
const exitCode = runTests();
process.exit(exitCode);
