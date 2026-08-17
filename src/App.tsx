import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ConnectivityStatusBanner } from './components/ConnectivityStatusBanner';
import { BottomNav } from './components/BottomNav';
import { ConsumerHome } from './components/ConsumerHome';
import { SearchResults } from './components/SearchResults';
import { DiscoverMarketsView } from './components/DiscoverMarketsView';
import { SavedWatchlistView } from './components/SavedWatchlistView';
import { AgentDashboardView } from './components/AgentDashboardView';
import { SubmitPriceView } from './components/SubmitPriceView';
import { AdminOverviewView } from './components/AdminOverviewView';
import { AdminVerificationView } from './components/AdminVerificationView';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { MarketDetailModal } from './components/MarketDetailModal';
import { ReportInaccurateModal } from './components/ReportInaccurateModal';
import { ExportReportsModal } from './components/ExportReportsModal';
import { BackendSetupModal } from './components/BackendSetupModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { motion, AnimatePresence } from 'motion/react';

const MainLayout: React.FC = () => {
  const {
    activeView,
    isExportModalOpen,
    closeExportModal,
    exportModalDefaultCategory,
    isBackendModalOpen,
    closeBackendModal,
    isAuthModalOpen,
    closeAuthModal,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#121c2a] text-[#121c2a] dark:text-[#f8f9ff] flex flex-col font-sans transition-colors duration-200 selection:bg-[#008751]/20 selection:text-[#006b3f]">
      {/* Top Navbar */}
      <Navbar />

      {/* Connectivity & Offline Market Cache Status */}
      <ConnectivityStatusBanner />

      {/* Main Responsive View Container */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeView === 'home' && <ConsumerHome />}
            {activeView === 'search' && <SearchResults />}
            {activeView === 'markets' && <DiscoverMarketsView />}
            {activeView === 'saved' && <SavedWatchlistView />}
            {activeView === 'agent-dashboard' && <AgentDashboardView />}
            {activeView === 'submit-price' && <SubmitPriceView />}
            {activeView === 'admin-overview' && <AdminOverviewView />}
            {activeView === 'admin-verification' && <AdminVerificationView />}
            {activeView === 'profile' && <ProfileSettingsModal />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNav />

      {/* Modals & Overlays */}
      <ProductDetailModal />
      <MarketDetailModal />
      <ReportInaccurateModal />
      <ExportReportsModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
        defaultCategory={exportModalDefaultCategory}
      />
      <BackendSetupModal
        isOpen={isBackendModalOpen}
        onClose={closeBackendModal}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
