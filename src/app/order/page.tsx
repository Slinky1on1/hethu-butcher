import { prisma } from "@/lib/prisma";
import { customerMenuProductFilter } from "@/lib/stock-utils";
import { OrderForm } from "./OrderForm";

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const products = await prisma.product.findMany({
    where: customerMenuProductFilter,
    orderBy: { sortOrder: "asc" },
  });

  return (
    <OrderForm
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
