-- Keep public RPC wrappers SECURITY INVOKER, matching the existing MarketPulse RPC pattern.
-- Authorization remains inside the private SECURITY DEFINER functions, which validate auth.uid() and roles.

grant execute on function private.start_production_acceptance_run(text) to authenticated;
grant execute on function private.update_production_acceptance_step(uuid,text,text,text,text) to authenticated;

create or replace function public.start_production_acceptance_run(p_notes text default null)
returns uuid language sql set search_path='' as $$
  select private.start_production_acceptance_run(p_notes);
$$;
revoke all on function public.start_production_acceptance_run(text) from public,anon;
grant execute on function public.start_production_acceptance_run(text) to authenticated;

create or replace function public.update_production_acceptance_step(
  p_run_id uuid,
  p_step_key text,
  p_status text,
  p_notes text default null,
  p_evidence text default null
) returns void language sql set search_path='' as $$
  select private.update_production_acceptance_step(p_run_id,p_step_key,p_status,p_notes,p_evidence);
$$;
revoke all on function public.update_production_acceptance_step(uuid,text,text,text,text) from public,anon;
grant execute on function public.update_production_acceptance_step(uuid,text,text,text,text) to authenticated;
