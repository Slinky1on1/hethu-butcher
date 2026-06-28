import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export { isInStock, maxOrderQuantity } from "./stock-utils";

type Tx = Prisma.TransactionClient;

async function validateAndDecrementInTx(
  tx: Tx,
  items: { productId: string; quantity: number }[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const products = await tx.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product?.trackStock) continue;
    if (product.stock < item.quantity) {
      return {
        ok: false,
        error: `Not enough ${product.name} in stock (only ${product.stock} left)`,
      };
    }
  }

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product?.trackStock) continue;
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  return { ok: true };
}

export async function decrementStock(
  items: { productId: string; quantity: number }[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  return prisma.$transaction(async (tx) => validateAndDecrementInTx(tx, items));
}

export async function incrementStock(
  items: { productId: string; quantity: number }[]
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product?.trackStock) continue;
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  });
}

export async function getLowStockProducts() {
  return prisma.product.findMany({
    where: { trackStock: true, stock: { lte: 5 } },
    orderBy: { stock: "asc" },
  });
}

export { validateAndDecrementInTx };
