# MarketPulse production readiness

## Implemented in the application

- Consumer catalog/search backed by Supabase.
- Verified-price empty states: no fabricated live prices.
- Product price ranges, freshness/confidence, market comparison and history when approved observations exist.
- Saved products and inaccurate-price reporting.
- Email/password authentication, confirmation/resend, password recovery and role-aware sessions.
- Google OAuth client integration; provider credentials remain an external Supabase setting.
- User profiles and server-controlled roles.
- Field-agent assignments, camera evidence, GPS/geofence checks, canonical units and offline queue/sync.
- Verifier/admin queue, evidence review, approve/reject/recheck and audit records.
- Super-admin user access, catalog and market/geofence management.
- PWA service worker/offline shell and installable manifest.

## Production controls added

- Vercel production build configuration.
- Security response headers and camera/geolocation permissions policy.
- Service-worker no-cache deployment rule.
- Pull-request TypeScript/build CI gate.
- No committed runtime `.env` secrets.

## External launch configuration still required

- Configure Google OAuth Client ID/Secret in Supabase Auth if Google login is enabled.
- Configure custom SMTP with a verified sender domain for production email confirmation/reset delivery.
- Enable Supabase leaked-password protection.
- Add the final Vercel/custom domain to Supabase Auth Site URL and redirect allow-list.
- Onboard verified field agents and collect real observations before advertising live prices.
- Add a custom domain, error monitoring and uptime monitoring before broad public launch.

## Data integrity rule

A product without approved, sufficiently recent observations must remain an awaiting-verified-data state. Demo or fabricated prices must never be presented as current market intelligence.
