function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

const dashboardUrl =
  argValue("--dashboard-url") ??
  process.env.DASHBOARD_QA_URL ??
  "https://euphorialens.vercel.app/leaderboard";
const officialApiBase = (process.env.EUPHORIA_OFFICIAL_API_BASE_URL ?? "https://api.mainnet.euphoria.finance").replace(
  /\/$/,
  "",
);
const requireOfficial = process.env.DASHBOARD_QA_REQUIRE_OFFICIAL === "1";

function officialUrl() {
  const url = new URL(`${officialApiBase}/leaderboard.getLeaderboard`);
  url.searchParams.set("batch", "1");
  url.searchParams.set(
    "input",
    JSON.stringify({
      "0": {
        json: {
          timeWindow: "all",
          metric: "payouts",
        },
      },
    }),
  );
  return url.toString();
}

function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const parsed = Number(value.replace(/[$,+\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function extractPayload(payload) {
  const first = Array.isArray(payload) ? payload[0] : payload;
  if (!first || typeof first !== "object") return first;
  if (first.error) {
    throw new Error(first.error?.json?.message ?? first.error?.message ?? "official API error");
  }
  return first.result?.data?.json ?? first.result?.data ?? first.json ?? first;
}

async function fetchOfficialTop() {
  try {
    const response = await fetch(officialUrl(), {
      cache: "no-store",
      headers: {
        accept: "application/json",
        origin: "https://euphoria.finance",
        referer: "https://euphoria.finance/leaderboard",
      },
    });
    const payload = await response.json();
    const data = extractPayload(payload);
    const entries = Array.isArray(data?.entries) ? data.entries : [];
    const top = entries[0];
    const valueUsd = parseNumber(top?.value);
    return {
      status: valueUsd == null ? "unavailable" : "ok",
      rowCount: entries.length,
      top: valueUsd == null ? null : {
        username: top.username ?? null,
        displayName: top.displayName ?? top.username ?? null,
        valueUsd,
        valueDisplay: formatUsd(valueUsd),
      },
      error: null,
    };
  } catch (error) {
    return {
      status: "unavailable",
      rowCount: 0,
      top: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function fetchDashboardHtml() {
  const response = await fetch(dashboardUrl, {
    cache: "no-store",
    headers: {
      accept: "text/html",
    },
  });
  return {
    status: response.status,
    ok: response.ok,
    html: await response.text(),
  };
}

const [official, dashboard] = await Promise.all([fetchOfficialTop(), fetchDashboardHtml()]);
const renderedOldDefault = /Net PNL leaderboard|Sortable Net PNL rankings/i.test(dashboard.html);
const renderedOfficialHeading = /Official Euphoria leaderboard|Official all-time leaderboard/i.test(dashboard.html);
const officialTopRendered = official.top ? dashboard.html.includes(official.top.valueDisplay) : false;

const qa = {
  generatedAt: new Date().toISOString(),
  dashboardUrl,
  officialApiBase,
  official,
  dashboard: {
    status: dashboard.status,
    ok: dashboard.ok,
    renderedOldDefault,
    renderedOfficialHeading,
    officialTopRendered,
  },
  status:
    dashboard.ok &&
    !renderedOldDefault &&
    renderedOfficialHeading &&
    (official.status !== "ok" || officialTopRendered) &&
    (!requireOfficial || official.status === "ok")
      ? "pass"
      : "fail",
};

console.log(JSON.stringify(qa, null, 2));

if (qa.status !== "pass") {
  process.exitCode = 1;
}
