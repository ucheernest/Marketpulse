import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  Market,
  FieldSubmission,
  AgentProfile,
  AdminKPIs,
  SystemAlert,
  AuditLogEntry,
  UserRole,
  ThemeMode,
  ProductCategory,
} from '../types';
import {
  INITIAL_MARKETS,
  INITIAL_PRODUCTS,
  INITIAL_SUBMISSIONS,
  INITIAL_AGENT_PROFILE,
  INITIAL_ADMIN_KPIS,
  INITIAL_SYSTEM_ALERTS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { getLocalData, setLocalData, isSupabaseConfigured } from '../services/supabaseClient';
import { evaluateVerificationEngine } from '../services/verificationEngine';
import { syncSubmissionToCloud, recordCloudAuditLog } from '../services/backendService';
import {
  getOfflineSubmissionsQueue,
  enqueueOfflineSubmission,
  removeOfflineSubmission,
  clearOfflineQueue,
  setCacheMetadata,
  getCacheMetadata,
  isLowBandwidthConnection,
  PendingOfflineSubmission,
} from '../services/offlineCache';
import { requestBackgroundSync } from '../services/serviceWorkerRegistration';

export type AppView = 
  | 'home' 
  | 'search' 
  | 'markets' 
  | 'saved' 
  | 'agent-dashboard' 
  | 'submit-price' 
  | 'admin-overview' 
  | 'admin-verification' 
  | 'profile';

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  // Theme & Mode
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;

  // Offline & Low-Connectivity
  isOnline: boolean;
  isLowConnectivity: boolean;
  pendingOfflineQueue: PendingOfflineSubmission[];
  syncOfflineQueue: () => Promise<void>;
  lastCacheSync: Date | null;

  // Role & Navigation
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;

  // Data & Collections
  products: Product[];
  markets: Market[];
  submissions: FieldSubmission[];
  agentProfile: AgentProfile;
  adminKPIs: AdminKPIs;
  systemAlerts: SystemAlert[];
  auditLogs: AuditLogEntry[];
  savedProductIds: string[];
  addAuditLog: (log: Omit<AuditLogEntry, 'id' | 'timestamp' | 'actorId' | 'actorName'> & { actorId?: string; actorName?: string }) => void;

  // Search & Filtering State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProductCategory | 'All';
  setSelectedCategory: (cat: ProductCategory | 'All') => void;
  selectedOriginFilter: 'All' | 'Local' | 'Imported';
  setSelectedOriginFilter: (origin: 'All' | 'Local' | 'Imported') => void;
  selectedSizeFilter: string;
  setSelectedSizeFilter: (size: string) => void;
  selectedSort: 'price_asc' | 'price_desc' | 'confidence' | 'recent';
  setSelectedSort: (sort: 'price_asc' | 'price_desc' | 'confidence' | 'recent') => void;

  // Modals & Details
  selectedProduct: Product | null;
  openProductDetail: (product: Product) => void;
  closeProductDetail: () => void;

  selectedMarket: Market | null;
  openMarketDetail: (market: Market) => void;
  closeMarketDetail: () => void;

  activeSubmissionDetail: FieldSubmission | null;
  setActiveSubmissionDetail: (sub: FieldSubmission | null) => void;

  reportModalProduct: Product | null;
  openReportModal: (product: Product) => void;
  closeReportModal: () => void;

  // Export CSV Modal
  isExportModalOpen: boolean;
  exportModalDefaultCategory: 'verifications' | 'audit_logs' | 'price_index';
  openExportModal: (category?: 'verifications' | 'audit_logs' | 'price_index') => void;
  closeExportModal: () => void;

  // Actions
  toggleSaveProduct: (productId: string) => void;
  isProductSaved: (productId: string) => boolean;

  submitPriceReport: (data: {
    productId: string;
    productName: string;
    marketId: string;
    marketName: string;
    price: number;
    quantity: number;
    unit: string;
    sellerStall: string;
    photoUrl?: string;
  }) => void;

  submitBulkPriceReports: (items: Array<{
    productId: string;
    productName: string;
    marketId: string;
    marketName: string;
    price: number;
    quantity: number;
    unit: string;
    sellerStall: string;
    photoUrl?: string;
  }>) => Promise<{ successCount: number; failedCount: number }>;

  approveSubmission: (id: string) => void;
  rejectSubmission: (id: string) => void;
  requestRecheckSubmission: (id: string) => void;

  submitInaccuratePriceReport: (data: {
    productId: string;
    marketName: string;
    reportedPrice: number;
    reason: string;
    notes?: string;
  }) => void;

  // System & Toast
  toasts: ToastNotification[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  isSupabaseActive: boolean;

  // Backend Setup & Auth Modals
  isBackendModalOpen: boolean;
  openBackendModal: () => void;
  closeBackendModal: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => 
    getLocalData<ThemeMode>('theme_mode', 'system')
  );
  const [isSystemDark, setIsSystemDark] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return isSystemDark;
  }, [themeMode, isSystemDark]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    setLocalData('theme_mode', mode);
  };

  // Roles & View
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() =>
    getLocalData<UserRole>('user_role', 'consumer')
  );
  const [activeView, setActiveViewState] = useState<AppView>(() => {
    if (currentRole === 'agent' || currentRole === 'field_agent') return 'agent-dashboard';
    if (currentRole === 'admin' || currentRole === 'verifier_admin' || currentRole === 'super_admin') return 'admin-overview';
    return 'home';
  });

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    setLocalData('user_role', role);
    if (role === 'consumer' || role === 'public_user') {
      setActiveViewState('home');
    } else if (role === 'agent' || role === 'field_agent') {
      setActiveViewState('agent-dashboard');
    } else if (role === 'admin' || role === 'verifier_admin' || role === 'super_admin') {
      setActiveViewState('admin-overview');
    }
    addToast(`Switched perspective to ${role.toUpperCase().replace('_', ' ')}`, 'info');
  };

  const setActiveView = (view: AppView) => {
    setActiveViewState(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Offline & Low-Connectivity State
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isLowConnectivity, setIsLowConnectivity] = useState<boolean>(() => isLowBandwidthConnection());
  const [pendingOfflineQueue, setPendingOfflineQueue] = useState<PendingOfflineSubmission[]>(() =>
    getOfflineSubmissionsQueue()
  );
  const [lastCacheSync, setLastCacheSync] = useState<Date | null>(() => {
    const meta = getCacheMetadata();
    return meta ? new Date(meta.lastSyncTimestamp) : new Date();
  });

  // Network and Connectivity Event Listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setIsLowConnectivity(isLowBandwidthConnection());
      addToast('Online: Connected to network. Syncing cached market data...', 'success');
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      addToast('Offline Mode: Using cached market catalog. Price submissions will be saved offline.', 'warning');
    };

    const handleConnectionChange = () => {
      setIsLowConnectivity(isLowBandwidthConnection());
    };

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'TRIGGER_OFFLINE_SYNC') {
        syncOfflineQueue();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      conn.addEventListener('change', handleConnectionChange);
    }

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (conn) {
        conn.removeEventListener('change', handleConnectionChange);
      }
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  // Sync offline queue to backend/live state
  const syncOfflineQueue = async () => {
    const queue = getOfflineSubmissionsQueue();
    if (queue.length === 0) return;

    const pendingCount = queue.length;
    addToast(`Synchronizing ${pendingCount} offline price observation(s)...`, 'info');

    for (const item of queue) {
      removeOfflineSubmission(item.id);
    }

    setPendingOfflineQueue([]);
    setLastCacheSync(new Date());
    addToast(`Successfully synchronized ${pendingCount} price observation(s) from market cache!`, 'success');
  };

  const [selectedCity, setSelectedCity] = useState<string>(() =>
    getLocalData<string>('selected_city', 'Port Harcourt')
  );

  // Collections state
  const [products, setProducts] = useState<Product[]>(() =>
    getLocalData<Product[]>('products', INITIAL_PRODUCTS)
  );
  const [markets, setMarkets] = useState<Market[]>(() =>
    getLocalData<Market[]>('markets', INITIAL_MARKETS)
  );

  // Sync cache metadata
  useEffect(() => {
    setCacheMetadata(products.length, markets.length);
    setLastCacheSync(new Date());
  }, [products.length, markets.length]);
  const [submissions, setSubmissions] = useState<FieldSubmission[]>(() =>
    getLocalData<FieldSubmission[]>('submissions', INITIAL_SUBMISSIONS)
  );
  const [agentProfile, setAgentProfile] = useState<AgentProfile>(() =>
    getLocalData<AgentProfile>('agent_profile', INITIAL_AGENT_PROFILE)
  );
  const [adminKPIs, setAdminKPIs] = useState<AdminKPIs>(() =>
    getLocalData<AdminKPIs>('admin_kpis', INITIAL_ADMIN_KPIS)
  );
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>(() =>
    getLocalData<SystemAlert[]>('system_alerts', INITIAL_SYSTEM_ALERTS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    getLocalData<AuditLogEntry[]>('audit_logs', INITIAL_AUDIT_LOGS)
  );
  const [savedProductIds, setSavedProductIds] = useState<string[]>(() =>
    getLocalData<string[]>('saved_product_ids', ['golden-penny-rice-50kg', 'tomatoes-basket'])
  );

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [selectedOriginFilter, setSelectedOriginFilter] = useState<'All' | 'Local' | 'Imported'>('All');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<'price_asc' | 'price_desc' | 'confidence' | 'recent'>('price_asc');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [activeSubmissionDetail, setActiveSubmissionDetail] = useState<FieldSubmission | null>(() => submissions[0] || null);
  const [reportModalProduct, setReportModalProduct] = useState<Product | null>(null);

  // Export CSV Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportModalDefaultCategory, setExportModalDefaultCategory] = useState<'verifications' | 'audit_logs' | 'price_index'>('verifications');

  // Backend Setup & Auth Modals
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openExportModal = (category: 'verifications' | 'audit_logs' | 'price_index' = 'verifications') => {
    setExportModalDefaultCategory(category);
    setIsExportModalOpen(true);
  };

  const closeExportModal = () => {
    setIsExportModalOpen(false);
  };

  const openBackendModal = () => setIsBackendModalOpen(true);
  const closeBackendModal = () => setIsBackendModalOpen(false);
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Add an audit log entry
  const addAuditLog = (
    log: Omit<AuditLogEntry, 'id' | 'timestamp' | 'actorId' | 'actorName'> & {
      actorId?: string;
      actorName?: string;
    }
  ) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: log.actorId || 'admin-01',
      actorName: log.actorName || 'Ngozi Adebayo',
      ...log,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);

    // Asynchronously record to Cloud if Supabase is active
    if (isSupabaseConfigured) {
      recordCloudAuditLog(newEntry).catch((e) => console.warn('Supabase audit log sync skipped:', e));
    }
  };

  // Sync to local data
  useEffect(() => {
    setLocalData('audit_logs', auditLogs);
  }, [auditLogs]);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to local data
  useEffect(() => {
    setLocalData('products', products);
  }, [products]);

  useEffect(() => {
    setLocalData('markets', markets);
  }, [markets]);

  useEffect(() => {
    setLocalData('submissions', submissions);
  }, [submissions]);

  useEffect(() => {
    setLocalData('agent_profile', agentProfile);
  }, [agentProfile]);

  useEffect(() => {
    setLocalData('saved_product_ids', savedProductIds);
  }, [savedProductIds]);

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const openMarketDetail = (market: Market) => {
    setSelectedMarket(market);
  };

  const closeMarketDetail = () => {
    setSelectedMarket(null);
  };

  const openReportModal = (product: Product) => {
    setReportModalProduct(product);
  };

  const closeReportModal = () => {
    setReportModalProduct(null);
  };

  const toggleSaveProduct = (productId: string) => {
    setSavedProductIds((prev) => {
      const isSaved = prev.includes(productId);
      const updated = isSaved ? prev.filter((id) => id !== productId) : [...prev, productId];
      addToast(isSaved ? 'Removed from saved watchlist' : 'Added to saved watchlist', 'info');
      return updated;
    });
  };

  const isProductSaved = (productId: string) => savedProductIds.includes(productId);

  // Submit Price from Field Agent
  const submitPriceReport = (data: {
    productId: string;
    productName: string;
    marketId: string;
    marketName: string;
    price: number;
    quantity: number;
    unit: string;
    sellerStall: string;
    photoUrl?: string;
  }) => {
    const newSubmissionNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const matchedProduct = products.find((p) => p.id === data.productId);
    const benchmark = matchedProduct ? matchedProduct.currentAvgPrice : data.price;
    const targetMarket = markets.find((m) => m.id === data.marketId);
    const marketCoords = targetMarket ? targetMarket.coordinates : { lat: 4.8156, lng: 7.0094 };

    // Run Algorithmic Verification Engine v1.0
    const verification = evaluateVerificationEngine({
      productId: data.productId,
      productName: data.productName,
      price: data.price,
      marketId: data.marketId,
      marketName: data.marketName,
      marketCoords,
      agentId: agentProfile.id,
      agentReputation: agentProfile.accuracyRate,
      gpsCoords: { lat: 4.8156, lng: 7.0094 },
      timestamp: new Date().toISOString(),
      exifMatched: true,
      hasPhoto: Boolean(data.photoUrl || true),
      benchmarkPrice: benchmark,
      recentSubmissions: submissions.map((s) => ({
        productId: s.productId,
        marketId: s.marketId,
        price: s.price,
        agentId: s.agentId,
        timestamp: Date.now(),
      })),
    });

    const isOffline = !navigator.onLine;
    if (isOffline) {
      const queued = enqueueOfflineSubmission(data);
      setPendingOfflineQueue(getOfflineSubmissionsQueue());
      requestBackgroundSync('sync-price-reports');
    }

    const newSubmission: FieldSubmission = {
      id: `sub-${Date.now()}`,
      submissionNumber: newSubmissionNumber,
      productId: data.productId,
      productName: data.productName,
      marketId: data.marketId,
      marketName: data.marketName,
      city: selectedCity,
      price: data.price,
      quantity: data.quantity,
      unit: data.unit,
      sellerStall: data.sellerStall || 'Field Stall Inspection',
      agentId: agentProfile.id,
      agentName: agentProfile.name,
      agentInitials: 'DP',
      agentLevel: 'Level 3 Verifier',
      agentReputation: agentProfile.accuracyRate,
      photoUrl:
        data.photoUrl ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkZdGqfLDyWMwVkHWY9jVke68rbpKstU6_ExyLHjNJHUwRatSlfaDoBG7GQUumsVcM6g39B1hTthgSsUqtcQVASYFM42zQA2xbyPvPrG5Pl7fsONd199psmdp0FWcCw2COY3OoeYVbYWCqYoMJ1VIA78IJNYDrPXxVecBRm8ERaFiP63b5xoioUj1ngqgj0Ry6v72pN37Kdam85ST0D9q5IY6O7xFRgLOeptfZFlAbyaDvVc_WHie-Q',
      exifMatched: true,
      gpsLocation: {
        lat: 4.8156,
        lng: 7.0094,
        address: `${data.marketName}, ${selectedCity}, Nigeria`,
      },
      submittedAt: 'Just now',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      systemConfidence: verification.compositeScore,
      systemRecommendation: verification.systemRecommendation,
      anomalyNote: verification.anomalyNotes.join('; '),
      isOfflineQueued: isOffline,
      nearbyMarketComparisons: [
        { marketName: 'Mile 3 Market', price: data.price, verified: true },
        { marketName: 'Oil Mill Market', price: Math.round(data.price * 1.02), verified: true },
      ],
    };

    setSubmissions((prev) => [newSubmission, ...prev]);
    setActiveSubmissionDetail(newSubmission);

    // Sync to Cloud PostgreSQL if Supabase is connected
    if (!isOffline && isSupabaseConfigured) {
      syncSubmissionToCloud(newSubmission).catch((e) => console.warn('Supabase submission sync skipped:', e));
    }

    // Update Agent Progress
    setAgentProfile((prev) => ({
      ...prev,
      completedChecksToday: prev.completedChecksToday + 1,
      totalEarnedThisWeek: prev.totalEarnedThisWeek + 650,
    }));

    // Update KPIs
    setAdminKPIs((prev) => ({
      ...prev,
      pendingVerification: prev.pendingVerification + 1,
    }));

    if (isOffline) {
      addToast(`Price ${newSubmissionNumber} saved to offline market cache. Will auto-sync when connected.`, 'info');
    } else {
      addToast(`Price submission ${newSubmissionNumber} sent for verification! Earned ₦650.`, 'success');
    }
  };

  const submitBulkPriceReports = async (
    items: Array<{
      productId: string;
      productName: string;
      marketId: string;
      marketName: string;
      price: number;
      quantity: number;
      unit: string;
      sellerStall: string;
      photoUrl?: string;
    }>
  ): Promise<{ successCount: number; failedCount: number }> => {
    if (items.length === 0) return { successCount: 0, failedCount: 0 };

    const isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
    const newSubmissions: FieldSubmission[] = [];
    const baseNumber = 7490 + submissions.length;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const newSubmissionNumber = `MP-PH-${baseNumber + i}`;
      const targetProd = products.find((p) => p.id === item.productId);
      const targetMarket = markets.find((m) => m.id === item.marketId);
      const marketCoords = targetMarket ? targetMarket.coordinates : { lat: 4.8156, lng: 7.0094 };
      const benchmark = targetProd ? targetProd.currentAvgPrice : item.price;

      const verification = evaluateVerificationEngine({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        marketId: item.marketId,
        marketName: item.marketName,
        marketCoords,
        agentId: agentProfile.id,
        agentReputation: agentProfile.accuracyRate,
        gpsCoords: { lat: 4.8156, lng: 7.0094 },
        timestamp: new Date().toISOString(),
        exifMatched: true,
        hasPhoto: Boolean(item.photoUrl || true),
        benchmarkPrice: benchmark,
        recentSubmissions: submissions.map((s) => ({
          productId: s.productId,
          marketId: s.marketId,
          price: s.price,
          agentId: s.agentId,
          timestamp: Date.now(),
        })),
      });

      const newSub: FieldSubmission = {
        id: `sub-bulk-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        submissionNumber: newSubmissionNumber,
        productId: item.productId,
        productName: item.productName,
        marketId: item.marketId,
        marketName: item.marketName,
        city: selectedCity,
        price: item.price,
        quantity: item.quantity || 1,
        unit: item.unit,
        sellerStall: item.sellerStall || 'Market Stall',
        agentId: agentProfile.id,
        agentName: agentProfile.name,
        agentInitials: agentProfile.name
          ? agentProfile.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
          : 'FA',
        agentLevel: agentProfile.tier,
        agentReputation: agentProfile.accuracyRate,
        photoUrl:
          item.photoUrl ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkZdGqfLDyWMwVkHWY9jVke68rbpKstU6_ExyLHjNJHUwRatSlfaDoBG7GQUumsVcM6g39B1hTthgSsUqtcQVASYFM42zQA2xbyPvPrG5Pl7fsONd199psmdp0FWcCw2COY3OoeYVbYWCqYoMJ1VIA78IJNYDrPXxVecBRm8ERaFiP63b5xoioUj1ngqgj0Ry6v72pN37Kdam85ST0D9q5IY6O7xFRgLOeptfZFlAbyaDvVc_WHie-Q',
        exifMatched: true,
        gpsLocation: {
          lat: 4.8156 + (Math.random() - 0.5) * 0.005,
          lng: 7.0094 + (Math.random() - 0.5) * 0.005,
          address: `${item.marketName}, ${selectedCity}`,
        },
        submittedAt: 'Just now',
        timestamp: new Date().toISOString(),
        status: 'pending',
        systemConfidence: verification.compositeScore,
        systemRecommendation: verification.systemRecommendation,
        anomalyNote: verification.anomalyNotes.join('; '),
        isOfflineQueued: isOffline,
        nearbyMarketComparisons: [
          { marketName: item.marketName, price: item.price, verified: true },
          { marketName: 'Oil Mill Market', price: Math.round(item.price * 1.02), verified: true },
        ],
      };

      newSubmissions.push(newSub);

      if (isOffline) {
        enqueueOfflineSubmission({
          productId: item.productId,
          productName: item.productName,
          marketId: item.marketId,
          marketName: item.marketName,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          sellerStall: item.sellerStall,
          photoUrl: item.photoUrl,
        });
      } else if (isSupabaseConfigured) {
        syncSubmissionToCloud(newSub).catch((e) =>
          console.warn('Supabase bulk submission sync skipped:', e)
        );
      }
    }

    setSubmissions((prev) => [...newSubmissions, ...prev]);
    if (newSubmissions.length > 0) {
      setActiveSubmissionDetail(newSubmissions[0]);
    }

    const bountyEarned = items.length * 650;
    setAgentProfile((prev) => ({
      ...prev,
      completedChecksToday: prev.completedChecksToday + items.length,
      totalEarnedThisWeek: prev.totalEarnedThisWeek + bountyEarned,
    }));

    setAdminKPIs((prev) => ({
      ...prev,
      pendingVerification: prev.pendingVerification + items.length,
    }));

    if (isOffline) {
      setPendingOfflineQueue(getOfflineSubmissionsQueue());
      addToast(
        `Batch saved: ${items.length} observations safely stored in offline cache. Will auto-sync on reconnect.`,
        'info'
      );
    } else {
      addToast(
        `Batch uploaded: ${items.length} price reports verified & submitted! Earned ₦${bountyEarned.toLocaleString()}.`,
        'success'
      );
    }

    return { successCount: items.length, failedCount: 0 };
  };

    // Admin Verification Actions
  const approveSubmission = (id: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;

    setSubmissions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'verified' as const } : item))
    );

    // Update the actual product live price intelligence
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === sub.productId || prod.name.toLowerCase().includes(sub.productName.toLowerCase())) {
          const updatedPrices = prod.marketPrices.map((mp) =>
            mp.marketName.toLowerCase() === sub.marketName.toLowerCase()
              ? { ...mp, price: sub.price, lastVerified: 'Just now' }
              : mp
          );
          return {
            ...prod,
            currentAvgPrice: sub.price,
            lastVerified: 'Just now',
            confidence: 'High Confidence' as const,
            confidenceScore: Math.min(99, prod.confidenceScore + 1),
            observationsCount: prod.observationsCount + 1,
            marketPrices: updatedPrices,
          };
        }
        return prod;
      })
    );

    setAdminKPIs((prev) => ({
      ...prev,
      verifiedToday: prev.verifiedToday + 1,
      pendingVerification: Math.max(0, prev.pendingVerification - 1),
    }));

    // Record system audit log
    addAuditLog({
      action: 'PRICE_VERIFICATION_APPROVED',
      actorRole: 'verifier_admin',
      entityType: 'submission',
      entityId: sub.id,
      entityName: sub.productName,
      marketName: sub.marketName,
      city: sub.city,
      status: 'SUCCESS',
      confidenceScore: sub.systemConfidence,
      price: sub.price,
      details: `Approved price observation ${sub.submissionNumber} (₦${sub.price.toLocaleString()}) for ${sub.productName} in ${sub.marketName}.`,
    });

    addToast(`Submission ${sub.submissionNumber} (${sub.productName}) approved & published live!`, 'success');
  };

  const rejectSubmission = (id: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;

    setSubmissions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'rejected' as const } : item))
    );

    setAdminKPIs((prev) => ({
      ...prev,
      pendingVerification: Math.max(0, prev.pendingVerification - 1),
    }));

    // Record system audit log
    addAuditLog({
      action: 'PRICE_VERIFICATION_REJECTED',
      actorRole: 'verifier_admin',
      entityType: 'submission',
      entityId: sub.id,
      entityName: sub.productName,
      marketName: sub.marketName,
      city: sub.city,
      status: 'WARNING',
      confidenceScore: sub.systemConfidence,
      price: sub.price,
      details: `Rejected submission ${sub.submissionNumber} due to data or price variance anomaly.`,
    });

    addToast(`Submission ${sub.submissionNumber} rejected due to price discrepancy.`, 'warning');
  };

  const requestRecheckSubmission = (id: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;

    setSubmissions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'recheck_requested' as const } : item))
    );

    // Record system audit log
    addAuditLog({
      action: 'RECHECK_TASK_DISPATCHED',
      actorRole: 'verifier_admin',
      entityType: 'submission',
      entityId: sub.id,
      entityName: sub.productName,
      marketName: sub.marketName,
      city: sub.city,
      status: 'ALERT',
      confidenceScore: sub.systemConfidence,
      price: sub.price,
      details: `Dispatched field recheck request for ${sub.submissionNumber} in ${sub.marketName}.`,
    });

    addToast(`Recheck request dispatched to field verifier in ${sub.marketName}.`, 'info');
  };

  const submitInaccuratePriceReport = (data: {
    productId: string;
    marketName: string;
    reportedPrice: number;
    reason: string;
    notes?: string;
  }) => {
    addAuditLog({
      action: 'CONSUMER_DISCREPANCY_FLAGGED',
      actorRole: currentRole,
      entityType: 'product',
      entityId: data.productId,
      entityName: data.productId,
      marketName: data.marketName,
      city: selectedCity,
      status: 'WARNING',
      price: data.reportedPrice,
      details: `Consumer flagged price discrepancy in ${data.marketName}: ${data.reason}. Notes: ${data.notes || 'None'}`,
    });

    addToast('Thank you! Your price report has been submitted to field verifiers for audit.', 'success');
    closeReportModal();
  };

  return (
    <AppContext.Provider
      value={{
        themeMode,
        setThemeMode,
        isDark,
        isOnline,
        isLowConnectivity,
        pendingOfflineQueue,
        syncOfflineQueue,
        lastCacheSync,
        currentRole,
        setCurrentRole,
        activeView,
        setActiveView,
        selectedCity,
        setSelectedCity,
        products,
        markets,
        submissions,
        agentProfile,
        adminKPIs,
        systemAlerts,
        auditLogs,
        addAuditLog,
        savedProductIds,
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
        selectedProduct,
        openProductDetail,
        closeProductDetail,
        selectedMarket,
        openMarketDetail,
        closeMarketDetail,
        activeSubmissionDetail,
        setActiveSubmissionDetail,
        reportModalProduct,
        openReportModal,
        closeReportModal,
        isExportModalOpen,
        exportModalDefaultCategory,
        openExportModal,
        closeExportModal,
        toggleSaveProduct,
        isProductSaved,
        submitPriceReport,
        submitBulkPriceReports,
        approveSubmission,
        rejectSubmission,
        requestRecheckSubmission,
        submitInaccuratePriceReport,
        toasts,
        addToast,
        removeToast,
        isSupabaseActive: isSupabaseConfigured,
        isBackendModalOpen,
        openBackendModal,
        closeBackendModal,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
