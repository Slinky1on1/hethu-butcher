import QRCode from "qrcode";
import { requireOwner } from "@/lib/auth";
import { businessPublicUrl, requireBusinessBySlug, toBusinessConfig } from "@/lib/tenant";
import { tenantAdminPath } from "@/lib/paths";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function QRPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireOwner(slug);
  const business = await requireBusinessBySlug(slug);
  const config = toBusinessConfig(business);
  const orderUrl = businessPublicUrl(slug);
  const qrDataUrl = await QRCode.toDataURL(orderUrl, {
    width: 300,
    margin: 2,
    color: { dark: "#c41e3a", light: "#ffffff" },
  });

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader
        title="Order link & QR"
        subtitle="Print this on flyers — link never changes"
        backHref={tenantAdminPath(slug)}
      />
      <div className="space-y-4 p-4 text-center">
        <div className="mx-auto inline-block rounded-2xl bg-white p-6 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Order QR code" className="mx-auto" width={300} height={300} />
        </div>

        <div className="rounded-2xl bg-white p-4">
          <p className="text-sm text-gray-500">Order link for {config.name}</p>
          <p className="mt-1 break-all font-mono text-sm text-hethu-red">{orderUrl}</p>
          <p className="mt-3 text-sm text-gray-500">
            Share this link on WhatsApp status or print the QR on your flyer.
          </p>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-gray-300 p-4 text-sm text-gray-500">
          <p className="font-bold text-gray-700">Add to Home Screen</p>
          <p className="mt-2">
            Open this site in Chrome → menu (⋮) → &quot;Add to Home screen&quot;. Works like an app!
          </p>
        </div>
      </div>
    </div>
  );
}
