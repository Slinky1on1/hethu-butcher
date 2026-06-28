import Link from "next/link";
import { PageHeader, BigButton } from "@/components/ui";
import { requireBusinessBySlug, toBusinessConfig } from "@/lib/tenant";
import { tenantOrderPath } from "@/lib/paths";
import { isProduction } from "@/lib/env";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const business = await requireBusinessBySlug(slug);
  const config = toBusinessConfig(business);
  const showError = error === "wrong-pin";

  return (
    <div className="min-h-screen bg-hethu-cream">
      <PageHeader title="Owner login" subtitle={config.name} />
      <form method="POST" action={`/api/b/${slug}/login`} className="space-y-4 p-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">PIN</label>
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            autoFocus
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-4 text-center text-2xl tracking-widest"
            placeholder="••••"
            autoComplete="current-password"
          />
          {!isProduction() && (
            <p className="mt-2 text-center text-xs text-gray-400">
              Default PIN is 1234 — change in business settings
            </p>
          )}
        </div>
        {showError && (
          <p className="rounded-xl bg-red-50 p-3 text-center text-red-700">
            Wrong PIN. Try again.
          </p>
        )}
        <BigButton type="submit" variant="primary">
          Login
        </BigButton>
      </form>
      <p className="pb-8 text-center">
        <Link href={tenantOrderPath(slug)} className="text-sm text-gray-400">
          ← Back to order page
        </Link>
      </p>
    </div>
  );
}
