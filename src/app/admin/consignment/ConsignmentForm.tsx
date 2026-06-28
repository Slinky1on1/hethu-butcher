"use client";

import { useState } from "react";
import { ProductGrid, ProductItem } from "@/components/ProductGrid";
import { BigButton } from "@/components/ui";
import { createConsignmentDrop } from "../actions";

export function ConsignmentForm({
  shops,
  products,
}: {
  shops: { id: string; name: string }[];
  products: ProductItem[];
}) {
  const [shopId, setShopId] = useState(shops[0]?.id || "");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

    const fd = new FormData();
    fd.set("shopId", shopId);
    fd.set("note", note);
    fd.set("items", JSON.stringify(items));

    const result = await createConsignmentDrop(fd);
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
          <label className="mb-1 block text-sm font-semibold text-gray-700">Note (optional)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3"
            placeholder="e.g. Weekly drop"
          />
        </div>
      </div>

      <div className="p-4">
        <p className="mb-3 font-bold text-gray-700">What are you leaving?</p>
        <ProductGrid
          products={products}
          quantities={quantities}
          onQuantityChange={(id, qty) => {
            const product = products.find((p) => p.id === id);
            if (product?.trackStock && product.stock !== undefined) {
              qty = Math.min(qty, product.stock);
            }
            setQuantities((prev) => ({ ...prev, [id]: qty }));
          }}
          showStock
        />
      </div>

      {error && (
        <p className="mx-4 rounded-xl bg-red-50 p-3 text-center text-red-700">{error}</p>
      )}

      <div className="p-4">
        <BigButton type="submit" variant="primary">
          {loading ? "Saving..." : "Log consignment drop"}
        </BigButton>
      </div>
    </form>
  );
}
