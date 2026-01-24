const API_BASE = '/api';
let currentCustomer = null;
let tierConfig = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    await loadTierConfig();
    await loadCustomers();
});

// Load tier configuration
async function loadTierConfig() {
    try {
        const response = await fetch(`${API_BASE}/tiers`);
        tierConfig = await response.json();
    } catch (error) {
        showNotification('Failed to load tier configuration', 'error');
    }
}

// Load customers into dropdown
async function loadCustomers() {
    try {
        const response = await fetch(`${API_BASE}/customers`);
        const customers = await response.json();
        
        const select = document.getElementById('customerSelect');
        select.innerHTML = '<option value="">Select a customer...</option>';
        
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.name} (${customer.email})`;
            select.appendChild(option);
        });
    } catch (error) {
        showNotification('Failed to load customers', 'error');
    }
}

// Load selected customer
async function loadCustomer() {
    const customerId = document.getElementById('customerSelect').value;
    
    if (!customerId) {
        document.getElementById('customerDetails').style.display = 'none';
        currentCustomer = null;
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/customers/${customerId}`);
        currentCustomer = await response.json();
        
        displayCustomerDetails();
        document.getElementById('customerDetails').style.display = 'block';
    } catch (error) {
        showNotification('Failed to load customer details', 'error');
    }
}

// Display customer details
function displayCustomerDetails() {
    if (!currentCustomer) return;
    
    // Update tier display
    const tierBadge = document.getElementById('tierBadge');
    const tierName = document.getElementById('tierName');
    const totalPoints = document.getElementById('totalPoints');
    
    tierBadge.className = `tier-badge ${currentCustomer.tier.toLowerCase()}`;
    tierBadge.textContent = getTierIcon(currentCustomer.tier);
    tierName.textContent = `${currentCustomer.tierInfo.name} Tier`;
    totalPoints.textContent = currentCustomer.totalPoints.toLocaleString();
    
    // Update progress bar
    updateProgressBar();
    
    // Update benefits
    displayBenefits();
    
    // Update transactions
    displayTransactions();
}

// Get tier icon
function getTierIcon(tier) {
    const icons = {
        'BRONZE': '🥉',
        'SILVER': '🥈',
        'GOLD': '🥇'
    };
    return icons[tier] || '🎁';
}

// Update progress bar
function updateProgressBar() {
    if (!currentCustomer) return;
    
    const progress = currentCustomer.progress;
    const progressBar = document.getElementById('progressBar');
    const progressLabel = document.getElementById('progressLabel');
    const pointsNeeded = document.getElementById('pointsNeeded');
    const progressPercentage = document.getElementById('progressPercentage');
    
    if (progress.nextTier) {
        progressBar.style.width = `${progress.percentage}%`;
        progressLabel.textContent = `Progress to ${tierConfig[progress.nextTier].name}`;
        pointsNeeded.textContent = `${progress.pointsToNext.toLocaleString()} points needed`;
        progressPercentage.textContent = `${progress.percentage.toFixed(1)}%`;
    } else {
        progressBar.style.width = '100%';
        progressLabel.textContent = 'Maximum Tier Achieved!';
        pointsNeeded.textContent = 'You\'re at the top!';
        progressPercentage.textContent = '100%';
    }
}

// Display tier benefits
function displayBenefits() {
    if (!currentCustomer) return;
    
    const benefitsList = document.getElementById('tierBenefits');
    const multiplier = document.getElementById('multiplier');
    
    benefitsList.innerHTML = '';
    currentCustomer.tierInfo.benefits.forEach(benefit => {
        const benefitItem = document.createElement('div');
        benefitItem.className = 'benefit-item';
        benefitItem.innerHTML = `
            <span class="benefit-icon">✓</span>
            <span>${benefit}</span>
        `;
        benefitsList.appendChild(benefitItem);
    });
    
    multiplier.textContent = `${currentCustomer.tierInfo.multiplier}x`;
}

