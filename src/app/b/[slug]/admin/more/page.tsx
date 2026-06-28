import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { PageHeader, BigButton } from "@/components/ui";
import { requireBusinessBySlug, toBusinessConfig } from "@/lib/tenant";
import { tenantAdminPath, tenantOrderPath } from "@/lib/paths";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function MorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireOwner(slug);
  const business = await requireBusinessBySlug(slug);
  const config = toBusinessConfig(business);

  return (
    <div className="min-h-screen bg-hethu-cream">
      <PageHeader title="More" subtitle={config.name} backHref={tenantAdminPath(slug)} />

      <div className="space-y-3 p-4">
        <SectionTitle>Stock & consignment</SectionTitle>
        <BigButton href={tenantAdminPath(slug, "consignment")} variant="secondary">
          Give stock (consignment)
        </BigButton>
        <BigButton href={tenantAdminPath(slug, "sales")} variant="secondary">
          Record a sale
        </BigButton>
        <BigButton href={tenantAdminPath(slug, "shops")} variant="secondary">
          Consignment shops
        </BigButton>

        <SectionTitle>Customers</SectionTitle>
        <BigButton href={tenantAdminPath(slug, "qr")} variant="outline">
          QR code & order link
        </BigButton>
        <BigButton href={tenantAdminPath(slug, "settings")} variant="outline">
          Business settings
        </BigButton>
        <a
          href={`tel:${config.phone}`}
          className="block w-full rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 text-center text-lg font-bold text-gray-700"
        >
          📞 {config.phone}
        </a>

        <SectionTitle>Account</SectionTitle>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-2xl border-2 border-gray-200 py-4 text-center font-bold text-gray-500"
          >
            Logout
          </button>
        </form>

        <p className="pt-4 text-center text-xs text-gray-400">
          <Link href={tenantOrderPath(slug)} className="underline">
            View customer order page
          </Link>
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="pt-2 text-xs font-bold uppercase tracking-wide text-gray-400">{children}</p>
  );
}
