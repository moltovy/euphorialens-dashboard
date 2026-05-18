# EuphoriaLens Dashboard

Independent Next.js dashboard for public Euphoria Mainnet on-chain analytics.

EuphoriaLens is an independent research dashboard. It is not affiliated with, endorsed by, or sponsored by Euphoria Finance.

## Data Mode

- Fetches the approved public dashboard JSON from Cloudflare R2 when `EUPHORIA_PUBLIC_DASHBOARD_URL` is set.
- Uses a 300-second Next.js revalidation window for the public JSON feed.
- Falls back to bundled public-shaped records if the feed is not configured or unavailable.
- Uses `NEXT_PUBLIC_EUPHORIA_ASSET_BASE_URL` for optional Cloudflare-hosted heavy media assets.
- No secrets or production credentials are required by the dashboard app.
- No private identity joins.
- Production data must remain public-safe Euphoria Mainnet aggregates.

Current public metric classes:

- verified activity metrics: on-chain volume, Total Taps, trading accounts, average bet size, and largest payout
- estimated account metrics: Net PNL (Est.) from decoded platform payouts minus observed stakes
- public concentration metrics: top-account volume share, Gini, HHI, and concentration curves

## Public Routes

- `/` - dashboard overview.
- `/leaderboard` - searchable and sortable public leaderboard.
- `/traders` - trader discovery.
- `/traders/[address]` - trader profile pages.
- `/whales` - trader concentration analytics.
- `/docs` - public methodology and data definitions.

## Validation

```bash
npm ci
npm run build
```

## Deployment

The production Vercel app should point `EUPHORIA_PUBLIC_DASHBOARD_URL` at:

```text
https://<r2-public-domain>/gold/public/public-dashboard.json
```

Custom domain recommendations:

- `euphorialens.xyz`
- `euphorialens.com`
- `euphorialens.app`

Vercel setup:

- Import this public repository into the existing `euphorialens` Vercel project, or create a new Vercel project from this repository.
- Keep the project root as `/`; this repository is already the dashboard app root.
- Add the domain in Vercel project Settings -> Domains.
- Configure the DNS record Vercel provides.
- Keep the same `EUPHORIA_PUBLIC_DASHBOARD_URL` environment variable.
- Verify the dashboard still reads the remote public JSON after the domain switch.

All outbound Euphoria trade links use the configured referral URL from `lib/dashboard-data.ts`.

## Heavy Media

To reduce Vercel Fast Data Transfer, this public deploy repository does not ship
the large hero video. It uses the lightweight local poster fallback unless a
public asset CDN/R2 base is configured:

```text
NEXT_PUBLIC_EUPHORIA_ASSET_BASE_URL=https://<cloudflare-public-asset-host>
```

If the variable is unset, the app uses local lightweight `/brand/...` files as fallback.

## Public Safety Boundary

This repository is dashboard-only. It should not contain collectors, raw data,
private Modeling outputs, wallet-handle joins, `.env.local`, `.vercel`, API keys,
operator logs, or private WebSocket/Binance/Redstone research artifacts.
