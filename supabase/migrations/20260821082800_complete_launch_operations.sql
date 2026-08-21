-- Complete MarketPulse launch operations: acceptance tracking, incident handling,
-- pilot staffing/coverage and evidence-retention review.

create table if not exists public.production_acceptance_runs (
  id uuid primary key default gen_random_uuid(),
  started_by_user_id uuid not null references public.profiles(id) on delete restrict,
  environment text not null default 'production' check (environment in ('production','preview','staging')),
  status text not null default 'in_progress' check (status in ('in_progress','passed','failed','cancelled')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text
);
alter table public.production_acceptance_runs enable row level security;
revoke all on public.production_acceptance_runs from anon, authenticated;
grant select on public.production_acceptance_runs to authenticated;
drop policy if exists production_acceptance_runs_admin_read on public.production_acceptance_runs;
create policy production_acceptance_runs_admin_read on public.production_acceptance_runs
for select to authenticated using (private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role]));

create table if not exists public.production_acceptance_steps (
  run_id uuid not null references public.production_acceptance_runs(id) on delete cascade,
  step_key text not null,
  step_order integer not null,
  title text not null,
  status text not null default 'pending' check (status in ('pending','passed','failed','blocked','not_applicable')),
  checked_by_user_id uuid references public.profiles(id) on delete set null,
  checked_at timestamptz,
  evidence text,
  notes text,
  primary key (run_id, step_key)
);
alter table public.production_acceptance_steps enable row level security;
revoke all on public.production_acceptance_steps from anon, authenticated;
grant select on public.production_acceptance_steps to authenticated;
drop policy if exists production_acceptance_steps_admin_read on public.production_acceptance_steps;
create policy production_acceptance_steps_admin_read on public.production_acceptance_steps
for select to authenticated using (private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role]));

create or replace function private.start_production_acceptance_run(p_notes text default null)
returns uuid language plpgsql security definer set search_path=public,private,auth as $$
declare v_uid uuid := auth.uid(); v_run uuid;
begin
  if v_uid is null or not private.has_role(array['super_admin'::app_user_role]) then
    raise exception 'Super admin required';
  end if;
  insert into public.production_acceptance_runs(started_by_user_id, notes)
  values(v_uid, left(p_notes,2000)) returning id into v_run;
  insert into public.production_acceptance_steps(run_id,step_key,step_order,title) values
    (v_run,'consumer_signup',10,'Consumer signup, confirmation, login and password reset'),
    (v_run,'google_oauth',20,'Google OAuth creates a public-user profile'),
    (v_run,'agent_onboarding',30,'Field agent role and assigned-market access'),
    (v_run,'field_capture_online',40,'Online camera + fresh GPS price submission'),
    (v_run,'field_capture_offline',50,'Offline capture queue and reconnect sync'),
    (v_run,'verification_recheck_reject',60,'Verifier recheck and rejection paths'),
    (v_run,'verification_approve_publish',70,'Approval publishes trusted aggregates after coverage threshold'),
    (v_run,'consumer_report_loop',80,'Consumer inaccurate-price report through admin resolution'),
    (v_run,'monitoring_backup',90,'Health monitoring, backup artifact and recovery drill verified'),
    (v_run,'security_launch_gates',100,'Password protection, redirects, domain and SMTP launch gates verified');
  insert into public.audit_logs(actor_user_id,actor_role,action_type,entity_table,entity_id,new_data)
  values(v_uid,'super_admin'::app_user_role,'start_production_acceptance_run','production_acceptance_runs',v_run,jsonb_build_object('notes',left(p_notes,2000)));
  return v_run;
end $$;
revoke all on function private.start_production_acceptance_run(text) from public,anon,authenticated;

create or replace function public.start_production_acceptance_run(p_notes text default null)
returns uuid language sql security definer set search_path=public,private,auth as $$
  select private.start_production_acceptance_run(p_notes);
$$;
revoke all on function public.start_production_acceptance_run(text) from public,anon;
grant execute on function public.start_production_acceptance_run(text) to authenticated;

