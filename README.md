# MarketPulse — Major Pre-Upload Build

This is the **single consolidated MarketPulse frontend** to use for the next Google AI Studio import. It is wired to the canonical Supabase backend and replaces every earlier ZIP/prototype copy.

## Authentication that users actually see

MarketPulse has one Supabase Auth system for consumers, field agents and admins. The auth screen exposes **Continue with Google** (when the Google provider is enabled in Supabase) plus **Log In / Sign Up with email and password**. Password recovery and confirmation-email resend are included.

Google OAuth users automatically receive a MarketPulse profile populated from their Google display name, email and avatar. All newly-created accounts remain `public_user`; only the protected super admin can later grant `field_agent` or `verifier_admin`. Successful sessions route automatically to the correct workspace. See `AUTH_SETUP.md` for the one-time Google provider configuration.

For public email/password signup and password recovery, configure custom SMTP in Supabase. The built-in Supabase mail service is development-only. Google OAuth and SMTP are provider settings, so they can be activated without another frontend code upload.


## Connected Supabase project

- Project ref: `iqavukfmeahqnovrkcuo`
- URL: `https://iqavukfmeahqnovrkcuo.supabase.co`
- Frontend credential: Supabase **publishable key** only
- Never place a service-role/secret key in this browser application.

The project has a browser-safe publishable fallback so an AI Studio build can connect even when its environment-variable UI is not configured. `.env.example` documents the preferred variable names.

## Consumer price intelligence

- Real Supabase product/category/brand/pack-size/market reads.
- Nigerian aliases such as `red oil`, `Maggi`, `tissue`, etc. participate in search.
- Public prices come only from approved observations and city-specific aggregates.
- Products with no approved data show **Awaiting verified data**, never synthetic prices.
- Market comparisons and price history use approved data only.
- Saved products follow signed-in accounts; anonymous saves remain local to that browser.
- Signed-in consumers can report a suspected inaccurate price through a rate-limited server RPC. Reports never overwrite published prices.
- Public Terms of Use / Privacy Notice links and a market-price variability disclaimer are available in the site footer.

## Identity and access

- Every registration starts as `public_user`.
- Profiles support name, avatar, phone, gender, date of birth, preferred city, state, country and bio.
- Only the profile owner and super admin can read full personal profile data.
- Verifier/admin screens use limited operational agent identity rather than private consumer profile fields.
- Users cannot change their own role, email or account-active status.
- There is no browser role/perspective switcher.
- Only `super_admin` can grant/revoke `field_agent` or `verifier_admin`.
- The protected super-admin owner cannot be demoted or deactivated through the application.
- Super admin can deactivate/reactivate other accounts without deleting audit/history records.
- Field-agent promotion requires a confirmed identity and at least one valid active market assignment.
- Verifier/admin promotion also requires a confirmed identity.
- Field-agent display name/avatar automatically follow the agent's profile identity.
- Signup records the current Terms/Privacy versions. Existing accounts are asked to acknowledge a new legal version when necessary.
- Password reset/recovery and confirmation-email resend use Supabase Auth.

## Field-agent collection

- Field agents use the same Supabase Auth login; the database role routes them to the agent workspace.
- Only assigned markets are available for collection.
- Product pack/unit is canonical and locked.
- Actual browser GPS is required; hard-coded coordinates are gone.
- Coordinates older than 15 minutes at submission time must be recaptured.
- Evidence is captured with the live in-app camera; gallery selection is not used for field evidence.
- Evidence is mandatory and stored in the private `price-evidence` bucket.
- No fake EXIF/GPS claims are made.
- Server-side logic scores GPS, evidence presence, agent reputation, duplicate risk, freshness and city-specific price deviation.
- Offline observations keep the original field capture time, store evidence in IndexedDB and are scoped to the authenticated agent who captured them.
- Legitimate offline sync delay is handled separately from actual data freshness.
- Failed server validation cleans up a newly uploaded orphan evidence file.
- No fixed bounty, fabricated leaderboard or fake productivity KPI exists.

