-- Read-only production readiness checks. Run with an administrative database connection.
do $$
begin
  if not exists (select 1 from pg_tables where schemaname='public' and tablename='price_observations') then raise exception 'price_observations missing'; end if;
  if not exists (select 1 from pg_tables where schemaname='public' and tablename='client_error_events') then raise exception 'client_error_events missing'; end if;
  if not exists (select 1 from pg_tables where schemaname='public' and tablename='privacy_requests') then raise exception 'privacy_requests missing'; end if;
  if not exists (select 1 from pg_tables where schemaname='public' and tablename='pilot_readiness_snapshots') then raise exception 'pilot_readiness_snapshots missing'; end if;
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and p.proname='submit_price_observation') then raise exception 'submit_price_observation missing'; end if;
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and p.proname='review_price_observation') then raise exception 'review_price_observation missing'; end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name in ('price','current_price','average_price')) then raise exception 'obsolete product price column detected'; end if;
  if not exists (select 1 from public.profiles where role='super_admin'::app_user_role and is_active) then raise exception 'no active super admin'; end if;
  if not exists (select 1 from cron.job where jobname='marketpulse-retention-daily') then raise exception 'retention cron missing'; end if;
  if not exists (select 1 from cron.job where jobname='marketpulse-pilot-readiness-refresh') then raise exception 'pilot readiness cron missing'; end if;
end $$;

select 'categories' metric,count(*) value from public.categories
union all select 'products',count(*) from public.products
union all select 'active_markets',count(*) from public.markets where is_active
union all select 'agents',count(*) from public.agents
union all select 'observations',count(*) from public.price_observations
union all select 'published_city_prices',count(*) from public.published_city_prices;
