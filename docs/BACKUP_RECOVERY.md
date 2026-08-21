# Backup & Recovery Policy

## Current platform constraint
The Supabase organization is currently on the **Free plan**. Paid-plan daily backups/PITR must not be assumed. A scheduled GitHub workflow (`database-backup.yml`) is configured to perform a **daily** logical `pg_dump` after the repository secret `MARKETPULSE_DB_URL` is configured. The workflow fails closed when the secret is absent rather than pretending a backup exists.

## Backup coverage
- PostgreSQL schema and data: daily independent logical backup plus schema-only dump, checksum and 30-day GitHub artifact retention once `MARKETPULSE_DB_URL` is configured.
- Git/source/config: GitHub history and successful Vercel deployments.
- Supabase Storage objects: `storage-backup.yml` performs a weekly authorized export of `price-evidence` and `profile-avatars`, including a manifest and SHA-256 checksums, after the GitHub secret `MARKETPULSE_SUPABASE_SECRET_KEY` is configured. The secret is server-side only and must never be exposed to the frontend.

## Required production upgrade before material scale
For a public pilot with meaningful data volume, move Supabase to a paid plan and use platform daily backups; enable PITR if the business RPO requires less than one day. Keep the independent logical and Storage exports even after upgrade.

## Recovery objectives
Pilot target after the independent workflows are active:
- **Database RPO:** <= 24 hours for PostgreSQL logical data; <= configured PITR interval after PITR is enabled.
- **Storage RPO:** <= 7 days with the weekly independent object export; reduce the interval if evidence volume/criticality warrants it.
- **RTO:** <= 4 hours for database restore and application validation during pilot, excluding very large Storage rehydration.

Until the required GitHub secrets are configured and successful artifacts are verified, the effective independent-backup RPO is **not proven** and the production acceptance `monitoring_backup` step must remain blocked.

## Monthly recovery drill
GitHub automatically opens a monthly recovery-drill issue. The operator must:
1. Select the newest valid database and Storage artifacts older than the drill start.
2. Restore the database into an isolated PostgreSQL/Supabase test target, never over production.
3. Verify required tables/functions/RLS, owner super-admin role, products, markets, storage metadata and snapshot counts.
4. Restore at least one avatar/evidence object into an isolated test bucket and verify its checksum.
5. Run `supabase/tests/production_readiness.sql` or equivalent checks.
6. Record start/end, RPO, RTO, failed checks and remediation in `public.recovery_drills`.
7. Confirm the application can connect to the isolated restored database before declaring the drill passed.
8. Mark the production acceptance monitoring/backup step passed only after at least one backup set and one successful isolated restore have been demonstrated.

## Storage recovery and retention
Database restore does not restore deleted Storage bytes. The weekly Storage export is the independent recovery path for `price-evidence` and `profile-avatars`. Evidence eligible for deletion is tracked in `evidence_retention_queue`; `legal_hold` objects must never be removed by cleanup. Retention deletion and recovery processes must preserve auditability without reintroducing evidence that was lawfully deleted after its backup retention window has expired.
