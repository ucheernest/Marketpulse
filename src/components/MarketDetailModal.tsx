import React from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Package,
  Activity,
  X,
  ExternalLink,
  Store,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';

export const MarketDetailModal: React.FC = () => {
  const { selectedMarket, closeMarketDetail, products, openProductDetail } = useApp();

  if (!selectedMarket) return null;

  // Filter products available in this market
  const marketProducts = products.filter((p) =>
    p.marketPrices.some((mp) => mp.marketName.toLowerCase().includes(selectedMarket.name.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/40 dark:border-[#2d3e58] w-full max-w-2xl min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Market Image Hero */}
        <div className="relative h-56 w-full bg-[#dee9fc] dark:bg-[#25344a]">
          <img
            src={selectedMarket.image}
            alt={selectedMarket.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <button
            onClick={closeMarketDetail}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-[10px] font-bold uppercase tracking-wider">
              {selectedMarket.status === 'active' ? 'Active Coverage Hub' : 'Verified'}
            </span>
            <h2 className="text-2xl font-bold mt-1 leading-tight">{selectedMarket.name}</h2>
            <p className="text-xs opacity-80 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{selectedMarket.address}</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white dark:bg-[#182232] p-3 rounded-2xl border border-[#bdcabe]/40 dark:border-[#2d3e58]">
              <div className="text-[11px] text-[#3e4a41] dark:text-[#bdcabe]">Health Index</div>
              <div className="text-lg font-bold text-[#006b3f] dark:text-[#8df8b7] mt-0.5">
                {selectedMarket.healthScore}%
              </div>
            </div>

            <div className="bg-white dark:bg-[#182232] p-3 rounded-2xl border border-[#bdcabe]/40 dark:border-[#2d3e58]">
              <div className="text-[11px] text-[#3e4a41] dark:text-[#bdcabe]">Products</div>
              <div className="text-lg font-bold text-[#121c2a] dark:text-[#f8f9ff] mt-0.5">
                {selectedMarket.productsTracked}
              </div>
            </div>

            <div className="bg-white dark:bg-[#182232] p-3 rounded-2xl border border-[#bdcabe]/40 dark:border-[#2d3e58]">
              <div className="text-[11px] text-[#3e4a41] dark:text-[#bdcabe]">Today's Checks</div>
              <div className="text-lg font-bold text-[#0058be] dark:text-[#adc6ff] mt-0.5">
                {selectedMarket.updatesToday}
              </div>
            </div>
          </div>

          {/* Operating hours & Coordinates */}
          <div className="bg-white dark:bg-[#182232] p-4 rounded-2xl border border-[#bdcabe]/40 dark:border-[#2d3e58] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#3e4a41] dark:text-[#bdcabe] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#008751]" />
                <span>Trading Hours</span>
              </span>
              <span className="font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                {selectedMarket.operatingHours}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#bdcabe]/20 dark:border-[#2d3e58]">
              <span className="text-[#3e4a41] dark:text-[#bdcabe] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#008751]" />
                <span>GPS Coordinates</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                {selectedMarket.coordinates.lat}° N, {selectedMarket.coordinates.lng}° E
              </span>
            </div>
          </div>

          {/* Available Tracked Commodities in this Market */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                Tracked Commodities in {selectedMarket.name}
              </h3>
              <span className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                {marketProducts.length} items
              </span>
            </div>

            <div className="space-y-2">
              {marketProducts.map((prod) => {
                const specificPrice = prod.marketPrices.find((mp) =>
                  mp.marketName.toLowerCase().includes(selectedMarket.name.toLowerCase())
                )?.price || prod.currentAvgPrice;

                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      closeMarketDetail();
                      openProductDetail(prod);
                    }}
                    className="p-3 rounded-xl bg-white dark:bg-[#182232] border border-[#bdcabe]/30 dark:border-[#2d3e58] hover:border-[#008751] flex justify-between items-center cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe]">
                        {prod.category} • {prod.unit}
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <div>
                        <div className="text-sm font-bold text-[#006b3f] dark:text-[#8df8b7]">
                          ₦{specificPrice.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe]">
                          {prod.lastVerified}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#bdcabe]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
