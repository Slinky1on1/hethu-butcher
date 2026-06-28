import { requireOwner } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { ProductForm } from "../ProductForm";
import { ProductSaveError } from "../ProductSaveError";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireOwner();
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader title="Add product" backHref="/admin/menu" />
      <ProductSaveError error={error} />
      <ProductForm />
    </div>
  );
}
