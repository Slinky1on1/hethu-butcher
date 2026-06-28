import Link from "next/link";
import { PageHeader, BigButton } from "@/components/ui";
import { businessConfig } from "@/lib/config";
import { isProduction } from "@/lib/env";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const showError = error === "wrong-pin";

  return (
    <div className="min-h-screen bg-hethu-cream">
      <PageHeader title="Owner login" subtitle={businessConfig.name} />
      <form method="POST" action="/api/login" className="space-y-4 p-4">
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
              Default PIN is 1234 — change in .env
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
        <Link href="/order" className="text-sm text-gray-400">
          ← Back to order page
        </Link>
      </p>
    </div>
  );
}
