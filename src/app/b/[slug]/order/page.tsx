import { prisma } from "@/lib/prisma";
import { customerMenuProductFilter } from "@/lib/stock-utils";
import { requireBusinessBySlug, toBusinessConfig } from "@/lib/tenant";
import { OrderForm } from "./OrderForm";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await requireBusinessBySlug(slug);
  const config = toBusinessConfig(business);

  const products = await prisma.product.findMany({
    where: { businessId: business.id, ...customerMenuProductFilter },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <OrderForm
      business={config}
      slug={slug}
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
  );
}
