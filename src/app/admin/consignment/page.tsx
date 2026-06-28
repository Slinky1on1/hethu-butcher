import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ConsignmentForm } from "./ConsignmentForm";

export const dynamic = "force-dynamic";

export default async function ConsignmentPage() {
  await requireOwner();
  const [shops, products] = await Promise.all([
    prisma.shop.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader title="Give stock" subtitle="Log consignment drop-off" backHref="/admin" />
      {shops.length === 0 ? (
        <p className="p-4 text-center text-gray-500">
          Add a consignment shop first.
        </p>
      ) : (
        <ConsignmentForm
          shops={shops.map((s) => ({ id: s.id, name: s.name }))}
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            packSize: p.packSize,
            price: p.price,
            imageUrl: p.imageUrl,
            trackStock: p.trackStock,
            stock: p.stock,
          }))}
        />
      )}
    </div>
  );
}
