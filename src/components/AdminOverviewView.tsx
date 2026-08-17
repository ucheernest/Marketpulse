import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowRight,
  ChevronRight,
  Zap,
  Layers,
  Store,
  FileCheck2,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Database,
  History,
} from 'lucide-react';

export const AdminOverviewView: React.FC = () => {
  const {
    adminKPIs,
    systemAlerts,
    submissions,
    auditLogs,
    openExportModal,
    setActiveView,
    selectedCity,
    addToast,
  } = useApp();

  const hourlyData = [
    { hour: '6 AM', count: 120 },
    { hour: '8 AM', count: 280 },
    { hour: '10 AM', count: 460 },
    { hour: '12 PM', count: 520 },
    { hour: '2 PM', count: 390 },
    { hour: '4 PM', count: 210 },
  ];

  const maxHourly = Math.max(...hourlyData.map((d) => d.count));

  return (
    <div id="admin-overview-screen" className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              Operations Overview
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#3e4a41] dark:text-[#bdcabe] mt-1">
            Real-time multi-agent pricing telemetry, audit logs, and data exports for {selectedCity}.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* CSV Export Action Button */}
          <button
            onClick={() => openExportModal('verifications')}
            id="admin-export-reports-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#182232] border border-[#008751]/40 text-[#006b3f] dark:text-[#8df8b7] hover:bg-[#008751]/10 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#008751]" />
            <span>Export CSV Reports</span>
          </button>

          <button
            onClick={() => addToast('Telemetry synchronizing with cloud edge nodes...', 'info')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#182232] border border-[#bdcabe]/50 dark:border-[#2d3e58] text-xs font-semibold text-[#121c2a] dark:text-[#f8f9ff] hover:bg-[#eff4ff] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setActiveView('admin-verification')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2170e4] hover:bg-[#0058be] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Review Queue ({adminKPIs.pendingVerification})</span>
          </button>
        </div>
      </div>

      {/* Real-time System Alerts (Image 13/14 style) */}
      <div className="space-y-2">
        {systemAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
              alert.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300/70 dark:border-amber-800/70 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300/70 dark:border-rose-800/70 text-rose-900 dark:text-rose-200'
            }`}
          >
            <AlertTriangle
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                alert.type === 'warning' ? 'text-amber-600' : 'text-rose-600'
              }`}
            />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span className="font-bold">{alert.title}: </span>
                <span>{alert.message}</span>
              </div>
              <span className="text-[11px] opacity-70 shrink-0">{alert.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 5 KPI Metric Tiles (Glassmorphism & High-contrast) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Tile 1: Verified Today */}
        <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#3e4a41] dark:text-[#bdcabe]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Verified Today</span>
            <CheckCircle2 className="w-4 h-4 text-[#008751]" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              {adminKPIs.verifiedToday.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+12% vs avg</span>
            </div>
          </div>
        </div>

        {/* Tile 2: Pending Verification */}
        <div
          onClick={() => setActiveView('admin-verification')}
          className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] hover:border-[#2170e4] rounded-2xl p-4 shadow-xs flex flex-col justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#3e4a41] dark:text-[#bdcabe]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Pending Queue</span>
            <ShieldCheck className="w-4 h-4 text-[#2170e4]" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-bold text-[#0058be] dark:text-[#adc6ff]">
              {adminKPIs.pendingVerification}
            </div>
            <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] mt-0.5">
              Requires review
            </div>
          </div>
        </div>

        {/* Tile 3: Active Agents */}
        <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#3e4a41] dark:text-[#bdcabe]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Active Agents</span>
            <Users className="w-4 h-4 text-[#835200] dark:text-[#ffb95f]" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              {adminKPIs.activeAgents}
            </div>
            <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] mt-0.5">
              32 currently in field
            </div>
          </div>
        </div>

        {/* Tile 4: Freshness */}
        <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#3e4a41] dark:text-[#bdcabe]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Avg Freshness</span>
            <Clock className="w-4 h-4 text-[#008751]" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-bold text-[#006b3f] dark:text-[#8df8b7]">
              {adminKPIs.averageFreshnessMinutes}m
            </div>
            <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] mt-0.5">
              Target &lt; 30m
            </div>
          </div>
        </div>

        {/* Tile 5: Confidence Score */}
        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#3e4a41] dark:text-[#bdcabe]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Trust Index</span>
            <Activity className="w-4 h-4 text-[#008751]" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              {adminKPIs.systemConfidenceScore}%
            </div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              High verification accuracy
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Submissions Volume Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                Submissions by Hour (Today)
              </h2>
              <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                Field agent throughput and burst cycles
              </p>
            </div>
            <span className="text-xs font-bold text-[#008751] dark:text-[#8df8b7] bg-[#008751]/10 px-2.5 py-1 rounded-full">
              Peak: 12 PM (520)
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {hourlyData.map((item, idx) => {
              const heightPercent = Math.round((item.count / maxHourly) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[11px] font-bold text-[#121c2a] dark:text-[#f8f9ff] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </div>
                  <div className="w-full bg-[#eff4ff] dark:bg-[#25344a] rounded-t-lg h-32 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-[#006b3f] to-[#008751] rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-[#6e7a70] dark:text-[#bdcabe]">
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Market Coverage Gauge */}
        <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              Market Coverage Health
            </h2>
            <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
              Target coverage density in {selectedCity}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Mile 3 Market</span>
                <span className="text-[#008751]">96%</span>
              </div>
              <div className="w-full bg-[#dee9fc] dark:bg-[#25344a] h-2 rounded-full overflow-hidden">
                <div className="bg-[#008751] h-full rounded-full" style={{ width: '96%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Oil Mill Market</span>
                <span className="text-[#008751]">92%</span>
              </div>
              <div className="w-full bg-[#dee9fc] dark:bg-[#25344a] h-2 rounded-full overflow-hidden">
                <div className="bg-[#008751] h-full rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Creek Road Market</span>
                <span className="text-amber-600 dark:text-amber-400">88%</span>
              </div>
              <div className="w-full bg-[#dee9fc] dark:bg-[#25344a] h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '88%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Town Market</span>
                <span className="text-blue-600 dark:text-blue-400">84%</span>
              </div>
              <div className="w-full bg-[#dee9fc] dark:bg-[#25344a] h-2 rounded-full overflow-hidden">
                <div className="bg-[#2170e4] h-full rounded-full" style={{ width: '84%' }} />
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('admin-verification')}
            className="w-full py-2 rounded-xl bg-[#eff4ff] dark:bg-[#25344a] text-xs font-bold text-[#0058be] dark:text-[#adc6ff] hover:bg-[#dee9fc] transition-colors"
          >
            Audit Coverage Details
          </button>
        </div>
      </div>

      {/* Recent Submissions Telemetry Table */}
      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              Live Agent Submissions Stream
            </h2>
            <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
              Incoming price reports awaiting or completed automated verification
            </p>
          </div>
          <button
            onClick={() => setActiveView('admin-verification')}
            className="text-xs font-bold text-[#2170e4] dark:text-[#adc6ff] hover:underline flex items-center gap-1"
          >
            <span>Open Queue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#bdcabe]/30 dark:border-[#2d3e58] text-[#6e7a70] dark:text-[#bdcabe] uppercase tracking-wider">
                <th className="py-2.5 px-3">Ref ID</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Market / Stall</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">Verifier</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bdcabe]/20 dark:divide-[#2d3e58]">
              {submissions.slice(0, 5).map((sub) => (
                <tr
                  key={sub.id}
                  onClick={() => setActiveView('admin-verification')}
                  className="hover:bg-[#eff4ff] dark:hover:bg-[#25344a] transition-colors cursor-pointer"
                >
                  <td className="py-3 px-3 font-bold text-[#0058be] dark:text-[#adc6ff]">
                    {sub.submissionNumber}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#121c2a] dark:text-[#f8f9ff]">
                    {sub.productName}
                  </td>
                  <td className="py-3 px-3 text-[#3e4a41] dark:text-[#bdcabe]">
                    {sub.marketName}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                    ₦{sub.price.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-[#3e4a41] dark:text-[#bdcabe]">
                    {sub.agentName}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#008751] dark:text-[#8df8b7]">
                    {sub.systemConfidence}%
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : sub.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {sub.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Data Export & Audit Intelligence Action Center */}
      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#121c2a] dark:text-[#f8f9ff] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#008751]" />
              <span>Data Export & Archival Center</span>
            </h2>
            <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
              Export operational verification data, full audit trails, and commodity pricing indices as RFC-4180 CSV
            </p>
          </div>
          <button
            onClick={() => openExportModal('verifications')}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Open Export Wizard</span>
          </button>
        </div>

        {/* 3 Quick Export Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          {/* Card 1: Verification Reports */}
          <div className="p-4 rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/30 dark:border-[#2d3e58] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                  Price Verifications CSV
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-[#006b3f] dark:text-[#8df8b7]">
                  {submissions.length} Records
                </span>
              </div>
              <p className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] mt-1">
                Full field reports with GPS coords, EXIF status, trust confidence, and agent IDs.
              </p>
            </div>
            <button
              onClick={() => openExportModal('verifications')}
              className="w-full py-2 rounded-lg bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] hover:border-[#008751] text-xs font-bold text-[#008751] dark:text-[#8df8b7] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Verification Reports</span>
            </button>
          </div>

          {/* Card 2: Audit Logs */}
          <div className="p-4 rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/30 dark:border-[#2d3e58] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                  Security & Audit Trail CSV
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-[#0058be] dark:text-[#adc6ff]">
                  {auditLogs.length} Events
                </span>
              </div>
              <p className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] mt-1">
                Immutable record of admin approvals, anomaly flags, recheck dispatches, and role actions.
              </p>
            </div>
            <button
              onClick={() => openExportModal('audit_logs')}
              className="w-full py-2 rounded-lg bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] hover:border-[#0058be] text-xs font-bold text-[#0058be] dark:text-[#adc6ff] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export System Audit Logs</span>
            </button>
          </div>

          {/* Card 3: Commodity Price Index */}
          <div className="p-4 rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/30 dark:border-[#2d3e58] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                  Market Price Index CSV
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-[#835200] dark:text-[#ffb95f]">
                  Regional Index
                </span>
              </div>
              <p className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] mt-1">
                Aggregated commodity benchmarks, price volatility, and stall-by-stall price distributions.
              </p>
            </div>
            <button
              onClick={() => openExportModal('price_index')}
              className="w-full py-2 rounded-lg bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] hover:border-[#835200] text-xs font-bold text-[#835200] dark:text-[#ffb95f] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Commodity Index</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security & System Audit Trail Table */}
      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#121c2a] dark:text-[#f8f9ff] flex items-center gap-2">
              <History className="w-4 h-4 text-[#0058be]" />
              <span>System & Security Audit Log Stream</span>
            </h2>
            <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
              Audit trail tracking approvals, anomaly detections, cache synchronizations, and data exports
            </p>
          </div>
          <button
            onClick={() => openExportModal('audit_logs')}
            className="text-xs font-bold text-[#0058be] dark:text-[#adc6ff] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Full Audit Log CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#bdcabe]/30 dark:border-[#2d3e58] text-[#6e7a70] dark:text-[#bdcabe] uppercase tracking-wider">
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Actor / Role</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Market / City</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bdcabe]/20 dark:divide-[#2d3e58]">
              {auditLogs.slice(0, 6).map((log) => (
                <tr key={log.id} className="hover:bg-[#eff4ff] dark:hover:bg-[#25344a] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#0058be] dark:text-[#adc6ff]">
                    {log.id}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#121c2a] dark:text-[#f8f9ff]">
                    <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#3e4a41] dark:text-[#bdcabe]">
                    <div className="font-semibold text-[#121c2a] dark:text-[#f8f9ff]">
                      {log.actorName}
                    </div>
                    <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe]">{log.actorRole}</div>
                  </td>
                  <td className="py-3 px-3 text-[#121c2a] dark:text-[#f8f9ff]">
                    {log.entityName}
                  </td>
                  <td className="py-3 px-3 text-[#3e4a41] dark:text-[#bdcabe]">
                    {log.marketName || 'All Markets'}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.status === 'WARNING'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : log.status === 'ALERT'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#3e4a41] dark:text-[#bdcabe] max-w-xs truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
