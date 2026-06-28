import { prisma } from "./prisma";

export async function getConsignmentOrdersOwing() {
  return prisma.order.findMany({
    where: {
      isConsignment: true,
      paid: false,
      status: { not: "cancelled" },
    },
    orderBy: { consignmentStartedAt: "asc" },
    include: { lines: { include: { product: true } } },
  });
}

export async function getConsignmentOrdersOwingTotal() {
  const result = await prisma.order.aggregate({
    where: {
      isConsignment: true,
      paid: false,
      status: { not: "cancelled" },
    },
    _sum: { total: true },
    _count: true,
  });
  return {
    total: result._sum.total || 0,
    count: result._count,
  };
}
