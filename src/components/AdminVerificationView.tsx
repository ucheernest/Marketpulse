import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Camera,
  Store,
  UserCheck,
  Layers,
  ArrowLeft,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { FieldSubmission } from '../types';

export const AdminVerificationView: React.FC = () => {
  const {
    submissions,
    activeSubmissionDetail,
    setActiveSubmissionDetail,
    approveSubmission,
    rejectSubmission,
    requestRecheckSubmission,
    openExportModal,
    setActiveView,
    addToast,
    selectedCity,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'priority' | 'recheck'>('all');
  const [photoZoom, setPhotoZoom] = useState(false);

  const filteredQueue = submissions.filter((sub) => {
    if (filterType === 'priority') return sub.systemConfidence < 90 || sub.price > 50000;
    if (filterType === 'recheck') return sub.status === 'recheck_requested';
    return true;
  });

  const currentSub = activeSubmissionDetail || submissions[0];

  return (
    <div id="admin-verification-screen" className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('admin-overview')}
            className="p-2 text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#25344a] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              Verification Queue
            </h1>
            <p className="text-xs sm:text-sm text-[#3e4a41] dark:text-[#bdcabe]">
              Audit incoming price submissions with multi-market context in {selectedCity}
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => openExportModal('verifications')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#182232] border border-[#008751]/40 text-[#006b3f] dark:text-[#8df8b7] hover:bg-[#008751]/10 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#008751]" />
            <span>Export CSV</span>
          </button>

          <div className="flex items-center gap-1 bg-white dark:bg-[#182232] p-1 rounded-xl border border-[#bdcabe]/40 dark:border-[#2d3e58]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#2170e4] text-white'
                  : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#2170e4]'
              }`}
            >
              All ({submissions.length})
            </button>
            <button
              onClick={() => setFilterType('priority')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'priority'
                  ? 'bg-[#2170e4] text-white'
                  : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#2170e4]'
              }`}
            >
              High Priority
            </button>
            <button
              onClick={() => setFilterType('recheck')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'recheck'
                  ? 'bg-[#2170e4] text-white'
                  : 'text-[#3e4a41] dark:text-[#bdcabe] hover:text-[#2170e4]'
              }`}
            >
              Requires Recheck
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Queue List & Detail Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Queue List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold text-[#6e7a70] dark:text-[#bdcabe] uppercase tracking-wider px-1">
            Pending Submissions ({filteredQueue.length})
          </h2>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredQueue.map((item) => {
              const isSelected = currentSub?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveSubmissionDetail(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-white dark:bg-[#182232] border-[#2170e4] ring-2 ring-[#2170e4]/20 shadow-md'
                      : 'bg-white/70 dark:bg-[#182232]/70 border-[#bdcabe]/40 dark:border-[#2d3e58] hover:bg-white dark:hover:bg-[#182232]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0058be] dark:text-[#adc6ff]">
                        {item.submissionNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                      {item.isOfflineQueued && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          Offline Sync
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.submittedAt}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                        {item.productName}
                      </h3>
                      <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                        {item.marketName}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-[#006b3f] dark:text-[#8df8b7]">
                        ₦{item.price.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe]">
                        {item.systemConfidence}% Trust
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Submission Review Detail Canvas */}
        {currentSub ? (
          <div className="lg:col-span-7 bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
            {/* Header with Reference & Price */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#bdcabe]/30 dark:border-[#2d3e58] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#0058be] dark:text-[#adc6ff]">
                    {currentSub.submissionNumber}
                  </span>
                  <span className="text-xs text-[#6e7a70] dark:text-[#bdcabe]">• Submitted {currentSub.submittedAt}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                  {currentSub.productName}
                </h2>
                <p className="text-xs sm:text-sm text-[#3e4a41] dark:text-[#bdcabe] flex items-center gap-1 mt-0.5">
                  <Store className="w-3.5 h-3.5 text-[#008751]" />
                  <span>
                    {currentSub.marketName} • {currentSub.sellerStall}
                  </span>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-2xl sm:text-3xl font-bold text-[#006b3f] dark:text-[#8df8b7]">
                  ₦{currentSub.price.toLocaleString()}
                </div>
                <div className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                  {currentSub.quantity} × {currentSub.unit}
                </div>
              </div>
            </div>

            {/* AI Trust System Recommendation Banner */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                    System Recommendation: {currentSub.systemRecommendation}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    {currentSub.systemConfidence}% Match
                  </span>
                </div>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-200/90 mt-1 leading-relaxed">
                  Price is consistent with recent vendor reports across {selectedCity}. GPS coordinates
                  match vendor stall boundaries with verified EXIF timestamp.
                </p>
              </div>
            </div>

            {/* Evidence Photo Preview */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider">
                  Photo Evidence & EXIF Stamp
                </h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  EXIF Geotag Validated
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-[#bdcabe]/40 dark:border-[#2d3e58] h-52 bg-[#dee9fc]/40 dark:bg-[#1d2a3c]">
                <img
                  src={currentSub.photoUrl}
                  alt="Evidence"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between p-3">
                  <div className="text-white text-xs">
                    <div className="font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{currentSub.gpsLocation.address}</span>
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      Lat: {currentSub.gpsLocation.lat}°, Lng: {currentSub.gpsLocation.lng}°
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Profile & Nearby Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Agent Reputation Card */}
              <div className="bg-[#f8f9ff] dark:bg-[#121c2a] p-4 rounded-2xl border border-[#bdcabe]/40 dark:border-[#2d3e58] space-y-2">
                <span className="text-[11px] font-bold text-[#6e7a70] dark:text-[#bdcabe] uppercase tracking-wider">
                  Reporting Verifier
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#008751] text-white font-bold flex items-center justify-center text-sm">
                    {currentSub.agentInitials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                      {currentSub.agentName}
                    </div>
                    <div className="text-xs text-[#006b3f] dark:text-[#8df8b7] font-semibold">
                      {currentSub.agentLevel} • {currentSub.agentReputation}% Score
                    </div>
                  </div>
                </div>
              </div>

              {/* Nearby Market Context */}
              <div className="bg-[#f8f9ff] dark:bg-[#121c2a] p-4 rounded-2xl border border-[#bdcabe]/40 dark:border-[#2d3e58] space-y-2">
                <span className="text-[11px] font-bold text-[#6e7a70] dark:text-[#bdcabe] uppercase tracking-wider">
                  Nearby Market Context
                </span>
                <div className="space-y-1.5 text-xs">
                  {currentSub.nearbyMarketComparisons.map((c, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-[#3e4a41] dark:text-[#bdcabe]">{c.marketName}</span>
                      <span className="font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                        ₦{c.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decision Actions Bar */}
            <div className="pt-4 border-t border-[#bdcabe]/30 dark:border-[#2d3e58] flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => rejectSubmission(currentSub.id)}
                disabled={currentSub.status === 'rejected'}
                className="flex-1 py-3 px-4 rounded-xl border border-[#ba1a1a]/40 text-[#ba1a1a] dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Entry</span>
              </button>

              <button
                onClick={() => requestRecheckSubmission(currentSub.id)}
                disabled={currentSub.status === 'recheck_requested'}
                className="flex-1 py-3 px-4 rounded-xl border border-amber-400/50 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Request Recheck</span>
              </button>

              <button
                onClick={() => approveSubmission(currentSub.id)}
                disabled={currentSub.status === 'verified'}
                className="flex-1 py-3 px-4 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold shadow-md transition-transform active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{currentSub.status === 'verified' ? 'Approved & Live' : 'Approve & Publish'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white dark:bg-[#182232] rounded-3xl p-12 text-center text-[#6e7a70] dark:text-[#bdcabe]">
            Select a submission from the queue to audit evidence and make decision.
          </div>
        )}
      </div>
    </div>
  );
};
