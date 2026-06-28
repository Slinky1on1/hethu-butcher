import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { tenantAdminPath } from "@/lib/paths";
import { ProductForm } from "../ProductForm";
import { ProductSaveError } from "../ProductSaveError";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug, id } = await params;
  const session = await requireOwner(slug);
  const { error } = await searchParams;
  const product = await prisma.product.findFirst({
    where: { id, businessId: session.businessId },
  });
  if (!product) {
    return <p className="p-4">Product not found.</p>;
  }

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader title="Edit product" backHref={tenantAdminPath(slug, "menu")} />
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
