import React, { useState, useMemo } from 'react';
import { LeaderboardAgent } from '../types';
import { INITIAL_LEADERBOARD_AGENTS } from '../data/leaderboardData';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Medal,
  Award,
  Flame,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ShieldCheck,
  MapPin,
  Filter,
  ArrowUpRight,
  Zap,
  Target,
  Crown,
  ChevronRight,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TimeframeOption = 'week' | 'month' | 'all';
type SortMetric = 'rank' | 'accuracy' | 'submissions' | 'bounties';

export const AgentLeaderboard: React.FC = () => {
  const { agentProfile, selectedCity, addToast, setActiveView } = useApp();

  const [timeframe, setTimeframe] = useState<TimeframeOption>('week');
  const [sortMetric, setSortMetric] = useState<SortMetric>('rank');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [selectedBadgeInfo, setSelectedBadgeInfo] = useState<string | null>(null);

  // Derive dynamic agents based on local user submissions
  const allAgents = useMemo(() => {
    return INITIAL_LEADERBOARD_AGENTS.map((ag) => {
      if (ag.isCurrentUser) {
        return {
          ...ag,
          accuracyRate: agentProfile.accuracyRate,
          validatedSubmissionsCount: 248 + agentProfile.completedChecksToday,
          totalBountiesEarned: 161200 + agentProfile.completedChecksToday * 650,
        };
      }
      return ag;
    });
  }, [agentProfile.accuracyRate, agentProfile.completedChecksToday]);

  // Filtered & Sorted agents
  const processedAgents = useMemo(() => {
    let list = [...allAgents];

    if (cityFilter !== 'All') {
      list = list.filter((a) => a.city.toLowerCase() === cityFilter.toLowerCase());
    }

    // Sort according to metric
    list.sort((a, b) => {
      if (sortMetric === 'accuracy') {
        return b.accuracyRate - a.accuracyRate;
      }
      if (sortMetric === 'submissions') {
        return b.validatedSubmissionsCount - a.validatedSubmissionsCount;
      }
      if (sortMetric === 'bounties') {
        return b.totalBountiesEarned - a.totalBountiesEarned;
      }
      return a.rank - b.rank;
    });

    return list;
  }, [allAgents, cityFilter, sortMetric]);

  const topThree = processedAgents.slice(0, 3);
  const remainingAgents = processedAgents.slice(3);
  const currentUserAgent = allAgents.find((a) => a.isCurrentUser);

  const cities = ['All', 'Port Harcourt', 'Lagos', 'Abuja', 'Kano', 'Ibadan', 'Enugu'];

  return (
    <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#bdcabe]/30 dark:border-[#2d3e58] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              Field Verifier Leaderboard
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7] border border-[#008751]/20">
              Live Season 4
            </span>
          </div>
          <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe] mt-1">
            Top performing agents ranked by verification accuracy & validated price volume across Nigerian market hubs.
          </p>
        </div>

        {/* Timeframe & Metric Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Tabs */}
          <div className="flex bg-[#f8f9ff] dark:bg-[#121c2a] p-1 rounded-xl border border-[#bdcabe]/40 dark:border-[#2d3e58] text-xs font-semibold">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                timeframe === 'week'
                  ? 'bg-white dark:bg-[#182232] text-[#008751] dark:text-[#8df8b7] shadow-xs'
                  : 'text-[#6e7a70] dark:text-[#bdcabe]'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                timeframe === 'month'
                  ? 'bg-white dark:bg-[#182232] text-[#008751] dark:text-[#8df8b7] shadow-xs'
                  : 'text-[#6e7a70] dark:text-[#bdcabe]'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                timeframe === 'all'
                  ? 'bg-white dark:bg-[#182232] text-[#008751] dark:text-[#8df8b7] shadow-xs'
                  : 'text-[#6e7a70] dark:text-[#bdcabe]'
              }`}
            >
              All-Time
            </button>
          </div>

          {/* Metric Filter */}
          <div className="flex bg-[#f8f9ff] dark:bg-[#121c2a] p-1 rounded-xl border border-[#bdcabe]/40 dark:border-[#2d3e58] text-xs font-semibold">
            <button
              onClick={() => setSortMetric('rank')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                sortMetric === 'rank'
                  ? 'bg-[#008751] text-white shadow-xs'
                  : 'text-[#6e7a70] dark:text-[#bdcabe]'
              }`}
            >
              Overall Rank
            </button>
            <button
              onClick={() => setSortMetric('accuracy')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                sortMetric === 'accuracy'
                  ? 'bg-[#008751] text-white shadow-xs'
                  : 'text-[#6e7a70] dark:text-[#bdcabe]'
              }`}
            >
              Accuracy %
            </button>
            <button
              onClick={() => setSortMetric('submissions')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                sortMetric === 'submissions'
                  ? 'bg-[#008751] text-white shadow-xs'
                  : 'text-[#6e7a70] dark:text-[#bdcabe]'
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </div>

      {/* Regional Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-[11px] font-bold text-[#6e7a70] dark:text-[#bdcabe] uppercase tracking-wider mr-1 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#008751]" /> Hub:
        </span>
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setCityFilter(city)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              cityFilter === city
                ? 'bg-[#008751] text-white shadow-xs'
                : 'bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/40 dark:border-[#2d3e58] text-[#3e4a41] dark:text-[#bdcabe] hover:border-[#008751]'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Current User Standing Banner */}
      {currentUserAgent && (
        <div className="bg-gradient-to-r from-[#008751]/15 via-[#008751]/5 to-transparent border border-[#008751]/30 dark:border-[#008751]/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={currentUserAgent.avatar}
                alt="You"
                className="w-12 h-12 rounded-xl object-cover border-2 border-[#008751]"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#008751] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#182232]">
                #{currentUserAgent.rank}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                  Your Ranking: #{currentUserAgent.rank} in Nigeria
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7] text-[10px] font-bold border border-[#008751]/20">
                  {currentUserAgent.tier}
                </span>
              </div>
              <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe] mt-0.5">
                {currentUserAgent.accuracyRate}% Accuracy • {currentUserAgent.validatedSubmissionsCount} Validated Reports • ₦{currentUserAgent.totalBountiesEarned.toLocaleString()} Earned
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 justify-end">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next Tier: Top 3 (+₦25,000 Bonus)</span>
              </div>
              <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe]">
                16 more verifications to overtake #3
              </div>
            </div>
            <button
              onClick={() => setActiveView('submit-price')}
              className="px-4 py-2 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Verify Now</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Gamified Top 3 Podium (1st, 2nd, 3rd) */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* 2nd Place (Silver) */}
          <div className="order-2 sm:order-1 bg-gradient-to-b from-slate-100/80 to-white dark:from-slate-800/40 dark:to-[#182232] border border-slate-300 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col items-center text-center relative shadow-xs">
            <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center shadow-xs">
              2
            </div>
            <div className="relative mt-2 mb-3">
              <img
                src={topThree[1].avatar}
                alt={topThree[1].name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-400"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-2 -right-1 bg-slate-400 text-slate-900 rounded-full p-1 shadow-sm">
                <Medal className="w-3.5 h-3.5" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff] line-clamp-1">
              {topThree[1].name}
            </h3>
            <span className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#008751]" />
              {topThree[1].primaryMarket}, {topThree[1].city}
            </span>

            <div className="mt-3 w-full bg-white dark:bg-[#121c2a] rounded-xl p-2.5 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-1 text-center">
              <div>
                <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe] uppercase font-bold">
                  Accuracy
                </div>
                <div className="text-xs font-extrabold text-[#008751] dark:text-[#8df8b7]">
                  {topThree[1].accuracyRate}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe] uppercase font-bold">
                  Reports
                </div>
                <div className="text-xs font-extrabold text-[#121c2a] dark:text-[#f8f9ff]">
                  {topThree[1].validatedSubmissionsCount}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 justify-center mt-2.5">
              {topThree[1].topBadges.slice(0, 2).map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-semibold"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* 1st Place (Gold / Champion) */}
          <div className="order-1 sm:order-2 bg-gradient-to-b from-amber-100/90 via-amber-50/50 to-white dark:from-amber-950/40 dark:via-[#182232] dark:to-[#182232] border-2 border-amber-400 dark:border-amber-500/60 rounded-2xl p-5 flex flex-col items-center text-center relative shadow-md scale-100 sm:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 px-3 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 shadow-md uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 fill-amber-950" />
              #1 Verifier
            </div>

            <div className="relative mt-3 mb-3">
              <img
                src={topThree[0].avatar}
                alt={topThree[0].name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-amber-400 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-2 -right-1 bg-amber-400 text-amber-950 rounded-full p-1.5 shadow-md animate-bounce">
                <Trophy className="w-4 h-4 fill-amber-950" />
              </div>
            </div>

            <h3 className="text-base font-extrabold text-[#121c2a] dark:text-[#f8f9ff] line-clamp-1">
              {topThree[0].name}
            </h3>
            <span className="text-xs text-[#6e7a70] dark:text-[#bdcabe] flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#008751]" />
              {topThree[0].primaryMarket}, {topThree[0].city}
            </span>

            <div className="mt-3.5 w-full bg-white dark:bg-[#121c2a] rounded-xl p-3 border border-amber-200 dark:border-amber-900/40 grid grid-cols-2 gap-1 text-center shadow-xs">
              <div>
                <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe] uppercase font-bold">
                  Accuracy
                </div>
                <div className="text-sm font-extrabold text-[#008751] dark:text-[#8df8b7]">
                  {topThree[0].accuracyRate}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe] uppercase font-bold">
                  Reports
                </div>
                <div className="text-sm font-extrabold text-[#121c2a] dark:text-[#f8f9ff]">
                  {topThree[0].validatedSubmissionsCount}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 justify-center mt-2.5">
              {topThree[0].topBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-[10px] font-bold border border-amber-300 dark:border-amber-800"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* 3rd Place (Bronze) */}
          <div className="order-3 sm:order-3 bg-gradient-to-b from-amber-100/40 to-white dark:from-amber-950/20 dark:to-[#182232] border border-amber-600/30 dark:border-amber-800/40 rounded-2xl p-4 flex flex-col items-center text-center relative shadow-xs">
            <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-amber-700/20 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center justify-center shadow-xs">
              3
            </div>
            <div className="relative mt-2 mb-3">
              <img
                src={topThree[2].avatar}
                alt={topThree[2].name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-700/50"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-2 -right-1 bg-amber-700 text-white rounded-full p-1 shadow-sm">
                <Medal className="w-3.5 h-3.5" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff] line-clamp-1">
              {topThree[2].name}
            </h3>
            <span className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#008751]" />
              {topThree[2].primaryMarket}, {topThree[2].city}
            </span>

            <div className="mt-3 w-full bg-white dark:bg-[#121c2a] rounded-xl p-2.5 border border-amber-200/40 dark:border-amber-900/30 grid grid-cols-2 gap-1 text-center">
              <div>
                <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe] uppercase font-bold">
                  Accuracy
                </div>
                <div className="text-xs font-extrabold text-[#008751] dark:text-[#8df8b7]">
                  {topThree[2].accuracyRate}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe] uppercase font-bold">
                  Reports
                </div>
                <div className="text-xs font-extrabold text-[#121c2a] dark:text-[#f8f9ff]">
                  {topThree[2].validatedSubmissionsCount}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 justify-center mt-2.5">
              {topThree[2].topBadges.slice(0, 2).map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-[10px] font-semibold"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold text-[#6e7a70] dark:text-[#bdcabe] uppercase tracking-wider px-1">
          Top Agent Rankings
        </h3>

        <div className="space-y-2">
          {processedAgents.map((agent, index) => {
            const rankTrend =
              agent.previousRank === undefined
                ? 0
                : agent.previousRank - (index + 1);

            return (
              <div
                key={agent.id}
                className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  agent.isCurrentUser
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-[#008751] shadow-xs'
                    : 'bg-[#f8f9ff] dark:bg-[#121c2a] border-[#bdcabe]/30 dark:border-[#2d3e58] hover:border-[#bdcabe]'
                }`}
              >
                {/* Rank + Profile */}
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className="flex items-center gap-1.5 w-10 shrink-0">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? 'bg-amber-400 text-amber-950'
                          : index === 1
                          ? 'bg-slate-300 text-slate-900'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-white dark:bg-[#182232] text-[#3e4a41] dark:text-[#bdcabe] border border-[#bdcabe]/40'
                      }`}
                    >
                      {index + 1}
                    </span>

                    {/* Trend Icon */}
                    {rankTrend > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    ) : rankTrend < 0 ? (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <Minus className="w-3 h-3 text-slate-400" />
                    )}
                  </div>

                  {/* Avatar */}
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-10 h-10 rounded-xl object-cover border border-[#bdcabe]/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  {/* Name and Meta */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                        {agent.name}
                      </span>
                      {agent.isCurrentUser && (
                        <span className="px-1.5 py-0.2 rounded bg-[#008751] text-white text-[9px] font-bold">
                          YOU
                        </span>
                      )}
                      <span className="hidden md:inline px-2 py-0.5 rounded-full bg-white dark:bg-[#182232] text-[10px] font-semibold text-[#6e7a70] dark:text-[#bdcabe] border border-[#bdcabe]/30">
                        {agent.tier}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] flex items-center gap-1.5 mt-0.5">
                      <span>{agent.primaryMarket}</span>
                      <span>•</span>
                      <span>{agent.city}</span>
                      <span className="hidden sm:inline flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                        <Flame className="w-3 h-3" /> {agent.weeklyStreakDays}d streak
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accuracy & Submissions Data Columns */}
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#bdcabe]/20">
                  {/* Accuracy */}
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe] uppercase font-bold">
                      Accuracy Rate
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#008751] dark:text-[#8df8b7] flex items-center sm:justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{agent.accuracyRate}%</span>
                    </div>
                  </div>

                  {/* Submissions */}
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe] uppercase font-bold">
                      Validated
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#121c2a] dark:text-[#f8f9ff]">
                      {agent.validatedSubmissionsCount} checks
                    </div>
                  </div>

                  {/* Total Bounties */}
                  <div className="text-right">
                    <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe] uppercase font-bold">
                      Bounties
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#0058be] dark:text-[#adc6ff]">
                      ₦{agent.totalBountiesEarned.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gamified Rewards & Badges Info Footer */}
      <div className="pt-2 border-t border-[#bdcabe]/30 dark:border-[#2d3e58] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#6e7a70] dark:text-[#bdcabe]">
        <div className="flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#008751] shrink-0" />
          <span>
            Rankings refresh every 15 minutes. Weekly bounties paid out every Friday at 5:00 PM WAT.
          </span>
        </div>

        <button
          onClick={() => {
            addToast('Leaderboard rules & reward breakdown copied to notifications', 'info');
          }}
          className="font-bold text-[#008751] hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>View Rewards Breakdown</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
