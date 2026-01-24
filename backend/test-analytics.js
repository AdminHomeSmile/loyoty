// Simple validation test for analytics logic
// This tests the core analytics calculations without database dependencies

// Mock data
const mockTransactions = [
  { customer_id: 1, amount: 29.99, product_id: 1 },
  { customer_id: 1, amount: 39.99, product_id: 2 },
  { customer_id: 2, amount: 24.99, product_id: 3 },
  { customer_id: 3, amount: 34.99, product_id: 1 },
];

const mockCustomers = [
  { id: 1, segment: 'premium', status: 'active' },
  { id: 2, segment: 'regular', status: 'active' },
  { id: 3, segment: 'vip', status: 'active' },
];

// Test functions
function calculateTotalSales(transactions) {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

function calculateActiveCustomers(transactions, customers) {
  const uniqueCustomerIds = new Set(transactions.map(t => t.customer_id));
  return Array.from(uniqueCustomerIds).filter(id => {
    const customer = customers.find(c => c.id === id);
    return customer && customer.status === 'active';
  }).length;
}

function calculateAvgTransactionValue(transactions) {
  if (transactions.length === 0) return 0;
  return calculateTotalSales(transactions) / transactions.length;
}

function segmentCustomers(transactions, customers) {
  const segments = {};

  customers.forEach(customer => {
    const customerTransactions = transactions.filter(t => t.customer_id === customer.id);
    const totalRevenue = customerTransactions.reduce((sum, t) => sum + t.amount, 0);

    if (!segments[customer.segment]) {
      segments[customer.segment] = {
        customer_count: 0,
        total_revenue: 0,
        transaction_count: 0,
      };
    }

    segments[customer.segment].customer_count++;
    segments[customer.segment].total_revenue += totalRevenue;
    segments[customer.segment].transaction_count += customerTransactions.length;
  });

  return segments;
}

// Run tests
console.log('🧪 Running Analytics Logic Tests...\n');

const totalSales = calculateTotalSales(mockTransactions);
console.log('✓ Total Sales:', totalSales.toFixed(2), '(Expected: 129.96)');

const activeCustomers = calculateActiveCustomers(mockTransactions, mockCustomers);
console.log('✓ Active Customers:', activeCustomers, '(Expected: 3)');

const avgTransaction = calculateAvgTransactionValue(mockTransactions);
console.log('✓ Avg Transaction Value:', avgTransaction.toFixed(2), '(Expected: 32.49)');

const segments = segmentCustomers(mockTransactions, mockCustomers);
console.log('✓ Customer Segmentation:', JSON.stringify(segments, null, 2));

// Validate results
const allTestsPassed = 
  Math.abs(totalSales - 129.96) < 0.01 &&
  activeCustomers === 3 &&
  Math.abs(avgTransaction - 32.49) < 0.01 &&
  Object.keys(segments).length === 3;

console.log('\n' + (allTestsPassed ? '✅ All tests passed!' : '❌ Some tests failed!'));

process.exit(allTestsPassed ? 0 : 1);
