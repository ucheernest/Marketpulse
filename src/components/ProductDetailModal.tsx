import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Store,
  AlertTriangle,
  ChevronRight,
  Info,
  Layers,
  MapPin,
  X,
  Calendar,
  Activity,
  BarChart3,
  Maximize2,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  generate30DayPriceHistory,
  getTimeframeData,
  DailyPriceDataPoint,
} from '../utils/priceHistoryGenerator';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    closeProductDetail,
    selectedCity,
    toggleSaveProduct,
    isProductSaved,
    openReportModal,
    addToast,
  } = useApp();

  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d' | '3m'>('30d');
  const [showSpreadBand, setShowSpreadBand] = useState<boolean>(false);
  const [showAvgBenchmark, setShowAvgBenchmark] = useState<boolean>(true);

  // Compute 30-day analytics & current timeframe dataset
  const { thirtyDayHistory, timeframeData, stats } = useMemo(() => {
    if (!selectedProduct) {
      return {
        thirtyDayHistory: [],
        timeframeData: [],
        stats: null,
      };
    }
    const history = generate30DayPriceHistory(selectedProduct);
    const tfData = getTimeframeData(selectedProduct, timeframe);
    return {
      thirtyDayHistory: history.data,
      timeframeData: tfData,
      stats: history.stats,
    };
  }, [selectedProduct, timeframe]);

  if (!selectedProduct) return null;

  const isSaved = isProductSaved(selectedProduct.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${selectedProduct.name} - MarketPulse Intelligence`,
          text: `Verified 30-day average price for ${selectedProduct.name} in ${selectedCity} is ₦${selectedProduct.currentAvgPrice.toLocaleString()}.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Verified price for ${selectedProduct.name} in ${selectedCity}: ₦${selectedProduct.currentAvgPrice.toLocaleString()} (30-day range: ₦${stats?.minPrice.toLocaleString() || selectedProduct.priceLow.toLocaleString()} - ₦${stats?.maxPrice.toLocaleString() || selectedProduct.priceHigh.toLocaleString()})`
      );
      addToast('Price intelligence link copied to clipboard!', 'info');
    }
  };

  // Find lowest price market
  const sortedMarkets = [...selectedProduct.marketPrices].sort((a, b) => a.price - b.price);

  // Formatter for Y-Axis (e.g., 78000 -> ₦78k)
  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `₦${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `₦${Math.round(val / 1000)}k`;
    return `₦${val}`;
  };

  // Custom Recharts Tooltip Component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: DailyPriceDataPoint = payload[0].payload;
      const isUp = stats ? dataPoint.avgPrice >= stats.startPrice : true;

      return (
        <div className="bg-white/95 dark:bg-[#182232]/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-[#bdcabe]/40 dark:border-[#2d3e58] text-xs space-y-1.5 min-w-[200px] z-50">
          <div className="flex items-center justify-between border-b border-[#bdcabe]/30 dark:border-[#2d3e58] pb-1.5">
            <span className="font-bold text-[#121c2a] dark:text-[#f8f9ff] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#008751]" />
              {dataPoint.fullDate || dataPoint.date}
            </span>
            <span className="text-[10px] font-semibold text-[#6e7a70] dark:text-[#bdcabe]">
              {dataPoint.confidence}% Trust
            </span>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center">
              <span className="text-[#3e4a41] dark:text-[#bdcabe]">Daily Average:</span>
              <span className="font-bold text-sm text-[#008751] dark:text-[#8df8b7]">
                ₦{dataPoint.avgPrice.toLocaleString()}
              </span>
            </div>

            {dataPoint.minPrice && dataPoint.maxPrice && (
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#6e7a70] dark:text-[#bdcabe]">Stall Range:</span>
                <span className="font-semibold text-[#121c2a] dark:text-[#f8f9ff]">
                  ₦{dataPoint.minPrice.toLocaleString()} - ₦{dataPoint.maxPrice.toLocaleString()}
                </span>
              </div>
            )}

            {dataPoint.volume && (
              <div className="flex justify-between items-center text-[10px] text-[#6e7a70] dark:text-[#bdcabe] pt-0.5">
                <span>Field observations:</span>
                <span>{dataPoint.volume} verifications</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.2 }}
        className="bg-[#f8f9ff] dark:bg-[#121c2a] w-full max-w-3xl min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl border-x sm:border border-[#bdcabe]/40 dark:border-[#2d3e58] flex flex-col my-auto overflow-hidden"
      >
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#182232]/90 backdrop-blur-md px-4 py-3 border-b border-[#bdcabe]/40 dark:border-[#2d3e58] flex items-center justify-between">
          <button
            onClick={closeProductDetail}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#006b3f] dark:hover:text-[#8df8b7] p-1.5 rounded-full hover:bg-[#eff4ff] dark:hover:bg-[#25344a] transition-colors cursor-pointer"
            aria-label="Back to results"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="text-center px-2">
            <h2 className="text-sm sm:text-base font-bold text-[#121c2a] dark:text-[#f8f9ff] line-clamp-1">
              {selectedProduct.name}
            </h2>
            <p className="text-[11px] text-[#3e4a41] dark:text-[#bdcabe]">
              {selectedCity} • 30-Day Verified Price Fluctuations
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleSaveProduct(selectedProduct.id)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isSaved
                  ? 'text-[#008751] bg-[#008751]/10'
                  : 'text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save to Watchlist'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#25344a] rounded-full transition-colors cursor-pointer"
              title="Share price report"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={closeProductDetail}
              className="sm:hidden p-2 text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#25344a] rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-100px)]">
          {/* Product Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] shadow-xs">
            <div className="h-48 sm:h-56 w-full bg-[#dee9fc]/40 dark:bg-[#1d2a3c] relative overflow-hidden">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Brand & Category Tags */}
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.brand && (
                    <span className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-[#121c2a]/90 text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff] shadow-sm backdrop-blur-md">
                      {selectedProduct.brand}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-md">
                    {selectedProduct.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#008751]/80 text-white text-xs font-medium backdrop-blur-md">
                    {selectedProduct.unit}
                  </span>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-semibold backdrop-blur-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Highlight Card */}
          <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider">
                  Current Average Price
                </span>
                <div className="text-3xl sm:text-4xl font-bold text-[#006b3f] dark:text-[#8df8b7] mt-0.5">
                  ₦{selectedProduct.currentAvgPrice.toLocaleString()}
                </div>
              </div>

              {/* Trend Tag */}
              {selectedProduct.priceChangeDirection === 'up' ? (
                <div className="flex items-center text-[#835200] dark:text-[#ffb95f] bg-amber-100/80 dark:bg-amber-950/80 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200/60 dark:border-amber-800/60">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+{selectedProduct.priceChangePercent}% (30d)</span>
                </div>
              ) : (
                <div className="flex items-center text-[#006b3f] dark:text-[#8df8b7] bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-200/60">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span>{selectedProduct.priceChangePercent}% (30d)</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-[#bdcabe]/30 dark:border-[#2d3e58]">
              <div className="bg-[#f8f9ff] dark:bg-[#121c2a] p-3 rounded-xl border border-[#bdcabe]/30 dark:border-[#2d3e58]">
                <div className="text-[11px] font-medium text-[#3e4a41] dark:text-[#bdcabe]">
                  Current Range
                </div>
                <div className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff] mt-0.5">
                  ₦{selectedProduct.priceLow.toLocaleString()} - ₦{selectedProduct.priceHigh.toLocaleString()}
                </div>
              </div>

              <div className="bg-[#f8f9ff] dark:bg-[#121c2a] p-3 rounded-xl border border-[#bdcabe]/30 dark:border-[#2d3e58]">
                <div className="text-[11px] font-medium text-[#3e4a41] dark:text-[#bdcabe]">
                  30-Day Benchmark
                </div>
                <div className="text-sm font-bold text-[#0058be] dark:text-[#adc6ff] mt-0.5">
                  ₦{stats?.avg30DayPrice.toLocaleString() || selectedProduct.currentAvgPrice.toLocaleString()}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-[#f8f9ff] dark:bg-[#121c2a] p-3 rounded-xl border border-[#bdcabe]/30 dark:border-[#2d3e58]">
                <div className="text-[11px] font-medium text-[#3e4a41] dark:text-[#bdcabe]">
                  Freshness
                </div>
                <div className="text-sm font-bold text-[#006b3f] dark:text-[#8df8b7] mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{selectedProduct.lastVerified}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 30-Day Historical Price Fluctuations Interactive Recharts Card */}
          <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
            {/* Section Header with Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#008751]" />
                  <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                    Historical Price Fluctuations
                  </h3>
                </div>
                <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe] mt-0.5">
                  Daily verified price trajectory and market volatility over time
                </p>
              </div>

              {/* Timeframe Selector */}
              <div className="flex bg-[#f8f9ff] dark:bg-[#121c2a] p-1 rounded-xl border border-[#bdcabe]/40 dark:border-[#2d3e58] self-start sm:self-auto">
                <button
                  onClick={() => setTimeframe('30d')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    timeframe === '30d'
                      ? 'bg-[#008751] text-white shadow-xs'
                      : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#006b3f]'
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setTimeframe('7d')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    timeframe === '7d'
                      ? 'bg-[#008751] text-white shadow-xs'
                      : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#006b3f]'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setTimeframe('3m')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    timeframe === '3m'
                      ? 'bg-[#008751] text-white shadow-xs'
                      : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#006b3f]'
                  }`}
                >
                  3 Months
                </button>
                <button
                  onClick={() => setTimeframe('today')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    timeframe === 'today'
                      ? 'bg-[#008751] text-white shadow-xs'
                      : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#006b3f]'
                  }`}
                >
                  Today
                </button>
              </div>
            </div>

            {/* 30-Day Key Analytical Stats Badges */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {/* 30d Low */}
                <div className="p-2.5 rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/30 dark:border-[#2d3e58]">
                  <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe] font-medium flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>30-Day Low</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    ₦{stats.minPrice.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-[#6e7a70] dark:text-[#bdcabe] mt-0.5">
                    {stats.minPriceDate}
                  </div>
                </div>

                {/* 30d High */}
                <div className="p-2.5 rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/30 dark:border-[#2d3e58]">
                  <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe] font-medium flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>30-Day High</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                    ₦{stats.maxPrice.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-[#6e7a70] dark:text-[#bdcabe] mt-0.5">
                    {stats.maxPriceDate}
                  </div>
                </div>

                {/* Net Change */}
                <div className="p-2.5 rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/30 dark:border-[#2d3e58]">
                  <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe] font-medium flex items-center gap-1">
                    <Activity className="w-3 h-3 text-[#0058be] dark:text-[#adc6ff]" />
                    <span>30d Net Shift</span>
                  </div>
                  <div className={`text-xs sm:text-sm font-bold mt-0.5 ${
                    stats.netChange >= 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
                  }`}>
                    {stats.netChange >= 0 ? `+₦${stats.netChange.toLocaleString()}` : `-₦${Math.abs(stats.netChange).toLocaleString()}`}
                  </div>
                  <div className="text-[9px] text-[#6e7a70] dark:text-[#bdcabe] mt-0.5">
                    {stats.netChangePercent >= 0 ? `+${stats.netChangePercent}%` : `${stats.netChangePercent}%`}
                  </div>
                </div>

                {/* Volatility */}
                <div className="p-2.5 rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/30 dark:border-[#2d3e58]">
                  <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe] font-medium flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span>Volatility</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff] mt-0.5">
                    {stats.volatilityLevel} (±{stats.volatilityPercent}%)
                  </div>
                  <div className="text-[9px] text-[#6e7a70] dark:text-[#bdcabe] mt-0.5">
                    {stats.totalObservations} data samples
                  </div>
                </div>
              </div>
            )}

            {/* Recharts Fluctuations Canvas */}
            <div className="w-full h-64 sm:h-72 pt-3 pb-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timeframeData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="priceGradientGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#008751" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#008751" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="spreadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0058be" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0058be" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#bdcabe"
                    strokeOpacity={0.25}
                  />

                  <XAxis
                    dataKey="shortDate"
                    tickLine={false}
                    axisLine={{ stroke: '#bdcabe', strokeOpacity: 0.3 }}
                    tick={{ fill: '#6e7a70', fontSize: 11 }}
                    interval="preserveStartEnd"
                    minTickGap={20}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6e7a70', fontSize: 11 }}
                    tickFormatter={formatYAxis}
                    domain={['dataMin - 1000', 'dataMax + 1000']}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  {/* Benchmark 30-day average reference line */}
                  {showAvgBenchmark && stats && (
                    <ReferenceLine
                      y={stats.avg30DayPrice}
                      stroke="#0058be"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: `Avg: ₦${stats.avg30DayPrice.toLocaleString()}`,
                        position: 'insideTopRight',
                        fill: '#0058be',
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    />
                  )}

                  {/* Optional Stall Spread Area */}
                  {showSpreadBand && (
                    <Area
                      type="monotone"
                      dataKey="maxPrice"
                      stroke="#2170e4"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      fill="url(#spreadGradient)"
                      name="Max Stall Price"
                    />
                  )}

                  {/* Main Verified Average Price Line & Gradient Area */}
                  <Area
                    type="monotone"
                    dataKey="avgPrice"
                    stroke="#008751"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#priceGradientGreen)"
                    activeDot={{
                      r: 6,
                      fill: '#008751',
                      stroke: '#ffffff',
                      strokeWidth: 2,
                    }}
                    name="Daily Average Price"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Interactive Feature Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#bdcabe]/20 dark:border-[#2d3e58] text-xs">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#008751]">
                  <input
                    type="checkbox"
                    checked={showAvgBenchmark}
                    onChange={(e) => setShowAvgBenchmark(e.target.checked)}
                    className="rounded border-[#bdcabe] text-[#008751] focus:ring-[#008751] accent-[#008751]"
                  />
                  <span>30-Day Benchmark Line</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#008751]">
                  <input
                    type="checkbox"
                    checked={showSpreadBand}
                    onChange={(e) => setShowSpreadBand(e.target.checked)}
                    className="rounded border-[#bdcabe] text-[#008751] focus:ring-[#008751] accent-[#008751]"
                  />
                  <span>Market Spread Corridor</span>
                </label>
              </div>

              <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe]">
                30-day index: <span className="font-semibold text-[#008751] dark:text-[#8df8b7]">RFC-4180 verified</span>
              </div>
            </div>

            {/* Smart Insight Banner */}
            <div className="bg-[#eff4ff] dark:bg-[#1d2a3c] p-3.5 rounded-xl border border-[#2170e4]/20 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#0058be] dark:text-[#adc6ff] shrink-0 mt-0.5" />
              <p className="text-xs text-[#0058be] dark:text-[#adc6ff] leading-relaxed">
                <span className="font-semibold">30-Day Market Analysis:</span>{' '}
                {selectedProduct.name} started 30 days ago at ₦{stats?.startPrice.toLocaleString()}, reached a peak of ₦{stats?.maxPrice.toLocaleString()} on {stats?.maxPriceDate}, and is presently trading at ₦{selectedProduct.currentAvgPrice.toLocaleString()}. {selectedProduct.insight}
              </p>
            </div>
          </div>

          {/* Data Trust Score Card */}
          <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#008751]" />
                <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                  Data Trust Score
                </h3>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#006b3f] dark:text-[#8df8b7] bg-[#008751]/10 px-2.5 py-1 rounded-full border border-[#008751]/20">
                <span>{selectedProduct.confidenceScore}%</span>
                <span>• {selectedProduct.confidence}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#dee9fc] dark:bg-[#25344a] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#008751] h-full rounded-full transition-all duration-500"
                style={{ width: `${selectedProduct.confidenceScore}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-2 text-xs text-[#3e4a41] dark:text-[#bdcabe] pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{selectedProduct.observationsCount} independent verified observations across 30 days</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Sourced from {selectedProduct.marketPrices.length} major {selectedCity} markets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Multi-vendor GPS and timestamp verified</span>
              </div>
            </div>
          </div>

          {/* Current Prices by Market (Detailed Breakdown) */}
          <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                Current Prices by Market
              </h3>
              <span className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                {sortedMarkets.length} locations surveyed
              </span>
            </div>

            <div className="space-y-2.5">
              {sortedMarkets.map((marketItem, idx) => {
                const isLowest = idx === 0;

                return (
                  <div
                    key={marketItem.marketId}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                      isLowest
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300/60 dark:border-emerald-800/60'
                        : 'bg-[#f8f9ff] dark:bg-[#121c2a] border-[#bdcabe]/30 dark:border-[#2d3e58]'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-[#008751]" />
                        <span className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                          {marketItem.marketName}
                        </span>
                        {isLowest && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                            Lowest Price
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#3e4a41] dark:text-[#bdcabe] flex items-center gap-1 pl-6">
                        <Clock className="w-3 h-3 text-[#6e7a70]" />
                        <span>Verified {marketItem.lastVerified}</span>
                        {marketItem.sellerStall && (
                          <span className="text-[#6e7a70] dark:text-[#bdcabe]">
                            • {marketItem.sellerStall}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base sm:text-lg font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                        ₦{marketItem.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="pt-2 pb-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => openReportModal(selectedProduct)}
              className="flex-1 py-3 px-4 rounded-xl border border-[#ba1a1a]/40 text-[#ba1a1a] dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report inaccurate price</span>
            </button>

            <button
              onClick={() => {
                toggleSaveProduct(selectedProduct.id);
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                isSaved
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300'
                  : 'bg-[#008751] hover:bg-[#006b3f] text-white shadow-xs'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{isSaved ? 'Saved in Watchlist' : 'Add to Watchlist'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
