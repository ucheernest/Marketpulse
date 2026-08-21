import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, RefreshCw, ShieldAlert, Target, Users } from 'lucide-react';
import { getSupabase } from '../services/supabaseClient';
import { useApp } from '../context/AppContext';

type AcceptanceRun = {
  id: string;
  status: 'in_progress' | 'passed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string | null;
  notes?: string | null;
};

type AcceptanceStep = {
  run_id: string;
  step_key: string;
  step_order: number;
  title: string;
  status: 'pending' | 'passed' | 'failed' | 'blocked' | 'not_applicable';
  notes?: string | null;
  evidence?: string | null;
};

type AgentSlot = {
  id: string;
  slot_code: string;
  status: 'open' | 'assigned' | 'active' | 'closed';
  target_market_id?: string | null;
  assigned_user_id?: string | null;
  markets?: { name?: string | null } | { name?: string | null }[] | null;
};

type Coverage = {
  product_id: string;
  product_name: string;
  recent_verified_observations: number;
  distinct_market_count: number;
  distinct_agent_count: number;
  qualified: boolean;
  priority_score: number;
};

type Incident = {
  id: string;
  severity: 'SEV-1' | 'SEV-2' | 'SEV-3';
  title: string;
  status: 'open' | 'monitoring' | 'resolved';
  started_at: string;
  notes?: string | null;
};

type EvidenceQueueRow = { evidence_id: string; status: 'pending_review' | 'approved' | 'legal_hold' | 'deleted' };

const marketLabel = (slot: AgentSlot) => {
  if (Array.isArray(slot.markets)) return slot.markets[0]?.name || 'Assigned market';
  return slot.markets?.name || 'Assigned market';
};

