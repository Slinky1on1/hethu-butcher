import { NextRequest, NextResponse } from "next/server";
import { loginOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tenantAdminPath } from "@/lib/paths";

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

  const business = await prisma.business.findUnique({
    where: { slug },
    select: { onboardingStep: true, billingLocked: true },
  });

  if (business?.onboardingStep && business.onboardingStep > 0) {
    return NextResponse.redirect(`${base}/onboarding/${slug}?step=${business.onboardingStep}`, 303);
  }
  if (business?.billingLocked) {
    return NextResponse.redirect(`${base}${tenantAdminPath(slug, "locked")}`, 303);
  }

  return NextResponse.redirect(`${base}${tenantAdminPath(slug)}`, 303);
}
