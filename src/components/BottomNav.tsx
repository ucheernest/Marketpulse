import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Search,
  Store,
  Bookmark,
  User,
  History,
  LayoutDashboard,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentRole, activeView, setActiveView, adminKPIs } = useApp();

  if (currentRole === 'agent') {
    return (
      <nav
        id="agent-bottom-nav"
        className="md:hidden fixed bottom-0 w-full z-40 bg-white/95 dark:bg-[#121c2a]/95 backdrop-blur-md border-t border-[#bdcabe]/40 dark:border-[#2d3e58] shadow-lg flex justify-around items-center px-2 py-2"
      >
        <button
          onClick={() => setActiveView('agent-dashboard')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all ${
            activeView === 'agent-dashboard'
              ? 'bg-[#008751] text-white shadow-xs scale-100'
              : 'text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] scale-95'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-0.5">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveView('submit-price')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all ${
            activeView === 'submit-price'
              ? 'bg-[#008751] text-white shadow-xs scale-100'
              : 'text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] scale-95'
          }`}
        >
          <PlusCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] font-medium mt-0.5">Submit</span>
        </button>

        <button
          onClick={() => setActiveView('markets')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all ${
            activeView === 'markets'
              ? 'bg-[#008751] text-white shadow-xs scale-100'
              : 'text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] scale-95'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-0.5">Markets</span>
        </button>

        <button
          onClick={() => setActiveView('profile')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all ${
            activeView === 'profile'
              ? 'bg-[#008751] text-white shadow-xs scale-100'
              : 'text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] scale-95'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-0.5">Profile</span>
        </button>
      </nav>
    );
  }

  if (currentRole === 'admin') {
    return (
      <nav
        id="admin-bottom-nav"
        className="md:hidden fixed bottom-0 w-full z-40 bg-white/95 dark:bg-[#121c2a]/95 backdrop-blur-md border-t border-[#bdcabe]/40 dark:border-[#2d3e58] shadow-lg flex justify-around items-center px-2 py-2"
      >
        <button
          onClick={() => setActiveView('admin-overview')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all ${
            activeView === 'admin-overview'
              ? 'bg-[#2170e4] text-white shadow-xs scale-100'
              : 'text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] scale-95'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-0.5">Overview</span>
        </button>

        <button
          onClick={() => setActiveView('admin-verification')}
          className={`relative flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all ${
            activeView === 'admin-verification'
              ? 'bg-[#2170e4] text-white shadow-xs scale-100'
              : 'text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] scale-95'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-0.5">Queue</span>
          {adminKPIs.pendingVerification > 0 && (
            <span className="absolute top-0 right-3 w-4 h-4 bg-[#ba1a1a] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {adminKPIs.pendingVerification}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('markets')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all ${
            activeView === 'markets'
              ? 'bg-[#2170e4] text-white shadow-xs scale-100'
              : 'text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] scale-95'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-0.5">Markets</span>
        </button>

        <button
          onClick={() => setActiveView('profile')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all ${
            activeView === 'profile'
              ? 'bg-[#2170e4] text-white shadow-xs scale-100'
              : 'text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] scale-95'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-0.5">Profile</span>
        </button>
      </nav>
    );
  }

  // Consumer bottom nav (as in image 1 & 3)
  return (
    <nav
      id="consumer-bottom-nav"
      className="md:hidden fixed bottom-0 w-full z-40 bg-white/95 dark:bg-[#121c2a]/95 backdrop-blur-md border-t border-[#bdcabe]/40 dark:border-[#2d3e58] shadow-lg flex justify-around items-center px-2 py-2"
    >
      <button
        onClick={() => setActiveView('home')}
        className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all ${
          activeView === 'home'
            ? 'bg-[#008751] text-white shadow-xs scale-100'
            : 'text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] scale-95'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[11px] font-medium mt-0.5">Home</span>
      </button>

      <button
        onClick={() => setActiveView('search')}
        className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all ${
          activeView === 'search'
            ? 'bg-[#008751] text-white shadow-xs scale-100'
            : 'text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] scale-95'
        }`}
      >
        <Search className="w-5 h-5" />
        <span className="text-[11px] font-medium mt-0.5">Search</span>
      </button>

      <button
        onClick={() => setActiveView('markets')}
        className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all ${
          activeView === 'markets'
            ? 'bg-[#008751] text-white shadow-xs scale-100'
            : 'text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] scale-95'
        }`}
      >
        <Store className="w-5 h-5" />
        <span className="text-[11px] font-medium mt-0.5">Markets</span>
      </button>

      <button
        onClick={() => setActiveView('saved')}
        className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all ${
          activeView === 'saved'
            ? 'bg-[#008751] text-white shadow-xs scale-100'
            : 'text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] scale-95'
        }`}
      >
        <Bookmark className="w-5 h-5" />
        <span className="text-[11px] font-medium mt-0.5">Saved</span>
      </button>

      <button
        onClick={() => setActiveView('profile')}
        className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all ${
          activeView === 'profile'
            ? 'bg-[#008751] text-white shadow-xs scale-100'
            : 'text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#1d2a3c] scale-95'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[11px] font-medium mt-0.5">Profile</span>
      </button>
    </nav>
  );
};
