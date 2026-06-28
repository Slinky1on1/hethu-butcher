"use client";

import { useState } from "react";
import { ProductGrid, ProductItem } from "@/components/ProductGrid";
import { BigButton, formatPrice } from "@/components/ui";
import { createSale } from "../actions";

export function SaleForm({
  shops,
  products,
}: {
  shops: { id: string; name: string }[];
  products: ProductItem[];
}) {
  const [shopId, setShopId] = useState(shops[0]?.id || "");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "eft">("cash");
  const [paid, setPaid] = useState(true);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = products.reduce((sum, p) => {
    const qty = quantities[p.id] || 0;
    return sum + p.price * qty;
  }, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

    const fd = new FormData();
    fd.set("shopId", shopId);
    fd.set("paymentMethod", paymentMethod);
    if (paid) fd.set("paid", "on");
    fd.set("note", note);
    fd.set("items", JSON.stringify(items));

    const result = await createSale(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pb-8">
      <div className="space-y-4 p-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Shop</label>
          <select
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
          >
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Payment</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={`rounded-xl border-2 py-3 font-bold ${
                paymentMethod === "cash"
                  ? "border-hethu-red bg-red-50 text-hethu-red"
                  : "border-gray-200 bg-white"
              }`}
            >
              Cash
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("eft")}
              className={`rounded-xl border-2 py-3 font-bold ${
                paymentMethod === "eft"
                  ? "border-hethu-red bg-red-50 text-hethu-red"
                  : "border-gray-200 bg-white"
              }`}
            >
              EFT
            </button>
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-xl bg-white p-4">
          <input
            type="checkbox"
            checked={paid}
            onChange={(e) => setPaid(e.target.checked)}
            className="h-5 w-5"
          />
          <span className="font-semibold text-gray-700">Paid now</span>
        </label>

        {!paid && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            This sale will show under &quot;Who owes money&quot; until marked paid.
          </p>
        )}
      </div>

      <div className="p-4">
        <p className="mb-3 font-bold text-gray-700">What did they sell?</p>
        <ProductGrid
          products={products}
          quantities={quantities}
          onQuantityChange={(id, qty) =>
            setQuantities((prev) => ({ ...prev, [id]: qty }))
          }
        />
      </div>

      {total > 0 && (
        <div className="mx-4 rounded-xl bg-white p-4 text-center">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-3xl font-bold text-hethu-red">{formatPrice(total)}</p>
        </div>
      )}

      {error && (
        <p className="mx-4 mt-4 rounded-xl bg-red-50 p-3 text-center text-red-700">{error}</p>
      )}

      <div className="p-4">
        <BigButton type="submit" variant="primary">
          {loading ? "Saving..." : "Record sale"}
        </BigButton>
      </div>
    </form>
  );
}