create or replace function private.update_production_acceptance_step(
  p_run_id uuid,
  p_step_key text,
  p_status text,
  p_notes text default null,
  p_evidence text default null
) returns void language plpgsql security definer set search_path=public,private,auth as $$
declare v_uid uuid := auth.uid(); v_role app_user_role; v_remaining int; v_failed int;
begin
  if v_uid is null or not private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role]) then
    raise exception 'Admin role required';
  end if;
  if p_status not in ('pending','passed','failed','blocked','not_applicable') then raise exception 'Invalid acceptance status'; end if;
  select role into v_role from public.profiles where id=v_uid;
  update public.production_acceptance_steps
  set status=p_status,
      checked_by_user_id=case when p_status='pending' then null else v_uid end,
      checked_at=case when p_status='pending' then null else now() end,
      notes=left(p_notes,3000),
      evidence=left(p_evidence,1000)
  where run_id=p_run_id and step_key=p_step_key;
  if not found then raise exception 'Acceptance step not found'; end if;
  select count(*) filter (where status in ('pending','blocked')), count(*) filter (where status='failed')
    into v_remaining,v_failed from public.production_acceptance_steps where run_id=p_run_id;
  update public.production_acceptance_runs
  set status=case when v_failed>0 then 'failed' when v_remaining=0 then 'passed' else 'in_progress' end,
      completed_at=case when v_failed>0 or v_remaining=0 then now() else null end
  where id=p_run_id and status<>'cancelled';
  insert into public.audit_logs(actor_user_id,actor_role,action_type,entity_table,entity_id,new_data)
  values(v_uid,v_role,'update_production_acceptance_step','production_acceptance_runs',p_run_id,jsonb_build_object('step_key',p_step_key,'status',p_status));
end $$;
revoke all on function private.update_production_acceptance_step(uuid,text,text,text,text) from public,anon,authenticated;

create or replace function public.update_production_acceptance_step(
  p_run_id uuid,
  p_step_key text,
  p_status text,
  p_notes text default null,
  p_evidence text default null
) returns void language sql security definer set search_path=public,private,auth as $$
  select private.update_production_acceptance_step(p_run_id,p_step_key,p_status,p_notes,p_evidence);
$$;
revoke all on function public.update_production_acceptance_step(uuid,text,text,text,text) from public,anon;
grant execute on function public.update_production_acceptance_step(uuid,text,text,text,text) to authenticated;

create table if not exists public.operational_incidents (
  id uuid primary key default gen_random_uuid(),
  severity text not null check (severity in ('SEV-1','SEV-2','SEV-3')),
  title text not null check (char_length(title) between 3 and 240),
  status text not null default 'open' check (status in ('open','monitoring','resolved')),
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_by_user_id uuid not null references public.profiles(id) on delete restrict,
  owner_user_id uuid references public.profiles(id) on delete set null,
  related_market_id uuid references public.markets(id) on delete set null,
  related_observation_id uuid references public.price_observations(id) on delete set null,
  notes text,
  resolution_summary text,
  updated_at timestamptz not null default now()
);
alter table public.operational_incidents enable row level security;
revoke all on public.operational_incidents from anon,authenticated;
grant select,insert,update on public.operational_incidents to authenticated;
drop policy if exists operational_incidents_admin_read on public.operational_incidents;
drop policy if exists operational_incidents_admin_insert on public.operational_incidents;
drop policy if exists operational_incidents_admin_update on public.operational_incidents;
create policy operational_incidents_admin_read on public.operational_incidents for select to authenticated using (private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role]));
create policy operational_incidents_admin_insert on public.operational_incidents for insert to authenticated with check (created_by_user_id=auth.uid() and private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role]));
create policy operational_incidents_admin_update on public.operational_incidents for update to authenticated using (private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role])) with check (private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role]));

create or replace function private.guard_operational_incident_write() returns trigger language plpgsql security definer set search_path=public,private,auth as $$
begin
  if auth.uid() is null or not private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role]) then raise exception 'Admin role required'; end if;
  if tg_op='INSERT' then new.created_by_user_id:=auth.uid(); end if;
  new.updated_at:=now();
  if new.status='resolved' and new.resolved_at is null then new.resolved_at:=now(); end if;
  if new.status<>'resolved' then new.resolved_at:=null; end if;
  return new;
end $$;
revoke all on function private.guard_operational_incident_write() from public,anon,authenticated;
drop trigger if exists operational_incident_write_guard on public.operational_incidents;
create trigger operational_incident_write_guard before insert or update on public.operational_incidents for each row execute function private.guard_operational_incident_write();

