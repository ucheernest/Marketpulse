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
import { UserManagementView } from './components/UserManagementView';
import { AdminCatalogView } from './components/AdminCatalogView';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { MarketDetailModal } from './components/MarketDetailModal';
import { ReportInaccurateModal } from './components/ReportInaccurateModal';
import { ExportReportsModal } from './components/ExportReportsModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { LegalConsentModal } from './components/LegalConsentModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SiteFooter } from './components/SiteFooter';
import { motion, AnimatePresence } from 'motion/react';

const MainLayout: React.FC = () => {
  const {
    activeView,
    isExportModalOpen,
    closeExportModal,
    exportModalDefaultCategory,
    isAuthModalOpen,
    closeAuthModal,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#121c2a] text-[#121c2a] dark:text-[#f8f9ff] flex flex-col font-sans transition-colors duration-200 selection:bg-[#008751]/20 selection:text-[#006b3f]">
      <Navbar />
      <ConnectivityStatusBanner />
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
            {activeView === 'home' && <ConsumerHome />}
            {activeView === 'search' && <SearchResults />}
            {activeView === 'markets' && <DiscoverMarketsView />}
            {activeView === 'saved' && <SavedWatchlistView />}
            {activeView === 'agent-dashboard' && <AgentDashboardView />}
            {activeView === 'submit-price' && <SubmitPriceView />}
            {activeView === 'admin-overview' && <AdminOverviewView />}
            {activeView === 'admin-verification' && <AdminVerificationView />}
            {activeView === 'admin-users' && <UserManagementView />}
            {activeView === 'admin-catalog' && <AdminCatalogView />}
            {activeView === 'profile' && <ProfileSettingsModal />}
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter />
      <BottomNav />
      <ProductDetailModal />
      <MarketDetailModal />
      <ReportInaccurateModal />
      <ExportReportsModal isOpen={isExportModalOpen} onClose={closeExportModal} defaultCategory={exportModalDefaultCategory} />
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      <ToastContainer />
      <LegalConsentModal />
    </div>
  );
};

export function App() {
  return <ErrorBoundary><AppProvider><MainLayout /></AppProvider></ErrorBoundary>;
}

export default App;
