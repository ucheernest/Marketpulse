# Backup & Recovery Policy

## Current platform constraint
The Supabase organization is currently on the **Free plan**. Paid-plan daily backups/PITR must not be assumed. A scheduled GitHub workflow (`database-backup.yml`) performs a weekly logical `pg_dump` after the repository secret `MARKETPULSE_DB_URL` is configured.

## Backup coverage
- PostgreSQL schema and data: weekly logical backup plus schema-only dump.
- Git/source/config: GitHub history and Vercel deployments.
- Supabase Storage objects: **not contained in database backups**. Evidence and avatars require a separate Storage export process before public scale.

## Required production upgrade before material scale
For a public pilot with meaningful data volume, move Supabase to a paid plan and use daily backups; enable PITR if the business RPO requires less than one day. Keep an independent logical export even after upgrade.

## Recovery objectives
Pilot target:
- **RPO:** <= 7 days while on Free plan with weekly logical dumps; <= 24h after paid daily backups; <= configured PITR interval after PITR.
- **RTO:** <= 4 hours for database restore and application validation during pilot.

## Monthly recovery drill
GitHub automatically opens a monthly recovery-drill issue. The operator must:
1. Select the newest valid backup older than the drill start.
2. Restore it into an isolated PostgreSQL/Supabase test target, never over production.
3. Verify required tables/functions/RLS, owner super-admin role, products, markets, storage metadata and snapshot counts.
4. Run `supabase/tests/production_readiness.sql` or equivalent checks.
5. Record start/end, RPO, RTO, failed checks and remediation in `public.recovery_drills`.
6. Confirm application can connect to the isolated restored database before declaring the drill passed.

## Storage recovery
Database restore does not restore deleted Storage bytes. Before collecting material field evidence, configure independent export/replication for `price-evidence` and `profile-avatars` and test restoring at least one evidence object.