// Display transactions
function displayTransactions() {
    if (!currentCustomer) return;
    
    const transactionsList = document.getElementById('transactions');
    transactionsList.innerHTML = '';
    
    if (currentCustomer.transactions.length === 0) {
        transactionsList.innerHTML = '<p style="text-align: center; color: #888;">No transactions yet</p>';
        return;
    }
    
    currentCustomer.transactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = `transaction-item ${transaction.type}`;
        
        const pointsClass = transaction.type === 'earn' ? 'positive' : 'negative';
        const pointsSign = transaction.type === 'earn' ? '+' : '-';
        
        let tierChangeHTML = '';
        if (transaction.tierChanged) {
            tierChangeHTML = `<div class="transaction-tier-change">
                Tier changed: ${tierConfig[transaction.oldTier].name} → ${tierConfig[transaction.newTier].name}
            </div>`;
        }
        
        let multiplierInfo = '';
        if (transaction.type === 'earn' && transaction.multiplier) {
            multiplierInfo = `<span class="transaction-multiplier">(${transaction.basePoints} × ${transaction.multiplier}x)</span>`;
        }
        
        item.innerHTML = `
            <div class="transaction-header">
                <span class="transaction-type">${transaction.type}</span>
                <span class="transaction-points ${pointsClass}">${pointsSign}${Math.abs(transaction.actualPoints).toLocaleString()} pts</span>
            </div>
            <div class="transaction-description">${transaction.description} ${multiplierInfo}</div>
            ${tierChangeHTML}
            <div class="transaction-meta">
                <span>${new Date(transaction.timestamp).toLocaleString()}</span>
                <span>ID: ${transaction.id}</span>
            </div>
        `;
        
        transactionsList.appendChild(item);
    });
}

// Show/hide create customer form
function showCreateCustomer() {
    document.getElementById('createCustomerForm').style.display = 'block';
}

function hideCreateCustomer() {
    document.getElementById('createCustomerForm').style.display = 'none';
    document.getElementById('customerId').value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('customerEmail').value = '';
}

// Create new customer
async function createCustomer() {
    const id = document.getElementById('customerId').value.trim();
    const name = document.getElementById('customerName').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    
    if (!id || !name || !email) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, name, email })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }
        
        const customer = await response.json();
        showNotification(`Customer ${name} created successfully!`, 'success');
        
        hideCreateCustomer();
        await loadCustomers();
        
        // Select the new customer
        document.getElementById('customerSelect').value = customer.id;
        await loadCustomer();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Add points to customer
async function addPoints() {
    if (!currentCustomer) {
        showNotification('Please select a customer first', 'error');
        return;
    }
    
    const points = parseInt(document.getElementById('earnPoints').value);
    const description = document.getElementById('earnDescription').value.trim();
    
    if (!points || points <= 0) {
        showNotification('Please enter a valid points value', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/customers/${currentCustomer.id}/points`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                points, 
                description: description || 'Points earned' 
            })
        });
        
        const result = await response.json();
        currentCustomer = result.customer;
        
        displayCustomerDetails();
        
        if (result.tierChanged) {
            showNotification(result.message, 'success');
        } else {
            showNotification(`Added ${result.transaction.actualPoints} points!`, 'success');
        }
        
        // Clear form
        document.getElementById('earnPoints').value = '';
        document.getElementById('earnDescription').value = '';
    } catch (error) {
        showNotification('Failed to add points', 'error');
    }
}

// Redeem points
async function redeemPoints() {
    if (!currentCustomer) {
        showNotification('Please select a customer first', 'error');
        return;
    }
    
    const points = parseInt(document.getElementById('redeemPoints').value);
    const description = document.getElementById('redeemDescription').value.trim();
    
    if (!points || points <= 0) {
        showNotification('Please enter a valid points value', 'error');
        return;
    }
    
    if (points > currentCustomer.totalPoints) {
        showNotification('Insufficient points', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/customers/${currentCustomer.id}/redeem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                points, 
                description: description || 'Points redeemed' 
            })
        });
        
        const result = await response.json();
        currentCustomer = result.customer;
        
        displayCustomerDetails();
        
        if (result.tierChanged) {
            showNotification(result.message, 'warning');
        } else {
            showNotification(`Redeemed ${points} points!`, 'success');
        }
        
        // Clear form
        document.getElementById('redeemPoints').value = '';
        document.getElementById('redeemDescription').value = '';
    } catch (error) {
        showNotification('Failed to redeem points', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}
