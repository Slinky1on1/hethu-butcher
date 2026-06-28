import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SessionData, defaultSession, sessionOptions } from "./config";

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireOwner() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/admin/login");
  }
  return session;
}

export async function loginOwner(pin: string): Promise<boolean> {
  const ownerPin = process.env.OWNER_PIN || "1234";
  if (pin !== ownerPin) return false;
  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();
  return true;
}

export async function logoutOwner() {
  const session = await getSession();
  session.isLoggedIn = defaultSession.isLoggedIn;
  await session.save();
}
