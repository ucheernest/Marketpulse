import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  ChevronDown,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
  Bell,
  ShieldCheck,
  UserCheck,
  SlidersHorizontal,
  Bookmark,
  Store,
  Search as SearchIcon,
  Home,
  FileCheck2,
  LayoutDashboard,
  Check,
  Database,
  KeyRound,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CITIES = ['Port Harcourt', 'Lagos', 'Abuja', 'Kano', 'Ibadan', 'Enugu'];

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeView,
    setActiveView,
    selectedCity,
    setSelectedCity,
    themeMode,
    setThemeMode,
    isDark,
    addToast,
    adminKPIs,
    agentProfile,
    isSupabaseActive,
    openBackendModal,
    openAuthModal,
  } = useApp();

  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      id="top-app-bar"
      className="bg-[#f8f9ff] dark:bg-[#121c2a] border-b border-[#bdcabe]/40 dark:border-[#2d3e58] sticky top-0 z-40 w-full transition-colors duration-200"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
        {/* Brand & Location Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView(currentRole === 'agent' ? 'agent-dashboard' : currentRole === 'admin' ? 'admin-overview' : 'home')}
            className="flex items-center gap-2 text-left group"
            id="brand-logo-btn"
          >
            <div className="w-9 h-9 rounded-xl bg-[#008751] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#006b3f] dark:text-[#8df8b7] tracking-tight leading-none">
                  MarketPulse
                </span>
                {currentRole !== 'consumer' && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#2170e4]/10 dark:bg-[#2170e4]/20 text-[#0058be] dark:text-[#adc6ff] border border-[#2170e4]/20">
                    {currentRole}
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Location Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setCityDropdownOpen(!cityDropdownOpen);
                setThemeDropdownOpen(false);
                setRoleDropdownOpen(false);
              }}
              id="city-selector-btn"
              className="flex items-center gap-1 text-xs font-medium text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#006b3f] dark:hover:text-[#8df8b7] bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] px-2.5 py-1 rounded-full shadow-xs transition-colors"
            >
              <span>{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            <AnimatePresence>
              {cityDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCityDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-48 bg-white dark:bg-[#182232] rounded-xl shadow-xl border border-[#bdcabe]/40 dark:border-[#2d3e58] p-1.5 z-50 overflow-hidden"
                  >
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[#6e7a70] dark:text-[#bdcabe] px-3 py-1.5">
                      Select Market City
                    </div>
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setCityDropdownOpen(false);
                          addToast(`Switched active intelligence to ${city}`, 'info');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          selectedCity === city
                            ? 'bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7] font-semibold'
                            : 'text-[#121c2a] dark:text-[#eaf1ff] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                        }`}
                      >
                        <span>{city}</span>
                        {selectedCity === city && <Check className="w-3.5 h-3.5 text-[#008751]" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/70 dark:bg-[#182232]/70 backdrop-blur-md px-2 py-1 rounded-full border border-[#bdcabe]/40 dark:border-[#2d3e58] shadow-xs">
          {currentRole === 'consumer' && (
            <>
              <button
                onClick={() => setActiveView('home')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeView === 'home'
                    ? 'bg-[#008751] text-white shadow-xs font-semibold'
                    : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#006b3f] dark:hover:text-[#8df8b7] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveView('search')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeView === 'search'
                    ? 'bg-[#008751] text-white shadow-xs font-semibold'
                    : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#006b3f] dark:hover:text-[#8df8b7] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                }`}
              >
                Search Prices
              </button>
              <button
                onClick={() => setActiveView('markets')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeView === 'markets'
                    ? 'bg-[#008751] text-white shadow-xs font-semibold'
                    : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#006b3f] dark:hover:text-[#8df8b7] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                }`}
              >
                Markets
              </button>
              <button
                onClick={() => setActiveView('saved')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeView === 'saved'
                    ? 'bg-[#008751] text-white shadow-xs font-semibold'
                    : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#006b3f] dark:hover:text-[#8df8b7] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                }`}
              >
                Saved
              </button>
            </>
          )}

          {currentRole === 'agent' && (
            <>
              <button
                onClick={() => setActiveView('agent-dashboard')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeView === 'agent-dashboard'
                    ? 'bg-[#008751] text-white shadow-xs font-semibold'
                    : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#006b3f] dark:hover:text-[#8df8b7] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                }`}
              >
                Agent Dashboard
              </button>
              <button
                onClick={() => setActiveView('submit-price')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeView === 'submit-price'
                    ? 'bg-[#008751] text-white shadow-xs font-semibold'
                    : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#006b3f] dark:hover:text-[#8df8b7] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                }`}
              >
                Submit Price
              </button>
              <button
                onClick={() => setActiveView('markets')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeView === 'markets'
                    ? 'bg-[#008751] text-white shadow-xs font-semibold'
                    : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#006b3f] dark:hover:text-[#8df8b7] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                }`}
              >
                Markets
              </button>
            </>
          )}

          {currentRole === 'admin' && (
            <>
              <button
                onClick={() => setActiveView('admin-overview')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeView === 'admin-overview'
                    ? 'bg-[#2170e4] text-white shadow-xs font-semibold'
                    : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#2170e4] dark:hover:text-[#adc6ff] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('admin-verification')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeView === 'admin-verification'
                    ? 'bg-[#2170e4] text-white shadow-xs font-semibold'
                    : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#2170e4] dark:hover:text-[#adc6ff] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                }`}
              >
                <span>Verification Queue</span>
                <span className="w-4 h-4 rounded-full bg-[#ba1a1a] text-white text-[10px] flex items-center justify-center">
                  {adminKPIs.pendingVerification}
                </span>
              </button>
              <button
                onClick={() => setActiveView('markets')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeView === 'markets'
                    ? 'bg-[#2170e4] text-white shadow-xs font-semibold'
                    : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#2170e4] dark:hover:text-[#adc6ff] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                }`}
              >
                Markets Hub
              </button>
            </>
          )}
        </nav>

        {/* Right Action Icons: Role Switcher, Theme Toggle, Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Perspective / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setThemeDropdownOpen(false);
                setCityDropdownOpen(false);
              }}
              id="role-switcher-btn"
              title="Switch Perspective"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-[#eff4ff] dark:bg-[#1d2a3c] text-[#0058be] dark:text-[#adc6ff] border border-[#2170e4]/30 hover:bg-[#dee9fc] dark:hover:bg-[#25344a] transition-all"
            >
              {currentRole === 'consumer' ? (
                <Store className="w-3.5 h-3.5 text-[#008751]" />
              ) : currentRole === 'agent' ? (
                <UserCheck className="w-3.5 h-3.5 text-[#2170e4]" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-[#835200]" />
              )}
              <span className="hidden sm:inline capitalize">{currentRole} View</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            <AnimatePresence>
              {roleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setRoleDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#182232] rounded-xl shadow-xl border border-[#bdcabe]/40 dark:border-[#2d3e58] p-1.5 z-50 overflow-hidden"
                  >
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[#6e7a70] dark:text-[#bdcabe] px-3 py-1.5">
                      Switch Role Perspective
                    </div>

                    <button
                      onClick={() => {
                        setCurrentRole('consumer');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-colors ${
                        currentRole === 'consumer'
                          ? 'bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7]'
                          : 'hover:bg-[#eff4ff] dark:hover:bg-[#25344a] text-[#121c2a] dark:text-[#eaf1ff]'
                      }`}
                    >
                      <Store className="w-4 h-4 text-[#008751] mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold">Consumer View</div>
                        <div className="text-[11px] opacity-70">Browse prices, compare markets, search</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentRole('agent');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-colors ${
                        currentRole === 'agent'
                          ? 'bg-[#2170e4]/10 text-[#0058be] dark:text-[#adc6ff]'
                          : 'hover:bg-[#eff4ff] dark:hover:bg-[#25344a] text-[#121c2a] dark:text-[#eaf1ff]'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-[#2170e4] mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold">Field Agent View</div>
                        <div className="text-[11px] opacity-70">Submit prices, earn bounties, daily tasks</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentRole('admin');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-colors ${
                        currentRole === 'admin' || currentRole === 'verifier_admin'
                          ? 'bg-[#a56800]/10 text-[#835200] dark:text-[#ffb95f]'
                          : 'hover:bg-[#eff4ff] dark:hover:bg-[#25344a] text-[#121c2a] dark:text-[#eaf1ff]'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-[#835200] mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold">Operations Admin / Verifier</div>
                        <div className="text-[11px] opacity-70">Verification queue, audit anomalies, KPIs</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentRole('super_admin');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-colors ${
                        currentRole === 'super_admin'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          : 'hover:bg-[#eff4ff] dark:hover:bg-[#25344a] text-[#121c2a] dark:text-[#eaf1ff]'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold">Super Admin</div>
                        <div className="text-[11px] opacity-70">System controls, RLS, audit logs & config</div>
                      </div>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Selector (Light, Dark, System OS) */}
          <div className="relative">
            <button
              onClick={() => {
                setThemeDropdownOpen(!themeDropdownOpen);
                setRoleDropdownOpen(false);
                setCityDropdownOpen(false);
              }}
              id="theme-toggle-btn"
              title="Theme settings"
              className="p-2 text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] rounded-full border border-transparent hover:border-[#bdcabe]/40 transition-colors"
            >
              {themeMode === 'system' ? (
                <Laptop className="w-4 h-4" />
              ) : isDark ? (
                <Moon className="w-4 h-4 text-[#adc6ff]" />
              ) : (
                <Sun className="w-4 h-4 text-[#a56800]" />
              )}
            </button>

            <AnimatePresence>
              {themeDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setThemeDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#182232] rounded-xl shadow-xl border border-[#bdcabe]/40 dark:border-[#2d3e58] p-1.5 z-50 overflow-hidden"
                  >
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[#6e7a70] dark:text-[#bdcabe] px-3 py-1.5">
                      Appearance Theme
                    </div>
                    <button
                      onClick={() => {
                        setThemeMode('light');
                        setThemeDropdownOpen(false);
                        addToast('Switched to Light mode', 'info');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                        themeMode === 'light'
                          ? 'bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7] font-semibold'
                          : 'text-[#121c2a] dark:text-[#eaf1ff] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-[#a56800]" />
                        <span>Light</span>
                      </div>
                      {themeMode === 'light' && <Check className="w-3.5 h-3.5 text-[#008751]" />}
                    </button>

                    <button
                      onClick={() => {
                        setThemeMode('dark');
                        setThemeDropdownOpen(false);
                        addToast('Switched to Dark mode', 'info');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                        themeMode === 'dark'
                          ? 'bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7] font-semibold'
                          : 'text-[#121c2a] dark:text-[#eaf1ff] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-[#adc6ff]" />
                        <span>Dark</span>
                      </div>
                      {themeMode === 'dark' && <Check className="w-3.5 h-3.5 text-[#008751]" />}
                    </button>

                    <button
                      onClick={() => {
                        setThemeMode('system');
                        setThemeDropdownOpen(false);
                        addToast('Following System OS theme automatically', 'info');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                        themeMode === 'system'
                          ? 'bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7] font-semibold'
                          : 'text-[#121c2a] dark:text-[#eaf1ff] hover:bg-[#eff4ff] dark:hover:bg-[#25344a]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-[#3e4a41] dark:text-[#bdcabe]" />
                        <span>System OS</span>
                      </div>
                      {themeMode === 'system' && <Check className="w-3.5 h-3.5 text-[#008751]" />}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Supabase / Cloud DB Connection Badge */}
          <button
            onClick={openBackendModal}
            id="cloud-db-btn"
            title={isSupabaseActive ? 'Supabase Live PostgreSQL Connected' : 'Connect Supabase Cloud Backend'}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              isSupabaseActive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSupabaseActive ? 'Cloud Live' : 'Connect DB'}</span>
          </button>

          {/* User Profile Avatar / Settings */}
          <button
            onClick={() => setActiveView('profile')}
            id="profile-avatar-btn"
            title="Profile & Settings"
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#008751] hover:ring-2 hover:ring-[#008751]/50 transition-all shrink-0 cursor-pointer"
          >
            <img
              src={agentProfile.avatar}
              alt="User Profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-[#182232] border-b border-[#bdcabe]/40 dark:border-[#2d3e58] px-4 py-4 space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#bdcabe]/20 dark:border-[#2d3e58]">
              <span className="text-xs font-semibold text-[#6e7a70] dark:text-[#bdcabe] uppercase tracking-wider">
                Menu & Views
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7]">
                {selectedCity}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveView('home');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeView === 'home'
                    ? 'bg-[#008751] text-white'
                    : 'bg-[#eff4ff] dark:bg-[#1d2a3c] text-[#121c2a] dark:text-[#eaf1ff]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Consumer Home</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('search');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeView === 'search'
                    ? 'bg-[#008751] text-white'
                    : 'bg-[#eff4ff] dark:bg-[#1d2a3c] text-[#121c2a] dark:text-[#eaf1ff]'
                }`}
              >
                <SearchIcon className="w-4 h-4" />
                <span>Search Prices</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('markets');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeView === 'markets'
                    ? 'bg-[#008751] text-white'
                    : 'bg-[#eff4ff] dark:bg-[#1d2a3c] text-[#121c2a] dark:text-[#eaf1ff]'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Discover Markets</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('saved');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeView === 'saved'
                    ? 'bg-[#008751] text-white'
                    : 'bg-[#eff4ff] dark:bg-[#1d2a3c] text-[#121c2a] dark:text-[#eaf1ff]'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved Watchlist</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('agent-dashboard');
                  setCurrentRole('agent');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeView === 'agent-dashboard'
                    ? 'bg-[#008751] text-white'
                    : 'bg-[#eff4ff] dark:bg-[#1d2a3c] text-[#121c2a] dark:text-[#eaf1ff]'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Agent Workspace</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('submit-price');
                  setCurrentRole('agent');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeView === 'submit-price'
                    ? 'bg-[#008751] text-white'
                    : 'bg-[#eff4ff] dark:bg-[#1d2a3c] text-[#121c2a] dark:text-[#eaf1ff]'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Submit Price</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('admin-overview');
                  setCurrentRole('admin');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeView === 'admin-overview'
                    ? 'bg-[#2170e4] text-white'
                    : 'bg-[#eff4ff] dark:bg-[#1d2a3c] text-[#121c2a] dark:text-[#eaf1ff]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Overview</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('admin-verification');
                  setCurrentRole('admin');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeView === 'admin-verification'
                    ? 'bg-[#2170e4] text-white'
                    : 'bg-[#eff4ff] dark:bg-[#1d2a3c] text-[#121c2a] dark:text-[#eaf1ff]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Queue</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
