# MarketPulse — Deploy Once

This package is the frontend to upload to Google AI Studio. The canonical backend is already live in Supabase project `iqavukfmeahqnovrkcuo`.

## 1. Upload and publish this project

Import/upload this package into Google AI Studio and publish it. Do not recreate the UI or regenerate the backend schema.

The browser-safe Supabase project URL and publishable key are already configured. Do not add a service-role or secret key to AI Studio.

## 2. Set the final MarketPulse URL in Supabase Auth

After AI Studio gives the final production origin, open Supabase Authentication → URL Configuration.

- Site URL = the final MarketPulse origin
- Redirect URLs = include that same origin

Email confirmation, password recovery and Google OAuth all return through this URL.

## 3. Activate Google login — no frontend re-upload required

Create a Google **Web application** OAuth client.

Google settings:

- Authorized JavaScript origin = the final MarketPulse origin
- Authorized redirect URI = `https://iqavukfmeahqnovrkcuo.supabase.co/auth/v1/callback`

Then enter the Google Client ID and Client Secret in Supabase Authentication → Providers → Google and enable the provider.

The MarketPulse auth screen checks Supabase provider settings automatically. Once Google is enabled, **Continue with Google** becomes active without another code upload.

## 4. Make email/password public-ready

Before allowing arbitrary public email signups, configure custom SMTP in Supabase Authentication → SMTP Settings. Supabase's built-in mail service is for development and is not suitable for public confirmation/reset delivery.

Google OAuth does not depend on MarketPulse custom SMTP for the Google sign-in itself.

## 5. Security toggle

Enable Supabase Auth → Leaked Password Protection. This is the only current Supabase security-advisor warning.

## Expected account flow

1. Person chooses **Continue with Google** or **Sign Up with Email**.
2. Supabase creates one MarketPulse identity.
3. New account role is always **Consumer (`public_user`)**.
4. Google name/avatar are copied into the MarketPulse profile automatically; email users can update their profile after login.
5. Unconfirmed email identities cannot receive staff roles.
6. Only the MarketPulse super admin can promote a confirmed account to Field Agent or Verifier/Admin.
7. On the next session restore/login, MarketPulse opens the workspace authorized by the database role.
