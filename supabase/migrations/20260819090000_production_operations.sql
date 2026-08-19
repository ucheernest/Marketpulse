-- MarketPulse production operations, privacy, monitoring and pilot-readiness controls.
create extension if not exists pg_cron with schema extensions;

create table if not exists public.client_error_events (
  id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id) on delete set null,
  route text not null default '/', error_name text not null default 'Error', message text not null,
  stack_excerpt text, app_version text, user_agent text, created_at timestamptz not null default now(),
  resolved_at timestamptz, resolution_notes text,
  constraint client_error_message_length check (char_length(message) <= 1200),
  constraint client_error_stack_length check (stack_excerpt is null or char_length(stack_excerpt) <= 4000)
);
alter table public.client_error_events enable row level security;
revoke all on public.client_error_events from anon, authenticated;
grant insert, select, update on public.client_error_events to authenticated;
create policy client_error_admin_read on public.client_error_events for select to authenticated using (private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role]));
create policy client_error_admin_update on public.client_error_events for update to authenticated using (private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role])) with check (private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role]));
create policy client_error_self_insert on public.client_error_events for insert to authenticated with check (user_id=auth.uid() and private.is_active_user());

create or replace function private.enforce_client_error_insert() returns trigger language plpgsql security definer set search_path=public,private,auth as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or not private.is_active_user() then raise exception 'Authentication required'; end if;
  if (select count(*) from public.client_error_events where user_id=v_uid and created_at>now()-interval '1 hour') >= 20 then raise exception 'Telemetry rate limit exceeded'; end if;
  new.user_id:=v_uid; new.route:=left(coalesce(nullif(new.route,''),'/'),300); new.error_name:=left(coalesce(nullif(new.error_name,''),'Error'),120); new.message:=left(coalesce(nullif(new.message,''),'Unknown client error'),1200);
  if new.stack_excerpt is not null then new.stack_excerpt:=left(new.stack_excerpt,4000); end if;
  if new.app_version is not null then new.app_version:=left(new.app_version,120); end if;
  if new.user_agent is not null then new.user_agent:=left(new.user_agent,500); end if;
  return new;
end $$;
revoke all on function private.enforce_client_error_insert() from public,anon,authenticated;
drop trigger if exists client_error_insert_guard on public.client_error_events;
create trigger client_error_insert_guard before insert on public.client_error_events for each row execute function private.enforce_client_error_insert();

create table if not exists public.privacy_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  request_type text not null check (request_type in ('access','correction','deletion','export')),
  status text not null default 'submitted' check (status in ('submitted','in_review','completed','rejected')),
  request_notes text, admin_notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), completed_at timestamptz
);
alter table public.privacy_requests enable row level security;
revoke all on public.privacy_requests from anon,authenticated;
grant select,insert,update on public.privacy_requests to authenticated;
create policy privacy_request_self_read on public.privacy_requests for select to authenticated using (user_id=auth.uid() or private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role]));
create policy privacy_request_self_insert on public.privacy_requests for insert to authenticated with check (user_id=auth.uid() and private.is_active_user());
create policy privacy_request_admin_update on public.privacy_requests for update to authenticated using (private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role])) with check (private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role]));

create table if not exists public.recovery_drills (
  id uuid primary key default gen_random_uuid(), performed_by_user_id uuid references public.profiles(id) on delete set null,
  drill_type text not null default 'logical_restore', source_backup_at timestamptz, target_environment text not null default 'isolated',
  started_at timestamptz not null default now(), completed_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled','running','passed','failed')),
  rpo_minutes integer, rto_minutes integer, notes text
);
alter table public.recovery_drills enable row level security;
revoke all on public.recovery_drills from anon,authenticated;
grant select,insert,update,delete on public.recovery_drills to authenticated;
create policy recovery_drills_admin on public.recovery_drills for all to authenticated using (private.has_role(array['super_admin'::app_user_role])) with check (private.has_role(array['super_admin'::app_user_role]));

alter table public.price_observations add column if not exists gps_redacted_at timestamptz;
alter table public.price_observations alter column gps_latitude drop not null;
alter table public.price_observations alter column gps_longitude drop not null;

create or replace view private.evidence_retention_candidates with (security_invoker=true) as
select ep.id evidence_id,ep.observation_id,ep.storage_path,po.status,po.captured_at,
case when po.status='rejected' then po.captured_at+interval '365 days' else po.captured_at+interval '730 days' end eligible_after
from public.evidence_photos ep join public.price_observations po on po.id=ep.observation_id
where po.status in ('verified','rejected') and ((po.status='rejected' and po.captured_at<now()-interval '365 days') or (po.status='verified' and po.captured_at<now()-interval '730 days'));

