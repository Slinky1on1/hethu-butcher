import { prisma } from "./prisma";
import { getConsignmentOrdersOwingTotal } from "./consignment-orders";
import { getUnpaidSalesTotal } from "./balances";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export type DashboardActivity = {
  id: string;
  type: "order" | "sale" | "consignment";
  title: string;
  subtitle: string;
  amount: number;
  date: Date;
  href: string;
};

export type BusinessDashboard = {
  salesToday: number;
  salesThisWeek: number;
  ordersThisWeek: number;
  totalOwed: number;
  owingCustomerCount: number;
  pendingOrders: number;
  shopCount: number;
  productCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  packsOnConsignment: number;
  needsAttention: { label: string; href: string; count: number }[];
  recentActivity: DashboardActivity[];
  topProducts: { name: string; quantity: number }[];
};

export async function getBusinessDashboard(): Promise<BusinessDashboard> {
  const today = startOfToday();
  const weekAgo = daysAgo(7);

  const [
    pendingOrders,
    shopCount,
    productCount,
    lowStock,
    consignmentOwing,
    unpaidShopSales,
    paidOrdersWeek,
    paidOrdersToday,
    allOrdersWeek,
    paidSalesWeek,
    paidSalesToday,
    recentOrders,
    recentSales,
    recentDrops,
    orderLinesWeek,
    saleLinesWeek,
    consignmentLines,
    saleLinesAll,
  ] = await Promise.all([
    prisma.order.count({ where: { status: "pending" } }),
    prisma.shop.count(),
    prisma.product.count({ where: { visible: true } }),
    prisma.product.findMany({ where: { trackStock: true, stock: { lte: 5 } } }),
    getConsignmentOrdersOwingTotal(),
    getUnpaidSalesTotal(),
    prisma.order.findMany({
      where: {
        paid: true,
        paidAt: { gte: weekAgo },
        status: { not: "cancelled" },
      },
    }),
    prisma.order.findMany({
      where: {
        paid: true,
        paidAt: { gte: today },
        status: { not: "cancelled" },
      },
    }),
    prisma.order.count({
      where: { createdAt: { gte: weekAgo }, status: { not: "cancelled" } },
    }),
    prisma.sale.findMany({ where: { paid: true, createdAt: { gte: weekAgo } } }),
    prisma.sale.findMany({ where: { paid: true, createdAt: { gte: today } } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { lines: true },
    }),
    prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { shop: true },
    }),
    prisma.consignmentDrop.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { shop: true, lines: true },
    }),
    prisma.orderLine.findMany({
      where: { order: { createdAt: { gte: weekAgo }, paid: true } },
      include: { product: true },
    }),
    prisma.saleLine.findMany({
      where: { sale: { createdAt: { gte: weekAgo }, paid: true } },
      include: { product: true },
    }),
    prisma.consignmentLine.findMany({ include: { product: true } }),
    prisma.saleLine.findMany(),
  ]);

  const shopOwedTotal = unpaidShopSales.reduce((s, x) => s + x.total, 0);
  const totalOwed = consignmentOwing.total + shopOwedTotal;
  const owingCustomerCount = consignmentOwing.count + unpaidShopSales.length;

  const salesToday =
    paidOrdersToday.reduce((s, o) => s + o.total, 0) +
    paidSalesToday.reduce((s, x) => s + x.total, 0);

  const salesThisWeek =
    paidOrdersWeek.reduce((s, o) => s + o.total, 0) +
    paidSalesWeek.reduce((s, x) => s + x.total, 0);

  const dropQty = new Map<string, number>();
  for (const line of consignmentLines) {
    dropQty.set(line.productId, (dropQty.get(line.productId) || 0) + line.quantity);
  }
  for (const line of saleLinesAll) {
    dropQty.set(line.productId, (dropQty.get(line.productId) || 0) - line.quantity);
  }
  let packsOnConsignment = 0;
  for (const qty of dropQty.values()) {
    if (qty > 0) packsOnConsignment += qty;
  }

  const productQty = new Map<string, { name: string; quantity: number }>();
  for (const line of orderLinesWeek) {
    const e = productQty.get(line.productId) || { name: line.product.name, quantity: 0 };
    e.quantity += line.quantity;
    productQty.set(line.productId, e);
  }
  for (const line of saleLinesWeek) {
    const e = productQty.get(line.productId) || { name: line.product.name, quantity: 0 };
    e.quantity += line.quantity;
    productQty.set(line.productId, e);
  }
  const topProducts = Array.from(productQty.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const activity: DashboardActivity[] = [
    ...recentOrders.map((o) => ({
      id: o.id,
      type: "order" as const,
      title: o.customerName,
      subtitle: o.status === "pending" ? "New order" : o.isConsignment ? "Consignment order" : "Order",
      amount: o.total,
      date: o.createdAt,
      href: "/admin/orders",
    })),
    ...recentSales.map((s) => ({
      id: s.id,
      type: "sale" as const,
      title: s.shop.name,
      subtitle: s.paid ? "Sale recorded" : "Sale — unpaid",
      amount: s.total,
      date: s.createdAt,
      href: s.paid ? "/admin/sales" : "/admin/owing",
    })),
    ...recentDrops.map((d) => ({
      id: d.id,
      type: "consignment" as const,
      title: d.shop.name,
      subtitle: `Stock drop · ${d.lines.reduce((n, l) => n + l.quantity, 0)} packs`,
      amount: 0,
      date: d.createdAt,
      href: "/admin/shops",
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  const needsAttention: BusinessDashboard["needsAttention"] = [];
  if (pendingOrders > 0) {
    needsAttention.push({ label: "New orders to process", href: "/admin/orders?filter=new", count: pendingOrders });
  }
  if (owingCustomerCount > 0) {
    needsAttention.push({ label: "Customers owing payment", href: "/admin/owing", count: owingCustomerCount });
  }
  const outOfStock = lowStock.filter((p) => p.stock === 0).length;
  if (outOfStock > 0) {
    needsAttention.push({ label: "Out of stock items", href: "/admin/menu", count: outOfStock });
  }
  const lowOnly = lowStock.filter((p) => p.stock > 0).length;
  if (lowOnly > 0) {
    needsAttention.push({ label: "Low stock items", href: "/admin/menu", count: lowOnly });
  }

  return {
    salesToday,
    salesThisWeek,
    ordersThisWeek: allOrdersWeek,
    totalOwed,
    owingCustomerCount,
    pendingOrders,
    shopCount,
    productCount,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock,
    packsOnConsignment,
    needsAttention,
    recentActivity: activity,
    topProducts,
  };
}
