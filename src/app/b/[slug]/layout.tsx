import { requireBusinessBySlug } from "@/lib/tenant";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireBusinessBySlug(slug);
  return <>{children}</>;
}
