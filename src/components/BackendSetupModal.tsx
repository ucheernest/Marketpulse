import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  HardDrive,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  X,
  Sparkles,
  Server,
  Layers,
  FileCode,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPABASE_SCHEMA_SQL } from '../services/backendService';
import { getSupabase } from '../services/supabaseClient';

interface BackendSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendSetupModal: React.FC<BackendSetupModalProps> = ({ isOpen, onClose }) => {
  const { isSupabaseActive, addToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    addToast('Production PostgreSQL Schema copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const supabase = getSupabase();

    if (!supabase) {
      setTimeout(() => {
        setIsTesting(false);
        setTestResult({
          success: false,
          message: 'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY) are not set.',
        });
      }, 500);
      return;
    }

    try {
      // Test querying the submissions or profiles table
      const { data, error } = await supabase.from('field_submissions').select('count', { count: 'exact', head: true });
      setIsTesting(false);

      if (error) {
        setTestResult({
          success: false,
          message: `Connected to Supabase project, but table test returned: ${error.message}. Make sure to run the SQL schema script below.`,
        });
      } else {
        setTestResult({
          success: true,
          message: 'Live connection verified! Supabase PostgreSQL tables & storage are active.',
        });
      }
    } catch (err: any) {
      setIsTesting(false);
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#182232] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#bdcabe]/40 dark:border-[#2d3e58] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#bdcabe]/30 dark:border-[#2d3e58] flex items-center justify-between bg-[#f8f9ff] dark:bg-[#121c2a]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#008751]/10 flex items-center justify-center text-[#008751]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                Live Backend & Cloud Setup
              </h2>
              <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
                Step-by-step Supabase PostgreSQL, Auth & Cloud Storage configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#25344a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs sm:text-sm">
          {/* Connection Status Badge */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isSupabaseActive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${
                  isSupabaseActive ? 'bg-[#008751]' : 'bg-[#0058be]'
                }`}
              />
              <div>
                <div className="font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                  {isSupabaseActive ? 'Supabase Project Connected' : 'Local Persistence Active (Ready for Supabase)'}
                </div>
                <div className="text-xs text-[#6e7a70] dark:text-[#bdcabe]">
                  {isSupabaseActive
                    ? 'Synchronizing submissions, audit logs, and photo evidence across devices.'
                    : 'Submissions are stored in browser local storage & broadcast channels until connected.'}
                </div>
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] hover:border-[#008751] text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-100/70 dark:bg-emerald-950/80 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-100/70 dark:bg-amber-950/80 border-amber-300 text-amber-900 dark:text-amber-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>{testResult.message}</div>
            </div>
          )}

          {/* 3 Step Deployment Guide */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff] flex items-center gap-2">
              <Server className="w-4 h-4 text-[#008751]" />
              <span>3 Steps to Go Live with Real Multi-Device Sync</span>
            </h3>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/30 dark:border-[#2d3e58] space-y-1">
                <div className="font-bold text-xs text-[#121c2a] dark:text-[#f8f9ff] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#008751] text-white flex items-center justify-center text-[10px] font-bold">
                    1
                  </span>
                  <span>Create a Free Supabase Project</span>
                </div>
                <p className="text-xs text-[#6e7a70] dark:text-[#bdcabe] pl-7">
                  Go to{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0058be] dark:text-[#adc6ff] underline inline-flex items-center gap-1 font-semibold"
                  >
                    supabase.com <ExternalLink className="w-3 h-3" />
                  </a>
                  , create a new project, and copy your <strong>Project URL</strong> and{' '}
                  <strong>Anon Public Key</strong> from Project Settings &gt; API.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/30 dark:border-[#2d3e58] space-y-1">
                <div className="font-bold text-xs text-[#121c2a] dark:text-[#f8f9ff] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#008751] text-white flex items-center justify-center text-[10px] font-bold">
                    2
                  </span>
                  <span>Set Environment Variables</span>
                </div>
                <p className="text-xs text-[#6e7a70] dark:text-[#bdcabe] pl-7">
                  Add these two variables to your project settings or <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">.env</code> file:
                </p>
                <div className="pl-7 pt-1 font-mono text-[11px] bg-slate-900 text-slate-100 p-2.5 rounded-lg select-all">
                  VITE_SUPABASE_URL=https://your-project.supabase.co<br />
                  VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR...
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/30 dark:border-[#2d3e58] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-[#121c2a] dark:text-[#f8f9ff] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#008751] text-white flex items-center justify-center text-[10px] font-bold">
                      3
                    </span>
                    <span>Run the SQL Database & Storage Migration</span>
                  </div>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy SQL Script'}</span>
                  </button>
                </div>
                <p className="text-xs text-[#6e7a70] dark:text-[#bdcabe] pl-7">
                  Paste the SQL script into Supabase <strong>SQL Editor</strong> and click <strong>Run</strong>. This will generate all tables (<code className="text-[11px]">field_submissions</code>, <code className="text-[11px]">audit_logs</code>, <code className="text-[11px]">profiles</code>), Row Level Security policies, and create the <code className="text-[11px]">price-evidence</code> Storage bucket for photo uploads.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#bdcabe]/30 dark:border-[#2d3e58] flex justify-end bg-[#f8f9ff] dark:bg-[#121c2a]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#121c2a] dark:bg-[#f8f9ff] text-white dark:text-[#121c2a] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
