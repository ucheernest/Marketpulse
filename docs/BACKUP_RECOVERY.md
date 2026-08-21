# Backup & Recovery Policy

## Current platform constraint
The Supabase organization is currently on the **Free plan**. Paid-plan daily backups/PITR must not be assumed. A scheduled GitHub workflow (`database-backup.yml`) is configured to perform a **daily** logical `pg_dump` after the repository secret `MARKETPULSE_DB_URL` is configured. The workflow fails closed when the secret is absent rather than pretending a backup exists.

## Backup coverage
- PostgreSQL schema and data: daily independent logical backup plus schema-only dump, checksum and 30-day GitHub artifact retention once `MARKETPULSE_DB_URL` is configured.
- Git/source/config: GitHub history and successful Vercel deployments.
- Supabase Storage objects: **not contained in database backups**. Evidence and avatars require a separate authorized Storage export/replication process before public scale.

## Required production upgrade before material scale
For a public pilot with meaningful data volume, move Supabase to a paid plan and use platform daily backups; enable PITR if the business RPO requires less than one day. Keep the independent logical export even after upgrade.

## Recovery objectives
Pilot target after the independent daily workflow is active:
- **RPO:** <= 24 hours for PostgreSQL logical data; <= configured PITR interval after PITR is enabled.
- **RTO:** <= 4 hours for database restore and application validation during pilot.

Until the GitHub database secret is configured and a successful artifact is verified, the effective independent-backup RPO is **not proven** and the production acceptance `monitoring_backup` step must remain blocked.

## Monthly recovery drill
GitHub automatically opens a monthly recovery-drill issue. The operator must:
1. Select the newest valid backup older than the drill start.
2. Restore it into an isolated PostgreSQL/Supabase test target, never over production.
3. Verify required tables/functions/RLS, owner super-admin role, products, markets, storage metadata and snapshot counts.
4. Run `supabase/tests/production_readiness.sql` or equivalent checks.
5. Record start/end, RPO, RTO, failed checks and remediation in `public.recovery_drills`.
6. Confirm the application can connect to the isolated restored database before declaring the drill passed.
7. Mark the production acceptance monitoring/backup step passed only after at least one backup artifact and one successful isolated restore have been demonstrated.

## Storage recovery
Database restore does not restore deleted Storage bytes. Before collecting material field evidence, configure independent export/replication for `price-evidence` and `profile-avatars` and test restoring at least one evidence object. Evidence eligible for deletion is tracked in `evidence_retention_queue`; legal-hold objects must never be removed by a backup/cleanup job.
