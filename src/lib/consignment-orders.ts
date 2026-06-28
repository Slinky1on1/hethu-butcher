import { prisma } from "./prisma";

export async function getConsignmentOrdersOwing(businessId: string) {
  return prisma.order.findMany({
    where: {
      businessId,
      isConsignment: true,
      paid: false,
      status: { not: "cancelled" },
    },
    orderBy: { consignmentStartedAt: "asc" },
    include: { lines: { include: { product: true } } },
  });
}

export async function getConsignmentOrdersOwingTotal(businessId: string) {
  const result = await prisma.order.aggregate({
    where: {
      businessId,
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
