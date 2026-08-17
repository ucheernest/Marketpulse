import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Store,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { signInWithSupabase, signUpWithSupabase, signOutSupabase } from '../services/backendService';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentRole, addToast } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    if (mode === 'signup' && !fullName) {
      setErrorMsg('Please enter your full name');
      setIsLoading(false);
      return;
    }

    try {
      if (!isSupabaseConfigured) {
        throw new Error('MarketPulse authentication is temporarily unavailable.');
      }

      if (mode === 'signup') {
        const res = await signUpWithSupabase(email, password, fullName);
        if (res.session) {
          setCurrentRole('consumer');
          addToast('Account created successfully.', 'success');
        } else {
          addToast('Account created. Check your email to confirm your address, then sign in.', 'success');
        }
      } else {
        const res = await signInWithSupabase(email, password);
        const dbRole = res.profile?.role || 'public_user';
        const uiRole =
          dbRole === 'field_agent' ? 'agent' :
          dbRole === 'verifier_admin' ? 'admin' :
          dbRole === 'super_admin' ? 'super_admin' : 'consumer';
        setCurrentRole(uiRole);
        addToast(`Welcome back, ${res.profile?.full_name || res.user?.user_metadata?.full_name || email}!`, 'success');
      }
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#182232] w-full max-w-md rounded-3xl shadow-2xl border border-[#bdcabe]/40 dark:border-[#2d3e58] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#bdcabe]/30 dark:border-[#2d3e58] flex items-center justify-between bg-[#f8f9ff] dark:bg-[#121c2a]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#008751]/10 flex items-center justify-center text-[#008751]">
              <KeyRound className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              {mode === 'signin' ? 'Sign In to MarketPulse' : 'Create MarketPulse Account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#25344a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Mode Switch Tabs */}
          <div className="flex bg-[#f8f9ff] dark:bg-[#121c2a] p-1 rounded-xl border border-[#bdcabe]/40 dark:border-[#2d3e58]">
            <button
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white dark:bg-[#182232] text-[#008751] dark:text-[#8df8b7] shadow-xs'
                  : 'text-[#6e7a70] dark:text-[#bdcabe]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white dark:bg-[#182232] text-[#008751] dark:text-[#8df8b7] shadow-xs'
                  : 'text-[#6e7a70] dark:text-[#bdcabe]'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6e7a70] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Daniel Peters"
                    className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6e7a70] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@marketpulse.ng"
                  className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6e7a70] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
