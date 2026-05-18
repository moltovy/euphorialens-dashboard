import { PublicShell } from "@/components/public-shell";

const metricDefinitions = [
  {
    term: "On-chain Volume",
    definition: "Total observed public lifecycle activity volume.",
  },
  {
    term: "Indexed Taps",
    definition: "Matched observed lifecycle tap, open, and settlement activity.",
  },
  {
    term: "Trading Accounts",
    definition: "Platform account addresses observed in Euphoria lifecycle records.",
  },
  {
    term: "Net PNL (Est.)",
    definition: "Estimated from observed account lifecycle cashflows. It is not wallet-level realized PNL.",
  },
  {
    term: "Platform Win Rate",
    definition: "Recipient-aware platform account outcome rate from decoded lifecycle settlements.",
  },
  {
    term: "Largest Payout",
    definition: "Largest observed Engine-to-account platform payout.",
  },
  {
    term: "Trader Concentration",
    definition: "Share of observed volume attributable to the largest platform accounts.",
  },
];

export default function DocsPage() {
  return (
    <PublicShell active="/docs">
      <main className="px-4 py-8 md:py-10">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-white/10 bg-euphoria-panel/[0.86] p-8 shadow-panel backdrop-blur md:p-10">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-euphoria-pink">Public Docs</div>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">EuphoriaLens Docs</h1>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
                <h2 className="font-bold text-white">About EuphoriaLens</h2>
                <p className="mt-2 text-sm leading-6 text-euphoria-muted">
                  EuphoriaLens is an on-chain analytics dashboard for public Euphoria Mainnet activity.
                </p>
              </section>
              <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
                <h2 className="font-bold text-white">Independence</h2>
                <p className="mt-2 text-sm leading-6 text-euphoria-muted">
                  EuphoriaLens is not affiliated with, endorsed by, or sponsored by Euphoria Finance.
                </p>
              </section>
            </div>

            <section className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-5">
              <h2 className="font-bold text-white">Data Sources</h2>
              <p className="mt-2 text-sm leading-6 text-euphoria-muted">
                The dashboard uses public Euphoria Mainnet on-chain lifecycle records, public transaction and log data,
                and derived account-level metrics. It does not include linked social handles, private market-data
                research, debug records, or operational logs.
              </p>
            </section>

            <section className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-5">
              <h2 className="font-bold text-white">Refresh Cadence</h2>
              <p className="mt-2 text-sm leading-6 text-euphoria-muted">
                Data is generated from the public pipeline. The dashboard dataset is intended to refresh about every
                five minutes, and Vercel revalidates dashboard data on a 300-second cadence. The footer and top
                freshness badge show the latest generated time.
              </p>
            </section>

            <section className="mt-4">
              <h2 className="font-bold text-white">Metric Definitions</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {metricDefinitions.map((metric) => (
                  <div key={metric.term} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                    <h3 className="font-bold text-white">{metric.term}</h3>
                    <p className="mt-2 text-sm leading-6 text-euphoria-muted">{metric.definition}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
                <h2 className="font-bold text-white">Methodology</h2>
                <p className="mt-2 text-sm leading-6 text-euphoria-muted">
                  The pipeline collects public on-chain events, decodes lifecycle records into public metrics, and
                  publishes a compact dashboard dataset from Cloudflare R2. Missing values are shown as unavailable
                  rather than as zero.
                </p>
              </section>
              <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
                <h2 className="font-bold text-white">Limitations</h2>
                <p className="mt-2 text-sm leading-6 text-euphoria-muted">
                  Account-level metrics are based on observed public lifecycle data. Net PNL (Est.) is estimated, not
                  wallet-level realized PNL. Platform account identity is not real-world identity. Metrics may lag live
                  protocol activity, and methodology is reviewed as Euphoria Mainnet activity evolves.
                </p>
              </section>
            </div>

            <section className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-5">
              <h2 className="font-bold text-white">Technical Stack</h2>
              <p className="mt-2 text-sm leading-6 text-euphoria-muted">
                EuphoriaLens uses an on-chain data pipeline, Cloudflare R2 public JSON, a Vercel / Next.js dashboard,
                and a public analytics layer.
              </p>
            </section>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
