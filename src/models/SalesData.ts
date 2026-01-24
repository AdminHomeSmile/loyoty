/**
 * Sales transaction data model
 */
export interface SalesTransaction {
  transactionId: string;
  businessId: string;
  timestamp: Date;
  customerId?: string;
  items: TransactionItem[];
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'cancelled';
}

/**
 * Transaction item details
 */
export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
}

/**
 * Rewards data model
 */
export interface RewardsData {
  rewardId: string;
  businessId: string;
  customerId: string;
  transactionId?: string;
  timestamp: Date;
  pointsEarned: number;
  pointsRedeemed: number;
  currentBalance: number;
  rewardType: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  description?: string;
}

/**
 * Combined data for external platform submission
 */
export interface ExternalPlatformData {
  sales?: SalesTransaction;
  rewards?: RewardsData;
  submittedAt: Date;
  businessId: string;
}
