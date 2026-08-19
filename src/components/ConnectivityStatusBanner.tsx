import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Zap,
  CloudOff,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ConnectivityStatusBanner: React.FC = () => {
  const {
    isOnline,
    isLowConnectivity,
    pendingOfflineQueue,
    syncOfflineQueue,
    lastCacheSync,
    refreshData,
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncOfflineQueue();
    if (isOnline) await refreshData();
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  const hasQueuedItems = pendingOfflineQueue.length > 0;
  const showBanner = !isOnline || isLowConnectivity || hasQueuedItems;

  if (!showBanner) {
    return null;
  }

  return (
    <div
      id="connectivity-status-banner"
      className={`border-b transition-colors duration-200 ${
        !isOnline
          ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 text-amber-900 dark:text-amber-200'
          : isLowConnectivity
          ? 'bg-blue-500/10 dark:bg-blue-950/40 border-blue-500/30 text-blue-900 dark:text-blue-200'
          : 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left Status Indicator */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold shrink-0 ${
              !isOnline
                ? 'bg-amber-500 text-white shadow-xs animate-pulse'
                : isLowConnectivity
                ? 'bg-blue-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {!isOnline ? (
              <WifiOff className="w-3.5 h-3.5" />
            ) : isLowConnectivity ? (
              <Zap className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
            <span className="font-bold tracking-tight">
              {!isOnline
                ? 'Offline mode — using last verified cache'
                : isLowConnectivity
                ? 'Low connectivity — verified cache available'
                : 'Verified cache synchronized'}
            </span>
            <span className="opacity-80 text-[11px] hidden sm:inline">•</span>
            <span className="opacity-80 text-[11px]">
              {!isOnline
                ? 'Reading from local catalog cache. Submissions are queued in storage.'
                : hasQueuedItems
                ? `${pendingOfflineQueue.length} pending report(s) ready to synchronize.`
                : 'Last successfully loaded verified catalog remains available offline.'}
            </span>
          </div>
        </div>

        {/* Right Sync Controls */}
        <div className="flex items-center gap-2">
          {lastCacheSync && (
            <span className="text-[10px] opacity-70 hidden md:inline">
              Cached: {lastCacheSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          {hasQueuedItems && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 dark:bg-amber-400/20 text-amber-800 dark:text-amber-200 border border-amber-500/30">
              {pendingOfflineQueue.length} queued
            </span>
          )}

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            id="manual-cache-sync-btn"
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              !isOnline
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-[#008751] hover:bg-[#006b3f] text-white'
            } disabled:opacity-50`}
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : hasQueuedItems ? 'Sync outbox' : 'Refresh verified data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
