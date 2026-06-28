import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { SaleForm } from "./SaleForm";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  await requireOwner();
  const [shops, products] = await Promise.all([
    prisma.shop.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader title="Record a sale" subtitle="What did the shop sell?" backHref="/admin" />
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
