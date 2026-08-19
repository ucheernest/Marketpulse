# MarketPulse major pre-upload audit

## Source checks

- One canonical Supabase project/client configuration.
- No `mockData`, obsolete `field_submissions`, browser role switcher, fixed GPS, fabricated EXIF, synthetic price history, fake KPI, fixed field-agent bounty or local-only admin approval path.
- No direct browser INSERT into `price_observations` or `reports`; privileged workflows use server-validated RPCs.
- No direct browser catalog UPDATE; catalog/market writes use super-admin RPCs.
- 33 TS/TSX source files parsed with **0 TypeScript transpile diagnostics** in the offline validation environment.
- All local relative imports resolve.
- Package versions are pinned exactly.
- AI Studio metadata requests `geolocation` and `camera`.
- Live camera evidence replaces gallery-based field evidence.
- GPS older than 15 minutes at submit time is rejected client-side for recapture; server still independently scores GPS and timestamps.
- Service worker excludes Supabase/Auth/API/private traffic from Cache Storage.
- Password recovery and confirmation resend included.
- Public Terms/Privacy documents and legal-version acceptance included.
- Error boundary included.

## Frontend ↔ live Supabase contract

Checked every table/RPC used by the source against project `iqavukfmeahqnovrkcuo`:

- Missing referenced tables: **0**
- Missing referenced RPCs: **0**
- Required Storage buckets present: **2** (`profile-avatars`, private `price-evidence`)

Direct privilege checks confirm:

- anon can read the public catalog;
- anon cannot directly insert reports;
- authenticated users cannot directly insert reports;
- authenticated users cannot directly insert price observations;
- authenticated users cannot directly update products.

## Live security/access checks

- Owner `ernestuche01@gmail.com` is confirmed, active and remains `super_admin`.
- Signup defaults to `public_user`.
- Only super admin can assign field-agent/verifier roles and change other account status.
- Field-agent promotion requires valid active market assignments.
- Protected super-admin accounts cannot be changed/deactivated in-app.
- Verifier/admin cannot manage the product/market catalog.
- Super admin does not automatically obtain field-agent submission privileges.
- Full personal profile rows are self + super-admin only; verifier operations use limited agent identity.
- Field evidence bucket is private; avatar bucket is intentionally public for profile identity.
- Default privileges for future public-schema tables/functions were hardened to opt-in access.

## End-to-end backend execution test

A rollback-only transaction on the live Supabase project executed the complete critical chain:

1. field-agent role and Mile 3 assignment;
2. evidence object presence;
3. real submission RPC with GPS + canonical 50 kg rice unit;
4. pending observation + confidence record;
5. admin approval RPC;
6. observation status changed to verified;
7. Port Harcourt published city aggregate recalculated.

The transaction was rolled back. Afterwards:

- price observations: **0**
- published city rows: **0**
- test evidence objects: **0**
- owner role: **super_admin**

A second rollback test used a field capture 3 hours before sync. The timestamp-integrity score remained 90 while the single-observation/single-market public confidence was capped at **54 (Limited Data)**. Public `last_verified_at` tracked the field capture time, not the later synchronization time.

## Current live pilot content

- 6 categories
- 20 products
- 53 search aliases
- 5 active Port Harcourt markets
- 0 production price observations (intentionally no synthetic/fake live prices)

## Remaining non-code project settings

1. Configure Supabase Auth Site URL / allowed redirect URL to the final AI Studio deployment origin.
2. Enable the Google Auth provider with the Google Web OAuth Client ID + Client Secret. The frontend already auto-detects provider availability.
3. Configure custom SMTP before public email/password signup; Supabase's built-in mailer is development-only.
4. Enable Supabase Auth **Leaked Password Protection**. This is the only current security-advisor warning.

## Build limitation

The environment could not reliably reach npm's registry, so no real `npm install && npm run build` result is claimed. The TypeScript compiler API parsed every TS/TSX source file without diagnostics, relative import resolution passed, and the live database/RPC path was tested transactionally. AI Studio's dependency install remains the first full Vite bundle execution.


## Usable authentication pass

- Added Google OAuth as a first-class auth path using Supabase `signInWithOAuth`.
- Auth modal checks the live Supabase provider settings; Google becomes active automatically after provider configuration, without another frontend upload.
- Added automatic role-based landing after successful login/session restore.
- Google-created users populate protected profile name/avatar/provider fields server-side.
- OAuth accounts remain `public_user`; no provider metadata is used for authorization.
- Added visible login-method status to Profile & Account.
- `auth_provider` is readable by the owner/admin UI but not user-updatable.
- Email/password signup, login, confirmation resend, reset-password and recovery remain available.

- Public email/password auth code is complete, but production confirmation/reset delivery requires custom SMTP in Supabase; no frontend rewrite is needed.

## Authentication usability validation

- One visible auth entry point: Log In / Sign Up.
- Google OAuth and email/password feed the same Supabase identity system.
- OAuth session return is explicitly detected in the browser client.
- Google provider availability is read from the live Supabase Auth settings endpoint; the button activates after provider configuration without a frontend change.
- Google name/avatar/provider synchronize into the protected profile server-side and never grant application roles.
- Staff promotion is blocked for unconfirmed email identities.
- Successful session restore routes by the protected database role.
- Source validation after the auth pass: all relative imports resolve, TypeScript parser reports no syntax diagnostics, and a full internal type check with temporary dependency stubs reports zero project type errors.
- Production email confirmation/reset delivery still requires custom SMTP in Supabase; Google OAuth requires a real Google Web OAuth Client ID + Client Secret in the Supabase provider configuration.
