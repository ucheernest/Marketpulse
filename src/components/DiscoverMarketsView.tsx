import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingUp,
  Package,
  Activity,
  Calendar,
  Users,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { Market } from '../types';

export const DiscoverMarketsView: React.FC = () => {
  const { markets, selectedCity, openMarketDetail, setActiveView, setSelectedCategory } = useApp();
  const [searchMarketQuery, setSearchMarketQuery] = useState('');

  const cityMarkets = useMemo(() => {
    return markets.filter((m) => {
      const matchesCity = m.city.toLowerCase() === selectedCity.toLowerCase();
      if (!matchesCity) return false;
      if (searchMarketQuery.trim()) {
        const q = searchMarketQuery.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.address.toLowerCase().includes(q);
      }
      return true;
    });
  }, [markets, selectedCity, searchMarketQuery]);

  const totalProductsTracked = cityMarkets.reduce((acc, m) => acc + m.productsTracked, 0);
  const totalUpdatesToday = cityMarkets.reduce((acc, m) => acc + m.updatesToday, 0);

  return (
    <div id="discover-markets-screen" className="space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#121c2a] dark:text-[#f8f9ff] tracking-tight">
            Discover Markets in {selectedCity}
          </h1>
          <p className="text-xs sm:text-sm text-[#3e4a41] dark:text-[#bdcabe] mt-1">
            Real-time price intelligence and verified vendor hubs across key trading centers.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3e4a41] dark:text-[#bdcabe]" />
          <input
            type="text"
            value={searchMarketQuery}
            onChange={(e) => setSearchMarketQuery(e.target.value)}
            placeholder="Search markets or locations..."
            className="w-full bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
          />
        </div>
      </div>

      {/* Top Metrics Cards (Image 7/8 design) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center shrink-0">
            <Store className="w-6 h-6 text-[#006b3f] dark:text-[#8df8b7]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider">
              Active Markets
            </span>
            <div className="text-2xl font-bold text-[#121c2a] dark:text-[#f8f9ff] mt-0.5">
              {cityMarkets.length}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-[#0058be] dark:text-[#adc6ff]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider">
              Products Tracked
            </span>
            <div className="text-2xl font-bold text-[#121c2a] dark:text-[#f8f9ff] mt-0.5">
              {totalProductsTracked > 0 ? totalProductsTracked.toLocaleString() : '1,055'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-[#835200] dark:text-[#ffb95f]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider">
              Updates Today
            </span>
            <div className="text-2xl font-bold text-[#006b3f] dark:text-[#8df8b7] mt-0.5">
              {totalUpdatesToday > 0 ? totalUpdatesToday.toLocaleString() : '554'}
            </div>
          </div>
        </div>
      </div>

      {/* Markets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cityMarkets.map((market) => (
          <div
            key={market.id}
            onClick={() => openMarketDetail(market)}
            className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer hover:-translate-y-1"
          >
            {/* Market Photo Header */}
            <div className="relative h-44 w-full bg-[#dee9fc] dark:bg-[#25344a] overflow-hidden">
              <img
                src={market.image}
                alt={market.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold backdrop-blur-md flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {market.status === 'active' ? 'Active Coverage' : 'Verified'}
                </span>
              </div>

              {/* Market Name & Address */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="text-lg font-bold leading-tight group-hover:text-[#8df8b7] transition-colors">
                  {market.name}
                </h3>
                <p className="text-xs opacity-80 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="line-clamp-1">{market.address}</span>
                </p>
              </div>
            </div>

            {/* Content & Stats */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              {/* Score and Operating Hours */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#f8f9ff] dark:bg-[#121c2a] p-2.5 rounded-xl border border-[#bdcabe]/30 dark:border-[#2d3e58]">
                  <div className="text-[11px] text-[#3e4a41] dark:text-[#bdcabe]">Health Score</div>
                  <div className="text-base font-bold text-[#006b3f] dark:text-[#8df8b7] mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{market.healthScore}%</span>
                  </div>
                </div>

                <div className="bg-[#f8f9ff] dark:bg-[#121c2a] p-2.5 rounded-xl border border-[#bdcabe]/30 dark:border-[#2d3e58]">
                  <div className="text-[11px] text-[#3e4a41] dark:text-[#bdcabe]">Products Tracked</div>
                  <div className="text-base font-bold text-[#121c2a] dark:text-[#f8f9ff] mt-0.5">
                    {market.productsTracked}
                  </div>
                </div>
              </div>

              {/* Operating Info */}
              <div className="space-y-1.5 text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#008751]" />
                    <span>{market.operatingHours}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    {market.updatesToday} updates today
                  </span>
                </div>
              </div>

              {/* Footer action */}
              <div className="pt-3 border-t border-[#bdcabe]/30 dark:border-[#2d3e58] flex justify-between items-center text-xs">
                <span className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe]">
                  Last observation {market.lastUpdated}
                </span>
                <span className="font-semibold text-[#006b3f] dark:text-[#8df8b7] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Explore Index</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
