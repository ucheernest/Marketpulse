import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  Filter,
  Package,
} from 'lucide-react';
import { Product } from '../types';

export const SearchResults: React.FC = () => {
  const {
    products,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedOriginFilter,
    setSelectedOriginFilter,
    selectedSizeFilter,
    setSelectedSizeFilter,
    selectedSort,
    setSelectedSort,
    selectedCity,
    setActiveView,
    openProductDetail,
  } = useApp();

  const filterChips = [
    { label: 'All', value: 'All' },
    { label: 'Local', value: 'Local' },
    { label: 'Imported', value: 'Imported' },
    { label: '5kg', value: '5kg' },
    { label: '10kg', value: '10kg' },
    { label: '25kg', value: '25kg' },
    { label: '50kg', value: '50kg' },
    { label: 'Basket', value: 'Basket' },
    { label: '1kg', value: '1kg' },
  ];

  const handleChipClick = (val: string) => {
    if (val === 'All') {
      setSelectedOriginFilter('All');
      setSelectedSizeFilter('All');
    } else if (val === 'Local' || val === 'Imported') {
      setSelectedOriginFilter(selectedOriginFilter === val ? 'All' : (val as 'Local' | 'Imported'));
    } else {
      setSelectedSizeFilter(selectedSizeFilter === val ? 'All' : val);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesBrand = p.brand?.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesBrand) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // Origin filter
      if (selectedOriginFilter !== 'All') {
        if (p.isLocalOrImported !== selectedOriginFilter && p.isLocalOrImported !== 'Both') {
          return false;
        }
      }

      // Size filter
      if (selectedSizeFilter !== 'All') {
        const matchesUnit = p.unit.toLowerCase().includes(selectedSizeFilter.toLowerCase());
        const matchesSize = p.sizeOption?.toLowerCase().includes(selectedSizeFilter.toLowerCase());
        if (!matchesUnit && !matchesSize) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (selectedSort === 'price_asc') return a.currentAvgPrice - b.currentAvgPrice;
      if (selectedSort === 'price_desc') return b.currentAvgPrice - a.currentAvgPrice;
      if (selectedSort === 'confidence') return b.confidenceScore - a.confidenceScore;
      return 0;
    });
  }, [products, searchQuery, selectedCategory, selectedOriginFilter, selectedSizeFilter, selectedSort]);

  return (
    <div id="search-results-screen" className="space-y-6 pb-20">
      {/* Header Search & Filter Bar */}
      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-3 md:p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('home')}
            className="p-2 text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#25344a] rounded-full transition-colors shrink-0"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3e4a41] dark:text-[#bdcabe]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search markets, grains, provisions..."
              className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751] focus:border-transparent"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3 py-2 text-xs font-medium text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="confidence">Confidence Score</option>
            </select>
          </div>
        </div>

        {/* Filter Chips Horizontal Bar */}
        <div
          className="flex overflow-x-auto gap-2 pb-1 scrollbar-none hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filterChips.map((chip) => {
            const isActive =
              (chip.value === 'All' && selectedOriginFilter === 'All' && selectedSizeFilter === 'All') ||
              (chip.value === selectedOriginFilter) ||
              (chip.value === selectedSizeFilter);

            return (
              <button
                key={chip.label}
                onClick={() => handleChipClick(chip.value)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#008751] text-white border border-[#008751] shadow-xs'
                    : 'bg-[#f8f9ff] dark:bg-[#121c2a] text-[#3e4a41] dark:text-[#bdcabe] border border-[#bdcabe]/50 dark:border-[#2d3e58] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Context Summary Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 px-1">
        <div>
          <h1 className="text-2xl font-bold text-[#121c2a] dark:text-[#f8f9ff]">
            {selectedCity}
          </h1>
          <p className="text-sm text-[#3e4a41] dark:text-[#bdcabe]">
            {filteredProducts.length} results {searchQuery ? `for "${searchQuery}"` : 'in catalog'}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:self-end">
          <div className="sm:hidden flex-1">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="w-full bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-lg px-3 py-1.5 text-xs text-[#121c2a] dark:text-[#f8f9ff]"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="confidence">Highest Confidence</option>
            </select>
          </div>
          <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-[#3e4a41] dark:text-[#bdcabe]">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sorted by Price</span>
          </span>
        </div>
      </div>

      {/* Results Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-12 text-center space-y-3">
          <Package className="w-12 h-12 mx-auto text-[#6e7a70] opacity-40" />
          <h3 className="text-lg font-bold text-[#121c2a] dark:text-[#f8f9ff]">
            No matching commodity prices found
          </h3>
          <p className="text-sm text-[#3e4a41] dark:text-[#bdcabe] max-w-md mx-auto">
            Try adjusting your search keywords or resetting filters to browse all verified market intelligence.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedOriginFilter('All');
              setSelectedSizeFilter('All');
            }}
            className="px-4 py-2 rounded-xl bg-[#008751] text-white text-xs font-semibold hover:bg-[#006b3f] transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const isUp = product.priceChangeDirection === 'up';
            const isDown = product.priceChangeDirection === 'down';

            return (
              <article
                key={product.id}
                onClick={() => openProductDetail(product)}
                className="bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-2xl p-4 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col gap-3 cursor-pointer group hover:-translate-y-0.5"
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-base font-bold text-[#121c2a] dark:text-[#f8f9ff] group-hover:text-[#006b3f] dark:group-hover:text-[#8df8b7] transition-colors leading-tight">
                    {product.name}
                  </h2>

                  {/* Trend Indicator */}
                  {isUp && (
                    <div className="flex items-center text-[#835200] dark:text-[#ffb95f] bg-amber-100/70 dark:bg-amber-950/70 px-2 py-1 rounded-md text-xs font-bold shrink-0 ml-2 border border-amber-200/50 dark:border-amber-800/50">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      <span>+{product.priceChangePercent}%</span>
                    </div>
                  )}
                  {isDown && (
                    <div className="flex items-center text-[#006b3f] dark:text-[#8df8b7] bg-emerald-100/70 dark:bg-emerald-950/70 px-2 py-1 rounded-md text-xs font-bold shrink-0 ml-2 border border-emerald-200/50 dark:border-emerald-800/50">
                      <TrendingDown className="w-3.5 h-3.5 mr-1" />
                      <span>{product.priceChangePercent}%</span>
                    </div>
                  )}
                  {!isUp && !isDown && (
                    <div className="flex items-center text-[#3e4a41] dark:text-[#bdcabe] bg-[#eff4ff] dark:bg-[#25344a] px-2 py-1 rounded-md text-xs font-bold shrink-0 ml-2">
                      <span>0.0%</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-[#006b3f] dark:text-[#8df8b7]">
                      ₦{product.currentAvgPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-[#3e4a41] dark:text-[#bdcabe] uppercase">
                      avg
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-medium text-[#3e4a41] dark:text-[#bdcabe] bg-[#f8f9ff] dark:bg-[#121c2a] p-2 rounded-xl border border-[#bdcabe]/30 dark:border-[#2d3e58]">
                    <span>Low: ₦{product.priceLow.toLocaleString()}</span>
                    <span>High: ₦{product.priceHigh.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-[#bdcabe]/30 dark:border-[#2d3e58] flex justify-between items-center text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                  <div className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#6e7a70]" />
                    <span>Verified {product.lastVerified}</span>
                  </div>

                  {product.confidence === 'High Confidence' ? (
                    <div className="flex items-center gap-1 text-[#006b3f] dark:text-[#8df8b7] bg-[#008751]/10 px-2 py-0.5 rounded-full font-semibold text-[11px] border border-[#008751]/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>High Confidence</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[#3e4a41] dark:text-[#bdcabe] bg-[#eff4ff] dark:bg-[#25344a] px-2 py-0.5 rounded-full font-semibold text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-[#a56800]" />
                      <span>Mod Confidence</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
