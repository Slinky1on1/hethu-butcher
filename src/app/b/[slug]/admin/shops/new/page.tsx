import { requireOwner } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { tenantAdminPath } from "@/lib/paths";
import { ShopForm } from "../ShopForm";

export default async function NewShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireOwner(slug);

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader title="Add shop" backHref={tenantAdminPath(slug, "shops")} />
      <ShopForm />
    </div>
  );
}
