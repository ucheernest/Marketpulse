import React, { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { acceptLegalTerms, PRIVACY_VERSION, TERMS_VERSION } from '../services/backendService';
import { LegalDocument, LegalDocumentModal } from './LegalDocumentModal';

export const LegalConsentModal: React.FC = () => {
  const { currentProfile, refreshAuthProfile, addToast, isPasswordRecovery, isAuthModalOpen } = useApp();
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const needsAcceptance = useMemo(() => Boolean(currentProfile && (
    currentProfile.terms_version !== TERMS_VERSION || !currentProfile.terms_accepted_at ||
    currentProfile.privacy_version !== PRIVACY_VERSION || !currentProfile.privacy_accepted_at
  )), [currentProfile]);

  if (!needsAcceptance || isPasswordRecovery || isAuthModalOpen) return null;
  const submit = async () => {
    if (!accepted) return;
    setBusy(true);
    try {
      await acceptLegalTerms();
      await refreshAuthProfile();
      addToast('Terms and privacy acknowledgement saved.', 'success');
    } catch (error: any) {
      addToast(error?.message || 'Could not save your acknowledgement.', 'error');
    } finally { setBusy(false); }
  };

  return <>
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] shadow-2xl p-6 space-y-5">
        <div className="w-11 h-11 rounded-2xl bg-[#008751]/10 text-[#008751] flex items-center justify-center"><ShieldCheck className="w-6 h-6"/></div>
        <div><h2 className="text-xl font-bold">Review Truprice.ng account terms</h2><p className="text-sm text-[#6e7a70] mt-2">Before continuing with this account, acknowledge the current Terms of Use and Privacy Notice. This does not change your role or permissions.</p></div>
        <div className="flex gap-3 text-xs font-bold"><button onClick={()=>setDocument('terms')} className="text-[#006b3f] underline">Read Terms of Use</button><button onClick={()=>setDocument('privacy')} className="text-[#006b3f] underline">Read Privacy Notice</button></div>
        <label className="flex items-start gap-3 rounded-2xl bg-[#f8f9ff] dark:bg-[#121c2a] p-4 text-sm"><input type="checkbox" checked={accepted} onChange={(e)=>setAccepted(e.target.checked)} className="mt-1"/><span>I agree to the Terms of Use and acknowledge the Privacy Notice.</span></label>
        <button disabled={!accepted||busy} onClick={()=>void submit()} className="w-full py-3 rounded-xl bg-[#008751] disabled:opacity-40 text-white font-bold text-sm">{busy?'Saving…':'Accept & Continue'}</button>
      </div>
    </div>
    <LegalDocumentModal document={document} onClose={()=>setDocument(null)}/>
  </>;
};
