export type UserRole = 
  | 'consumer' 
  | 'agent' 
  | 'admin' 
  | 'super_admin'
  | 'public_user'
  | 'field_agent'
  | 'verifier_admin';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ProductCategory = 
  | 'Food Staples'
  | 'Fresh Food'
  | 'Meat & Seafood'
  | 'Household'
  | 'Personal Care'
  | 'Beverages';

export type ConfidenceLevel = 'High Confidence' | 'Mod Confidence' | 'Low Confidence';

export interface Market {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  image: string;
  healthScore: number;
  confidenceScore: number;
  productsCount: number;
  updatesToday: number;
  lastUpdated: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  openingHours: string;
  description: string;
}

export interface MarketPrice {
  marketId: string;
  marketName: string;
  city: string;
  state: string;
  price: number;
  isLowest?: boolean;
  lastVerified: string;
  sellerStall?: string;
}

export interface PriceTrendPoint {
  date: string;
  price: number;
  avgPrice: number;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: ProductCategory;
  categorySlug: string;
  image: string;
  unit: string;
  unitWeight?: string;
  isLocalOrImported?: 'Local' | 'Imported' | 'Both';
  sizeOption?: string; // '5kg' | '10kg' | '25kg' | '50kg' | 'Basket' | etc.
  currentAvgPrice: number;
  priceChangePercent: number; // e.g. +4.2 or -0.5
  priceChangeDirection: 'up' | 'down' | 'neutral';
  priceLow: number;
  priceHigh: number;
  lastVerified: string;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 94%
  observationsCount: number;
  marketsCount: number;
  insight: string;
  marketPrices: MarketPrice[];
  priceTrends: {
    today: PriceTrendPoint[];
    '7D': PriceTrendPoint[];
    '30D': PriceTrendPoint[];
    '3M': PriceTrendPoint[];
  };
}

export interface FieldSubmission {
  id: string;
  submissionNumber: string;
  productId: string;
  productName: string;
  marketId: string;
  marketName: string;
  city: string;
  price: number;
  quantity: number;
  unit: string;
  sellerStall: string;
  agentId: string;
  agentName: string;
  agentInitials: string;
  agentLevel: string;
  agentReputation: number; // e.g. 96
  photoUrl: string;
  exifMatched: boolean;
  gpsLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  submittedAt: string;
  timestamp: string;
  status: 'pending' | 'verified' | 'flagged' | 'rejected' | 'recheck_requested';
  systemConfidence: number; // 93
  systemRecommendation: 'Likely Valid' | 'Potential Anomaly' | 'Needs Recheck';
  anomalyNote?: string;
  isOfflineQueued?: boolean;
  nearbyMarketComparisons: {
    marketName: string;
    price: number;
    verified: boolean;
  }[];
}

export interface AgentProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  assignedMarket: string;
  assignedMarketId: string;
  tier: 'Trusted Agent' | 'Senior Verifier' | 'Field Agent';
  completedChecksToday: number;
  assignedChecksToday: number;
  accuracyRate: number; // e.g. 96%
  totalEarnedThisWeek: number; // e.g. 12400
  pendingVerificationsCount: number;
  pendingLocationsCount: number;
  activeDraft?: {
    productName: string;
    unit: string;
    market: string;
  };
}

export interface LeaderboardAgent {
  id: string;
  name: string;
  avatar: string;
  city: string;
  primaryMarket: string;
  tier: 'Master Verifier' | 'Senior Verifier' | 'Trusted Agent' | 'Field Scout';
  accuracyRate: number; // e.g. 98.4
  validatedSubmissionsCount: number; // e.g. 248
  totalBountiesEarned: number; // e.g. 161200
  weeklyStreakDays: number;
  rank: number;
  previousRank?: number; // to show rank trend (+1, -1, 0)
  topBadges: string[];
  isCurrentUser?: boolean;
}

export interface AdminKPIs {
  verifiedToday: number;
  verifiedGrowthPercent: number;
  pendingVerification: number;
  activeAgents: number;
  regionsCovered: number;
  avgFreshnessMinutes: number;
  freshnessImprovementMinutes: number;
  systemConfidenceScore: number;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  count?: number;
}

export interface SavedItem {
  productId: string;
  savedAt: string;
  targetPriceAlert?: number;
  notifyOnVolatility?: boolean;
}

export interface BulkObservationItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  marketId: string;
  marketName: string;
  price: number;
  quantity: number;
  unit: string;
  sellerStall: string;
  photoUrl?: string;
  baselinePrice: number;
  isAnomaly: boolean;
  status: 'draft' | 'queued' | 'uploading' | 'synced' | 'failed';
  error?: string;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: 'submission' | 'product' | 'market' | 'agent' | 'system';
  entityId: string;
  entityName: string;
  marketName?: string;
  city?: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT' | 'INFO';
  details: string;
  confidenceScore?: number;
  price?: number;
}
