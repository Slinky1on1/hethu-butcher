import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ShopForm } from "../ShopForm";

export const dynamic = "force-dynamic";

export default async function EditShopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();
  const { id } = await params;
  const shop = await prisma.shop.findUnique({ where: { id } });
  if (!shop) return <p className="p-4">Shop not found.</p>;

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader title="Edit shop" backHref="/admin/shops" />
      <ShopForm shop={shop} />
    </div>
  );
}
