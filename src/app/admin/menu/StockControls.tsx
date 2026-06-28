"use client";

import { adjustStockAction } from "../actions";

export function StockControls({
  productId,
  stock,
  trackStock,
}: {
  productId: string;
  stock: number;
  trackStock: boolean;
}) {
  if (!trackStock) {
    return (
      <p className="mt-2 text-xs text-gray-400">Stock tracking off</p>
    );
  }

  return (
    <div className="mt-3 rounded-xl bg-gray-50 p-2">
      <p className="mb-2 text-center text-xs font-bold uppercase text-gray-500">
        Stock (packs)
      </p>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => adjustStockAction(productId, -1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl font-bold text-gray-700 shadow-sm"
        >
          −
        </button>
        <span
          className={`min-w-[3rem] text-center text-2xl font-bold ${
            stock === 0 ? "text-red-600" : stock <= 5 ? "text-amber-600" : "text-gray-900"
          }`}
        >
          {stock}
        </span>
        <button
          type="button"
          onClick={() => adjustStockAction(productId, 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-hethu-red text-xl font-bold text-white shadow-sm"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => adjustStockAction(productId, 10)}
          className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-hethu-red shadow-sm"
        >
          +10
        </button>
      </div>
      {stock === 0 && (
        <p className="mt-1 text-center text-xs font-semibold text-red-600">Out of stock</p>
      )}
      {stock > 0 && stock <= 5 && (
        <p className="mt-1 text-center text-xs font-semibold text-amber-600">Running low</p>
      )}
    </div>
  );
}
