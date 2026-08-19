import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

export type LegalDocument = 'terms' | 'privacy';

const TermsBody = () => (
  <div className="space-y-4">
    <p><strong>MarketPulse provides price intelligence, not a guarantee of a seller's final price.</strong> Prices can change by vendor, location, quantity, quality, and time of day.</p>
    <section><h3 className="font-bold mb-1">Using MarketPulse</h3><p>Use the service lawfully and do not submit false, manipulated, duplicate, or misleading information. Public users may report suspected inaccuracies; reports do not directly overwrite published prices.</p></section>
    <section><h3 className="font-bold mb-1">Verified price observations</h3><p>Published prices are calculated from observations that pass MarketPulse's collection and verification workflow. A confidence score describes the available evidence; it is not a promise that every seller will quote the same amount.</p></section>
    <section><h3 className="font-bold mb-1">Field agents and administrators</h3><p>Field-agent access is assigned by MarketPulse. Agents must collect genuine market evidence and location data. Verifier/admin access is restricted and may be revoked when necessary to protect data integrity.</p></section>
    <section><h3 className="font-bold mb-1">Accounts</h3><p>You are responsible for keeping your login credentials secure. MarketPulse may deactivate accounts used to abuse the service, compromise data quality, or attempt unauthorized access.</p></section>
    <section><h3 className="font-bold mb-1">Service changes</h3><p>MarketPulse may update product coverage, markets, methodology, or these terms as the service develops. When a material new version requires renewed acceptance, the app will ask you again.</p></section>
  </div>
);

const PrivacyBody = () => (
  <div className="space-y-4">
    <p>MarketPulse collects only the information needed to operate accounts, personalize the product, protect the price-verification network, and improve data quality.</p>
    <section><h3 className="font-bold mb-1">Account information</h3><p>Account data can include your name, email, profile picture, phone number, preferred city, and optional profile fields such as gender, date of birth, state of residence, and bio.</p></section>
    <section><h3 className="font-bold mb-1">Consumer activity</h3><p>When signed in, MarketPulse may store saved products and inaccurate-price reports so those actions follow your account.</p></section>
    <section><h3 className="font-bold mb-1">Field-agent evidence</h3><p>Field agents provide price observations, capture time, device GPS, GPS accuracy, assigned market, and evidence photographs. This information is used for verification, anomaly detection, auditability, and anti-fraud controls.</p></section>
    <section><h3 className="font-bold mb-1">Photos and visibility</h3><p>Profile avatars are intended to be visible as profile identity. Field evidence is stored separately in a private evidence bucket and is available only to authorized operational users under access-control rules.</p></section>
    <section><h3 className="font-bold mb-1">Access and retention</h3><p>MarketPulse uses role-based access controls so consumers, field agents, verifiers, and the super admin receive different levels of access. Operational records and audit history may be retained when needed to preserve the integrity of the price-verification system.</p></section>
    <section><h3 className="font-bold mb-1">Your profile</h3><p>You can update supported personal profile fields in the app. Your application role cannot be changed through your own profile.</p></section>
  </div>
);

export const LegalDocumentModal: React.FC<{ document: LegalDocument | null; onClose: () => void }> = ({ document, onClose }) => {
  if (!document) return null;
  const title = document === 'terms' ? 'MarketPulse Terms of Use' : 'MarketPulse Privacy Notice';
  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center">
      <div className="w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-3xl bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] shadow-2xl flex flex-col">
        <div className="px-5 sm:px-6 py-4 border-b border-[#bdcabe]/30 dark:border-[#2d3e58] flex items-center justify-between">
          <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#008751]"/><div><h2 className="font-bold">{title}</h2><p className="text-[11px] text-[#6e7a70]">Version 2026-08</p></div></div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#eff4ff] dark:hover:bg-[#25344a]" aria-label="Close"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto text-sm leading-6 text-[#3e4a41] dark:text-[#d8e3d9]">{document === 'terms' ? <TermsBody/> : <PrivacyBody/>}</div>
      </div>
    </div>
  );
};
