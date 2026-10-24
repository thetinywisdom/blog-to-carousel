# Lovable export — Blog to Carousel

Snapshot copied from Lovable project `7d9ff253-7d3d-47b0-8315-a03ad6bc26b9` at commit `65af8836652c0548c511263b0f3dc861c637c401` on 2026-10-24 (JST) so the code survives cancelling the Lovable subscription.
This repo was NOT created via Lovable's GitHub sync; files were copied one by one through the Lovable API.

- Lovable editor: https://lovable.dev/projects/7d9ff253-7d3d-47b0-8315-a03ad6bc26b9
- Published URL: https://slides.thetinywisdom.com
- Files in Lovable project: 138 (44 binary)

## Binary files not recoverable through the API
- none

## Excluded (large third-party / regenerable data)
- `bun.lockb`

## Lovable-hosted assets (`*.asset.json`) — downloaded copies
The `*.asset.json` files point at Lovable's CDN (`/__l5e/assets-v1/...`), which only works on Lovable hosting.
The real files were downloaded next to each json (same name without `.asset.json`). After leaving Lovable, change imports to use those files directly.
- none

## Things that do NOT move with this code
- **Supabase (Lovable Cloud) database, auth users, storage, edge functions deployment and secrets** live in Lovable's Supabase project. Export data/schema before cancelling, or create your own Supabase project and run the migrations.
- **Secrets / env vars** (names only; values are not in this repo except the public publishable keys in `.env`): see list below.
- **Hosting**: `*.lovable.app` / custom domain hosting stops; redeploy (e.g. Vercel/Netlify/Cloudflare) and repoint DNS.
- `@lovable.dev/*` npm packages are public on npmjs and keep working; `bun.lock` may reference Lovable's private npm cache — delete it and reinstall if install fails.
## Project-specific notes

- **Stack:** Vite + React SPA (shadcn/ui, Tailwind), Supabase client, vitest. App title "Blog to Carousel". Slides rendered and exported client-side (`ExportSection.tsx`).
- **Edge functions (2):** `parse-article` (fetches a blog URL and extracts content; called via `supabase.functions.invoke("parse-article")`) and `proxy-image` (CORS image proxy for export). Neither reads any secrets/env vars and neither depends on Lovable APIs — deploy them as-is to a new Supabase project (`supabase functions deploy`).
- **Database:** no tables and no migrations — nothing to migrate.
- **Lovable-specific code:** `src/integrations/supabase/previewAuthStorage.ts` (auth-session broker for the Lovable editor preview; harmless outside Lovable, falls back to localStorage — can be removed) and dev-only `lovable-tagger` plugin in vite.config.ts.
- **Env names (values not copied):** client `.env`: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID — point these at the new Supabase project.
- **Published at:** https://slides.thetinywisdom.com (custom domain on Lovable hosting).
