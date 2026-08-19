# MarketPulse Authentication — Production Setup

MarketPulse now uses one Supabase Auth identity system for every person.

## User-facing login methods

1. **Google OAuth** — `Continue with Google`
2. **Email + password** — Log In / Sign Up
3. **Password recovery** — email reset link
4. **Email confirmation resend** — for unconfirmed email signups

Every newly-created account starts as `public_user`. A browser user can never choose Field Agent, Verifier/Admin or Super Admin during signup.

## Role routing

After Supabase restores a successful session:

- `public_user` → Consumer Home
- `field_agent` → Agent Dashboard
- `verifier_admin` → Admin Overview / Verification
- `super_admin` → Admin Overview + Users & Access + Catalog

Only the existing MarketPulse `super_admin` can promote a registered account to `field_agent` or `verifier_admin`. Staff promotion is blocked until the Supabase identity is confirmed.

## Google OAuth activation

The frontend is already implemented. It reads `/auth/v1/settings` when the auth modal opens. If Google is enabled in Supabase, the Google button becomes active automatically. No new frontend build is required after provider activation.

To activate Google in Supabase, create a **Google Web OAuth client** and configure it in Supabase Authentication → Providers → Google.

Google OAuth client settings:

- **Authorized JavaScript origin:** the final deployed MarketPulse origin, for example `https://marketpluse.ai.studio`
- **Authorized redirect URI:** `https://iqavukfmeahqnovrkcuo.supabase.co/auth/v1/callback`

Then configure the Google **Client ID** and **Client Secret** on the Supabase Google provider.

Do not put the Google Client Secret in this frontend project.

## Supabase URL configuration

In Supabase Authentication → URL Configuration:

- **Site URL:** final deployed MarketPulse URL
- **Redirect URLs:** include the same final MarketPulse URL used by email confirmation, password recovery and Google OAuth return flow.

## OAuth profile behavior

When Google creates a new Supabase user, the database trigger automatically copies:

- email
- Google display name
- Google avatar/picture
- auth provider (`google`)

into `public.profiles`. The role remains `public_user`.

If Terms/Privacy have not yet been accepted, MarketPulse blocks continuation with the legal-consent modal until the user accepts them.

Users can later update personal profile fields (name, photo, phone, gender, date of birth, city/state/country, bio), but cannot change their own role, account status or auth provider.

## Production email delivery

Email/password authentication is implemented in the frontend and Supabase Auth, including signup confirmation, resend confirmation, login, forgot password and password recovery.

For real public users, configure **custom SMTP** in Supabase Authentication → Emails / SMTP Settings. Supabase's built-in SMTP service is for development and is not suitable for public production delivery; without custom SMTP it may refuse confirmation/reset emails to addresses outside the project team.

Typical SMTP providers supported by Supabase include Resend, AWS SES, Postmark, SendGrid, ZeptoMail and Brevo. Keep SMTP credentials only in Supabase; they do not belong in this frontend project.

Recommended launch behavior:

- Google OAuth: primary fast signup/login once the Google provider is enabled.
- Email + password: secondary login/signup path once custom SMTP is configured.
- Both create the same MarketPulse identity and the same `public_user` role.

Enabling Google OAuth or changing SMTP later does **not** require another MarketPulse frontend code change. They are Supabase/Auth provider settings.