create table if not exists public.pilot_agent_slots (
  id uuid primary key default gen_random_uuid(),
  slot_code text not null unique,
  target_market_id uuid references public.markets(id) on delete set null,
  assigned_user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'open' check (status in ('open','assigned','active','closed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pilot_agent_slots enable row level security;
revoke all on public.pilot_agent_slots from anon,authenticated;
grant select,insert,update,delete on public.pilot_agent_slots to authenticated;
drop policy if exists pilot_agent_slots_admin on public.pilot_agent_slots;
create policy pilot_agent_slots_admin on public.pilot_agent_slots for all to authenticated using (private.has_role(array['super_admin'::app_user_role])) with check (private.has_role(array['super_admin'::app_user_role]));

with ranked as (
  select id,row_number() over(order by name,id) rn from public.markets where is_active and city='Port Harcourt' order by name,id limit 3
)
insert into public.pilot_agent_slots(slot_code,target_market_id,notes)
select 'PH-AGENT-'||lpad(rn::text,2,'0'),id,'Pilot staffing slot. Assign only after a real person signs up and is approved.' from ranked
on conflict(slot_code) do nothing;

create table if not exists public.pilot_product_coverage (
  product_id uuid primary key references public.products(id) on delete cascade,
  product_name text not null,
  recent_verified_observations integer not null default 0,
  distinct_market_count integer not null default 0,
  distinct_agent_count integer not null default 0,
  qualified boolean not null default false,
  priority_score integer not null default 100,
  refreshed_at timestamptz not null default now()
);
alter table public.pilot_product_coverage enable row level security;
revoke all on public.pilot_product_coverage from anon,authenticated;
grant select on public.pilot_product_coverage to authenticated;
drop policy if exists pilot_product_coverage_admin_read on public.pilot_product_coverage;
create policy pilot_product_coverage_admin_read on public.pilot_product_coverage for select to authenticated using (private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role]));

create or replace function private.refresh_pilot_readiness() returns void language plpgsql security definer set search_path=public,private as $$
declare v_products int;v_markets int;v_agents int;v_recent_verified int;v_qualified_products int;v_covered_markets int;v_published int;v_score numeric;
begin
  insert into public.pilot_product_coverage(product_id,product_name,recent_verified_observations,distinct_market_count,distinct_agent_count,qualified,priority_score,refreshed_at)
  select p.id,p.name,
         count(o.id)::int,
         count(distinct o.market_id)::int,
         count(distinct o.agent_id)::int,
         (count(o.id)>=3 and count(distinct o.market_id)>=2 and count(distinct o.agent_id)>=2),
         greatest(0,100 - least(count(o.id)::int,3)*20 - least(count(distinct o.market_id)::int,2)*15 - least(count(distinct o.agent_id)::int,2)*15),
         now()
  from public.products p
  left join public.price_observations o on o.product_id=p.id and o.status='verified' and o.captured_at>=now()-interval '72 hours'
  where p.is_active
  group by p.id,p.name
  on conflict(product_id) do update set product_name=excluded.product_name,recent_verified_observations=excluded.recent_verified_observations,distinct_market_count=excluded.distinct_market_count,distinct_agent_count=excluded.distinct_agent_count,qualified=excluded.qualified,priority_score=excluded.priority_score,refreshed_at=excluded.refreshed_at;
  delete from public.pilot_product_coverage pc where not exists(select 1 from public.products p where p.id=pc.product_id and p.is_active);
  select count(*) into v_products from public.products where is_active;
  select count(*) into v_markets from public.markets where is_active;
  select count(*) into v_agents from public.agents where is_field_active;
  select count(*) into v_recent_verified from public.price_observations where status='verified' and captured_at>=now()-interval '72 hours';
  select count(*) into v_published from public.published_city_prices where last_verified_at>=now()-interval '72 hours';
  select count(*) into v_qualified_products from public.pilot_product_coverage where qualified;
  select count(*) into v_covered_markets from (select market_id from public.price_observations where status='verified' and captured_at>=now()-interval '72 hours' group by market_id having count(*)>=3) m;
  v_score:=round(100*(0.60*(case when v_products=0 then 0 else v_qualified_products::numeric/v_products end)+0.20*(case when v_markets=0 then 0 else v_covered_markets::numeric/v_markets end)+0.20*least(v_agents::numeric/2,1)),1);
  insert into public.pilot_readiness_snapshots(id,readiness_score,target_window_hours,active_products,active_markets,active_field_agents,recent_verified_observations,recent_published_products,qualified_products,covered_markets,launch_ready,qualification_rule,refreshed_at)
  values(true,v_score,72,v_products,v_markets,v_agents,v_recent_verified,v_published,v_qualified_products,v_covered_markets,(v_score>=80 and v_agents>=2 and v_qualified_products>=greatest(5,ceil(v_products*0.5)::int)),'>=3 verified observations, >=2 markets, >=2 agents in 72h',now())
  on conflict(id) do update set readiness_score=excluded.readiness_score,target_window_hours=excluded.target_window_hours,active_products=excluded.active_products,active_markets=excluded.active_markets,active_field_agents=excluded.active_field_agents,recent_verified_observations=excluded.recent_verified_observations,recent_published_products=excluded.recent_published_products,qualified_products=excluded.qualified_products,covered_markets=excluded.covered_markets,launch_ready=excluded.launch_ready,qualification_rule=excluded.qualification_rule,refreshed_at=excluded.refreshed_at;
end $$;
revoke all on function private.refresh_pilot_readiness() from public,anon,authenticated;

alter table public.evidence_photos add column if not exists retention_deleted_at timestamptz;
create table if not exists public.evidence_retention_queue (
  evidence_id uuid primary key references public.evidence_photos(id) on delete cascade,
  observation_id uuid not null references public.price_observations(id) on delete cascade,
  storage_path text not null,
  eligible_after timestamptz not null,
  status text not null default 'pending_review' check (status in ('pending_review','approved','legal_hold','deleted')),
  reviewed_by_user_id uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.evidence_retention_queue enable row level security;
revoke all on public.evidence_retention_queue from anon,authenticated;
grant select,update on public.evidence_retention_queue to authenticated;
drop policy if exists evidence_retention_admin_read on public.evidence_retention_queue;
drop policy if exists evidence_retention_superadmin_update on public.evidence_retention_queue;
create policy evidence_retention_admin_read on public.evidence_retention_queue for select to authenticated using (private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role]));
create policy evidence_retention_superadmin_update on public.evidence_retention_queue for update to authenticated using (private.has_role(array['super_admin'::app_user_role])) with check (private.has_role(array['super_admin'::app_user_role]));

