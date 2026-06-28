import { hubConfigured, postToHub, connectInstanceId } from "./hub-client";

export async function provisionConnectTenant(opts: {
  slug: string;
  name: string;
  email: string;
  url: string;
  planId?: string;
}) {
  if (!hubConfigured()) {
    return { ok: true as const, skipped: true };
  }

  const instanceId = connectInstanceId(opts.slug);
  await postToHub("/connect/provision", {
    instanceId,
    name: opts.name,
    url: opts.url,
    email: opts.email,
    companyName: opts.name,
    planId: opts.planId || "connect_trial",
  });

  return { ok: true as const, instanceId };
}
