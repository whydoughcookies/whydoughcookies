# Deploying to Cloudflare Pages (migration guide)

> How to deploy Why Dough Cookies directly to Cloudflare Pages instead of
> relying on the GitHub ↔ Pages auto-build integration.
>
> Updated: 2026-08-09

## Understanding the move

**Cloudflare does not host git repositories** — it hosts the *deployment*
(Cloudflare Pages). Your code still needs a home. Two paths:

- **Path A (recommended): keep GitHub as the code repo**, deploy via
  Cloudflare-native tooling (`wrangler`) triggered by GitHub Actions.
  You keep git history + collaboration; the build/deploy is 100% Cloudflare's.
- **Path B: no GitHub involvement.** Repo stays local (or another host);
  you run `npx wrangler pages deploy .` yourself.

Both share steps 1–8. Choose at step 9.

---

## Prerequisites

- Node.js installed. `wrangler` is already in `node_modules` (or `npm i -D wrangler`).
- Cloudflare account with `whydoughcookies.com` (already on Cloudflare).
- Site uses **Pages Functions** (`functions/`) — supported by both paths.
- Repo already has `wrangler.toml` + `package.json` (committed on `seo-tier1`).

---

## 1. Log in to Cloudflare from your machine

```bash
npx wrangler login
```

Opens a browser → authorize. (For CI, use `CLOUDFLARE_API_TOKEN` +
`CLOUDFLARE_ACCOUNT_ID` env vars instead.)

## 2. Create (or confirm) the Pages project

```bash
npx wrangler pages project create whydoughcookies --production-branch main
```

If it already exists from the GitHub integration, reuse it — but disconnect the
integration in step 10 to avoid double-deploys.

## 3. `wrangler.toml` (already in repo)

`name`, `compatibility_date`, `pages_build_output_dir = "."`, plus `[vars]`
(Resend + PayMongo public key) and commented KV/D1 bindings for later.

## 4. Set secrets & env vars

```bash
npx wrangler pages secret put RESEND_API_KEY   # required before going live
```

Repeat for other secrets (`PAYMONGO_SECRET_KEY`, `PAYMONGO_WEBHOOK_SECRET` when
PayMongo ships). Non-secret vars live in `wrangler.toml` `[vars]` or the
dashboard (Settings → Functions → Environment variables).

## 5. KV namespace (used by PayMongo order status)

```bash
npx wrangler kv namespace create ORDERS
# paste the returned id + preview_id into wrangler.toml under [[kv_namespaces]]
```

## 6. (Later, for the D1 order backend — ROADMAP B.1)

```bash
npx wrangler d1 create whydough-orders
npx wrangler d1 execute whydough-orders --file=./schema.sql --remote
```

## 7. Deploy the site

```bash
npm run deploy:prod        # == npx wrangler pages deploy . --branch main
```

**⚠️ Deploy to the production branch (`main`, set in step 2).** Running plain
`wrangler pages deploy .` while on a feature branch (e.g. `seo-tier1`) creates a
*preview* deployment — production stays empty and the custom domain serves
"Deployment Not Found". Use `--branch main` (or `npm run deploy:prod`).

Uploads static files **and** compiles `functions/` automatically (so
`/api/notify` works). Output prints a `*.pages.dev` URL.

## 8. Attach the custom domain (dashboard — there is NO `wrangler pages domain` CLI command)

1. Cloudflare dashboard → **Workers & Pages** → select the `whydoughcookies` project.
2. **Custom domains** tab → **Set up a custom domain**.
3. Enter `www.whydoughcookies.com` → Cloudflare detects the domain is on your
   account → **Activate domain** (the DNS record is created automatically).
4. Repeat for the apex `whydoughcookies.com`, or add a **redirect rule** so one
   canonical host forwards to the other (pick one primary host — the sitemap and
   canonical tags use `www.`).

Note: the domain can only be attached after the first successful deployment
(step 7).

---

## 9a. Path A — automate with GitHub Actions (repo already has the workflow)

`.github/workflows/deploy.yml` deploys on every push to `main` via wrangler.

Set GitHub repo secrets:

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | API token (My Profile → API Tokens) scoped to **Cloudflare Pages:Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

## 9b. Path B — no GitHub

Run `npm run deploy` (i.e., `npx wrangler pages deploy .`) whenever you update
the site. Keep the repo local or on any other host.

---

## 10. Decommission the old GitHub integration (do this LAST)

Cloudflare Pages dashboard → project → **Settings → Builds & deployments** →
disconnect the GitHub connection. Otherwise the auto-build and wrangler deploys
fight over the same project. If GitHub Pages was ever enabled, disable it in
repo Settings → Pages (the `CNAME` file is then optional/harmless).

## 11. Verify the migration

```bash
# Functions deployed?
curl -s -X POST https://www.whydoughcookies.com/api/notify -d '{}' -H 'Content-Type: application/json'

# Security headers applied?
curl -sI https://www.whydoughcookies.com/ | grep -i "content-security-policy"

# SEO files resolve?
curl -sI https://www.whydoughcookies.com/sitemap.xml
curl -sI https://www.whydoughcookies.com/robots.txt
```

Then place a test order and confirm the email still reaches
`whydoughcookies@gmail.com` (requires `RESEND_API_KEY` set).

---

## Gotchas

1. **Resend first** — until `RESEND_API_KEY` is set in Cloudflare, order
   notifications silently fail (`/api/notify` returns 500).
2. **Don't set long cache expiries** on unversioned files (`styles.min.css`,
   JS) — stale-update bugs. Let Cloudflare use its defaults.
3. **The PayMongo stash** (`stash@{0}`) contains its own `wrangler.toml` /
   `package.json` — if you pop it later, keep the committed versions (they're
   equivalent + extended) and resolve `.gitignore`/`.dev.vars.example` conflicts
   in favor of the working-tree files.
