"use client";

import { formatPrice } from "./ui";
import { isInStock } from "@/lib/stock-utils";

export type ProductItem = {
  id: string;
  name: string;
  packSize: string;
  price: number;
  imageUrl: string | null;
  trackStock?: boolean;
  stock?: number;
};

export function ProductGrid({
  products,
  quantities,
  onQuantityChange,
  showStock = false,
}: {
  products: ProductItem[];
  quantities: Record<string, number>;
  onQuantityChange: (productId: string, qty: number) => void;
  showStock?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product) => {
        const qty = quantities[product.id] || 0;
        const trackStock = product.trackStock ?? false;
        const stock = product.stock ?? 0;
        const inStock = isInStock({ trackStock, stock });
        const maxQty = trackStock ? stock : 999;

        return (
          <div
            key={product.id}
            className={`relative rounded-2xl border-2 bg-white p-3 shadow-sm transition ${
              qty > 0 ? "border-hethu-red" : "border-gray-100"
            } ${!inStock ? "opacity-60" : ""}`}
          >
            {!inStock && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80">
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                  Out of stock
                </span>
              </div>
            )}
            <div className="mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-red-50">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl">🥩</span>
              )}
            </div>
            <h3 className="text-sm font-bold leading-tight text-gray-900">
              {product.name}
            </h3>
            {product.packSize && (
              <p className="text-xs text-gray-500">{product.packSize}</p>
            )}
            <p className="mt-1 text-lg font-bold text-hethu-red">
              {formatPrice(product.price)}
            </p>
            {showStock && trackStock && inStock && (
              <p className="text-xs font-semibold text-gray-500">
                {stock} pack{stock !== 1 ? "s" : ""} left
              </p>
            )}
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={!inStock}
                onClick={() => onQuantityChange(product.id, Math.max(0, qty - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-xl font-bold text-gray-700 active:bg-gray-200 disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="min-w-[2rem] text-center text-lg font-bold">{qty}</span>
              <button
                type="button"
                disabled={!inStock || qty >= maxQty}
                onClick={() => onQuantityChange(product.id, qty + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-hethu-red text-xl font-bold text-white active:bg-hethu-red-dark disabled:opacity-40"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
