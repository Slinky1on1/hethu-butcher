"use client";

import {
  approveOrderConsignment,
  deliverOrderPaid,
  markOrderPaid,
  recordOrderReminder,
  updateOrderStatus,
} from "../actions";
import {
  buildPaymentReminderMessage,
  buildWhatsAppUrl,
  daysSince,
} from "@/lib/whatsapp";
import { formatPrice } from "@/components/ui";

export type OrderActionData = {
  id: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: string;
  isConsignment: boolean;
  paid: boolean;
  consignmentStartedAt: string | null;
  lastReminderAt: string | null;
};

export function OrderActions({ order }: { order: OrderActionData }) {
  const days =
    order.consignmentStartedAt != null
      ? daysSince(new Date(order.consignmentStartedAt))
      : 0;

  async function handleRemind() {
    await recordOrderReminder(order.id);
    const message = buildPaymentReminderMessage({
      customerName: order.customerName,
      totalFormatted: formatPrice(order.total),
      daysOnConsignment: days,
    });
    window.open(buildWhatsAppUrl(order.customerPhone, message), "_blank");
  }

  if (order.status === "pending") {
    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs font-semibold text-gray-500">How is this order?</p>
        <button
          type="button"
          onClick={() => deliverOrderPaid(order.id)}
          className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white"
        >
          Delivered — paid (cash / EFT)
        </button>
        <button
          type="button"
          onClick={() => approveOrderConsignment(order.id)}
          className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white"
        >
          Allow consignment (pay later)
        </button>
        <button
          type="button"
          onClick={() => updateOrderStatus(order.id, "cancelled")}
          className="w-full rounded-xl border-2 border-gray-200 py-2 text-sm font-bold text-gray-500"
        >
          Cancel order
        </button>
      </div>
    );
  }

  if (order.isConsignment && !order.paid && order.status !== "cancelled") {
    return (
      <div className="mt-3 space-y-2 rounded-xl border-2 border-amber-200 bg-amber-50 p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-amber-900">On consignment</p>
          <p className="text-lg font-bold text-amber-800">
            {days} day{days !== 1 ? "s" : ""}
          </p>
        </div>
        {order.lastReminderAt && (
          <p className="text-xs text-amber-700">
            Last reminded: {new Date(order.lastReminderAt).toLocaleDateString()}
          </p>
        )}
        <button
          type="button"
          onClick={handleRemind}
          className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white"
        >
          Remind on WhatsApp
        </button>
        <button
          type="button"
          onClick={() => markOrderPaid(order.id)}
          className="w-full rounded-xl bg-hethu-red py-3 text-sm font-bold text-white"
        >
          Mark as paid
        </button>
      </div>
    );
  }

  if (order.status === "delivered" || order.status === "paid") {
    return (
      <p className="mt-2 text-center text-sm font-semibold text-green-700">
        {order.isConsignment ? "Consignment paid" : "Delivered & paid"}
      </p>
    );
  }

  if (order.status === "cancelled") {
    return (
      <p className="mt-2 text-center text-sm text-gray-400">Cancelled</p>
    );
  }

  return null;
}
