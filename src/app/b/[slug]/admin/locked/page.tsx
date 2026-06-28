import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function BillingLockedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireOwner(slug, { allowBillingLock: true });
  const business = await prisma.business.findFirst({
    where: { slug },
    select: { billingMessage: true, name: true },
  });

  return (
    <div className="min-h-screen bg-hethu-cream p-4">
      <PageHeader title="Account on hold" subtitle={business?.name} />
      <div className="mx-auto max-w-md rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 text-center">
        <p className="text-4xl">⏸</p>
        <p className="mt-4 font-bold text-amber-900">Billing action required</p>
        <p className="mt-2 text-sm text-amber-800">
          {business?.billingMessage ||
            "Your Nexvintrix Connect subscription needs attention. Contact Nexvintrix support to restore access."}
        </p>
        <p className="mt-4 text-xs text-amber-700">
          Customer order pages may still work. Admin access will unlock once billing is resolved.
        </p>
      </div>
    </div>
  );
}
