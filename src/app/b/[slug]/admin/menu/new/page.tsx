import { requireOwner } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { tenantAdminPath } from "@/lib/paths";
import { ProductForm } from "../ProductForm";
import { ProductSaveError } from "../ProductSaveError";

export default async function NewProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  await requireOwner(slug);
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader title="Add product" backHref={tenantAdminPath(slug, "menu")} />
      <ProductSaveError error={error} />
      <ProductForm />
    </div>
  );
}
