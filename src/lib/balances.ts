import { prisma } from "./prisma";

export async function getShopBalances(shopId: string) {
  const [drops, sales] = await Promise.all([
    prisma.consignmentLine.findMany({
      where: { consignmentDrop: { shopId } },
      include: { product: true },
    }),
    prisma.saleLine.findMany({
      where: { sale: { shopId } },
      include: { product: true },
    }),
  ]);

  const balanceMap = new Map<
    string,
    { productId: string; name: string; packSize: string; price: number; quantity: number }
  >();

  for (const line of drops) {
    const existing = balanceMap.get(line.productId);
    if (existing) {
      existing.quantity += line.quantity;
    } else {
      balanceMap.set(line.productId, {
        productId: line.productId,
        name: line.product.name,
        packSize: line.product.packSize,
        price: line.product.price,
        quantity: line.quantity,
      });
    }
  }

  for (const line of sales) {
    const existing = balanceMap.get(line.productId);
    if (existing) {
      existing.quantity -= line.quantity;
    }
  }

  return Array.from(balanceMap.values()).filter((b) => b.quantity > 0);
}

export async function getUnpaidSalesTotal() {
  const sales = await prisma.sale.findMany({
    where: { paid: false },
    include: { shop: true },
  });
  return sales;
}

export async function getDashboardStats() {
  const [pendingOrders, unpaidSales, shopCount] = await Promise.all([
    prisma.order.count({ where: { status: "pending" } }),
    prisma.sale.aggregate({
      where: { paid: false },
      _sum: { total: true },
    }),
    prisma.shop.count(),
  ]);

  return {
    pendingOrders,
    unpaidTotal: unpaidSales._sum.total || 0,
    shopCount,
  };
}
