import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { getBusinessDashboard } from "@/lib/dashboard";
import { PageHeader, formatPrice } from "@/components/ui";
import { requireBusinessBySlug, toBusinessConfig } from "@/lib/tenant";
import { tenantAdminPath } from "@/lib/paths";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await requireOwner(slug);
  const business = await requireBusinessBySlug(slug);
  const config = toBusinessConfig(business);
  const d = await getBusinessDashboard(session.businessId!, slug);

  const weekDay = new Date().toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="min-h-screen bg-hethu-cream">
      <PageHeader title={config.name} subtitle={weekDay} />

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Sales today" value={formatPrice(d.salesToday)} highlight />
          <StatCard label="This week" value={formatPrice(d.salesThisWeek)} />
          <StatCard
            label="Owed to you"
            value={formatPrice(d.totalOwed)}
            href={tenantAdminPath(slug, "owing")}
            warn={d.totalOwed > 0}
          />
          <StatCard
            label="New orders"
            value={String(d.pendingOrders)}
            href={tenantAdminPath(slug, "orders?filter=new")}
            warn={d.pendingOrders > 0}
          />
        </div>

        {d.needsAttention.length > 0 && (
          <section className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
            <h2 className="font-bold text-amber-900">Needs attention</h2>
            <div className="mt-2 space-y-2">
              {d.needsAttention.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-800">{item.label}</span>
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                    {item.count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-bold text-gray-900">Business overview</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <OverviewItem label="Orders this week" value={String(d.ordersThisWeek)} />
            <OverviewItem label="Menu items" value={String(d.productCount)} />
            <OverviewItem label="Consignment shops" value={String(d.shopCount)} />
            <OverviewItem
              label="Packs at shops"
              value={String(d.packsOnConsignment)}
              href={tenantAdminPath(slug, "shops")}
            />
            <OverviewItem
              label="Customers owing"
              value={String(d.owingCustomerCount)}
              href={tenantAdminPath(slug, "owing")}
            />
            <OverviewItem
              label="Stock alerts"
              value={d.lowStockCount > 0 ? `${d.lowStockCount} items` : "All good"}
              href={tenantAdminPath(slug, "menu")}
              warn={d.lowStockCount > 0}
            />
          </div>
        </section>

        {d.topProducts.length > 0 && (
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="font-bold text-gray-900">Top sellers this week</h2>
            <div className="mt-2 space-y-2">
              {d.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    <span className="mr-2 font-bold text-hethu-red">{i + 1}.</span>
                    {p.name}
                  </span>
                  <span className="font-bold text-gray-900">{p.quantity} packs</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent activity</h2>
            <Link href={tenantAdminPath(slug, "orders")} className="text-xs font-bold text-hethu-red">
              See all
            </Link>
          </div>
          {d.recentActivity.length === 0 ? (
            <p className="mt-3 text-center text-sm text-gray-400">No activity yet.</p>
          ) : (
            <div className="mt-2 divide-y">
              {d.recentActivity.map((a) => (
                <Link
                  key={`${a.type}-${a.id}`}
                  href={a.href}
                  className="flex items-center gap-3 py-3"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-lg">
                    {a.type === "order" ? "📦" : a.type === "sale" ? "💵" : "🏪"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-500">
                      {a.subtitle} · {a.date.toLocaleDateString()}
                    </p>
                  </div>
                  {a.amount > 0 && (
                    <span className="shrink-0 font-bold text-hethu-red">
                      {formatPrice(a.amount)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
            Quick actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <QuickAction href={tenantAdminPath(slug, "sales")} label="Record sale" />
            <QuickAction href={tenantAdminPath(slug, "consignment")} label="Give stock" />
            <QuickAction href={tenantAdminPath(slug, "menu/new")} label="Add product" />
            <QuickAction href={tenantAdminPath(slug, "qr")} label="Order QR code" />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  highlight,
  warn,
}: {
  label: string;
  value: string;
  href?: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  const inner = (
    <div
      className={`rounded-2xl p-4 shadow-sm ${
        highlight
          ? "bg-hethu-red text-white"
          : warn
            ? "border-2 border-amber-300 bg-amber-50"
            : "bg-white"
      }`}
    >
      <p className={`text-sm ${highlight ? "text-white/80" : "text-gray-500"}`}>{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-white" : warn ? "text-amber-800" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function OverviewItem({
  label,
  value,
  href,
  warn,
}: {
  label: string;
  value: string;
  href?: string;
  warn?: boolean;
}) {
  const content = (
    <>
      <p className="text-gray-500">{label}</p>
      <p className={`font-bold ${warn ? "text-amber-700" : "text-gray-900"}`}>{value}</p>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="rounded-lg bg-gray-50 p-2 active:bg-gray-100">
        {content}
      </Link>
    );
  }
  return <div className="rounded-lg bg-gray-50 p-2">{content}</div>;
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border-2 border-gray-200 bg-white py-3 text-center text-sm font-bold text-gray-700 active:bg-gray-50"
    >
      {label}
    </Link>
  );
}
