# External Launch Configuration

The application and database are prepared for these integrations, but the items below require credentials or infrastructure ownership outside source code. Until each is verified, the matching production acceptance step remains `blocked` rather than being simulated.

## Google OAuth — owner credential required
Frontend support is implemented and the admin readiness panel detects whether the provider is enabled. In Google Cloud create a Web OAuth client, then configure Supabase Auth → Providers → Google with the Client ID and Client Secret.

Authorized redirect URI:
`https://iqavukfmeahqnovrkcuo.supabase.co/auth/v1/callback`

Never commit the Google client secret. After configuration, run a real Google sign-in and confirm the new profile is `public_user`.

## Leaked-password protection — Supabase Auth setting required
Supabase Security Advisor currently reports leaked-password protection as disabled. Enable Supabase Auth leaked-password protection before public launch, then rerun the security advisor and the password acceptance checks. This is a platform Auth control, not a frontend feature.

## Auth URLs — Supabase Auth setting required
Current production platform URL:
`https://marketpulse-khaki.vercel.app`

Set the Supabase Auth Site URL to the final production hostname and allow the current production URL plus the final custom HTTPS domain for OAuth/confirmation/reset flows. Preview hosts should only be allow-listed when needed for controlled testing. The frontend uses `window.location.origin` for OAuth/reset redirects, so source changes are not required when the final domain changes.

## Custom domain — domain ownership/DNS required
Choose and own the final domain, attach it to the Vercel project, apply the DNS records Vercel provides and verify HTTPS. Then add that exact origin to Supabase Auth. Do not hard-code or claim ownership of an unpurchased/unverified domain.

## SMTP — verified sender required
Configure a verified sending domain and custom SMTP for confirmation/reset email delivery. Rotate any SMTP/API credential that was previously exposed in chat or logs. Test signup confirmation and password reset before marking consumer identity acceptance passed.

## First real field agents — real people required
The production database has staffing slots `PH-AGENT-01`, `PH-AGENT-02` and `PH-AGENT-03` for Choba, Creek Road and Mile 3. They intentionally do not create users. A real person must create/confirm an account before a super admin can promote the account to Field Agent and assign the target market.

## Real pilot price data — physical field capture required
Do not seed production observations to satisfy readiness. Product qualification requires >=3 verified observations, >=2 markets and >=2 independent agents within 72 hours. Admin → Launch operations shows the live coverage gaps and priority order.

## GitHub backup secret — repository secret required
Add `MARKETPULSE_DB_URL` as a GitHub Actions secret containing a production database connection URL with the minimum privilege needed for `pg_dump`. Never commit it to the repository. The daily logical-backup workflow fails when the secret is absent; at least one artifact and one isolated restore must succeed before the recovery acceptance step is passed.

## Current owner-only blockers
As of the production launch configuration pass, these must be completed by the account/domain owner or real field team:
1. Google OAuth Client ID/Secret.
2. Supabase leaked-password protection.
3. Supabase production Site URL/redirect allow-list.
4. Verified production SMTP sender.
5. Final custom-domain purchase/DNS/Vercel attachment.
6. GitHub `MARKETPULSE_DB_URL` secret.
7. Real agent signup/onboarding and physical market submissions.
