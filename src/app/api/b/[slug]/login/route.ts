import { NextRequest, NextResponse } from "next/server";
import { loginOwner } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const formData = await request.formData();
  const pin = String(formData.get("pin") || "").trim();
  const base = request.nextUrl.origin;

  const result = await loginOwner(slug, pin);
  if (!result.ok) {
    return NextResponse.redirect(`${base}/b/${slug}/admin/login?error=wrong-pin`, 303);
  }

  return NextResponse.redirect(`${base}/b/${slug}/admin`, 303);
}
