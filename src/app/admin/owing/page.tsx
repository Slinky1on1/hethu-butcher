import { requireOwner } from "@/lib/auth";
import { getUnpaidSalesTotal } from "@/lib/balances";
import {
  getConsignmentOrdersOwing,
  getConsignmentOrdersOwingTotal,
} from "@/lib/consignment-orders";
import { daysSince } from "@/lib/whatsapp";
import { PageHeader, formatPrice } from "@/components/ui";
import { OrderActions } from "../orders/OrderActions";
import { ShopSaleActions } from "./ShopSaleActions";

export const dynamic = "force-dynamic";

export default async function OwingPage() {
  await requireOwner();

  const [orders, orderStats, shopSales] = await Promise.all([
    getConsignmentOrdersOwing(),
    getConsignmentOrdersOwingTotal(),
    getUnpaidSalesTotal(),
  ]);

  const shopTotal = shopSales.reduce((sum, s) => sum + s.total, 0);
  const grandTotal = orderStats.total + shopTotal;

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader
        title="Customers owing"
        subtitle="Consignment & unpaid amounts"
      />

      <div className="mx-4 mb-4 rounded-2xl bg-hethu-red p-4 text-center text-white">
        <p className="text-sm text-white/80">Total owed to you</p>
        <p className="text-3xl font-bold">{formatPrice(grandTotal)}</p>
        <p className="mt-1 text-xs text-white/70">
          {orderStats.count} order{orderStats.count !== 1 ? "s" : ""} ·{" "}
          {shopSales.length} shop{shopSales.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-4 px-4">
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
            Order consignment ({formatPrice(orderStats.total)})
          </h2>
          {orders.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-center text-sm text-gray-400">
              No order consignment owing.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const days = order.consignmentStartedAt
                  ? daysSince(order.consignmentStartedAt)
                  : 0;
                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border-2 border-amber-300 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xl font-bold text-gray-900">
                          {order.customerName}
                        </p>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="text-sm text-hethu-red"
                        >
                          📞 {order.customerPhone}
                        </a>
                        <p className="text-sm text-gray-500">{order.area}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-hethu-red">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-sm font-bold text-amber-600">
                          {days} day{days !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 border-t pt-2 text-sm text-gray-600">
                      {order.lines.map((line) => (
                        <p key={line.id}>
                          {line.quantity}x {line.product.name}
                        </p>
                      ))}
                    </div>
                    {order.consignmentStartedAt && (
                      <p className="mt-1 text-xs text-gray-400">
                        Consignment since{" "}
                        {new Date(order.consignmentStartedAt).toLocaleDateString()}
                      </p>
                    )}
                    <OrderActions
                      order={{
                        id: order.id,
                        customerName: order.customerName,
                        customerPhone: order.customerPhone,
                        total: order.total,
                        status: order.status,
                        isConsignment: order.isConsignment,
                        paid: order.paid,
                        consignmentStartedAt:
                          order.consignmentStartedAt?.toISOString() ?? null,
                        lastReminderAt: order.lastReminderAt?.toISOString() ?? null,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
            Consignment shops ({formatPrice(shopTotal)})
          </h2>
          {shopSales.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-center text-sm text-gray-400">
              No shop consignment owing.
            </p>
          ) : (
            <div className="space-y-3">
              {shopSales.map((sale) => (
                <div
                  key={sale.id}
                  className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{sale.shop.name}</p>
                      {sale.shop.contact && (
                        <p className="text-sm text-gray-500">{sale.shop.contact}</p>
                      )}
                      {sale.shop.phone && (
                        <a href={`tel:${sale.shop.phone}`} className="text-sm text-hethu-red">
                          📞 {sale.shop.phone}
                        </a>
                      )}
                    </div>
                    <p className="font-bold text-hethu-red">{formatPrice(sale.total)}</p>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Sale recorded {new Date(sale.createdAt).toLocaleDateString()} ·{" "}
                    {sale.paymentMethod === "cash" ? "Cash" : "EFT"} not received
                  </p>
                  <ShopSaleActions saleId={sale.id} total={sale.total} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