create or replace function private.apply_retention_policy() returns jsonb language plpgsql security definer set search_path=public,private as $$
declare v_errors int:=0; v_gps int:=0; v_reports int:=0;
begin
  delete from public.client_error_events where (resolved_at is not null and resolved_at<now()-interval '90 days') or created_at<now()-interval '180 days'; get diagnostics v_errors=row_count;
  update public.price_observations set gps_latitude=null,gps_longitude=null,gps_accuracy_meters=null,gps_redacted_at=now() where gps_redacted_at is null and status in ('verified','rejected') and captured_at<now()-interval '730 days'; get diagnostics v_gps=row_count;
  update public.reports set reported_by_user_id=null,notes=null,updated_at=now() where status in ('resolved','dismissed') and updated_at<now()-interval '730 days' and (reported_by_user_id is not null or notes is not null); get diagnostics v_reports=row_count;
  return jsonb_build_object('client_errors_deleted',v_errors,'gps_records_redacted',v_gps,'reports_deidentified',v_reports,'evidence_candidates',(select count(*) from private.evidence_retention_candidates));
end $$;
revoke all on function private.apply_retention_policy() from public,anon,authenticated;

create table if not exists public.pilot_readiness_snapshots (
  id boolean primary key default true check(id), readiness_score numeric not null default 0, target_window_hours integer not null default 72,
  active_products integer not null default 0, active_markets integer not null default 0, active_field_agents integer not null default 0,
  recent_verified_observations integer not null default 0, recent_published_products integer not null default 0,
  qualified_products integer not null default 0, covered_markets integer not null default 0, launch_ready boolean not null default false,
  qualification_rule text not null default '>=3 verified observations, >=2 markets, >=2 agents in 72h', refreshed_at timestamptz not null default now()
);
alter table public.pilot_readiness_snapshots enable row level security;
revoke all on public.pilot_readiness_snapshots from anon,authenticated;
grant select on public.pilot_readiness_snapshots to authenticated;
create policy pilot_readiness_admin_read on public.pilot_readiness_snapshots for select to authenticated using (private.has_role(array['verifier_admin'::app_user_role,'super_admin'::app_user_role]));

create or replace function private.refresh_pilot_readiness() returns void language plpgsql security definer set search_path=public,private as $$
declare v_products int;v_markets int;v_agents int;v_recent_verified int;v_qualified_products int;v_covered_markets int;v_published int;v_score numeric;
begin
 select count(*) into v_products from public.products where is_active;
 select count(*) into v_markets from public.markets where is_active;
 select count(*) into v_agents from public.agents where is_field_active;
 select count(*) into v_recent_verified from public.price_observations where status='verified' and captured_at>=now()-interval '72 hours';
 select count(*) into v_published from public.published_city_prices where last_verified_at>=now()-interval '72 hours';
 select count(*) into v_qualified_products from (select product_id from public.price_observations where status='verified' and captured_at>=now()-interval '72 hours' group by product_id having count(*)>=3 and count(distinct market_id)>=2 and count(distinct agent_id)>=2) q;
 select count(*) into v_covered_markets from (select market_id from public.price_observations where status='verified' and captured_at>=now()-interval '72 hours' group by market_id having count(*)>=3) m;
 v_score:=round(100*(0.60*(case when v_products=0 then 0 else v_qualified_products::numeric/v_products end)+0.20*(case when v_markets=0 then 0 else v_covered_markets::numeric/v_markets end)+0.20*least(v_agents::numeric/2,1)),1);
 insert into public.pilot_readiness_snapshots(id,readiness_score,target_window_hours,active_products,active_markets,active_field_agents,recent_verified_observations,recent_published_products,qualified_products,covered_markets,launch_ready,qualification_rule,refreshed_at)
 values(true,v_score,72,v_products,v_markets,v_agents,v_recent_verified,v_published,v_qualified_products,v_covered_markets,(v_score>=80 and v_agents>=2 and v_qualified_products>=greatest(5,ceil(v_products*0.5)::int)),'>=3 verified observations, >=2 markets, >=2 agents in 72h',now())
 on conflict(id) do update set readiness_score=excluded.readiness_score,target_window_hours=excluded.target_window_hours,active_products=excluded.active_products,active_markets=excluded.active_markets,active_field_agents=excluded.active_field_agents,recent_verified_observations=excluded.recent_verified_observations,recent_published_products=excluded.recent_published_products,qualified_products=excluded.qualified_products,covered_markets=excluded.covered_markets,launch_ready=excluded.launch_ready,qualification_rule=excluded.qualification_rule,refreshed_at=excluded.refreshed_at;
end $$;
revoke all on function private.refresh_pilot_readiness() from public,anon,authenticated;
select private.refresh_pilot_readiness();
select cron.unschedule(jobid) from cron.job where jobname='marketpulse-retention-daily';
select cron.schedule('marketpulse-retention-daily','23 2 * * *','select private.apply_retention_policy();');
select cron.unschedule(jobid) from cron.job where jobname='marketpulse-pilot-readiness-refresh';
select cron.schedule('marketpulse-pilot-readiness-refresh','*/15 * * * *','select private.refresh_pilot_readiness();');
