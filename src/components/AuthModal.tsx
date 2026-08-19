import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, KeyRound, Lock, Mail, RefreshCw, User, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getAuthProviderAvailability,
  requestPasswordReset,
  resendSignupConfirmation,
  signInWithGoogleOAuth,
  signInWithSupabase,
  signUpWithSupabase,
  updatePasswordWithSupabase,
} from '../services/backendService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { LegalDocument, LegalDocumentModal } from './LegalDocumentModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { refreshAuthProfile, addToast, isPasswordRecovery, finishPasswordRecovery } = useApp();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [acceptLegal, setAcceptLegal] = useState(false);
  const [legalDocument, setLegalDocument] = useState<LegalDocument | null>(null);

  useEffect(() => {
    if (!isOpen || isPasswordRecovery) return;
    let active = true;
    setGoogleAvailable(null);
    void getAuthProviderAvailability().then((providers) => {
      if (active) setGoogleAvailable(providers.google);
    });
    return () => { active = false; };
  }, [isOpen, isPasswordRecovery]);

  useEffect(() => {
    if (isPasswordRecovery) {
      setErrorMsg(null);
      setInfoMsg('Choose a new password for your MarketPulse account.');
      setPassword('');
      setConfirmPassword('');
    }
  }, [isPasswordRecovery]);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setShowResend(false);
  };

  const handleGoogle = async () => {
    resetMessages();
    if (!isSupabaseConfigured) {
      setErrorMsg('MarketPulse authentication is temporarily unavailable.');
      return;
    }
    if (googleAvailable !== true) {
      setErrorMsg('Google sign-in has not been enabled on the MarketPulse authentication project yet. You can use email and password now.');
      return;
    }
    setGoogleLoading(true);
    try {
      await signInWithGoogleOAuth();
      // A successful call redirects the browser to Google. The Supabase auth listener
      // restores the profile and routes the user when Google redirects back.
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not start Google sign-in.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!isSupabaseConfigured) {
      setErrorMsg('MarketPulse authentication is temporarily unavailable.');
      return;
    }

    if (isPasswordRecovery) {
      if (!password || !confirmPassword) { setErrorMsg('Enter and confirm your new password.'); return; }
      if (password !== confirmPassword) { setErrorMsg('The two passwords do not match.'); return; }
      if (password.length < 8) { setErrorMsg('Use a password with at least 8 characters.'); return; }
      setIsLoading(true);
      try {
        await updatePasswordWithSupabase(password);
        await refreshAuthProfile();
        addToast('Password updated successfully.', 'success');
        finishPasswordRecovery();
      } catch (err: any) {
        setErrorMsg(err?.message || 'Could not update your password.');
      } finally { setIsLoading(false); }
      return;
    }

    if (!email.trim()) { setErrorMsg('Please enter your email address.'); return; }

    if (mode === 'forgot') {
      setIsLoading(true);
      try {
        await requestPasswordReset(email);
        setInfoMsg('Password-reset email sent. Open the link in that email to choose a new password.');
      } catch (err: any) {
        setErrorMsg(err?.message || 'Could not send the password-reset email.');
      } finally { setIsLoading(false); }
      return;
    }

    if (!password) { setErrorMsg('Please enter your password.'); return; }
    if (mode === 'signup' && !fullName.trim()) { setErrorMsg('Please enter your full name.'); return; }
    if (mode === 'signup' && password.length < 8) { setErrorMsg('Use a password with at least 8 characters.'); return; }
    if (mode === 'signup' && !acceptLegal) { setErrorMsg('Accept the Terms of Use and acknowledge the Privacy Notice to create an account.'); return; }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const res = await signUpWithSupabase(email, password, fullName, 'Port Harcourt', { acceptTerms: acceptLegal, acceptPrivacy: acceptLegal });
        if (res.session) {
          await refreshAuthProfile();
          addToast('Account created successfully.', 'success');
          onClose();
        } else {
          setInfoMsg('Account created. Check your email to confirm your address, then log in.');
          setShowResend(true);
          setMode('signin');
        }
      } else {
        const res = await signInWithSupabase(email, password);
        await refreshAuthProfile();
        addToast(`Welcome back, ${res.profile?.full_name || email}!`, 'success');
        onClose();
      }
    } catch (err: any) {
      const message = err?.message || 'Authentication failed. Please check your credentials.';
      setErrorMsg(message);
      setShowResend(message.toLowerCase().includes('email not confirmed'));
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmation = async () => {
    if (!email.trim()) { setErrorMsg('Enter the email address you registered with first.'); return; }
    setIsLoading(true); resetMessages();
    try {
      await resendSignupConfirmation(email);
      setInfoMsg('A new confirmation email has been sent.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not resend the confirmation email.');
    } finally { setIsLoading(false); }
  };

  const title = isPasswordRecovery
    ? 'Set a New Password'
    : mode === 'signin'
      ? 'Welcome Back'
      : mode === 'signup'
        ? 'Create Your MarketPulse Account'
        : 'Reset Your Password';

  const subtitle = isPasswordRecovery
    ? 'Choose a new password for this account.'
    : mode === 'signin'
      ? 'Log in with Google or your email and password.'
      : mode === 'signup'
        ? 'Create a consumer account. Staff roles are assigned only by the super admin.'
        : 'We will email you a secure password-reset link.';

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white dark:bg-[#182232] w-full max-w-md rounded-3xl shadow-2xl border border-[#bdcabe]/40 dark:border-[#2d3e58] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#bdcabe]/30 dark:border-[#2d3e58] flex items-center justify-between bg-[#f8f9ff] dark:bg-[#121c2a]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#008751]/10 flex items-center justify-center text-[#008751]"><KeyRound className="w-4 h-4" /></div>
              <div>
                <h2 className="text-base font-bold">{title}</h2>
                <p className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe] mt-0.5">{subtitle}</p>
              </div>
            </div>
            {!isPasswordRecovery && <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#eff4ff] dark:hover:bg-[#25344a]" aria-label="Close"><X className="w-5 h-5" /></button>}
          </div>

          <div className="p-6 space-y-4 text-xs sm:text-sm">
            {!isPasswordRecovery && mode !== 'forgot' && (
              <>
                <button
                  type="button"
                  onClick={() => void handleGoogle()}
                  disabled={googleLoading || googleAvailable !== true}
                  className="w-full py-3 px-4 rounded-xl bg-white dark:bg-[#121c2a] border border-[#bdcabe]/60 dark:border-[#2d3e58] hover:border-[#6e7a70] text-[#121c2a] dark:text-[#f8f9ff] text-sm font-bold flex items-center justify-center gap-3 disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {googleLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GoogleMark />}
                  <span>{googleLoading ? 'Opening Google…' : googleAvailable === null ? 'Checking Google sign-in…' : 'Continue with Google'}</span>
                </button>
                {googleAvailable === false && (
                  <p className="text-[10px] leading-4 text-[#835200] dark:text-[#ffdea6] text-center">
                    Google sign-in is not enabled yet. Existing email accounts can still log in; new email sign-ups require working confirmation-email delivery.
                  </p>
                )}
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-bold text-[#6e7a70]">
                  <span className="h-px bg-[#bdcabe]/50 dark:bg-[#2d3e58] flex-1" />
                  <span>or use email</span>
                  <span className="h-px bg-[#bdcabe]/50 dark:bg-[#2d3e58] flex-1" />
                </div>

                <div className="flex bg-[#f8f9ff] dark:bg-[#121c2a] p-1 rounded-xl border border-[#bdcabe]/40 dark:border-[#2d3e58]">
                  {(['signin','signup'] as const).map((tab) => (
                    <button key={tab} type="button" onClick={() => { setMode(tab); resetMessages(); }} className={`flex-1 py-2 text-xs font-bold rounded-lg ${mode===tab?'bg-white dark:bg-[#182232] text-[#008751] shadow-xs':'text-[#6e7a70]'}`}>
                      {tab === 'signin' ? 'Log In' : 'Sign Up'}
                    </button>
                  ))}
                </div>
              </>
            )}

            {errorMsg && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{errorMsg}</span></div>}
            {infoMsg && <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span>{infoMsg}</span></div>}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {!isPasswordRecovery && mode === 'signup' && (
                <Field label="Full Name" icon={<User className="w-4 h-4" />}><input type="text" value={fullName} onChange={(e)=>setFullName(e.target.value)} autoComplete="name" placeholder="e.g. Uche Ernest" className={inputClass} /></Field>
              )}

              {!isPasswordRecovery && (
                <Field label="Email Address" icon={<Mail className="w-4 h-4" />}><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" placeholder="name@example.com" className={inputClass} /></Field>
              )}

              {mode !== 'forgot' && (
                <Field label={isPasswordRecovery ? 'New Password' : 'Password'} icon={<Lock className="w-4 h-4" />}><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete={isPasswordRecovery ? 'new-password' : mode === 'signup' ? 'new-password' : 'current-password'} placeholder="••••••••" className={inputClass} /></Field>
              )}

              {isPasswordRecovery && (
                <Field label="Confirm New Password" icon={<Lock className="w-4 h-4" />}><input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="••••••••" className={inputClass} /></Field>
              )}

              {!isPasswordRecovery && mode === 'signup' && (
                <>
                  <label className="flex items-start gap-2.5 rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/40 dark:border-[#2d3e58] p-3 text-[11px] leading-5">
                    <input type="checkbox" checked={acceptLegal} onChange={(e)=>setAcceptLegal(e.target.checked)} className="mt-1"/>
                    <span>I agree to the <button type="button" onClick={()=>setLegalDocument('terms')} className="font-bold text-[#006b3f] underline">Terms of Use</button> and acknowledge the <button type="button" onClick={()=>setLegalDocument('privacy')} className="font-bold text-[#006b3f] underline">Privacy Notice</button>.</span>
                  </label>
                  <p className="text-[10px] leading-4 text-[#6e7a70] dark:text-[#bdcabe]">New accounts always start as Consumer. We will send a confirmation email before staff access can ever be granted. Field Agent and Verifier/Admin access can only be assigned later by the MarketPulse super admin.</p>
                </>
              )}

              <button type="submit" disabled={isLoading || googleLoading} className="w-full py-3 px-4 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 disabled:opacity-50">
                <span>{isLoading ? 'Processing…' : isPasswordRecovery ? 'Update Password' : mode === 'signin' ? 'Log In with Email' : mode === 'signup' ? 'Create Account with Email' : 'Send Reset Email'}</span><ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {!isPasswordRecovery && mode === 'signin' && (
              <div className="flex flex-wrap justify-between gap-2 text-[11px]">
                <button type="button" onClick={() => { setMode('forgot'); resetMessages(); }} className="font-bold text-[#006b3f] dark:text-[#8df8b7]">Forgot password?</button>
                {showResend && <button type="button" onClick={() => void resendConfirmation()} disabled={isLoading} className="font-bold text-[#0058be] dark:text-[#adc6ff] disabled:opacity-50">Resend confirmation email</button>}
              </div>
            )}

            {!isPasswordRecovery && mode === 'forgot' && (
              <button type="button" onClick={() => { setMode('signin'); resetMessages(); }} className="w-full text-center text-[11px] font-bold text-[#006b3f] dark:text-[#8df8b7]">Back to log in</button>
            )}

            {!isPasswordRecovery && mode !== 'forgot' && googleAvailable === true && (
              <p className="text-[10px] leading-4 text-center text-[#6e7a70] dark:text-[#bdcabe]">
                If Google creates a new MarketPulse account, you will review the Terms and Privacy Notice before continuing.
              </p>
            )}
          </div>
        </div>
      </div>
      <LegalDocumentModal document={legalDocument} onClose={()=>setLegalDocument(null)} />
    </>
  );
};

const GoogleMark: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.716v2.258h2.909c1.703-1.568 2.684-3.878 2.684-6.615Z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.258c-.806.54-1.836.859-3.047.859-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z"/>
    <path fill="#FBBC05" d="M3.963 10.707A5.41 5.41 0 0 1 3.681 9c0-.592.102-1.168.282-1.707V4.961H.956A9 9 0 0 0 0 9c0 1.45.347 2.823.956 4.039l3.007-2.332Z"/>
    <path fill="#EA4335" d="M9 3.579c1.321 0 2.507.454 3.441 1.346l2.581-2.581C13.463.891 11.425 0 9 0A9 9 0 0 0 .956 4.961l3.007 2.332C4.672 5.164 6.656 3.579 9 3.579Z"/>
  </svg>
);

const inputClass = 'w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl pl-9 pr-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#008751]';
const Field: React.FC<{label:string;icon:React.ReactNode;children:React.ReactNode}> = ({label,icon,children}) => (
  <label className="block">
    <span className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">{label}</span>
    <span className="relative block"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6e7a70]">{icon}</span>{children}</span>
  </label>
);
