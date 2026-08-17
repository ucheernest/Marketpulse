import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  ArrowRight,
  Utensils,
  Apple,
  Fish,
  Sparkles,
  HeartPulse,
  Coffee,
  Store,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Package,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ProductCategory, Product } from '../types';

export const ConsumerHome: React.FC = () => {
  const {
    products,
    selectedCity,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    setActiveView,
    openProductDetail,
    adminKPIs,
  } = useApp();

  const handleCategoryClick = (category: ProductCategory) => {
    setSelectedCategory(category);
    setActiveView('search');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveView('search');
    }
  };

  // Find featured items from recent verification
  const tomatoes = products.find((p) => p.id === 'tomatoes-basket') || products[3];
  const rice = products.find((p) => p.id === 'golden-penny-rice-50kg') || products[0];
  const cement = products.find((p) => p.id === 'dangote-cement-50kg') || products[4];
  const fish = products.find((p) => p.id === 'fresh-catfish-kg') || products[6];

  const categories = [
    { name: 'Food Staples' as ProductCategory, icon: Utensils, label: 'Food Staples' },
    { name: 'Fresh Food' as ProductCategory, icon: Apple, label: 'Fresh Food' },
    { name: 'Meat & Seafood' as ProductCategory, icon: Fish, label: 'Meat & Seafood' },
    { name: 'Household' as ProductCategory, icon: Sparkles, label: 'Household' },
    { name: 'Personal Care' as ProductCategory, icon: HeartPulse, label: 'Personal Care' },
    { name: 'Beverages' as ProductCategory, icon: Coffee, label: 'Beverages' },
  ];

  return (
    <div id="consumer-home-screen" className="space-y-8 md:space-y-10 pb-16">
      {/* Hero Search Section */}
      <section className="flex flex-col items-center justify-center pt-4 md:pt-8 pb-2 w-full max-w-2xl mx-auto text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#121c2a] dark:text-[#f8f9ff] mb-4 tracking-tight">
          What price are you checking?
        </h1>

        <form
          onSubmit={handleSearchSubmit}
          className="w-full relative shadow-sm hover:shadow-md transition-shadow duration-300 rounded-full bg-white dark:bg-[#182232] border border-[#bdcabe] dark:border-[#2d3e58] flex items-center px-4 py-2 sm:py-2.5"
        >
          <Search className="w-5 h-5 text-[#3e4a41] dark:text-[#bdcabe] mr-3 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search markets, products, categories (e.g. Rice, Tomatoes, Cement)..."
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm md:text-base text-[#121c2a] dark:text-[#f8f9ff] placeholder-[#3e4a41]/70 dark:placeholder-[#bdcabe]/60 px-0 py-1"
          />
          <button
            type="submit"
            id="hero-search-submit-btn"
            className="bg-[#006b3f] hover:bg-[#008751] text-white rounded-full w-10 h-10 flex items-center justify-center transition-transform active:scale-95 shrink-0 ml-2 shadow-xs cursor-pointer"
            aria-label="Submit search"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </section>

      {/* Categories Grid */}
      <section>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 bg-white dark:bg-[#182232] border rounded-xl hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] hover:border-[#008751] hover:shadow-md transition-all duration-200 group cursor-pointer ${
                  isSelected
                    ? 'border-[#008751] ring-2 ring-[#008751]/20 bg-[#eff4ff] dark:bg-[#1d2a3c]'
                    : 'border-[#bdcabe]/50 dark:border-[#2d3e58]'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#eff4ff] dark:bg-[#25344a] group-hover:bg-[#008751] group-hover:text-white flex items-center justify-center transition-colors text-[#006b3f] dark:text-[#8df8b7]">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-[#121c2a] dark:text-[#eaf1ff] text-center line-clamp-1">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Market Snapshot Bento Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Card 1: City Snapshot Overview */}
          <div className="sm:col-span-2 lg:col-span-1 bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-6 -top-6 opacity-5 dark:opacity-10 pointer-events-none text-[#006b3f] dark:text-[#8df8b7]">
              <Activity className="w-40 h-40" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Store className="w-5 h-5 text-[#006b3f] dark:text-[#8df8b7]" />
                <h2 className="text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider">
                  {selectedCity} Snapshot
                </h2>
              </div>
              <p className="text-sm font-medium text-[#121c2a] dark:text-[#f8f9ff] mb-4 mt-1">
                Live market intelligence based on verified vendor and field agent reports.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#3e4a41] dark:text-[#bdcabe] mt-auto">
              <Clock className="w-4 h-4 text-[#008751]" />
              <span>Updated 18m ago</span>
            </div>
          </div>

          {/* Card 2: Prices Verified Today */}
          <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl p-5 shadow-xs flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
            <span className="text-3xl sm:text-4xl font-bold text-[#006b3f] dark:text-[#8df8b7] leading-none mb-1">
              2,481
            </span>
            <span className="text-xs font-medium text-[#3e4a41] dark:text-[#bdcabe]">
              Prices Verified Today
            </span>
          </div>

          {/* Card 3: Markets Covered */}
          <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl p-5 shadow-xs flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
            <span className="text-3xl sm:text-4xl font-bold text-[#121c2a] dark:text-[#f8f9ff] leading-none mb-1">
              12
            </span>
            <span className="text-xs font-medium text-[#3e4a41] dark:text-[#bdcabe]">
              Markets Covered
            </span>
          </div>

          {/* Card 4: Confidence Score */}
          <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl p-5 shadow-xs flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
            <div className="relative inline-flex items-center justify-center mb-1">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  className="text-[#dee9fc] dark:text-[#25344a]"
                  cx="32"
                  cy="32"
                  fill="transparent"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                />
                <circle
                  className="text-[#008751]"
                  cx="32"
                  cy="32"
                  fill="transparent"
                  r="26"
                  stroke="currentColor"
                  strokeDasharray="163.3"
                  strokeDashoffset="9.8"
                  strokeLinecap="round"
                  strokeWidth="5"
                />
              </svg>
              <span className="absolute text-base font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                94<span className="text-xs font-semibold">%</span>
              </span>
            </div>
            <span className="text-xs font-medium text-[#3e4a41] dark:text-[#bdcabe]">
              Confidence Score
            </span>
          </div>
        </div>
      </section>

      {/* Recently Verified Prices Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              Recently Verified
            </h2>
            <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
              Direct multi-vendor price observations in {selectedCity}
            </p>
          </div>
          <button
            onClick={() => setActiveView('search')}
            className="text-xs md:text-sm font-semibold text-[#006b3f] dark:text-[#8df8b7] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Tomatoes Basket */}
          {tomatoes && (
            <div
              onClick={() => openProductDetail(tomatoes)}
              className="bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50 dark:border-rose-900/50 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-6 h-6 text-[#ba1a1a] dark:text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#121c2a] dark:text-[#f8f9ff] group-hover:text-[#006b3f] dark:group-hover:text-[#8df8b7] transition-colors leading-tight">
                      {tomatoes.name}
                    </h3>
                    <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe] flex items-center gap-1 mt-1">
                      <Store className="w-3.5 h-3.5 text-[#008751]" />
                      <span>Mile 3 Market</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-lg sm:text-xl font-bold text-[#006b3f] dark:text-[#8df8b7]">
                    ₦{tomatoes.currentAvgPrice.toLocaleString()}{' '}
                    <span className="text-xs text-[#3e4a41] dark:text-[#bdcabe] font-normal">avg</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7] uppercase tracking-wider border border-[#008751]/20">
                      High Confidence
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#bdcabe]/30 dark:border-[#2d3e58] pt-3 mt-2 flex justify-between items-center text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                <div className="flex gap-4">
                  <span>Low: ₦{tomatoes.priceLow.toLocaleString()}</span>
                  <span>High: ₦{tomatoes.priceHigh.toLocaleString()}</span>
                </div>
                <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified 24m ago</span>
                </span>
              </div>
            </div>
          )}

          {/* Card 2: Golden Penny Rice 50kg */}
          {rice && (
            <div
              onClick={() => openProductDetail(rice)}
              className="bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/50 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-[#835200] dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#121c2a] dark:text-[#f8f9ff] group-hover:text-[#006b3f] dark:group-hover:text-[#8df8b7] transition-colors leading-tight">
                      {rice.name}
                    </h3>
                    <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe] flex items-center gap-1 mt-1">
                      <Store className="w-3.5 h-3.5 text-[#008751]" />
                      <span>Oil Mill Market</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-lg sm:text-xl font-bold text-[#006b3f] dark:text-[#8df8b7] flex items-center gap-1.5">
                    <span>₦{rice.currentAvgPrice.toLocaleString()}</span>
                    <span className="flex items-center text-[#835200] dark:text-[#ffb95f] text-xs font-semibold bg-amber-100/70 dark:bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-200/50 dark:border-amber-800/50">
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +3.2%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7] uppercase tracking-wider border border-[#008751]/20">
                      High Confidence
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#bdcabe]/30 dark:border-[#2d3e58] pt-3 mt-2 flex justify-between items-center text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                <div className="flex gap-4">
                  <span>Low: ₦{rice.priceLow.toLocaleString()}</span>
                  <span>High: ₦{rice.priceHigh.toLocaleString()}</span>
                </div>
                <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified 41m ago</span>
                </span>
              </div>
            </div>
          )}

          {/* Card 3: Dangote Cement 50kg */}
          {cement && (
            <div
              onClick={() => openProductDetail(cement)}
              className="bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/50 flex items-center justify-center shrink-0">
                    <Layers className="w-6 h-6 text-[#0058be] dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#121c2a] dark:text-[#f8f9ff] group-hover:text-[#006b3f] dark:group-hover:text-[#8df8b7] transition-colors leading-tight">
                      {cement.name}
                    </h3>
                    <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe] flex items-center gap-1 mt-1">
                      <Store className="w-3.5 h-3.5 text-[#008751]" />
                      <span>Mile 3 Market</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-lg sm:text-xl font-bold text-[#006b3f] dark:text-[#8df8b7]">
                    ₦{cement.currentAvgPrice.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7] uppercase tracking-wider border border-[#008751]/20">
                      High Confidence
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#bdcabe]/30 dark:border-[#2d3e58] pt-3 mt-2 flex justify-between items-center text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                <div className="flex gap-4">
                  <span>Low: ₦{cement.priceLow.toLocaleString()}</span>
                  <span>High: ₦{cement.priceHigh.toLocaleString()}</span>
                </div>
                <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified 10m ago</span>
                </span>
              </div>
            </div>
          )}

          {/* Card 4: Fresh Catfish */}
          {fish && (
            <div
              onClick={() => openProductDetail(fish)}
              className="bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/50 dark:border-teal-900/50 flex items-center justify-center shrink-0">
                    <Fish className="w-6 h-6 text-teal-700 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#121c2a] dark:text-[#f8f9ff] group-hover:text-[#006b3f] dark:group-hover:text-[#8df8b7] transition-colors leading-tight">
                      {fish.name}
                    </h3>
                    <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe] flex items-center gap-1 mt-1">
                      <Store className="w-3.5 h-3.5 text-[#008751]" />
                      <span>Creek Road Market</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-lg sm:text-xl font-bold text-[#006b3f] dark:text-[#8df8b7] flex items-center gap-1.5">
                    <span>₦{fish.currentAvgPrice.toLocaleString()}</span>
                    <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-100/70 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-200/50">
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -1.2%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7] uppercase tracking-wider border border-[#008751]/20">
                      High Confidence
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#bdcabe]/30 dark:border-[#2d3e58] pt-3 mt-2 flex justify-between items-center text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                <div className="flex gap-4">
                  <span>Low: ₦{fish.priceLow.toLocaleString()}</span>
                  <span>High: ₦{fish.priceHigh.toLocaleString()}</span>
                </div>
                <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified 35m ago</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
