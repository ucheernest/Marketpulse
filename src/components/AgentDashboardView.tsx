import React from 'react';
import { useApp } from '../context/AppContext';
import { AgentKPIDashboard } from './AgentKPIDashboard';
import { AgentLeaderboard } from './AgentLeaderboard';
import {
  MapPin,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Wallet,
  Clock,
  ArrowRight,
  PlusCircle,
  FileCheck2,
  AlertCircle,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const AgentDashboardView: React.FC = () => {
  const {
    agentProfile,
    setActiveView,
    submissions,
    addToast,
    selectedCity,
    isOnline,
    pendingOfflineQueue,
    syncOfflineQueue,
  } = useApp();

  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');
  const progressPercent = Math.round(
    (agentProfile.completedChecksToday / agentProfile.assignedChecksToday) * 100
  );

  const sampleTasks = [
    {
      id: 't-1',
      productName: 'Mama Gold Rice (50kg)',
      marketName: 'Mile 3 Market',
      stall: 'Stall 42 (Mama Joy)',
      bounty: 650,
      priority: 'High Priority',
      dueIn: '25m',
    },
    {
      id: 't-2',
      productName: 'Golden Penny Semovita (10kg)',
      marketName: 'Mile 3 Market',
      stall: 'Line B, Stall 12',
      bounty: 500,
      priority: 'Standard',
      dueIn: '1h',
    },
    {
      id: 't-3',
      productName: 'Red Palm Oil (5 Litres)',
      marketName: 'Oil Mill Market',
      stall: 'Oil Section Stall 08',
      bounty: 700,
      priority: 'High Priority',
      dueIn: '2h',
    },
  ];

  return (
    <div id="agent-dashboard-screen" className="space-y-6 pb-24">
      {/* Header Profile Summary */}
      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#008751] shrink-0">
            <img
              src={agentProfile.avatar}
              alt={agentProfile.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                Good morning, {agentProfile.name.split(' ')[0]}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7] border border-[#008751]/20">
                <ShieldCheck className="w-3 h-3" />
                Trusted Agent
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#3e4a41] dark:text-[#bdcabe] flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#008751]" />
              <span>
                {agentProfile.currentMarket}, {selectedCity}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('submit-price')}
          className="flex items-center justify-center gap-2 bg-[#008751] hover:bg-[#006b3f] text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Price Check</span>
        </button>
      </div>

      {/* Progress & Earnings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's Progress Card */}
        <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider">
                  Today's Field Mission
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-[#121c2a] dark:text-[#f8f9ff] mt-1">
                  {agentProfile.completedChecksToday} / {agentProfile.assignedChecksToday}
                  <span className="text-xs text-[#3e4a41] dark:text-[#bdcabe] font-normal ml-2">
                    checks completed
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#006b3f] dark:text-[#8df8b7] bg-[#008751]/10 px-2.5 py-1 rounded-full border border-[#008751]/20">
                {agentProfile.accuracyRate}% Accuracy
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#dee9fc] dark:bg-[#25344a] h-3 rounded-full overflow-hidden mt-4">
              <div
                className="bg-gradient-to-r from-[#006b3f] to-[#008751] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-[#3e4a41] dark:text-[#bdcabe] pt-3 border-t border-[#bdcabe]/30 dark:border-[#2d3e58]">
            <span className="font-medium">{progressPercent}% daily target fulfilled</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {agentProfile.assignedChecksToday - agentProfile.completedChecksToday} tasks remaining
            </span>
          </div>
        </div>

        {/* Earnings Summary Card (Image 9/10 style) */}
        <div className="bg-gradient-to-br from-[#006b3f] to-[#004e2d] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <Wallet className="w-44 h-44" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-emerald-200">
                Total Earned This Week
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold backdrop-blur-md">
                Active Bounties
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight">
              ₦{agentProfile.totalEarnedThisWeek.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-100/80 mt-1">
              ₦650 per approved verification • Next payout on Friday
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-white/20 flex justify-between items-center text-xs">
            <span className="text-emerald-100">3 verifications in review (₦1,950 pending)</span>
            <button
              onClick={() => addToast('Payout details & account statement downloaded', 'info')}
              className="px-3 py-1.5 rounded-lg bg-white text-[#006b3f] font-bold text-xs hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Field Agent Key Performance Indicators (KPI) Dashboard */}
      <AgentKPIDashboard />

      {/* Action Shortcut Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {/* Card 1: Today's Assignments */}
        <div
          onClick={() => {
            addToast('Viewing full assignments queue for Mile 3 Market', 'info');
          }}
          className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#0058be] dark:text-[#adc6ff]">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0058be] dark:text-[#adc6ff]">
              17 Pending
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff] group-hover:text-[#008751] transition-colors">
              Today's Assignments
            </h3>
            <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe] mt-0.5">
              17 locations pending field audit
            </p>
          </div>
        </div>

        {/* Card 2: Offline Outbox / Submission Draft */}
        <div
          onClick={() => {
            if (pendingOfflineQueue.length > 0) {
              syncOfflineQueue();
            } else {
              setActiveView('submit-price');
            }
          }}
          className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              pendingOfflineQueue.length > 0
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                : 'bg-amber-50 dark:bg-amber-950/50 text-[#835200] dark:text-[#ffb95f]'
            }`}>
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              pendingOfflineQueue.length > 0
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-amber-100 dark:bg-amber-950 text-[#835200] dark:text-[#ffb95f]'
            }`}>
              {pendingOfflineQueue.length > 0 ? `${pendingOfflineQueue.length} Queued Offline` : 'Draft Ready'}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff] group-hover:text-[#008751] transition-colors">
              {pendingOfflineQueue.length > 0 ? 'Sync Offline Outbox' : 'Continue Submission'}
            </h3>
            <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe] mt-0.5">
              {pendingOfflineQueue.length > 0
                ? 'Tap to push cached submissions'
                : 'Mama Gold Rice • Stall 42'}
            </p>
          </div>
        </div>

        {/* Card 3: Pending Verification */}
        <div
          onClick={() => {
            setActiveView('admin-verification');
          }}
          className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-[#008751] dark:text-[#8df8b7]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#006b3f] dark:text-[#8df8b7]">
              {pendingSubmissions.length} in Review
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff] group-hover:text-[#008751] transition-colors">
              Audit Status
            </h3>
            <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe] mt-0.5">
              Live automated trust engine
            </p>
          </div>
        </div>
      </div>

      {/* Priority Assigned Tasks Queue */}
      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              Priority Verification Tasks
            </h2>
            <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
              Target stalls near your GPS vicinity in {agentProfile.currentMarket}
            </p>
          </div>
          <button
            onClick={() => setActiveView('submit-price')}
            className="text-xs font-bold text-[#008751] hover:underline"
          >
            Start Check
          </button>
        </div>

        <div className="space-y-3">
          {sampleTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setActiveView('submit-price')}
              className="p-3.5 rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/40 dark:border-[#2d3e58] hover:border-[#008751] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                    {task.productName}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-[#ba1a1a] dark:text-rose-400">
                    {task.priority}
                  </span>
                </div>
                <div className="text-xs text-[#3e4a41] dark:text-[#bdcabe] flex items-center gap-2">
                  <span>{task.marketName}</span>
                  <span>•</span>
                  <span>{task.stall}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right">
                  <div className="text-sm font-bold text-[#008751] dark:text-[#8df8b7]">
                    +₦{task.bounty}
                  </div>
                  <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe]">
                    Due in {task.dueIn}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] flex items-center justify-center text-[#008751]">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gamified Agent Leaderboard */}
      <AgentLeaderboard />
    </div>
  );
};
