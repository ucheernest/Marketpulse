# External Launch Configuration

The application code is prepared for these integrations, but they require credentials or infrastructure ownership outside source code.

## Google OAuth
Frontend support is already implemented. In Google Cloud create a Web OAuth client, then configure Supabase Auth → Providers → Google with the Client ID and Client Secret. Authorized redirect URI:
`https://iqavukfmeahqnovrkcuo.supabase.co/auth/v1/callback`
Never commit the Google client secret.

## Leaked-password protection
Enable Supabase Auth leaked-password protection before public launch. This is a platform Auth setting and cannot be safely simulated in frontend code.

## Auth URLs
Current production platform URL: `https://marketpulse-khaki.vercel.app`
Set the Supabase Auth Site URL to the final production hostname and allow both the final custom domain and required Vercel preview/production redirects. The frontend always uses `window.location.origin` for OAuth/reset redirects.

## Custom domain
Choose and own the final domain, add it to the Vercel project, apply the DNS records Vercel provides, then add the final HTTPS origin to Supabase Auth redirect URLs. Do not hard-code or claim ownership of a domain that has not been purchased/verified.

## SMTP
Configure a verified sending domain and custom SMTP for confirmation/reset email delivery. Rotate any SMTP/API credential that was previously exposed in chat or logs.

## GitHub backup secret
Add `MARKETPULSE_DB_URL` as an Actions secret containing a production database connection URL with the minimum privilege needed for `pg_dump`. Never commit it to the repository.
