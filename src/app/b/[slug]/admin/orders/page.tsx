import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { daysSince } from "@/lib/whatsapp";
import { PageHeader, formatPrice } from "@/components/ui";
import { requireBusinessBySlug, toBusinessConfig } from "@/lib/tenant";
import { tenantAdminPath } from "@/lib/paths";
import { OrderActions } from "./OrderActions";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { slug } = await params;
  const session = await requireOwner(slug);
  const businessId = session.businessId!;
  const business = await requireBusinessBySlug(slug);
  const config = toBusinessConfig(business);
  const { filter } = await searchParams;

  const orders = await prisma.order.findMany({
    where: {
      businessId,
      ...(filter === "new" ? { status: "pending" } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { lines: { include: { product: true } } },
  });

  const newCount = await prisma.order.count({
    where: { businessId, status: "pending" },
  });

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader title="Orders" subtitle="Manage deliveries & consignment" />

      <div className="flex gap-2 px-4 pb-2">
        <FilterTab href={tenantAdminPath(slug, "orders")} label="All" active={!filter} />
        <FilterTab
          href={tenantAdminPath(slug, "orders?filter=new")}
          label={`New (${newCount})`}
          active={filter === "new"}
        />
      </div>

      <div className="space-y-3 p-4">
        {orders.length === 0 && (
          <p className="text-center text-gray-500">No orders here.</p>
        )}
        {orders.map((order) => {
          const days =
            order.consignmentStartedAt != null
              ? daysSince(order.consignmentStartedAt)
              : 0;
          const isOwing = order.isConsignment && !order.paid;

          return (
            <div
              key={order.id}
              className={`rounded-2xl bg-white p-4 shadow-sm ${
                order.status === "pending"
                  ? "border-2 border-hethu-red"
                  : isOwing
                    ? "border-2 border-amber-300"
                    : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xl font-bold text-gray-900">{order.customerName}</p>
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="mt-1 block text-sm text-hethu-red"
                  >
                    📞 {order.customerPhone}
                  </a>
                  <p className="text-sm text-gray-500">{order.area}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-hethu-red">{formatPrice(order.total)}</p>
                  <StatusBadge order={order} days={days} />
                </div>
              </div>

              <div className="mt-2 border-t pt-2 text-sm text-gray-600">
                {order.lines.map((line) => (
                  <p key={line.id}>
                    {line.quantity}x {line.product.name}
                  </p>
                ))}
              </div>

              <p className="mt-1 text-xs text-gray-400">
                Ordered {new Date(order.createdAt).toLocaleString()}
                {order.consignmentStartedAt && (
                  <> · Consignment since {new Date(order.consignmentStartedAt).toLocaleDateString()}</>
                )}
              </p>

              {order.note && (
                <p className="mt-1 text-sm text-gray-500">Note: {order.note}</p>
              )}

              <OrderActions
                businessName={config.name}
                order={{
                  id: order.id,
                  customerName: order.customerName,
                  customerPhone: order.customerPhone,
                  total: order.total,
                  status: order.status,
                  isConsignment: order.isConsignment,
                  paid: order.paid,
                  consignmentStartedAt: order.consignmentStartedAt?.toISOString() ?? null,
                  lastReminderAt: order.lastReminderAt?.toISOString() ?? null,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex-1 rounded-xl py-2 text-center text-sm font-bold ${
        active ? "bg-hethu-red text-white" : "bg-white text-gray-600"
      }`}
    >
      {label}
    </Link>
  );
}

function StatusBadge({
  order,
  days,
}: {
  order: { status: string; isConsignment: boolean; paid: boolean };
  days: number;
}) {
  if (order.isConsignment && !order.paid) {
    return (
      <p className="text-xs font-bold text-amber-600">
        Consignment · {days}d
      </p>
    );
  }
  if (order.status === "pending") {
    return <p className="text-xs font-bold text-hethu-red">New</p>;
  }
  if (order.status === "cancelled") {
    return <p className="text-xs text-gray-400">Cancelled</p>;
  }
  return <p className="text-xs font-bold text-green-600">Paid</p>;
}
