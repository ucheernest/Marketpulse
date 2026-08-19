import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Globe2, RefreshCw, ShieldCheck, Users, Wrench } from 'lucide-react';
import {
  ClientErrorEvent,
  PilotReadinessSnapshot,
  PrivacyRequest,
  getAuthProviderAvailability,
  loadClientErrors,
  loadPilotReadinessSnapshot,
  loadPrivacyRequestsForAdmin,
  resolveClientError,
  updatePrivacyRequestStatus,
} from '../services/backendService';
import { useApp } from '../context/AppContext';

export const ProductionReadinessPanel: React.FC = () => {
  const { addToast } = useApp();
  const [pilot, setPilot] = useState<PilotReadinessSnapshot | null>(null);
  const [errors, setErrors] = useState<ClientErrorEvent[]>([]);
  const [privacy, setPrivacy] = useState<PrivacyRequest[]>([]);
  const [google, setGoogle] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [pilotRow, errorRows, privacyRows, providers] = await Promise.all([
        loadPilotReadinessSnapshot(),
        loadClientErrors(20),
        loadPrivacyRequestsForAdmin(20),
        getAuthProviderAvailability(),
      ]);
      setPilot(pilotRow);
      setErrors(errorRows);
      setPrivacy(privacyRows);
      setGoogle(providers.google);
    } catch (error: any) {
      addToast(error?.message || 'Could not load production readiness.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { void refresh(); }, [refresh]);

  const unresolvedErrors = errors.filter((row) => !row.resolved_at);
  const openPrivacy = privacy.filter((row) => row.status === 'submitted' || row.status === 'in_review');
  const host = typeof window === 'undefined' ? '' : window.location.hostname;
  const customDomain = host && !host.endsWith('.vercel.app') && host !== 'localhost';

  const scoreTone = (pilot?.readiness_score || 0) >= 80 ? 'text-emerald-700' : (pilot?.readiness_score || 0) >= 50 ? 'text-amber-700' : 'text-slate-700';

  return (
    <section className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-[#2170e4]"/><h2 className="font-bold">Production readiness</h2></div>
          <p className="text-xs text-[#6e7a70] mt-1">Live operational gates. No demo data contributes to these numbers.</p>
        </div>
        <button onClick={() => void refresh()} disabled={loading} className="p-2 rounded-xl border border-[#bdcabe]/40 disabled:opacity-50" aria-label="Refresh production readiness">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <ReadyCard label="Pilot score" value={`${pilot?.readiness_score ?? 0}%`} detail={pilot?.launch_ready ? 'Coverage threshold met' : 'Collect more independent verified observations'} ok={Boolean(pilot?.launch_ready)} valueClass={scoreTone} />
        <ReadyCard label="Active field agents" value={String(pilot?.active_field_agents ?? 0)} detail="Target: at least 2 independent agents" ok={(pilot?.active_field_agents ?? 0) >= 2} icon={<Users className="w-4 h-4"/>}/>
        <ReadyCard label="Google OAuth" value={google === null ? 'Checking' : google ? 'Enabled' : 'Not enabled'} detail="Provider must be configured in Supabase Auth" ok={google === true}/>
        <ReadyCard label="Public domain" value={host || 'Unknown'} detail={customDomain ? 'Custom domain active' : 'Still using platform / preview hostname'} ok={Boolean(customDomain)} icon={<Globe2 className="w-4 h-4"/>}/>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[#f8f9ff] dark:bg-[#121c2a] p-4">
          <div className="flex justify-between gap-3"><p className="text-sm font-bold">Client error telemetry</p><span className={`text-xs font-bold ${unresolvedErrors.length ? 'text-amber-700' : 'text-emerald-700'}`}>{unresolvedErrors.length} unresolved</span></div>
          <div className="mt-3 space-y-2">
            {unresolvedErrors.slice(0, 5).map((row) => <div key={row.id} className="rounded-xl bg-white dark:bg-[#182232] p-3 border border-[#bdcabe]/30 dark:border-[#2d3e58]"><div className="flex justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold truncate">{row.error_name}</p><p className="text-[11px] text-[#6e7a70] truncate mt-1">{row.message}</p></div><button onClick={async()=>{await resolveClientError(row.id,'Reviewed from admin readiness panel.'); await refresh();}} className="text-[10px] font-bold text-[#2170e4] shrink-0">Resolve</button></div></div>)}
            {!unresolvedErrors.length && <p className="text-xs text-[#6e7a70] py-3">No unresolved authenticated-client errors.</p>}
          </div>
        </div>

        <div className="rounded-2xl bg-[#f8f9ff] dark:bg-[#121c2a] p-4">
          <div className="flex justify-between gap-3"><p className="text-sm font-bold">Privacy requests</p><span className={`text-xs font-bold ${openPrivacy.length ? 'text-amber-700' : 'text-emerald-700'}`}>{openPrivacy.length} open</span></div>
          <div className="mt-3 space-y-2">
            {openPrivacy.slice(0, 5).map((row) => <div key={row.id} className="rounded-xl bg-white dark:bg-[#182232] p-3 border border-[#bdcabe]/30 dark:border-[#2d3e58]"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold capitalize">{row.request_type} request</p><p className="text-[11px] text-[#6e7a70] mt-1">{new Date(row.created_at).toLocaleString()}</p></div><select value={row.status} onChange={async(e)=>{await updatePrivacyRequestStatus(row.id,e.target.value as PrivacyRequest['status']); await refresh();}} className="text-[10px] rounded-lg border border-[#bdcabe]/40 bg-white dark:bg-[#182232] px-2 py-1"><option value="submitted">Submitted</option><option value="in_review">In review</option><option value="completed">Completed</option><option value="rejected">Rejected</option></select></div></div>)}
            {!openPrivacy.length && <p className="text-xs text-[#6e7a70] py-3">No open privacy requests.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs leading-5 text-amber-900 dark:text-amber-200">
          <p className="font-bold">External launch gates</p>
          <p className="mt-1">Leaked-password protection, Google Client ID/Secret, Auth redirect allow-list, DNS/custom-domain ownership, and real field-agent identities cannot be fabricated by application code. The UI and backend are prepared for them; those settings must be supplied by the account/domain owner.</p>
        </div>
      </div>
    </section>
  );
};

const ReadyCard: React.FC<{label:string;value:string;detail:string;ok:boolean;icon?:React.ReactNode;valueClass?:string}>=({label,value,detail,ok,icon,valueClass})=><div className="rounded-2xl border border-[#bdcabe]/30 dark:border-[#2d3e58] p-4"><div className="flex items-center justify-between gap-2"><span className="text-[11px] font-bold uppercase tracking-wide text-[#6e7a70]">{label}</span>{icon || (ok?<CheckCircle2 className="w-4 h-4 text-emerald-600"/>:<ShieldCheck className="w-4 h-4 text-amber-600"/>)}</div><p className={`text-xl font-bold mt-2 truncate ${valueClass||''}`}>{value}</p><p className="text-[11px] text-[#6e7a70] mt-1 leading-4">{detail}</p></div>;
