import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  Check,
  ChevronDown,
  FileCheck2,
  Home,
  Laptop,
  LayoutDashboard,
  MapPin,
  Menu,
  Moon,
  Search as SearchIcon,
  ShieldCheck,
  Store,
  Sun,
  User,
  UserCheck,
  Users,
  PackageSearch,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AppView, useApp } from '../context/AppContext';

const CITIES = ['Port Harcourt'];

export const Navbar: React.FC = () => {
  const {
    currentRole,
    currentProfile,
    isAuthenticated,
    activeView,
    setActiveView,
    selectedCity,
    setSelectedCity,
    themeMode,
    setThemeMode,
    addToast,
    adminKPIs,
    openAuthModal,
  } = useApp();

  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAgent = currentRole === 'agent';
  const isAdmin = currentRole === 'admin' || currentRole === 'super_admin';
  const isSuperAdmin = currentRole === 'super_admin';

  const initials = useMemo(() => {
    const name = currentProfile?.full_name?.trim();
    if (!name) return 'MP';
    return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  }, [currentProfile?.full_name]);

  const roleLabel = isSuperAdmin ? 'Super Admin' : isAdmin ? 'Verifier / Admin' : isAgent ? 'Field Agent' : 'Consumer';
  const homeView: AppView = isAgent ? 'agent-dashboard' : isAdmin ? 'admin-overview' : 'home';

  const navItems = useMemo(() => {
    if (isAgent) {
      return [
        { view: 'agent-dashboard' as AppView, label: 'Agent Dashboard', icon: UserCheck },
        { view: 'submit-price' as AppView, label: 'Submit Price', icon: FileCheck2 },
        { view: 'markets' as AppView, label: 'Markets', icon: Store },
      ];
    }
    if (isAdmin) {
      const items = [
        { view: 'admin-overview' as AppView, label: 'Overview', icon: LayoutDashboard },
        { view: 'admin-verification' as AppView, label: 'Verification Queue', icon: ShieldCheck },
        { view: 'markets' as AppView, label: 'Markets Hub', icon: Store },
      ];
      if (isSuperAdmin) {
        items.push({ view: 'admin-users' as AppView, label: 'Users & Access', icon: Users });
        items.push({ view: 'admin-catalog' as AppView, label: 'Catalog', icon: PackageSearch });
      }
      return items;
    }
    return [
      { view: 'home' as AppView, label: 'Home', icon: Home },
      { view: 'search' as AppView, label: 'Search Prices', icon: SearchIcon },
      { view: 'markets' as AppView, label: 'Markets', icon: Store },
      { view: 'saved' as AppView, label: 'Saved', icon: Bookmark },
    ];
  }, [isAgent, isAdmin, isSuperAdmin]);

  return (
    <header className="bg-[#f8f9ff] dark:bg-[#121c2a] border-b border-[#bdcabe]/40 dark:border-[#2d3e58] sticky top-0 z-40 w-full">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-16 flex justify-between items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setActiveView(homeView)} className="flex items-center gap-2 text-left group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#008751] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-[#006b3f] dark:text-[#8df8b7] tracking-tight">MarketPulse</span>
              {currentRole !== 'consumer' && (
                <span className="ml-2 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#2170e4]/10 text-[#0058be] dark:text-[#adc6ff]">
                  {roleLabel}
                </span>
              )}
            </div>
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setCityDropdownOpen((open) => !open);
                setThemeDropdownOpen(false);
              }}
              className="flex items-center gap-1 text-xs font-medium text-[#3e4a41] dark:text-[#bdcabe] bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] px-2.5 py-1 rounded-full shadow-xs"
            >
              <span>{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            <AnimatePresence>
              {cityDropdownOpen && (
                <>
                  <button className="fixed inset-0 z-40 cursor-default" onClick={() => setCityDropdownOpen(false)} aria-label="Close city menu" />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    className="absolute left-0 mt-2 w-52 bg-white dark:bg-[#182232] rounded-xl shadow-xl border border-[#bdcabe]/40 dark:border-[#2d3e58] p-1.5 z-50"
                  >
                    <p className="px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-[#6e7a70]">Pilot city</p>
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setCityDropdownOpen(false);
                          addToast(`Showing verified intelligence for ${city}`, 'info');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs ${selectedCity === city ? 'bg-[#008751]/10 text-[#006b3f] font-semibold' : 'hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'}`}
                      >
                        {city}
                        {selectedCity === city && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 bg-white/70 dark:bg-[#182232]/70 backdrop-blur-md px-2 py-1 rounded-full border border-[#bdcabe]/40 dark:border-[#2d3e58] shadow-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${active ? 'bg-[#008751] text-white shadow-xs font-semibold' : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#006b3f] dark:hover:text-[#8df8b7] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.view === 'admin-verification' && adminKPIs.pendingVerification > 0 && (
                  <span className="min-w-4 h-4 px-1 rounded-full bg-[#ba1a1a] text-white text-[9px] flex items-center justify-center">
                    {adminKPIs.pendingVerification}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] text-[11px] font-bold">
              {isSuperAdmin || isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-[#835200]" /> : isAgent ? <UserCheck className="w-3.5 h-3.5 text-[#2170e4]" /> : <User className="w-3.5 h-3.5 text-[#008751]" />}
              {roleLabel}
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => {
                setThemeDropdownOpen((open) => !open);
                setCityDropdownOpen(false);
              }}
              className="p-2 rounded-full hover:bg-[#eff4ff] dark:hover:bg-[#25344a]"
              title="Appearance"
            >
              {themeMode === 'system' ? <Laptop className="w-4 h-4" /> : themeMode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {themeDropdownOpen && (
                <>
                  <button className="fixed inset-0 z-40 cursor-default" onClick={() => setThemeDropdownOpen(false)} aria-label="Close theme menu" />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#182232] rounded-xl shadow-xl border border-[#bdcabe]/40 dark:border-[#2d3e58] p-1.5 z-50"
                  >
                    {([
                      ['light', 'Light', Sun],
                      ['dark', 'Dark', Moon],
                      ['system', 'System', Laptop],
                    ] as const).map(([mode, label, Icon]) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setThemeMode(mode);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs ${themeMode === mode ? 'bg-[#008751]/10 text-[#006b3f] font-semibold' : 'hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'}`}
                      >
                        <span className="flex items-center gap-2"><Icon className="w-4 h-4" />{label}</span>
                        {themeMode === mode && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {isAuthenticated && currentProfile ? (
            <button
              onClick={() => setActiveView('profile')}
              className="flex items-center gap-2 group"
              title="Profile & Account"
            >
              {currentProfile.avatar_url ? (
                <img
                  src={currentProfile.avatar_url}
                  alt={currentProfile.full_name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#008751] group-hover:ring-2 group-hover:ring-[#008751]/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#008751] text-white flex items-center justify-center text-xs font-bold group-hover:ring-2 group-hover:ring-[#008751]/30">
                  {initials}
                </div>
              )}
              <span className="hidden xl:block max-w-28 truncate text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                {currentProfile.full_name || 'Profile'}
              </span>
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-3.5 py-2 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Log In / Sign Up</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="lg:hidden p-2 rounded-lg hover:bg-[#eff4ff] dark:hover:bg-[#25344a]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-[#182232] border-b border-[#bdcabe]/40 dark:border-[#2d3e58] px-4 py-4 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => {
                      setActiveView(item.view);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${activeView === item.view ? 'bg-[#008751] text-white' : 'bg-[#eff4ff] dark:bg-[#1d2a3c]'}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    setActiveView('profile');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${activeView === 'profile' ? 'bg-[#008751] text-white' : 'bg-[#eff4ff] dark:bg-[#1d2a3c]'}`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