export const LaunchOperationsPanel: React.FC = () => {
  const { addToast, currentRole } = useApp();
  const [run, setRun] = useState<AcceptanceRun | null>(null);
  const [steps, setSteps] = useState<AcceptanceStep[]>([]);
  const [slots, setSlots] = useState<AgentSlot[]>([]);
  const [coverage, setCoverage] = useState<Coverage[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [evidenceQueue, setEvidenceQueue] = useState<EvidenceQueueRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState<Incident['severity']>('SEV-3');

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    try {
      const [runRes, coverageRes, incidentRes, evidenceRes] = await Promise.all([
        supabase.from('production_acceptance_runs').select('*').order('started_at', { ascending: false }).limit(1),
        supabase.from('pilot_product_coverage').select('*').order('qualified', { ascending: true }).order('priority_score', { ascending: false }).limit(20),
        supabase.from('operational_incidents').select('*').neq('status', 'resolved').order('started_at', { ascending: false }).limit(20),
        supabase.from('evidence_retention_queue').select('evidence_id,status').limit(500),
      ]);
      if (runRes.error) throw runRes.error;
      if (coverageRes.error) throw coverageRes.error;
      if (incidentRes.error) throw incidentRes.error;
      if (evidenceRes.error) throw evidenceRes.error;

      const latest = (runRes.data?.[0] || null) as AcceptanceRun | null;
      setRun(latest);
      setCoverage((coverageRes.data || []) as Coverage[]);
      setIncidents((incidentRes.data || []) as Incident[]);
      setEvidenceQueue((evidenceRes.data || []) as EvidenceQueueRow[]);

      if (latest) {
        const stepRes = await supabase.from('production_acceptance_steps').select('*').eq('run_id', latest.id).order('step_order');
        if (stepRes.error) throw stepRes.error;
        setSteps((stepRes.data || []) as AcceptanceStep[]);
      } else {
        setSteps([]);
      }

      if (currentRole === 'super_admin') {
        const slotRes = await supabase.from('pilot_agent_slots').select('*,markets(name)').order('slot_code');
        if (slotRes.error) throw slotRes.error;
        setSlots((slotRes.data || []) as AgentSlot[]);
      } else {
        setSlots([]);
      }
    } catch (error: any) {
      addToast(error?.message || 'Could not load launch operations.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, currentRole]);

  useEffect(() => { void refresh(); }, [refresh]);

  const startAcceptance = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const { error } = await supabase.rpc('start_production_acceptance_run', { p_notes: 'Port Harcourt production launch acceptance run.' });
      if (error) throw error;
      addToast('Production acceptance run started.', 'success');
      await refresh();
    } catch (error: any) {
      addToast(error?.message || 'Could not start acceptance run.', 'error');
    }
  };

  const setStepStatus = async (step: AcceptanceStep, status: AcceptanceStep['status']) => {
    const supabase = getSupabase();
    if (!supabase || !run) return;
    try {
      const { error } = await supabase.rpc('update_production_acceptance_step', {
        p_run_id: run.id,
        p_step_key: step.step_key,
        p_status: status,
        p_notes: status === 'blocked' ? 'Blocked until the required external identity, domain, platform setting or real-world field action is completed.' : null,
        p_evidence: null,
      });
      if (error) throw error;
      await refresh();
    } catch (error: any) {
      addToast(error?.message || 'Could not update acceptance step.', 'error');
    }
  };

  const createIncident = async () => {
    const title = incidentTitle.trim();
    if (title.length < 3) return;
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sign in again to create an incident.');
      const { error } = await supabase.from('operational_incidents').insert({
        severity: incidentSeverity,
        title,
        status: 'open',
        created_by_user_id: user.id,
      });
      if (error) throw error;
      setIncidentTitle('');
      addToast('Operational incident opened.', 'success');
      await refresh();
    } catch (error: any) {
      addToast(error?.message || 'Could not open incident.', 'error');
    }
  };

  const setIncidentStatus = async (id: string, status: Incident['status']) => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const { error } = await supabase.from('operational_incidents').update({ status }).eq('id', id);
      if (error) throw error;
      await refresh();
    } catch (error: any) {
      addToast(error?.message || 'Could not update incident.', 'error');
    }
  };

  const passedSteps = steps.filter((step) => step.status === 'passed' || step.status === 'not_applicable').length;
  const qualifiedProducts = coverage.filter((row) => row.qualified).length;
  const evidenceCounts = useMemo(() => ({
    pending: evidenceQueue.filter((row) => row.status === 'pending_review').length,
    approved: evidenceQueue.filter((row) => row.status === 'approved').length,
    hold: evidenceQueue.filter((row) => row.status === 'legal_hold').length,
  }), [evidenceQueue]);

  return (
    <section className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-[#2170e4]"/><h2 className="font-bold">Launch operations</h2></div>
          <p className="text-xs text-[#6e7a70] mt-1">Acceptance, staffing, incident and real-data coverage controls. Synthetic prices do not count.</p>
        </div>
        <div className="flex gap-2">
          {currentRole === 'super_admin' && !run && <button onClick={()=>void startAcceptance()} className="px-3 py-2 rounded-xl bg-[#2170e4] text-white text-xs font-bold">Start acceptance run</button>}
          <button onClick={()=>void refresh()} disabled={loading} className="p-2 rounded-xl border border-[#bdcabe]/40 disabled:opacity-50" aria-label="Refresh launch operations"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/></button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Acceptance" value={run ? `${passedSteps}/${steps.length}` : 'Not started'} ok={Boolean(run?.status === 'passed')} detail={run ? run.status.replace(/_/g,' ') : 'Super admin starts the production test run'} />
        <Metric label="Pilot products qualified" value={`${qualifiedProducts}/${coverage.length || 20}`} ok={qualifiedProducts >= 10} detail="3 verified observations · 2 markets · 2 agents · 72h" />
        <Metric label="Open field-agent slots" value={String(slots.filter((slot)=>slot.status==='open').length)} ok={slots.length > 0 && slots.every((slot)=>slot.status!=='open')} detail="Real people must sign up before assignment" />
        <Metric label="Evidence retention" value={`${evidenceCounts.pending} review`} ok={evidenceCounts.pending === 0} detail={`${evidenceCounts.approved} approved · ${evidenceCounts.hold} legal hold`} />
      </div>

      {run && (
        <div className="rounded-2xl bg-[#f8f9ff] dark:bg-[#121c2a] p-4">
          <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold">Production acceptance run</p><p className="text-[11px] text-[#6e7a70] mt-1">Started {new Date(run.started_at).toLocaleString()} · {run.status.replace(/_/g,' ')}</p></div><span className="text-xs font-bold">{passedSteps}/{steps.length} complete</span></div>
          <div className="mt-3 space-y-2">
            {steps.map((step)=><div key={step.step_key} className="rounded-xl bg-white dark:bg-[#182232] border border-[#bdcabe]/30 dark:border-[#2d3e58] p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"><div><p className="text-xs font-bold">{step.step_order}. {step.title}</p>{step.notes&&<p className="text-[11px] text-[#6e7a70] mt-1">{step.notes}</p>}</div><select value={step.status} onChange={(e)=>void setStepStatus(step,e.target.value as AcceptanceStep['status'])} className="text-[11px] rounded-lg border border-[#bdcabe]/40 bg-white dark:bg-[#182232] px-2 py-1.5"><option value="pending">Pending</option><option value="passed">Passed</option><option value="blocked">Blocked</option><option value="failed">Failed</option><option value="not_applicable">N/A</option></select></div>)}
          </div>
        </div>
      )}

      {currentRole === 'super_admin' && slots.length > 0 && (
        <div className="rounded-2xl bg-[#f8f9ff] dark:bg-[#121c2a] p-4">
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#2170e4]"/><p className="text-sm font-bold">Port Harcourt pilot staffing</p></div>
          <div className="grid md:grid-cols-3 gap-2 mt-3">{slots.map((slot)=><div key={slot.id} className="rounded-xl bg-white dark:bg-[#182232] border border-[#bdcabe]/30 dark:border-[#2d3e58] p-3"><p className="text-xs font-bold">{slot.slot_code}</p><p className="text-[11px] text-[#6e7a70] mt-1">{marketLabel(slot)}</p><span className={`inline-flex mt-2 rounded-full px-2 py-1 text-[10px] font-bold ${slot.status==='open'?'bg-amber-50 text-amber-700':'bg-emerald-50 text-emerald-700'}`}>{slot.status}</span></div>)}</div>
          <p className="text-[11px] text-[#6e7a70] mt-3">After a real person creates an account, promote them in Users & access and assign the target market. These slots deliberately do not create fake identities.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[#f8f9ff] dark:bg-[#121c2a] p-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Target className="w-4 h-4 text-[#2170e4]"/><p className="text-sm font-bold">Real pilot coverage gaps</p></div><span className="text-[11px] text-[#6e7a70]">72-hour window</span></div>
          <div className="mt-3 space-y-2">{coverage.slice(0,8).map((row)=><div key={row.product_id} className="rounded-xl bg-white dark:bg-[#182232] border border-[#bdcabe]/30 dark:border-[#2d3e58] p-3"><div className="flex justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold truncate">{row.product_name}</p><p className="text-[11px] text-[#6e7a70] mt-1">{row.recent_verified_observations}/3 observations · {row.distinct_market_count}/2 markets · {row.distinct_agent_count}/2 agents</p></div>{row.qualified?<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0"/>:<span className="text-[10px] font-bold text-amber-700">P{row.priority_score}</span>}</div></div>)}{!coverage.length&&<p className="text-xs text-[#6e7a70] py-4">Coverage matrix is empty until readiness refresh runs.</p>}</div>
        </div>

        <div className="rounded-2xl bg-[#f8f9ff] dark:bg-[#121c2a] p-4">
          <div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-600"/><p className="text-sm font-bold">Operational incidents</p></div>
          <div className="mt-3 flex gap-2"><select value={incidentSeverity} onChange={(e)=>setIncidentSeverity(e.target.value as Incident['severity'])} className="text-xs rounded-lg border border-[#bdcabe]/40 bg-white dark:bg-[#182232] px-2"><option>SEV-1</option><option>SEV-2</option><option>SEV-3</option></select><input value={incidentTitle} onChange={(e)=>setIncidentTitle(e.target.value)} placeholder="Incident title" className="min-w-0 flex-1 text-xs rounded-lg border border-[#bdcabe]/40 bg-white dark:bg-[#182232] px-3 py-2"/><button onClick={()=>void createIncident()} className="px-3 py-2 rounded-lg bg-[#121c2a] dark:bg-white text-white dark:text-[#121c2a] text-xs font-bold">Open</button></div>
          <div className="mt-3 space-y-2">{incidents.map((incident)=><div key={incident.id} className="rounded-xl bg-white dark:bg-[#182232] border border-[#bdcabe]/30 dark:border-[#2d3e58] p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold">{incident.severity} · {incident.title}</p><p className="text-[11px] text-[#6e7a70] mt-1">{incident.status} · {new Date(incident.started_at).toLocaleString()}</p></div><select value={incident.status} onChange={(e)=>void setIncidentStatus(incident.id,e.target.value as Incident['status'])} className="text-[10px] rounded-lg border border-[#bdcabe]/40 bg-white dark:bg-[#182232] px-2 py-1"><option value="open">Open</option><option value="monitoring">Monitoring</option><option value="resolved">Resolved</option></select></div></div>)}{!incidents.length&&<p className="text-xs text-[#6e7a70] py-4">No open incidents.</p>}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5"/>
        <p className="text-xs leading-5 text-amber-900 dark:text-amber-200">A production acceptance run can track external launch gates, but it cannot make them true. Google credentials, leaked-password protection, Auth redirect settings, DNS ownership, backup secrets and real field observations remain blocked until the account owner or real field team supplies the required external input.</p>
      </div>
    </section>
  );
};

const Metric:React.FC<{label:string;value:string;detail:string;ok:boolean}>=({label,value,detail,ok})=><div className="rounded-2xl border border-[#bdcabe]/30 dark:border-[#2d3e58] p-4"><div className="flex items-center justify-between gap-2"><span className="text-[11px] font-bold uppercase tracking-wide text-[#6e7a70]">{label}</span>{ok?<CheckCircle2 className="w-4 h-4 text-emerald-600"/>:<AlertTriangle className="w-4 h-4 text-amber-600"/>}</div><p className="text-xl font-bold mt-2 truncate">{value}</p><p className="text-[11px] text-[#6e7a70] mt-1 leading-4">{detail}</p></div>;