create or replace function private.refresh_evidence_retention_queue() returns integer language plpgsql security definer set search_path=public,private as $$
declare v_count int;
begin
  insert into public.evidence_retention_queue(evidence_id,observation_id,storage_path,eligible_after)
  select evidence_id,observation_id,storage_path,eligible_after from private.evidence_retention_candidates
  on conflict(evidence_id) do nothing;
  get diagnostics v_count=row_count;
  return v_count;
end $$;
revoke all on function private.refresh_evidence_retention_queue() from public,anon,authenticated;

create or replace function private.apply_retention_policy() returns jsonb language plpgsql security definer set search_path=public,private as $$
declare v_errors int:=0; v_gps int:=0; v_reports int:=0; v_queued int:=0;
begin
  delete from public.client_error_events where (resolved_at is not null and resolved_at<now()-interval '90 days') or created_at<now()-interval '180 days'; get diagnostics v_errors=row_count;
  update public.price_observations set gps_latitude=null,gps_longitude=null,gps_accuracy_meters=null,gps_redacted_at=now() where gps_redacted_at is null and status in ('verified','rejected') and captured_at<now()-interval '730 days'; get diagnostics v_gps=row_count;
  update public.reports set reported_by_user_id=null,notes=null,updated_at=now() where status in ('resolved','dismissed') and updated_at<now()-interval '730 days' and (reported_by_user_id is not null or notes is not null); get diagnostics v_reports=row_count;
  select private.refresh_evidence_retention_queue() into v_queued;
  return jsonb_build_object('client_errors_deleted',v_errors,'gps_records_redacted',v_gps,'reports_deidentified',v_reports,'evidence_candidates_queued',v_queued,'evidence_pending_review',(select count(*) from public.evidence_retention_queue where status='pending_review'));
end $$;
revoke all on function private.apply_retention_policy() from public,anon,authenticated;

select private.refresh_pilot_readiness();
select private.refresh_evidence_retention_queue();
