# Truprice.ng Authentication — Production Setup

Truprice.ng uses one Supabase Auth identity system for consumers, field agents, verifiers/admins and the super admin.

## User-facing login methods

1. **Google OAuth** — `Continue with Google`
2. **Email + password** — Log In / Sign Up
3. **Password recovery** — email reset link
4. **Email confirmation resend** — for unconfirmed email signups

Every newly-created account starts as `public_user`. A browser user can never choose Field Agent, Verifier/Admin or Super Admin during signup.

## Google OAuth implementation

The frontend implementation is already complete. The auth modal checks Supabase `/auth/v1/settings`; when the Google provider is enabled, the Google button becomes active automatically.

The application starts OAuth with:

- provider: `google`
- return URL: the current browser origin
- Google account chooser: enabled

No Google Client Secret is stored in the frontend.

## Google Auth Platform configuration

Create a **Web application** OAuth client in Google Auth Platform.

Authorized JavaScript origins should include the real production origin, for example:

- `https://truprice.ng` once the custom domain is attached
- the current Vercel production origin while it remains in use
- `http://localhost:3000` only for development

Authorized redirect URI:

- `https://iqavukfmeahqnovrkcuo.supabase.co/auth/v1/callback`

Copy the Google **Client ID** and **Client Secret** into Supabase Authentication → Providers → Google and enable the provider.

Never commit the Google Client Secret to GitHub or expose it through a `VITE_` environment variable.

## Supabase URL configuration

In Supabase Authentication → URL Configuration:

- **Site URL:** the canonical Truprice.ng production origin
- **Redirect URLs:** include the production origin used by Google OAuth, email confirmation and password recovery
- keep localhost only if local development still needs it

## OAuth profile behavior

When Google creates a new Supabase user, the database profile trigger copies supported identity information such as:

- email
- Google display name
- Google avatar/picture
- auth provider (`google`)

The application role remains `public_user`.

If Terms/Privacy have not yet been accepted, Truprice.ng blocks continuation with the legal-consent modal until the user accepts them.

Users can later update normal profile fields, but cannot change their own role, account status or auth provider.

## Required production test

After enabling Google:

1. Open Truprice.ng in an incognito/private browser window.
2. Select **Continue with Google**.
3. Sign in with a Google account that has never used Truprice.ng.
4. Confirm the browser returns to the production origin.
5. Confirm a `public_user` profile is created with the Google identity information.
6. Confirm Terms/Privacy acceptance appears where required.
7. Log out and sign in again with Google.
8. Confirm the user cannot access Field Agent/Admin areas.

## Production email delivery

Email/password authentication is separate from Google OAuth. For public email signup and password recovery, configure custom SMTP in Supabase rather than relying on development mail delivery.

Google OAuth should be the primary fast signup/login path; email/password remains the secondary authentication method.
