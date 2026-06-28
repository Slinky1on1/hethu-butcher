import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ProductForm } from "../ProductForm";
import { ProductSaveError } from "../ProductSaveError";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireOwner();
  const { id } = await params;
  const { error } = await searchParams;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return <p className="p-4">Product not found.</p>;
  }

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader title="Edit product" backHref="/admin/menu" />
      <ProductSaveError error={error} />
      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          packSize: product.packSize,
          price: product.price / 100,
          visible: product.visible,
          trackStock: product.trackStock,
          stock: product.stock,
          imageUrl: product.imageUrl || "",
        }}
      />
    </div>
  );
}
