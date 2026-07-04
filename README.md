# EuphoriaLens Dashboard

Independent Next.js dashboard for public Euphoria Mainnet on-chain analytics.

EuphoriaLens is an independent research dashboard. It is not affiliated with, endorsed by, or sponsored by Euphoria Finance.

## Data Mode

- Fetches the approved public dashboard JSON bundle from Cloudflare R2 when `EUPHORIA_PUBLIC_DASHBOARD_URL` is set.
- Prefers split route-specific JSON files from `gold/public/v3/` and falls back to the legacy `public-dashboard.json` contract when needed.
- Reads the public JSON feed dynamically on the server so the dashboard does
  not show stale page-cache metrics after the R2 feed advances.
- Fetches the official Euphoria all-time leaderboard from the public app data source when it is accessible without private credentials.
- Keeps official leaderboard rows separate from EuphoriaLens on-chain wallet/account analytics.
- Falls back to bundled public-shaped records if the feed is not configured or unavailable.
- Uses `NEXT_PUBLIC_EUPHORIA_ASSET_BASE_URL` for optional Cloudflare-hosted heavy media assets.
- No secrets or production credentials are required by the dashboard app.
- No private identity joins.
- Production data must remain public-safe Euphoria Mainnet aggregates.

Current public metric classes:

- official app metrics: official all-time leaderboard rows and official trading stats when exposed by the public app data source
- verified activity metrics: on-chain observed volume, Total Taps, trading accounts, average bet size, and largest payout candidates
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

Optional split-data base URL:

```text
EUPHORIA_PUBLIC_DATA_BASE_URL=https://<r2-public-domain>/gold/public/
```

If the split base URL is unset, the app derives it from `EUPHORIA_PUBLIC_DASHBOARD_URL`.

Optional official-source configuration:

```text
EUPHORIA_OFFICIAL_API_BASE_URL=https://api.mainnet.euphoria.finance
EUPHORIA_OFFICIAL_LEADERBOARD_URL=
EUPHORIA_OFFICIAL_REVALIDATE_SECONDS=300
EUPHORIA_OFFICIAL_FETCH_TIMEOUT_MS=5000
```

Do not configure private cookies, browser sessions, wallet keys, or API secrets in this dashboard repository. If the official
app route is unavailable without a session, the dashboard shows an official-source warning and does not substitute
estimated Net PNL as the official leaderboard.

Custom domain recommendations:

- `euphorialens.xyz`
- `euphorialens.com`
- `euphorialens.app`

Vercel setup:

- Import this public repository into the existing `euphorialens` Vercel project, or create a new Vercel project from this repository.
- Keep the project root as `/`; this repository is already the dashboard app root.
- Keep production branch as `main`.
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

## Freshness Semantics

The dashboard separates two timestamps:

- `Dashboard feed refreshed`: when the public JSON bundle was generated and uploaded.
- `On-chain data through`: the latest lifecycle event timestamp included in the metrics.
- `Official leaderboard generated`: when the dashboard last fetched the official app data source or public official mirror.

This avoids treating a freshly rebuilt dashboard feed as proof that on-chain indexing is fully caught up.

## Public Safety Boundary

This repository is dashboard-only. It should not contain collectors, raw data,
private Modeling outputs, wallet-handle joins, `.env.local`, `.vercel`, API keys,
operator logs, or private WebSocket/Binance/Redstone research artifacts.
