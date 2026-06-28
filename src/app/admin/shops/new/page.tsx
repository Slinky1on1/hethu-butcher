import { requireOwner } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { ShopForm } from "../ShopForm";

export default async function NewShopPage() {
  await requireOwner();
  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader title="Add shop" backHref="/admin/shops" />
      <ShopForm />
    </div>
  );
}
