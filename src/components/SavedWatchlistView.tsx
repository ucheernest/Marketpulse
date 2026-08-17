import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Bookmark,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Package,
} from 'lucide-react';

export const SavedWatchlistView: React.FC = () => {
  const { products, savedProductIds, toggleSaveProduct, openProductDetail, setActiveView, selectedCity } =
    useApp();

  const savedProducts = products.filter((p) => savedProductIds.includes(p.id));

  return (
    <div id="saved-watchlist-screen" className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#121c2a] dark:text-[#f8f9ff]">
            Saved Commodity Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-[#3e4a41] dark:text-[#bdcabe] mt-1">
            Track price movements and volatility alerts across {selectedCity} markets.
          </p>
        </div>

        <button
          onClick={() => setActiveView('search')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>Find More Commodities</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {savedProducts.length === 0 ? (
        <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-12 text-center space-y-4">
          <Bookmark className="w-12 h-12 mx-auto text-[#6e7a70] opacity-40" />
          <h3 className="text-lg font-bold text-[#121c2a] dark:text-[#f8f9ff]">
            Your watchlist is empty
          </h3>
          <p className="text-sm text-[#3e4a41] dark:text-[#bdcabe] max-w-sm mx-auto">
            Bookmark items from search or market feeds to track live price shifts and get instant anomaly alerts.
          </p>
          <button
            onClick={() => setActiveView('search')}
            className="px-4 py-2 rounded-xl bg-[#008751] text-white text-xs font-semibold hover:bg-[#006b3f] transition-colors cursor-pointer"
          >
            Explore Market Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => openProductDetail(product)}
              className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#006b3f] dark:text-[#8df8b7]">
                    {product.category}
                  </span>
                  <h3 className="text-base font-bold text-[#121c2a] dark:text-[#f8f9ff] group-hover:text-[#006b3f] dark:group-hover:text-[#8df8b7] transition-colors">
                    {product.name}
                  </h3>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveProduct(product.id);
                  }}
                  className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4 opacity-70 hover:opacity-100" />
                </button>
              </div>

              <div className="my-3 space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#006b3f] dark:text-[#8df8b7]">
                    ₦{product.currentAvgPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">avg</span>
                </div>

                <div className="flex justify-between text-xs text-[#3e4a41] dark:text-[#bdcabe] bg-[#f8f9ff] dark:bg-[#121c2a] p-2 rounded-xl">
                  <span>Low: ₦{product.priceLow.toLocaleString()}</span>
                  <span>High: ₦{product.priceHigh.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#bdcabe]/30 dark:border-[#2d3e58] flex justify-between items-center text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Verified {product.lastVerified}</span>
                </span>

                <span className="text-xs font-bold text-[#006b3f] dark:text-[#8df8b7] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{product.confidenceScore}% Trust</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
