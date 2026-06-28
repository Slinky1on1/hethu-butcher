import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SessionData, defaultSession, sessionOptions } from "./config";
import { prisma } from "./prisma";
import { verifyOwnerPin } from "./pin";

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireOwner(businessSlug: string) {
  const session = await getSession();
  if (!session.isLoggedIn || session.businessSlug !== businessSlug) {
    redirect(`/b/${businessSlug}/admin/login`);
  }
  if (!session.businessId) {
    redirect(`/b/${businessSlug}/admin/login`);
  }
  return session;
}

export async function loginOwner(
  businessSlug: string,
  pin: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, active: true },
  });
  if (!business) return { ok: false, error: "Business not found." };

  const valid = await verifyOwnerPin(pin, business.ownerPinHash);
  if (!valid) return { ok: false, error: "Wrong PIN. Try again." };

  const session = await getSession();
  session.isLoggedIn = true;
  session.businessId = business.id;
  session.businessSlug = business.slug;
  await session.save();
  return { ok: true };
}

export async function logoutOwner() {
  const session = await getSession();
  session.isLoggedIn = defaultSession.isLoggedIn;
  session.businessId = defaultSession.businessId;
  session.businessSlug = defaultSession.businessSlug;
  await session.save();
}

export function getOwnerBusinessId(session: SessionData): string {
  if (!session.businessId) throw new Error("Not authenticated");
  return session.businessId;
}
