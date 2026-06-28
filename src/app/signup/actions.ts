"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashOwnerPin } from "@/lib/pin";
import { slugifyBusinessName, isValidBusinessSlug, isReservedSlug } from "@/lib/slug";
import { businessPublicUrl } from "@/lib/tenant";
import { provisionConnectTenant } from "@/lib/hub-provision";
import { connectInstanceId } from "@/lib/hub-client";

export async function signupAction(formData: FormData) {
  const companyName = String(formData.get("companyName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const industry = String(formData.get("industry") || "general").trim();
  let slug = String(formData.get("slug") || "").trim().toLowerCase();

  if (!companyName || !email || !phone) {
    redirect("/signup?error=missing");
  }
  if (!email.includes("@")) {
    redirect("/signup?error=email");
  }

  if (!slug) slug = slugifyBusinessName(companyName);
  if (!isValidBusinessSlug(slug) || isReservedSlug(slug)) {
    redirect("/signup?error=slug");
  }

  const existing = await prisma.business.findUnique({ where: { slug } });
  if (existing) {
    redirect("/signup?error=taken");
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);
  const tempPin = String(Math.floor(1000 + Math.random() * 9000));

  await prisma.business.create({
    data: {
      slug,
      name: companyName,
      industry,
      email,
      phone,
      whatsapp: phone.replace(/\D/g, "").replace(/^0/, "27"),
      hubInstanceId: connectInstanceId(slug),
      planId: "connect_trial",
      trialEndsAt,
      onboardingStep: 1,
      ownerPinHash: await hashOwnerPin(tempPin),
    },
  });

  try {
    await provisionConnectTenant({
      slug,
      name: companyName,
      email,
      url: businessPublicUrl(slug),
      planId: "connect_trial",
    });
  } catch {
    // Signup still succeeds if hub is offline
  }

  redirect(`/onboarding/${slug}?step=1&welcome=1`);
}
