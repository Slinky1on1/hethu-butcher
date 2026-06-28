import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, BigButton } from "@/components/ui";
import { businessPublicUrl } from "@/lib/tenant";
import { tenantAdminPath, tenantOrderPath } from "@/lib/paths";
import {
  saveOnboardingStep1,
  saveOnboardingStep2,
  skipOnboardingProducts,
  finishOnboarding,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ step?: string; welcome?: string; error?: string }>;
}) {
  const { slug } = await params;
  const { step: stepRaw, welcome, error } = await searchParams;
  const step = Math.min(4, Math.max(1, parseInt(stepRaw || "1", 10) || 1));

  const business = await prisma.business.findUnique({ where: { slug, active: true } });
  if (!business) notFound();

  const orderUrl = businessPublicUrl(slug);

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader
        title={`Set up ${business.name}`}
        subtitle={`Step ${step} of 4`}
        backHref="/"
      />

      <div className="mx-auto max-w-lg p-4">
        <div className="mb-6 flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`h-2 flex-1 rounded-full ${n <= step ? "bg-hethu-red" : "bg-gray-200"}`}
            />
          ))}
        </div>

        {welcome === "1" && step === 1 && (
          <p className="mb-4 rounded-xl bg-green-50 p-3 text-center text-sm text-green-800">
            Welcome! Let&apos;s set up your business — this only takes a few minutes.
          </p>
        )}

        {step === 1 && (
          <form
            action={saveOnboardingStep1.bind(null, slug)}
            className="space-y-4 rounded-2xl bg-white p-4 shadow-sm"
          >
            <h2 className="font-bold text-gray-900">Business details</h2>
            {error === "missing" && (
              <p className="text-sm text-red-600">Name and phone are required.</p>
            )}
            <Input label="Business name *" name="name" defaultValue={business.name} required />
            <Input label="Phone *" name="phone" type="tel" defaultValue={business.phone} required />
            <Input label="WhatsApp number" name="whatsapp" defaultValue={business.whatsapp} />
            <p className="text-xs font-bold uppercase text-gray-400">Bank (for customer EFT)</p>
            <Input label="Bank" name="bankName" defaultValue={business.bankName} />
            <Input label="Account name" name="bankAccountName" defaultValue={business.bankAccountName} />
            <Input label="Account number" name="bankAccountNumber" defaultValue={business.bankAccountNumber} />
            <Input label="Branch" name="bankBranch" defaultValue={business.bankBranch} />
            <BigButton type="submit" variant="primary">
              Continue
            </BigButton>
          </form>
        )}

        {step === 2 && (
          <form
            action={saveOnboardingStep2.bind(null, slug)}
            className="space-y-4 rounded-2xl bg-white p-4 shadow-sm"
          >
            <h2 className="font-bold text-gray-900">Owner PIN</h2>
            <p className="text-sm text-gray-500">
              You&apos;ll use this PIN to log in to your admin dashboard.
            </p>
            {error === "pin" && (
              <p className="text-sm text-red-600">PINs must match and be at least 4 digits.</p>
            )}
            <Input label="Choose PIN *" name="pin" type="password" inputMode="numeric" required />
            <Input label="Confirm PIN *" name="confirmPin" type="password" inputMode="numeric" required />
            <BigButton type="submit" variant="primary">
              Continue
            </BigButton>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="font-bold text-gray-900">Add your menu</h2>
            <p className="text-sm text-gray-500">
              Add products from your admin after setup, or add your first item now.
            </p>
            <BigButton href={tenantAdminPath(slug, "menu/new")} variant="secondary">
              Add first product
            </BigButton>
            <form action={skipOnboardingProducts.bind(null, slug)}>
              <BigButton type="submit" variant="outline">
                Skip for now
              </BigButton>
            </form>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm text-center">
            <h2 className="font-bold text-gray-900">You&apos;re ready!</h2>
            <p className="text-sm text-gray-500">Share this link with customers:</p>
            <p className="break-all font-mono text-sm text-hethu-red">{orderUrl}</p>
            <BigButton href={tenantOrderPath(slug)} variant="secondary">
              Preview order page
            </BigButton>
            <form action={finishOnboarding.bind(null, slug)}>
              <BigButton type="submit" variant="primary">
                Go to admin login
              </BigButton>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          Your link: <span className="font-mono">/b/{slug}</span>
        </p>
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  inputMode?: "numeric" | "tel" | "text";
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        inputMode={inputMode}
        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
      />
    </div>
  );
}
