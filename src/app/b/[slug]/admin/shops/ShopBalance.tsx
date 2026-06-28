import { formatPrice } from "@/components/ui";
import Link from "next/link";
import { tenantAdminPath } from "@/lib/paths";

type Shop = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  area: string;
};

type Balance = {
  productId: string;
  name: string;
  packSize: string;
  quantity: number;
};

export function ShopBalance({
  slug,
  shop,
  balances,
}: {
  slug: string;
  shop: Shop;
  balances: Balance[];
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-gray-900">{shop.name}</p>
          {shop.contact && <p className="text-sm text-gray-500">{shop.contact}</p>}
          {shop.area && <p className="text-sm text-gray-500">{shop.area}</p>}
          {shop.phone && (
            <a href={`tel:${shop.phone}`} className="text-sm text-hethu-red">
              {shop.phone}
            </a>
          )}
        </div>
        <Link
          href={tenantAdminPath(slug, `shops/${shop.id}`)}
          className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600"
        >
          Edit
        </Link>
      </div>

      {balances.length > 0 ? (
        <div className="mt-3 border-t pt-3">
          <p className="text-xs font-bold uppercase text-gray-400">Stock on consignment</p>
          {balances.map((b) => (
            <div key={b.productId} className="mt-1 flex justify-between text-sm">
              <span>
                {b.quantity}x {b.name}
                {b.packSize ? ` (${b.packSize})` : ""}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-400">No stock on consignment</p>
      )}
    </div>
  );
}
