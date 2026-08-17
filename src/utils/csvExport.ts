import { FieldSubmission, Product, Market } from '../types';

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

/**
 * Escapes values for RFC 4180 compliant CSV output
 */
function escapeCSVField(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const stringValue = String(value);
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
}

/**
 * Triggers a browser file download of CSV content with UTF-8 BOM
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats Field Verification Submissions to CSV string
 */
export function generateVerificationReportsCSV(submissions: FieldSubmission[]): string {
  const headers = [
    'Submission ID',
    'Reference Number',
    'Product ID',
    'Product Name',
    'Market Name',
    'City',
    'Price (NGN)',
    'Quantity',
    'Unit',
    'Seller / Stall',
    'Field Agent ID',
    'Field Agent Name',
    'Agent Verification Level',
    'Agent Reputation (%)',
    'GPS Latitude',
    'GPS Longitude',
    'GPS Location Address',
    'EXIF Metadata Valid',
    'System Trust Confidence (%)',
    'Algorithmic Recommendation',
    'Anomaly Notes',
    'Offline Queued',
    'Submission Status',
    'Submitted Time Display',
    'Timestamp ISO / Certified',
    'Photo Evidence URL',
  ];

  const rows = submissions.map((sub) => {
    return [
      escapeCSVField(sub.id),
      escapeCSVField(sub.submissionNumber),
      escapeCSVField(sub.productId),
      escapeCSVField(sub.productName),
      escapeCSVField(sub.marketName),
      escapeCSVField(sub.city || 'Port Harcourt'),
      escapeCSVField(sub.price),
      escapeCSVField(sub.quantity),
      escapeCSVField(sub.unit),
      escapeCSVField(sub.sellerStall),
      escapeCSVField(sub.agentId),
      escapeCSVField(sub.agentName),
      escapeCSVField(sub.agentLevel),
      escapeCSVField(sub.agentReputation),
      escapeCSVField(sub.gpsLocation?.lat ?? ''),
      escapeCSVField(sub.gpsLocation?.lng ?? ''),
      escapeCSVField(sub.gpsLocation?.address ?? ''),
      escapeCSVField(sub.exifMatched ? 'YES' : 'NO'),
      escapeCSVField(sub.systemConfidence),
      escapeCSVField(sub.systemRecommendation),
      escapeCSVField(sub.anomalyNote || 'None'),
      escapeCSVField(sub.isOfflineQueued ? 'YES' : 'NO'),
      escapeCSVField(sub.status.toUpperCase()),
      escapeCSVField(sub.submittedAt),
      escapeCSVField(sub.timestamp),
      escapeCSVField(sub.photoUrl),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Formats System & Security Audit Logs to CSV string
 */
export function generateAuditLogsCSV(auditLogs: AuditLogEntry[]): string {
  const headers = [
    'Log ID',
    'Timestamp',
    'Actor ID',
    'Actor Name',
    'Actor Role',
    'Action Type',
    'Entity Type',
    'Entity ID',
    'Entity Name',
    'Market Name',
    'City',
    'Status Severity',
    'Trust Confidence (%)',
    'Recorded Price (NGN)',
    'Detailed Description / Audit Payload',
  ];

  const rows = auditLogs.map((log) => {
    return [
      escapeCSVField(log.id),
      escapeCSVField(log.timestamp),
      escapeCSVField(log.actorId),
      escapeCSVField(log.actorName),
      escapeCSVField(log.actorRole),
      escapeCSVField(log.action),
      escapeCSVField(log.entityType),
      escapeCSVField(log.entityId),
      escapeCSVField(log.entityName),
      escapeCSVField(log.marketName || 'N/A'),
      escapeCSVField(log.city || 'Port Harcourt'),
      escapeCSVField(log.status),
      escapeCSVField(log.confidenceScore ?? ''),
      escapeCSVField(log.price ?? ''),
      escapeCSVField(log.details),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Formats Commodity Market Price Index & Volatility to CSV string
 */
export function generateMarketPriceIndexCSV(products: Product[], markets: Market[]): string {
  const headers = [
    'Product ID',
    'Product Name',
    'Category',
    'Brand',
    'Standard Unit',
    'Origin (Local/Imported)',
    'Average Price (NGN)',
    'Lowest Price (NGN)',
    'Highest Price (NGN)',
    'Price Change (%)',
    'Price Trend Direction',
    'Confidence Level',
    'Confidence Score (%)',
    'Total Field Observations',
    'Markets Covered Count',
    'Last Verified Time',
    'Market Breakdown (Prices across stalls)',
  ];

  const rows = products.map((prod) => {
    const marketDetails = prod.marketPrices
      .map((mp) => `${mp.marketName}: ₦${mp.price.toLocaleString()}`)
      .join(' | ');

    return [
      escapeCSVField(prod.id),
      escapeCSVField(prod.name),
      escapeCSVField(prod.category),
      escapeCSVField(prod.brand || 'Unbranded / Commodity'),
      escapeCSVField(prod.unit),
      escapeCSVField(prod.isLocalOrImported || 'Local'),
      escapeCSVField(prod.currentAvgPrice),
      escapeCSVField(prod.priceLow),
      escapeCSVField(prod.priceHigh),
      escapeCSVField(`${prod.priceChangePercent > 0 ? '+' : ''}${prod.priceChangePercent}%`),
      escapeCSVField(prod.priceChangeDirection.toUpperCase()),
      escapeCSVField(prod.confidence),
      escapeCSVField(prod.confidenceScore),
      escapeCSVField(prod.observationsCount),
      escapeCSVField(prod.marketsCount),
      escapeCSVField(prod.lastVerified),
      escapeCSVField(marketDetails),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}
