import { prisma } from "./prisma";
import { businessPublicUrl } from "./tenant";
import {
  connectInstanceId,
  hubConfigured,
  postToHub,
  type HubHeartbeatResponse,
} from "./hub-client";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function sendBusinessHeartbeat(businessId: string) {
  if (!hubConfigured()) return { skipped: true as const };

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business?.active) return { skipped: true as const };

  const today = startOfToday();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [productCount, ordersToday, ordersWeek, pendingOrders] = await Promise.all([
    prisma.product.count({ where: { businessId } }),
    prisma.order.count({
      where: { businessId, createdAt: { gte: today }, status: { not: "cancelled" } },
    }),
    prisma.order.count({
      where: { businessId, createdAt: { gte: weekAgo }, status: { not: "cancelled" } },
    }),
    prisma.order.count({ where: { businessId, status: "pending" } }),
  ]);

  const instanceId = business.hubInstanceId || connectInstanceId(business.slug);
  const appVersion = process.env.npm_package_version || "0.2.0";

  let dbConnected = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  const payload = {
    instanceId,
    product: "connect",
    name: business.name,
    url: businessPublicUrl(business.slug),
    version: appVersion,
    database: { type: "postgresql", connected: dbConnected },
    connect: {
      slug: business.slug,
      industry: business.industry,
      email: business.email,
      productCount,
      ordersToday,
      ordersWeek,
      pendingOrders,
      onboardingStep: business.onboardingStep,
      trialEndsAt: business.trialEndsAt?.toISOString() ?? null,
    },
  };

  const response = await postToHub<HubHeartbeatResponse>("/heartbeat", payload);

  const billing = response.billing;
  const paymentPending = response.paymentPending;
  const locked =
    billing?.isSuspended === true ||
    (paymentPending?.isPending === true && billing?.paymentReview !== true);
  const message =
    billing?.message || paymentPending?.message || null;

  await prisma.business.update({
    where: { id: businessId },
    data: {
      hubInstanceId: instanceId,
      planId: response.plan?.planId || business.planId,
      billingLocked: locked,
      billingMessage: locked ? message : null,
    },
  });

  return { ok: true as const, instanceId, locked };
}

export async function runAllBusinessHeartbeats() {
  if (!hubConfigured()) {
    return { skipped: true, count: 0 };
  }

  const businesses = await prisma.business.findMany({
    where: { active: true },
    select: { id: true },
  });

  const results = [];
  for (const { id } of businesses) {
    try {
      results.push(await sendBusinessHeartbeat(id));
    } catch (e) {
      results.push({
        businessId: id,
        error: e instanceof Error ? e.message : "heartbeat failed",
      });
    }
  }

  return { count: businesses.length, results };
}
