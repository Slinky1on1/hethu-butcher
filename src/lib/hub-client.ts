const HUB_PATH = "/super-admin/api";

export function hubConfigured(): boolean {
  return Boolean(process.env.CENTRAL_HUB_URL?.trim() && process.env.HUB_SECRET?.trim());
}

export function hubBaseUrl(): string {
  const url = (process.env.CENTRAL_HUB_URL || "").trim().replace(/\/+$/, "");
  if (!url) throw new Error("CENTRAL_HUB_URL is not configured");
  return url;
}

export function hubSecret(): string {
  const secret = (process.env.HUB_SECRET || "").trim();
  if (!secret) throw new Error("HUB_SECRET is not configured");
  return secret;
}

export function connectInstanceId(slug: string): string {
  return `connect-${slug}`;
}

export type HubHeartbeatResponse = {
  success?: boolean;
  plan?: { planId: string; planName: string };
  billing?: {
    isSuspended?: boolean;
    hasOverdue?: boolean;
    message?: string;
    paymentReview?: boolean;
  } | null;
  paymentPending?: { isPending?: boolean; message?: string } | null;
};

export async function postToHub<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${hubBaseUrl()}${HUB_PATH}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: hubSecret(), ...body }),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Hub request failed (${res.status})`);
  }
  return data;
}
