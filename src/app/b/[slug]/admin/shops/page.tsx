import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getShopBalances } from "@/lib/balances";
import { PageHeader } from "@/components/ui";
import { tenantAdminPath } from "@/lib/paths";
import { ShopBalance } from "./ShopBalance";

export const dynamic = "force-dynamic";

export default async function ShopsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await requireOwner(slug);
  const shops = await prisma.shop.findMany({
    where: { businessId: session.businessId },
    orderBy: { name: "asc" },
  });

  const shopsWithBalances = await Promise.all(
    shops.map(async (shop) => ({
      shop,
      balances: await getShopBalances(shop.id),
    }))
  );

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader title="Consignment shops" backHref={tenantAdminPath(slug)} />
      <div className="space-y-3 p-4">
        <Link
          href={tenantAdminPath(slug, "shops/new")}
          className="block w-full rounded-2xl border-2 border-dashed border-hethu-red bg-white py-4 text-center font-bold text-hethu-red"
        >
          + Add shop
        </Link>

        {shopsWithBalances.map(({ shop, balances }) => (
          <ShopBalance key={shop.id} slug={slug} shop={shop} balances={balances} />
        ))}

        {shops.length === 0 && (
          <p className="text-center text-gray-500">No shops yet. Add your first consignment shop.</p>
        )}
      </div>
    </div>
  );
}
