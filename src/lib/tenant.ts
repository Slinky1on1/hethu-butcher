import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "./prisma";

export type BusinessRecord = {
  id: string;
  slug: string;
  name: string;
  industry: string;
  phone: string;
  whatsapp: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  logoUrl: string | null;
  active: boolean;
};

export function businessBasePath(slug: string) {
  return `/b/${slug}`;
}

export function businessOrderPath(slug: string) {
  return `/b/${slug}/order`;
}

export function businessAdminPath(slug: string, sub = "") {
  const base = `/b/${slug}/admin`;
  return sub ? `${base}/${sub.replace(/^\//, "")}` : base;
}

export function businessPublicUrl(slug: string) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
  return `${appUrl}${businessOrderPath(slug)}`;
}

export const getBusinessBySlug = cache(async (slug: string): Promise<BusinessRecord | null> => {
  const row = await prisma.business.findFirst({
    where: { slug, active: true },
    select: {
      id: true,
      slug: true,
      name: true,
      industry: true,
      phone: true,
      whatsapp: true,
      bankName: true,
      bankAccountName: true,
      bankAccountNumber: true,
      bankBranch: true,
      logoUrl: true,
      active: true,
    },
  });
  return row;
});

export async function requireBusinessBySlug(slug: string): Promise<BusinessRecord> {
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();
  return business;
}

export function toBusinessConfig(business: BusinessRecord) {
  return {
    id: business.id,
    slug: business.slug,
    name: business.name,
    industry: business.industry,
    phone: business.phone,
    whatsapp: business.whatsapp,
    bank: {
      name: business.bankName,
      accountName: business.bankAccountName,
      accountNumber: business.bankAccountNumber,
      branch: business.bankBranch,
    },
    appUrl: businessPublicUrl(business.slug),
  };
}

export type BusinessConfig = ReturnType<typeof toBusinessConfig>;
