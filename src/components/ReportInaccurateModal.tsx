import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, X, Send, Store, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

export const ReportInaccurateModal: React.FC = () => {
  const { reportModalProduct, closeReportModal, submitInaccuratePriceReport } = useApp();
  const [reportedPrice, setReportedPrice] = useState<number>(() =>
    reportModalProduct ? reportModalProduct.currentAvgPrice : 0
  );
  const [selectedMarket, setSelectedMarket] = useState<string>(() =>
    reportModalProduct?.marketPrices[0]?.marketName || 'Mile 3 Market'
  );
  const [reason, setReason] = useState<string>('Higher price encountered at stall');
  const [notes, setNotes] = useState<string>('');

  if (!reportModalProduct) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitInaccuratePriceReport({
      productId: reportModalProduct.id,
      marketName: selectedMarket,
      reportedPrice,
      reason,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5"
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-[#ba1a1a] dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                Report Inaccurate Price
              </h2>
              <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                {reportModalProduct.name}
              </p>
            </div>
          </div>

          <button
            onClick={closeReportModal}
            className="p-1 text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#25344a] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
              Market Where Encountered
            </label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3.5 py-2.5 text-sm text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
            >
              {reportModalProduct.marketPrices.map((mp) => (
                <option key={mp.marketId} value={mp.marketName}>
                  {mp.marketName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
              Actual Price You Observed (₦ NGN)
            </label>
            <input
              type="number"
              value={reportedPrice}
              onChange={(e) => setReportedPrice(Number(e.target.value))}
              className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3.5 py-2.5 text-base font-bold text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
              Reason / Discrepancy Type
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3.5 py-2.5 text-sm text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
            >
              <option value="Higher price encountered at stall">Higher price encountered at stall</option>
              <option value="Lower price available at stalls">Lower price available at stalls</option>
              <option value="Product temporarily out of stock">Product temporarily out of stock</option>
              <option value="Different brand / packaging">Different brand / packaging</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
              Additional Details (Stall name, line, etc.)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Price was quoted at Stall 14 in Grain line today at 11am..."
              className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl p-3 text-xs sm:text-sm text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={closeReportModal}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#bdcabe]/50 text-xs font-semibold text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#25344a] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#ba1a1a] hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Audit</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
