import {
  createDashboardData,
  fallbackDashboardData,
  type DashboardData,
} from "@/lib/dashboard-data";
import type { PublicDashboardPayload } from "@/lib/types";

const DATA_URL =
  process.env.EUPHORIA_PUBLIC_DASHBOARD_URL ??
  process.env.NEXT_PUBLIC_EUPHORIA_DASHBOARD_DATA_URL ??
  process.env.NEXT_PUBLIC_EUPHORIA_PUBLIC_DASHBOARD_URL;

export async function getDashboardData(): Promise<DashboardData> {
  if (!DATA_URL) return fallbackDashboardData;

  try {
    const response = await fetch(DATA_URL, {
      headers: { accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) return fallbackDashboardData;

    const payload = (await response.json()) as PublicDashboardPayload;
    return createDashboardData(payload, "remote");
  } catch {
    return fallbackDashboardData;
  }
}
