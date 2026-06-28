"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashOwnerPin } from "@/lib/pin";
import { tenantAdminPath, tenantOrderPath } from "@/lib/paths";
import { sendBusinessHeartbeat } from "@/lib/hub-heartbeat";

export async function saveOnboardingStep1(slug: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const bankName = String(formData.get("bankName") || "").trim();
  const bankAccountName = String(formData.get("bankAccountName") || "").trim();
  const bankAccountNumber = String(formData.get("bankAccountNumber") || "").trim();
  const bankBranch = String(formData.get("bankBranch") || "").trim();

  if (!name || !phone) redirect(`/onboarding/${slug}?step=1&error=missing`);

  await prisma.business.update({
    where: { slug },
    data: {
      name,
      phone,
      whatsapp: whatsapp || phone.replace(/\D/g, "").replace(/^0/, "27"),
      bankName,
      bankAccountName,
      bankAccountNumber,
      bankBranch,
      onboardingStep: 2,
    },
  });

  redirect(`/onboarding/${slug}?step=2`);
}

export async function saveOnboardingStep2(slug: string, formData: FormData) {
  const pin = String(formData.get("pin") || "").trim();
  const confirm = String(formData.get("confirmPin") || "").trim();

  if (pin.length < 4 || pin !== confirm) {
    redirect(`/onboarding/${slug}?step=2&error=pin`);
  }

  await prisma.business.update({
    where: { slug },
    data: {
      ownerPinHash: await hashOwnerPin(pin),
      onboardingStep: 3,
    },
  });

  redirect(`/onboarding/${slug}?step=3`);
}

export async function skipOnboardingProducts(slug: string) {
  await prisma.business.update({
    where: { slug },
    data: { onboardingStep: 4 },
  });
  redirect(`/onboarding/${slug}?step=4`);
}

export async function finishOnboarding(slug: string) {
  await prisma.business.update({
    where: { slug },
    data: { onboardingStep: 0 },
  });

  try {
    const business = await prisma.business.findUnique({ where: { slug } });
    if (business) await sendBusinessHeartbeat(business.id);
  } catch {
    // non-fatal
  }

  revalidatePath(tenantOrderPath(slug));
  revalidatePath(tenantAdminPath(slug));
  redirect(tenantAdminPath(slug, "login"));
}
