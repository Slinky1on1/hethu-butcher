import Link from "next/link";
import { businessOrderPath } from "@/lib/tenant";

export default function ConnectHome() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hethu-cream p-6 text-center">
      <p className="text-5xl">🔗</p>
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Nexvintrix Connect</h1>
      <p className="mt-2 max-w-md text-gray-600">
        Order pages, owner admin, and consignment tools for any local business — your own
        brand, your own customers, your own link.
      </p>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <Link
          href="/signup"
          className="rounded-2xl bg-hethu-red px-8 py-4 text-lg font-bold text-white"
        >
          Start your business — free trial
        </Link>
        <Link
          href={businessOrderPath("hethu")}
          className="rounded-2xl border-2 border-gray-200 bg-white px-8 py-4 text-lg font-bold text-gray-700"
        >
          Example: Hethu Mobile Butcher
        </Link>
      </div>

      <p className="mt-8 max-w-md text-sm text-gray-500">
        Each business gets a private space:{" "}
        <span className="font-mono text-gray-600">yoursite.co.za/b/your-name/order</span>
        {" · "}
        <span className="font-mono text-gray-600">/b/your-name/admin</span>
      </p>
      <p className="mt-4 text-xs text-gray-400">
        Already a customer? Open your personal admin link or contact Nexvintrix.
      </p>
    </div>
  );
}
