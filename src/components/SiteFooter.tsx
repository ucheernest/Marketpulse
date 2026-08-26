import React, { useState } from 'react';
import { LegalDocument, LegalDocumentModal } from './LegalDocumentModal';

export const SiteFooter: React.FC = () => {
  const [document, setDocument] = useState<LegalDocument | null>(null);
  return (
    <>
      <footer className="border-t border-[#bdcabe]/35 dark:border-[#2d3e58] bg-white/60 dark:bg-[#121c2a] pb-20 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-[11px] text-[#6e7a70] dark:text-[#9eaa9f]">
          <p>Truprice.ng reports verified market observations and aggregates. A seller's actual quote can still vary by vendor, quantity, quality, location and time.</p>
          <div className="flex gap-4 shrink-0 font-semibold">
            <button onClick={() => setDocument('terms')} className="hover:text-[#006b3f] dark:hover:text-[#8df8b7] underline underline-offset-2">Terms of Use</button>
            <button onClick={() => setDocument('privacy')} className="hover:text-[#006b3f] dark:hover:text-[#8df8b7] underline underline-offset-2">Privacy Notice</button>
          </div>
        </div>
      </footer>
      <LegalDocumentModal document={document} onClose={() => setDocument(null)} />
    </>
  );
};
