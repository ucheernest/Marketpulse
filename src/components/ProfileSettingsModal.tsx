import React from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  ShieldCheck,
  Store,
  Sun,
  Moon,
  Laptop,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  Check,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

export const ProfileSettingsModal: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    themeMode,
    setThemeMode,
    isDark,
    selectedCity,
    setSelectedCity,
    agentProfile,
    isSupabaseActive,
    setActiveView,
    addToast,
    openBackendModal,
    openAuthModal,
  } = useApp();

  return (
    <div id="profile-settings-screen" className="max-w-2xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveView('home')}
          className="p-2 text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#25344a] rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#121c2a] dark:text-[#f8f9ff]">
            Account & Preferences
          </h1>
          <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
            Manage application themes, role views, and data persistence
          </p>
        </div>
      </div>

      {/* User Card */}
      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#008751] shrink-0">
          <img
            src={agentProfile.avatar}
            alt={agentProfile.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              {agentProfile.name}
            </h2>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7]">
              {currentRole}
            </span>
          </div>
          <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe] mt-0.5">
            daniel.peters@marketpulse.ng • Level 3 Verifier
          </p>
          <div className="flex items-center gap-1 text-[11px] text-[#006b3f] dark:text-[#8df8b7] font-semibold mt-1">
            <MapPin className="w-3 h-3" />
            <span>Active City: {selectedCity}</span>
          </div>
        </div>
      </div>

      {/* Theme Settings Section (Light / Dark / System OS) */}
      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
            Appearance & Dark Mode
          </h3>
          <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe] mt-0.5">
            Switch between Light, Dark, or automatically match your system OS theme.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setThemeMode('light')}
            className={`p-3.5 rounded-xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
              themeMode === 'light'
                ? 'bg-[#008751]/10 border-[#008751] text-[#006b3f] dark:text-[#8df8b7] ring-2 ring-[#008751]/20'
                : 'bg-[#f8f9ff] dark:bg-[#121c2a] border-[#bdcabe]/40 dark:border-[#2d3e58] text-[#121c2a] dark:text-[#f8f9ff]'
            }`}
          >
            <Sun className="w-5 h-5 text-[#a56800]" />
            <span className="text-xs font-bold">Light</span>
          </button>

          <button
            onClick={() => setThemeMode('dark')}
            className={`p-3.5 rounded-xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
              themeMode === 'dark'
                ? 'bg-[#008751]/10 border-[#008751] text-[#006b3f] dark:text-[#8df8b7] ring-2 ring-[#008751]/20'
                : 'bg-[#f8f9ff] dark:bg-[#121c2a] border-[#bdcabe]/40 dark:border-[#2d3e58] text-[#121c2a] dark:text-[#f8f9ff]'
            }`}
          >
            <Moon className="w-5 h-5 text-[#adc6ff]" />
            <span className="text-xs font-bold">Dark</span>
          </button>

          <button
            onClick={() => setThemeMode('system')}
            className={`p-3.5 rounded-xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
              themeMode === 'system'
                ? 'bg-[#008751]/10 border-[#008751] text-[#006b3f] dark:text-[#8df8b7] ring-2 ring-[#008751]/20'
                : 'bg-[#f8f9ff] dark:bg-[#121c2a] border-[#bdcabe]/40 dark:border-[#2d3e58] text-[#121c2a] dark:text-[#f8f9ff]'
            }`}
          >
            <Laptop className="w-5 h-5 text-[#3e4a41] dark:text-[#bdcabe]" />
            <span className="text-xs font-bold">System OS</span>
          </button>
        </div>
      </div>

      {/* Role Perspective Switcher */}
      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
            Perspective / Role Testing
          </h3>
          <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe] mt-0.5">
            Test the application across different stakeholder workflows.
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => setCurrentRole('consumer')}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-colors text-left ${
              currentRole === 'consumer'
                ? 'bg-[#008751]/10 border-[#008751]'
                : 'bg-[#f8f9ff] dark:bg-[#121c2a] border-[#bdcabe]/40 dark:border-[#2d3e58]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-[#008751]" />
              <div>
                <div className="text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                  Consumer (Shopper / Household)
                </div>
                <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe]">
                  Search prices, compare markets, save items
                </div>
              </div>
            </div>
            {currentRole === 'consumer' && <Check className="w-4 h-4 text-[#008751]" />}
          </button>

          <button
            onClick={() => setCurrentRole('agent')}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-colors text-left ${
              currentRole === 'agent'
                ? 'bg-[#2170e4]/10 border-[#2170e4]'
                : 'bg-[#f8f9ff] dark:bg-[#121c2a] border-[#bdcabe]/40 dark:border-[#2d3e58]'
            }`}
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[#2170e4]" />
              <div>
                <div className="text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                  Field Verification Agent
                </div>
                <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe]">
                  Submit price reports, earn bounties, daily checklist
                </div>
              </div>
            </div>
            {currentRole === 'agent' && <Check className="w-4 h-4 text-[#2170e4]" />}
          </button>

          <button
            onClick={() => setCurrentRole('admin')}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-colors text-left ${
              currentRole === 'admin'
                ? 'bg-[#a56800]/10 border-[#a56800]'
                : 'bg-[#f8f9ff] dark:bg-[#121c2a] border-[#bdcabe]/40 dark:border-[#2d3e58]'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#a56800]" />
              <div>
                <div className="text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                  Operations Verifier / Admin
                </div>
                <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe]">
                  Verification queue, telemetry KPIs, audit anomalies
                </div>
              </div>
            </div>
            {currentRole === 'admin' && <Check className="w-4 h-4 text-[#a56800]" />}
          </button>

          <button
            onClick={() => setCurrentRole('super_admin')}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-colors text-left ${
              currentRole === 'super_admin'
                ? 'bg-purple-500/10 border-purple-500'
                : 'bg-[#f8f9ff] dark:bg-[#121c2a] border-[#bdcabe]/40 dark:border-[#2d3e58]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <div className="text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                  Super Admin
                </div>
                <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe]">
                  Full platform access, RLS policies, audit logs & system config
                </div>
              </div>
            </div>
            {currentRole === 'super_admin' && <Check className="w-4 h-4 text-purple-600" />}
          </button>
        </div>
      </div>

      {/* Supabase & Synchronization Status Card */}
      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#008751]" />
            <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              Database & Real-Time Sync
            </h3>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
              isSupabaseActive
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            {isSupabaseActive ? 'Supabase Live Connected' : 'Local Persistence & Broadcast Sync'}
          </span>
        </div>

        <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe] leading-relaxed">
          The app is configured for full multi-tab real-time synchronization with automatic local
          fallback. Supabase credentials can be connected at any time in{' '}
          <code className="text-[11px] bg-[#f8f9ff] dark:bg-[#121c2a] px-1.5 py-0.5 rounded border border-[#bdcabe]/40">
            .env
          </code>{' '}
          for cloud-hosted PostgreSQL storage.
        </p>

        <div className="pt-2 flex flex-wrap gap-2.5">
          <button
            onClick={openBackendModal}
            className="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>Connect Live Supabase Database</span>
          </button>
          <button
            onClick={openAuthModal}
            className="py-2.5 px-4 rounded-xl bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] hover:bg-[#eff4ff] dark:hover:bg-[#25344a] text-[#121c2a] dark:text-[#f8f9ff] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4 text-[#008751]" />
            <span>Sign In / Verifier Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
