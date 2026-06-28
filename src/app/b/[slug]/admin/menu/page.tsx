import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, formatPrice } from "@/components/ui";
import { tenantAdminPath } from "@/lib/paths";
import { toggleProductVisibilityAction } from "../actions";
import { StockControls } from "./StockControls";

export const dynamic = "force-dynamic";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await requireOwner(slug);
  const products = await prisma.product.findMany({
    where: { businessId: session.businessId },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader title="Edit My Menu" subtitle="Set stock, prices & photos" />
      <div className="space-y-3 p-4">
        <Link
          href={tenantAdminPath(slug, "menu/new")}
          className="block w-full rounded-2xl border-2 border-dashed border-hethu-red bg-white py-4 text-center font-bold text-hethu-red"
        >
          + Add item
        </Link>

        {products.map((product) => (
          <div
            key={product.id}
            className={`rounded-2xl bg-white p-4 shadow-sm ${!product.visible ? "opacity-60" : ""}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-red-50 text-2xl">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  "🥩"
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{product.name}</p>
                {product.packSize && (
                  <p className="text-sm text-gray-500">{product.packSize}</p>
                )}
                <p className="font-bold text-hethu-red">{formatPrice(product.price)}</p>
                {product.trackStock ? (
                  <p
                    className={`text-sm font-bold ${
                      product.stock === 0
                        ? "text-red-600"
                        : product.stock <= 5
                          ? "text-amber-600"
                          : "text-green-700"
                    }`}
                  >
                    {product.stock} pack{product.stock !== 1 ? "s" : ""} in stock
                    {product.stock === 0 && product.visible && (
                      <span className="block text-xs font-semibold text-red-500">
                        Hidden from customers
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">Stock not tracked</p>
                )}
                {!product.visible && (
                  <p className="text-xs font-semibold text-amber-600">Hidden from menu</p>
                )}
              </div>
            </div>
            <StockControls
              productId={product.id}
              stock={product.stock}
              trackStock={product.trackStock}
            />
            <div className="mt-3 flex gap-2">
              <Link
                href={tenantAdminPath(slug, `menu/${product.id}`)}
                className="flex-1 rounded-xl bg-hethu-red py-2 text-center text-sm font-bold text-white"
              >
                Edit
              </Link>
              <form action={toggleProductVisibilityAction}>
                <input type="hidden" name="productId" value={product.id} />
                <button
                  type="submit"
                  className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-bold text-gray-600"
                >
                  {product.visible ? "Hide" : "Show"}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
