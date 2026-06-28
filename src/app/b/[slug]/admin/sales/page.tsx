import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { tenantAdminPath } from "@/lib/paths";
import { SaleForm } from "./SaleForm";

export const dynamic = "force-dynamic";

export default async function SalesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await requireOwner(slug);
  const businessId = session.businessId!;

  const [shops, products] = await Promise.all([
    prisma.shop.findMany({ where: { businessId }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { businessId }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader title="Record a sale" subtitle="What did the shop sell?" backHref={tenantAdminPath(slug)} />
      {shops.length === 0 ? (
        <p className="p-4 text-center text-gray-500">Add a consignment shop first.</p>
      ) : (
        <SaleForm
          shops={shops.map((s) => ({ id: s.id, name: s.name }))}
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            packSize: p.packSize,
            price: p.price,
            imageUrl: p.imageUrl,
          }))}
        />
      )}
    </div>
  );
}
