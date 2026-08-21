# Production Acceptance Test

This is the release gate for the Port Harcourt pilot. Use real test people/accounts and real field captures. Do not seed fake public prices.

## Recorded acceptance run
A super admin starts the production run from **Admin → Launch operations**. The database creates a `production_acceptance_runs` record and ten ordered `production_acceptance_steps`. Verifier admins or the super admin record each step as `passed`, `failed`, `blocked` or `not_applicable`; completion and audit timestamps are server-recorded. Do not mark an external gate passed merely because code exists.

## 1. Consumer identity
- Create a new consumer account with email/password.
- Confirm the email through production SMTP.
- Sign in, sign out and sign back in.
- Request password reset and complete it.
- If Google OAuth is enabled, sign in with Google and confirm the profile is created as `public_user`.
- Save/unsave a product and verify the watchlist is private to the account.
- Submit a privacy access/export request.

## 2. Agent onboarding
- Consumer signs up first.
- Super admin promotes the person to `field_agent` and assigns at least one active Port Harcourt market.
- Match the real person to one of the `PH-AGENT-*` pilot staffing slots.
- Agent signs in again; server-controlled role shows Field Agent and only assigned markets are available.

## 3. Field capture
- At the assigned market, capture a current price for a canonical product/pack.
- Use the live camera; no gallery-only evidence.
- Capture fresh GPS with <=15m client-side accuracy threshold.
- Submit online once and once through the offline queue/reconnect path.
- Confirm no duplicate/orphan evidence is left after failed validation.

## 4. Verification
- Verifier/admin opens the observation, evidence, GPS distance and confidence details.
- Exercise recheck on one test observation and rejection on another.
- Approve the valid observation with a reason.
- Confirm audit and verification records are created.

## 5. Publication
- After enough independent valid observations, verify city/market snapshots publish with the correct average/low/high, freshness and confidence.
- Confirm one observation/one market cannot display High Confidence.
- Confirm stale observations are labelled stale/limited rather than current.
- Confirm Admin → Launch operations updates the product coverage matrix and only marks a product qualified at >=3 verified observations, >=2 markets and >=2 agents in the 72-hour window.

## 6. Consumer correction loop
- Consumer views the published product.
- Submit an inaccurate-price report.
- Admin investigates and resolves/dismisses with notes.
- Confirm the report workflow is auditable.

## 7. Operational gates
- GitHub CI green.
- Vercel production deployment green.
- `marketpulse-health` returns `ok:true`.
- No Supabase security-advisor ERROR items.
- No unresolved SEV-1/SEV-2 client telemetry or operational incidents.
- Backup workflow has produced at least one restorable artifact and a recovery drill has passed.
- Leaked-password protection, Auth redirect allow-list, SMTP and final domain are verified in their owning platforms.

The release is accepted only when the recorded acceptance run is `passed` and the pilot-readiness threshold is met with real observations.
