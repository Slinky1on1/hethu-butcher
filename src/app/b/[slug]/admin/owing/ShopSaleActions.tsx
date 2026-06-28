"use client";

import { markSalePaid } from "../actions";
import { formatPrice } from "@/components/ui";

export function ShopSaleActions({
  saleId,
  total,
}: {
  saleId: string;
  total: number;
}) {
  return (
    <button
      type="button"
      onClick={() => markSalePaid(saleId)}
      className="mt-3 w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white"
    >
      Mark paid — {formatPrice(total)}
    </button>
  );
}
