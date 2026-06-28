import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { tenantAdminPath } from "@/lib/paths";
import { ShopForm } from "../ShopForm";

export const dynamic = "force-dynamic";

export default async function EditShopPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const session = await requireOwner(slug);
  const shop = await prisma.shop.findFirst({
    where: { id, businessId: session.businessId },
  });
  if (!shop) return <p className="p-4">Shop not found.</p>;

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader title="Edit shop" backHref={tenantAdminPath(slug, "shops")} />
      <ShopForm shop={shop} />
    </div>
  );
}
