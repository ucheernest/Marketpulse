<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/44552a5e-ba2b-4f58-b0bb-ead308f72a86

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Supabase authentication configuration

This corrected build targets the MarketPulse Supabase project `iqavukfmeahqnovrkcuo`.
The browser client uses the project publishable key (never a service-role/secret key).
New accounts are always created as `public_user`; privileged roles are assigned only in the database.

