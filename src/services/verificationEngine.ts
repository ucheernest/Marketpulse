/**
 * MarketPulse Verification Engine v1.0
 * Multi-factor algorithmic price verification and fraud prevention system.
 * 
 * Factors:
 * 1. GPS Geofence & Market proximity (Haversine distance calculation)
 * 2. Timestamp freshness & EXIF time-drift analysis
 * 3. Photo & image evidence integrity
 * 4. Field Agent reputation & historical accuracy weighting
 * 5. Duplicate submission detection (frequency & interval checks)
 * 6. Statistical outlier detection (deviation from market & city rolling medians)
 * 7. Composite confidence scoring (0-100%) & automated recommendation
 */

export interface VerificationInput {
  productId: string;
  productName: string;
  price: number;
  marketId: string;
  marketName: string;
  marketCoords: { lat: number; lng: number };
  agentId: string;
  agentReputation: number; // 0 - 100
  gpsCoords: { lat: number; lng: number };
  timestamp: string;
  exifMatched: boolean;
  hasPhoto: boolean;
  benchmarkPrice: number; // Current benchmark/average price
  recentSubmissions?: {
    productId: string;
    marketId: string;
    price: number;
    agentId: string;
    timestamp: number;
  }[];
}

export interface VerificationResult {
  compositeScore: number; // 0 - 100
  systemRecommendation: 'Likely Valid' | 'Potential Anomaly' | 'Needs Recheck';
  isOutlier: boolean;
  isDuplicate: boolean;
  isGpsValid: boolean;
  isTimestampValid: boolean;
  distanceToMarketMeters: number;
  priceDeviationPercent: number;
  factors: {
    gpsScore: number;
    timestampScore: number;
    evidenceScore: number;
    agentReputationScore: number;
    outlierScore: number;
    duplicateScore: number;
  };
  anomalyNotes: string[];
}

/**
 * Calculates Haversine distance between two coordinates in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Evaluates a field price submission through the 6 verification layers
 */
export function evaluateVerificationEngine(input: VerificationInput): VerificationResult {
  const anomalyNotes: string[] = [];

  // 1. GPS Geofencing Check (< 400m from designated market center)
  const distanceToMarketMeters = calculateDistanceMeters(
    input.gpsCoords.lat,
    input.gpsCoords.lng,
    input.marketCoords.lat,
    input.marketCoords.lng
  );

  let gpsScore = 100;
  let isGpsValid = true;
  if (distanceToMarketMeters > 400) {
    isGpsValid = false;
    gpsScore = Math.max(0, 100 - (distanceToMarketMeters - 400) / 10);
    anomalyNotes.push(`GPS coordinate is ${distanceToMarketMeters}m from market center (threshold: 400m)`);
  } else if (distanceToMarketMeters > 200) {
    gpsScore = 90;
  }

  // 2. Timestamp & Freshness Check
  const subDate = new Date(input.timestamp).getTime();
  const now = Date.now();
  const ageMinutes = Math.max(0, (now - subDate) / (1000 * 60));
  let timestampScore = 100;
  let isTimestampValid = true;

  if (ageMinutes > 120) {
    timestampScore = 70;
    anomalyNotes.push(`Submission delayed by ${Math.round(ageMinutes)} minutes`);
  }
  if (!input.exifMatched) {
    timestampScore -= 20;
    anomalyNotes.push('Camera EXIF timestamp mismatch or metadata missing');
  }

  // 3. Image Evidence Check
  let evidenceScore = input.hasPhoto ? (input.exifMatched ? 100 : 75) : 30;
  if (!input.hasPhoto) {
    anomalyNotes.push('No stall photo evidence provided');
  }

  // 4. Agent Reputation Weighting
  const agentReputationScore = Math.min(100, Math.max(0, input.agentReputation));

  // 5. Statistical Outlier Detection (Deviation from benchmark)
  let outlierScore = 100;
  let isOutlier = false;
  const deviation = Math.abs(input.price - input.benchmarkPrice);
  const priceDeviationPercent =
    input.benchmarkPrice > 0 ? (deviation / input.benchmarkPrice) * 100 : 0;

  if (priceDeviationPercent > 40) {
    isOutlier = true;
    outlierScore = 40;
    anomalyNotes.push(
      `Price (₦${input.price.toLocaleString()}) deviates by ${priceDeviationPercent.toFixed(1)}% from benchmark (₦${input.benchmarkPrice.toLocaleString()})`
    );
  } else if (priceDeviationPercent > 20) {
    outlierScore = 75;
    anomalyNotes.push(`Moderate price divergence (${priceDeviationPercent.toFixed(1)}% from benchmark)`);
  }

  // 6. Duplicate Submission Detection (same product, same market within 10 minutes)
  let duplicateScore = 100;
  let isDuplicate = false;
  if (input.recentSubmissions && input.recentSubmissions.length > 0) {
    const matchingRecent = input.recentSubmissions.find((s) => {
      const timeDiffMinutes = Math.abs(now - s.timestamp) / (1000 * 60);
      return (
        s.productId === input.productId &&
        s.marketId === input.marketId &&
        timeDiffMinutes < 15
      );
    });

    if (matchingRecent) {
      isDuplicate = true;
      duplicateScore = 20;
      anomalyNotes.push('Potential duplicate submission detected within 15 minutes in same market');
    }
  }

  // Weighted Composite Confidence Score Calculation
  // Weights: Outlier (25%), GPS (20%), Agent (20%), Evidence (15%), Timestamp (10%), Duplicate (10%)
  const compositeScore = Math.round(
    outlierScore * 0.25 +
    gpsScore * 0.20 +
    agentReputationScore * 0.20 +
    evidenceScore * 0.15 +
    timestampScore * 0.10 +
    duplicateScore * 0.10
  );

  // System Recommendation Determination
  let systemRecommendation: 'Likely Valid' | 'Potential Anomaly' | 'Needs Recheck' = 'Likely Valid';
  if (compositeScore < 70 || isOutlier || isDuplicate) {
    systemRecommendation = 'Potential Anomaly';
  } else if (compositeScore < 85 || !isGpsValid) {
    systemRecommendation = 'Needs Recheck';
  }

  return {
    compositeScore,
    systemRecommendation,
    isOutlier,
    isDuplicate,
    isGpsValid,
    isTimestampValid,
    distanceToMarketMeters,
    priceDeviationPercent,
    factors: {
      gpsScore,
      timestampScore,
      evidenceScore,
      agentReputationScore,
      outlierScore,
      duplicateScore,
    },
    anomalyNotes,
  };
}
