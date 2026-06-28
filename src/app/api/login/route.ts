import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const pin = String(formData.get("pin") || "").trim();
  const ownerPin = process.env.OWNER_PIN || "1234";
  const base = request.nextUrl.origin;

  if (pin !== ownerPin) {
    return NextResponse.redirect(`${base}/admin/login?error=wrong-pin`, 303);
  }

  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.redirect(`${base}/admin`, 303);
}
