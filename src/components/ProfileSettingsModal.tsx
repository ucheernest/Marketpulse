import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  LogOut,
  KeyRound,
  MapPin,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ProfileGender,
  PrivacyRequest,
  loadMyPrivacyRequests,
  submitPrivacyRequest,
  updateMyProfile,
  uploadProfileAvatar,
} from '../services/backendService';

const GENDER_OPTIONS: Array<{ value: '' | ProfileGender; label: string }> = [
  { value: '', label: 'Prefer not to specify' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const ProfileSettingsModal: React.FC = () => {
  const {
    currentProfile,
    currentRole,
    isAuthenticated,
    authLoading,
    refreshAuthProfile,
    logout,
    setActiveView,
    addToast,
    openAuthModal,
  } = useApp();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'' | ProfileGender>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('Port Harcourt');
  const [state, setState] = useState('Rivers State');
  const [country, setCountry] = useState('Nigeria');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [privacyRequests, setPrivacyRequests] = useState<PrivacyRequest[]>([]);
  const [privacyBusy, setPrivacyBusy] = useState(false);

  useEffect(() => {
    if (!currentProfile) return;
    setFullName(currentProfile.full_name || '');
    setPhone(currentProfile.phone_number || '');
    setGender((currentProfile.gender || '') as '' | ProfileGender);
    setDateOfBirth(currentProfile.date_of_birth || '');
    setCity(currentProfile.preferred_city || 'Port Harcourt');
    setState(currentProfile.state_of_residence || 'Rivers State');
    setCountry(currentProfile.country || 'Nigeria');
    setBio(currentProfile.bio || '');
  }, [currentProfile]);

  useEffect(() => {
    if (!isAuthenticated) { setPrivacyRequests([]); return; }
    void loadMyPrivacyRequests().then(setPrivacyRequests).catch(() => setPrivacyRequests([]));
  }, [isAuthenticated, currentProfile?.id]);

  const handlePrivacyRequest = async (requestType: PrivacyRequest['request_type']) => {
    if (requestType === 'deletion' && !window.confirm('Submit an account/data deletion request? MarketPulse will review the request before deleting records required for fraud, verification, legal or audit obligations.')) return;
    setPrivacyBusy(true);
    try {
      await submitPrivacyRequest(requestType);
      setPrivacyRequests(await loadMyPrivacyRequests());
      addToast(`${requestType.charAt(0).toUpperCase()+requestType.slice(1)} privacy request submitted.`, 'success');
    } catch (error: any) {
      addToast(error?.message || 'Could not submit privacy request.', 'error');
    } finally { setPrivacyBusy(false); }
  };

  const initials = useMemo(() => {
    const name = currentProfile?.full_name?.trim();
    if (!name) return 'MP';
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [currentProfile?.full_name]);

  const roleLabel =
    currentRole === 'super_admin'
      ? 'Super Admin'
      : currentRole === 'admin'
        ? 'Verifier / Admin'
        : currentRole === 'agent'
          ? 'Field Agent'
          : 'Consumer';

  const handleAvatar = async (file?: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadProfileAvatar(file);
      await refreshAuthProfile();
      addToast('Profile picture updated.', 'success');
    } catch (error: any) {
      addToast(error?.message || 'Could not upload profile picture.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim()) {
      addToast('Please enter your full name.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await updateMyProfile({
        full_name: fullName,
        phone_number: phone || null,
        preferred_city: city,
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
        country,
        state_of_residence: state || null,
        bio: bio || null,
      });
      await refreshAuthProfile();
      addToast('Profile updated successfully.', 'success');
    } catch (error: any) {
      addToast(error?.message || 'Could not update your profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-sm text-[#6e7a70] dark:text-[#bdcabe]">
        Loading your MarketPulse account…
      </div>
    );
  }

  if (!isAuthenticated || !currentProfile) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#008751]/10 text-[#008751] flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[#121c2a] dark:text-[#f8f9ff]">Your MarketPulse profile</h1>
          <p className="text-sm text-[#6e7a70] dark:text-[#bdcabe] mt-2 mb-6">
            Sign in to manage your name, photo, personal details, saved preferences and account access.
          </p>
          <button
            onClick={openAuthModal}
            className="px-5 py-3 rounded-xl bg-[#008751] text-white text-sm font-bold hover:bg-[#006b3f]"
          >
            Sign In / Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="profile-settings-screen" className="max-w-3xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveView(currentRole === 'agent' ? 'agent-dashboard' : currentRole === 'admin' || currentRole === 'super_admin' ? 'admin-overview' : 'home')}
          className="p-2 rounded-full hover:bg-[#eff4ff] dark:hover:bg-[#25344a]"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Profile & Account</h1>
          <p className="text-xs text-[#6e7a70] dark:text-[#bdcabe]">
            Your identity is attached to your verified MarketPulse login.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative w-24 h-24 shrink-0">
            {currentProfile.avatar_url ? (
              <img
                src={currentProfile.avatar_url}
                alt={currentProfile.full_name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#182232] ring-2 ring-[#008751]/50"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#008751] text-white flex items-center justify-center text-2xl font-bold ring-2 ring-[#008751]/30">
                {initials}
              </div>
            )}
            <label className="absolute -right-1 -bottom-1 w-9 h-9 rounded-full bg-[#121c2a] text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#006b3f]">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => void handleAvatar(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold truncate">{currentProfile.full_name || 'MarketPulse User'}</h2>
              <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7]">
                {roleLabel}
              </span>
            </div>
            <p className="text-sm text-[#6e7a70] dark:text-[#bdcabe] mt-1">{currentProfile.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eff4ff] dark:bg-[#25344a] text-[10px] font-bold text-[#3e4a41] dark:text-[#dce2f9]">
                <KeyRound className="w-3 h-3" />
                {currentProfile.auth_provider === 'google' ? 'Signed in with Google' : 'Email & password'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${currentProfile.email_confirmed_at ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'}`}>
                <CheckCircle2 className="w-3 h-3" />
                {currentProfile.email_confirmed_at ? 'Identity confirmed' : 'Email confirmation pending'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#006b3f] dark:text-[#8df8b7] mt-2">
              <MapPin className="w-3.5 h-3.5" />
              {currentProfile.preferred_city}, {currentProfile.state_of_residence || 'Nigeria'}
            </div>
            {isUploading && <p className="text-xs mt-2 text-[#2170e4]">Uploading profile picture…</p>}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div>
          <h3 className="font-bold text-base">Personal information</h3>
          <p className="text-xs text-[#6e7a70] dark:text-[#bdcabe] mt-1">
            These details belong to your account. Your application role cannot be changed here.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} required />
          </Field>
          <Field label="Email address">
            <input value={currentProfile.email || ''} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
          </Field>
          <Field label="Phone number">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +234…" className={inputClass} />
          </Field>
          <Field label="Gender">
            <select value={gender} onChange={(e) => setGender(e.target.value as '' | ProfileGender)} className={inputClass}>
              {GENDER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </Field>
          <Field label="Date of birth">
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} max={new Date().toISOString().slice(0, 10)} className={inputClass} />
          </Field>
          <Field label="Preferred city">
            <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
          </Field>
          <Field label="State of residence">
            <input value={state} onChange={(e) => setState(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Country">
            <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
          </Field>
        </div>

        <Field label="Short bio (optional)">
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} rows={3} className={inputClass} placeholder="A short description about you…" />
        </Field>

        <div className="rounded-2xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/30 dark:border-[#2d3e58] p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#008751] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold">Account access is controlled centrally</p>
            <p className="text-xs text-[#6e7a70] dark:text-[#bdcabe] mt-1">
              Only the MarketPulse super admin can appoint field agents or verifier/admin accounts. Users cannot promote themselves from this profile page.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between border-t border-[#bdcabe]/30 dark:border-[#2d3e58] pt-5">
          <button
            type="button"
            onClick={async () => {
              await logout();
              addToast('Signed out successfully.', 'info');
            }}
            className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm font-bold flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <CheckCircle2 className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>

      <section className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base">Privacy & data rights</h3>
          <p className="text-xs text-[#6e7a70] dark:text-[#bdcabe] mt-1">Request a copy of your account data, a correction review, export, or deletion review. Requests are recorded with an auditable status.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <button disabled={privacyBusy} onClick={()=>void handlePrivacyRequest('access')} className="px-3 py-2.5 rounded-xl border border-[#bdcabe]/50 text-xs font-bold disabled:opacity-50">Request access</button>
          <button disabled={privacyBusy} onClick={()=>void handlePrivacyRequest('export')} className="px-3 py-2.5 rounded-xl border border-[#bdcabe]/50 text-xs font-bold disabled:opacity-50">Request export</button>
          <button disabled={privacyBusy} onClick={()=>void handlePrivacyRequest('correction')} className="px-3 py-2.5 rounded-xl border border-[#bdcabe]/50 text-xs font-bold disabled:opacity-50">Request correction</button>
          <button disabled={privacyBusy} onClick={()=>void handlePrivacyRequest('deletion')} className="px-3 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold disabled:opacity-50">Request deletion</button>
        </div>
        <div className="divide-y divide-[#bdcabe]/30 dark:divide-[#2d3e58]">
          {privacyRequests.slice(0,6).map((request)=><div key={request.id} className="py-3 flex items-center justify-between gap-3 text-xs"><div><p className="font-bold capitalize">{request.request_type} request</p><p className="text-[#6e7a70] mt-1">{new Date(request.created_at).toLocaleString()}</p></div><span className="px-2.5 py-1 rounded-full bg-[#eff4ff] dark:bg-[#25344a] font-bold capitalize">{request.status.replace('_',' ')}</span></div>)}
          {!privacyRequests.length && <p className="py-4 text-xs text-[#6e7a70]">No privacy requests submitted.</p>}
        </div>
      </section>
    </div>
  );
};

const inputClass = 'w-full rounded-xl border border-[#bdcabe]/50 dark:border-[#2d3e58] bg-[#f8f9ff] dark:bg-[#121c2a] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block space-y-1.5">
    <span className="text-xs font-bold uppercase tracking-wide text-[#3e4a41] dark:text-[#bdcabe]">{label}</span>
    {children}
  </label>
);
