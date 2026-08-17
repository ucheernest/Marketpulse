import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  Filter,
  Calendar,
  Layers,
  ShieldCheck,
  Activity,
  Store,
  ChevronDown,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  downloadCSV,
  generateVerificationReportsCSV,
  generateAuditLogsCSV,
  generateMarketPriceIndexCSV,
} from '../utils/csvExport';

type ExportCategory = 'verifications' | 'audit_logs' | 'price_index';
type DateFilter = 'today' | '7days' | '30days' | 'all';

interface ExportReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: ExportCategory;
}

export const ExportReportsModal: React.FC<ExportReportsModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'verifications',
}) => {
  const {
    submissions,
    auditLogs,
    products,
    markets,
    selectedCity,
    addToast,
    addAuditLog,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<ExportCategory>(defaultCategory);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'flagged'>('all');
  const [marketFilter, setMarketFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Sync category if default changes when opened
  React.useEffect(() => {
    if (isOpen && defaultCategory) {
      setActiveCategory(defaultCategory);
    }
  }, [isOpen, defaultCategory]);

  // Filtered Submissions for Verification Reports
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // Status filter
      if (statusFilter === 'verified' && sub.status !== 'verified') return false;
      if (statusFilter === 'pending' && sub.status !== 'pending') return false;
      if (
        statusFilter === 'flagged' &&
        sub.status !== 'flagged' &&
        sub.status !== 'rejected' &&
        sub.status !== 'recheck_requested'
      )
        return false;

      // Market filter
      if (marketFilter !== 'all' && sub.marketName !== marketFilter && sub.marketId !== marketFilter)
        return false;

      return true;
    });
  }, [submissions, statusFilter, marketFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (statusFilter === 'verified' && log.status !== 'SUCCESS') return false;
      if (statusFilter === 'flagged' && log.status !== 'WARNING' && log.status !== 'ALERT')
        return false;
      if (marketFilter !== 'all' && log.marketName && log.marketName !== marketFilter) return false;
      return true;
    });
  }, [auditLogs, statusFilter, marketFilter]);

  // Filtered Products for Price Index
  const filteredProducts = useMemo(() => {
    if (marketFilter === 'all') return products;
    return products.filter((p) =>
      p.marketPrices.some((mp) => mp.marketName === marketFilter || mp.marketId === marketFilter)
    );
  }, [products, marketFilter]);

  if (!isOpen) return null;

  // Handle Export Trigger
  const handleExport = () => {
    setIsExporting(true);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    setTimeout(() => {
      try {
        let count = 0;
        let filename = '';

        if (activeCategory === 'verifications') {
          const csv = generateVerificationReportsCSV(filteredSubmissions);
          filename = `marketpulse_verification_reports_${dateFilter}_${timestamp}.csv`;
          downloadCSV(filename, csv);
          count = filteredSubmissions.length;

          addAuditLog({
            action: 'CSV_EXPORT_GENERATED',
            actorRole: 'verifier_admin',
            entityType: 'system',
            entityId: 'export-verifications',
            entityName: 'Verification Reports CSV',
            status: 'SUCCESS',
            details: `Exported ${count} price verification records to CSV file (${filename}).`,
          });
        } else if (activeCategory === 'audit_logs') {
          const csv = generateAuditLogsCSV(filteredAuditLogs);
          filename = `marketpulse_audit_logs_${dateFilter}_${timestamp}.csv`;
          downloadCSV(filename, csv);
          count = filteredAuditLogs.length;

          addAuditLog({
            action: 'CSV_EXPORT_GENERATED',
            actorRole: 'verifier_admin',
            entityType: 'system',
            entityId: 'export-audit-logs',
            entityName: 'Security & Operations Audit Logs CSV',
            status: 'SUCCESS',
            details: `Exported ${count} operational audit trail entries to CSV file (${filename}).`,
          });
        } else {
          const csv = generateMarketPriceIndexCSV(filteredProducts, markets);
          filename = `marketpulse_commodity_price_index_${timestamp}.csv`;
          downloadCSV(filename, csv);
          count = filteredProducts.length;

          addAuditLog({
            action: 'CSV_EXPORT_GENERATED',
            actorRole: 'verifier_admin',
            entityType: 'system',
            entityId: 'export-price-index',
            entityName: 'Commodity Price Index CSV',
            status: 'SUCCESS',
            details: `Exported price index data across ${count} commodities to CSV file (${filename}).`,
          });
        }

        addToast(`Successfully downloaded CSV: ${filename} (${count} records)`, 'success');
        setIsExporting(false);
        onClose();
      } catch (err) {
        setIsExporting(false);
        addToast('Failed to generate CSV export', 'error');
      }
    }, 450);
  };

  const getRecordCount = () => {
    if (activeCategory === 'verifications') return filteredSubmissions.length;
    if (activeCategory === 'audit_logs') return filteredAuditLogs.length;
    return filteredProducts.length;
  };

  return (
    <div
      id="export-reports-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#bdcabe]/30 dark:border-[#2d3e58] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-[#008751] dark:text-[#8df8b7] flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#121c2a] dark:text-[#f8f9ff] flex items-center gap-2">
                <span>Export Reports & Audit Logs</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7]">
                  CSV Format
                </span>
              </h2>
              <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                Download structured data for offline analytics, auditing, and spreadsheets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#25344a] transition-colors cursor-pointer"
            aria-label="Close export dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Step 1: Select Report Dataset */}
          <div>
            <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-2">
              1. Select Data Stream
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Verification Reports */}
              <button
                type="button"
                onClick={() => setActiveCategory('verifications')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activeCategory === 'verifications'
                    ? 'bg-[#008751]/10 dark:bg-[#008751]/20 border-[#008751] ring-2 ring-[#008751]/20'
                    : 'bg-[#f8f9ff] dark:bg-[#121c2a] border-[#bdcabe]/40 dark:border-[#2d3e58] hover:border-[#008751]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <ShieldCheck
                    className={`w-5 h-5 ${
                      activeCategory === 'verifications'
                        ? 'text-[#008751]'
                        : 'text-[#3e4a41] dark:text-[#bdcabe]'
                    }`}
                  />
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#182232] text-[#121c2a] dark:text-[#f8f9ff] border border-[#bdcabe]/30 dark:border-[#2d3e58]">
                    {submissions.length} rows
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                    Verification Reports
                  </div>
                  <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] mt-0.5">
                    Field submissions, GPS, EXIF & Trust Scores
                  </div>
                </div>
              </button>

              {/* Option 2: Audit Trail Logs */}
              <button
                type="button"
                onClick={() => setActiveCategory('audit_logs')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activeCategory === 'audit_logs'
                    ? 'bg-[#0058be]/10 dark:bg-[#0058be]/20 border-[#0058be] ring-2 ring-[#0058be]/20'
                    : 'bg-[#f8f9ff] dark:bg-[#121c2a] border-[#bdcabe]/40 dark:border-[#2d3e58] hover:border-[#0058be]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Activity
                    className={`w-5 h-5 ${
                      activeCategory === 'audit_logs'
                        ? 'text-[#0058be]'
                        : 'text-[#3e4a41] dark:text-[#bdcabe]'
                    }`}
                  />
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#182232] text-[#121c2a] dark:text-[#f8f9ff] border border-[#bdcabe]/30 dark:border-[#2d3e58]">
                    {auditLogs.length} rows
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                    Audit Trail & Events
                  </div>
                  <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] mt-0.5">
                    Security actions, verifier approvals & syncs
                  </div>
                </div>
              </button>

              {/* Option 3: Market Price Index */}
              <button
                type="button"
                onClick={() => setActiveCategory('price_index')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activeCategory === 'price_index'
                    ? 'bg-[#835200]/10 dark:bg-[#835200]/20 border-[#835200] ring-2 ring-[#835200]/20'
                    : 'bg-[#f8f9ff] dark:bg-[#121c2a] border-[#bdcabe]/40 dark:border-[#2d3e58] hover:border-[#835200]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Store
                    className={`w-5 h-5 ${
                      activeCategory === 'price_index'
                        ? 'text-[#835200] dark:text-[#ffb95f]'
                        : 'text-[#3e4a41] dark:text-[#bdcabe]'
                    }`}
                  />
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#182232] text-[#121c2a] dark:text-[#f8f9ff] border border-[#bdcabe]/30 dark:border-[#2d3e58]">
                    {products.length} commodities
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                    Commodity Price Index
                  </div>
                  <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] mt-0.5">
                    Multi-market price benchmarks & spreads
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Filter Parameters */}
          <div className="bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              <Filter className="w-3.5 h-3.5 text-[#008751]" />
              <span>Export Filter Scope</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Date Scope */}
              <div>
                <label className="block text-[11px] font-semibold text-[#3e4a41] dark:text-[#bdcabe] mb-1">
                  Time Window
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="w-full bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3 py-2 text-xs font-medium text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
                >
                  <option value="all">All Available Records</option>
                  <option value="today">Today Only</option>
                  <option value="7days">Past 7 Days</option>
                  <option value="30days">Past 30 Days</option>
                </select>
              </div>

              {/* Status Scope */}
              {activeCategory !== 'price_index' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#3e4a41] dark:text-[#bdcabe] mb-1">
                    Status Filter
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3 py-2 text-xs font-medium text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  >
                    <option value="all">All Verification Statuses</option>
                    <option value="verified">Verified / Approved Only</option>
                    <option value="pending">Pending Review Only</option>
                    <option value="flagged">Flagged & Outliers Only</option>
                  </select>
                </div>
              )}

              {/* Market Scope */}
              <div>
                <label className="block text-[11px] font-semibold text-[#3e4a41] dark:text-[#bdcabe] mb-1">
                  Target Market
                </label>
                <select
                  value={marketFilter}
                  onChange={(e) => setMarketFilter(e.target.value)}
                  className="w-full bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3 py-2 text-xs font-medium text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
                >
                  <option value="all">All Markets ({selectedCity})</option>
                  {markets.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Column Specification Preview */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider">
                Included CSV Columns & Schema
              </span>
              <span className="font-bold text-[#008751] dark:text-[#8df8b7]">
                {getRecordCount()} rows matching criteria
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/30 dark:border-[#2d3e58] text-xs space-y-2">
              {activeCategory === 'verifications' && (
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Submission ID',
                    'Ref #',
                    'Product Name',
                    'Market Name',
                    'City',
                    'Price (NGN)',
                    'Quantity & Unit',
                    'Vendor Stall',
                    'Agent ID & Name',
                    'Agent Reputation',
                    'GPS Lat / Lng',
                    'EXIF Verified',
                    'Trust Score (%)',
                    'Anomaly Notes',
                    'Offline Queued',
                    'Status',
                    'Certified Timestamp',
                  ].map((col) => (
                    <span
                      key={col}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] text-[10px] font-semibold text-[#121c2a] dark:text-[#f8f9ff]"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              )}

              {activeCategory === 'audit_logs' && (
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Log ID',
                    'Timestamp ISO',
                    'Actor Name & Role',
                    'Action Type',
                    'Entity Target',
                    'Status Severity',
                    'Confidence Score',
                    'Recorded Price',
                    'Detailed Audit Payload',
                  ].map((col) => (
                    <span
                      key={col}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] text-[10px] font-semibold text-[#121c2a] dark:text-[#f8f9ff]"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              )}

              {activeCategory === 'price_index' && (
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Product ID',
                    'Product Name',
                    'Category',
                    'Brand',
                    'Unit',
                    'Average Price',
                    'Lowest Price',
                    'Highest Price',
                    'Price Change %',
                    'Confidence Level',
                    'Observations Count',
                    'Market Price Breakdown',
                  ].map((col) => (
                    <span
                      key={col}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] text-[10px] font-semibold text-[#121c2a] dark:text-[#f8f9ff]"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-[#6e7a70] dark:text-[#bdcabe] pt-1">
                <Info className="w-3.5 h-3.5 text-[#008751] shrink-0" />
                <span>
                  Formatted with UTF-8 BOM encoding for direct import into Microsoft Excel, Google
                  Sheets, and Python Pandas.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#bdcabe]/30 dark:border-[#2d3e58] bg-[#f8f9ff] dark:bg-[#121c2a] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#3e4a41] dark:text-[#bdcabe] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#008751]" />
            <span>Ready to generate RFC-4180 compliant CSV stream</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#bdcabe]/50 dark:border-[#2d3e58] text-xs font-semibold text-[#121c2a] dark:text-[#f8f9ff] hover:bg-white dark:hover:bg-[#182232] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || getRecordCount() === 0}
              id="confirm-csv-download-btn"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Generating CSV...' : `Download CSV (${getRecordCount()} Rows)`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
