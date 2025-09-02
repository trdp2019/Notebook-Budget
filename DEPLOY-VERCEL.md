# Deploy to Vercel

This project builds a static SPA into `dist/spa`. Deploy that folder to Vercel.

## 1) Vercel Dashboard (recommended)
1. Push your repo to GitHub/GitLab/Bitbucket.
2. In Vercel → “Add New Project” → Import the repo.
3. Framework Preset: Vite (or Other if not detected).
4. Build Command: `npm run build:client`
5. Output Directory: `dist/spa`
6. Create the following `vercel.json` in the repo root:
```json
{
  "cleanUrls": true,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
7. Deploy.

The rewrite makes React Router deep-links work (SPA fallback to `index.html`).

## 2) Vercel CLI (optional)
```bash
npm i -g vercel
vercel                   # first time, set build to npm run build:client, output dist/spa
vercel --prod            # deploy to production
```

## API/Functions note
- This template includes Netlify Functions under `netlify/functions` for the Netlify deploy path.
- For Vercel, either deploy purely static (recommended) or migrate APIs to `api/*.ts` under a `vercel` serverless setup separately.

## Environment variables
- None required by default. If you add any, define them in the Vercel project → Settings → Environment Variables.

## Troubleshooting
- Blank/404 on deep links → ensure `vercel.json` rewrite is present and redeploy.
- Wrong publish directory → must be `dist/spa`.
- Build fails on server code → make sure the build command is exactly `npm run build:client` so only the SPA is built.
