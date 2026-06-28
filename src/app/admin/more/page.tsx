import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { PageHeader, BigButton } from "@/components/ui";
import { businessConfig } from "@/lib/config";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function MorePage() {
  await requireOwner();

  return (
    <div className="min-h-screen bg-hethu-cream">
      <PageHeader title="More" subtitle={businessConfig.name} backHref="/admin" />

      <div className="space-y-3 p-4">
        <SectionTitle>Stock & consignment</SectionTitle>
        <BigButton href="/admin/consignment" variant="secondary">
          Give stock (consignment)
        </BigButton>
        <BigButton href="/admin/sales" variant="secondary">
          Record a sale
        </BigButton>
        <BigButton href="/admin/shops" variant="secondary">
          Consignment shops
        </BigButton>

        <SectionTitle>Customers</SectionTitle>
        <BigButton href="/admin/qr" variant="outline">
          QR code & order link
        </BigButton>
        <a
          href={`tel:${businessConfig.phone}`}
          className="block w-full rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 text-center text-lg font-bold text-gray-700"
        >
          📞 {businessConfig.phone}
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
          <Link href="/order" className="underline">
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