## Trust and publication

- `products` contains catalog identity, not a global current price.
- Published prices are separated by city, market and daily history.
- Public freshness/history use `captured_at` (the time the observation was collected in the field), not the later network-sync timestamp.
- Approval joins the observation to the verified dataset and recomputes aggregates; it never performs a browser-side direct price overwrite.
- Outlier benchmarking is city-specific.
- A city with fewer than 3 observations **or** fewer than 2 markets is capped at 54% confidence (**Limited Data**).
- A city with fewer than 6 observations **or** fewer than 3 markets is capped below High Confidence (79%).
- High Confidence therefore requires broader independent coverage.
- Stale public data is visibly labelled based on field observation age.

## Verification/admin

- Verification queue reads canonical `price_observations` plus evidence/confidence records.
- Verifiers can approve, reject or request recheck through secured RPCs.
- Reject/recheck requires a decision reason; all decisions create verification and audit records.
- Evidence is shown through short-lived signed URLs from the private bucket.
- Admin KPIs are live-record derived; “Approved today” uses actual verification time while data freshness uses field capture time.
- Public price reports have their own investigation queue and can be resolved/dismissed without changing price data automatically.
- Super-admin-only **Users & Access** manages roles, market assignments and active status.
- Super-admin-only **Catalog & Markets** can create/edit/deactivate/reactivate pilot products and market geofences through secured RPCs, not direct table writes.

## Offline / runtime safety

- Service worker caches only the app shell/static assets.
- Supabase/Auth/API responses and evidence URLs are never put in Cache Storage.
- Offline submissions cannot sync under a different agent login.
- A top-level React error boundary provides a recoverable failure screen rather than leaving a blank app.

## Live pilot state

The backend intentionally contains catalog data but **zero fake live observations**:

- 6 categories
- 20 pilot products
- 53 Nigerian search aliases
- 5 active Port Harcourt markets
- 0 real price observations until field collection begins

## Pre-upload server verification already performed

Rollback-only tests against the real Supabase project successfully exercised:

1. anonymous read-only catalog access;
2. super-admin catalog/market management;
3. verifier inability to manage the catalog;
4. super-admin inability to impersonate a field agent for price submission;
5. legal acknowledgement;
6. consumer inaccurate-price report + verifier closure;
7. full agent → evidence → GPS → pending observation → admin approval → Port Harcourt published aggregate flow.

The end-to-end test was rolled back completely: production remains at **0 observations and 0 test evidence objects**.

A second offline-freshness test used an observation captured 3 hours before synchronization. It correctly retained a strong timestamp-integrity score while the single-observation/single-market public aggregate was capped at **54% Limited Data**.

## Local commands

```bash
npm install
npm run lint
npm run build
```

Dependencies are pinned exactly in `package.json`.

## Environment variables

```env
VITE_SUPABASE_URL=https://iqavukfmeahqnovrkcuo.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Do not use a service-role/secret key in a `VITE_` variable.

## Two Supabase dashboard settings after deployment

These are project settings, not another source-code upload:

1. Set **Auth Site URL / Redirect URLs** to the deployed MarketPulse origin so confirmation, password-reset and OAuth returns go back to the app.
2. Enable the **Google** Auth provider with a Google Web OAuth Client ID and Client Secret. The frontend detects this automatically.
3. Configure **custom SMTP** before opening email/password signup to arbitrary public users.
4. Enable **Leaked Password Protection** in Supabase Auth. It is currently the only Supabase security-advisor warning.

## Build-validation limitation

The execution environment used for this correction pass cannot reach the npm registry reliably, so it could not perform a genuine dependency install and Vite production build. All local TS/TSX files were nevertheless parsed successfully with the TypeScript compiler API, relative imports were resolved, source-to-Supabase table/RPC contracts were checked against the live project, and the critical backend workflow was executed transactionally against Supabase and rolled back.
