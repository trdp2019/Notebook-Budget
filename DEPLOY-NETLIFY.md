# Deploy to Netlify

This project ships with Netlify config and builds to `dist/spa`.

## 1) One‑click (recommended)
- Push your repo to GitHub/GitLab/Bitbucket
- In Netlify: New site from Git → select the repo
- Build command: `npm run build:client` (from netlify.toml)
- Publish directory: `dist/spa`
- Functions directory: `netlify/functions`
- Deploy

Netlify will use `netlify.toml`:
```toml
[build]
  command = "npm run build:client"
  functions = "netlify/functions"
  publish = "dist/spa"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
  force = true
```

### SPA routing (React Router)
If deep links 404, add this rule to `netlify.toml` and redeploy:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 2) CLI (optional)
```bash
# Install once
npm i -g netlify-cli

# Inside the project
netlify init        # link to a Netlify site
netlify deploy --build --prod
```
This runs the build and publishes `dist/spa` with functions bundled from `netlify/functions`.

## Environment variables
- None required by default. If you add any, set them in Site settings → Build & deploy → Environment.

## Common gotchas
- Wrong publish dir → ensure it’s `dist/spa`
- Functions not found → ensure `netlify/functions` exists (it does) and `serverless-http` is installed (it is)
- Router 404s → add the SPA redirect above

You're live! 🎈
