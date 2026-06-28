import Link from "next/link";
import { businessAdminPath, businessOrderPath } from "@/lib/tenant";

export default function ConnectHome() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hethu-cream p-6 text-center">
      <p className="text-5xl">🔗</p>
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Nexvintrix Connect</h1>
      <p className="mt-2 max-w-md text-gray-600">
        Order pages, owner admin, and consignment tools for any local business that wants to
        connect with customers — food sellers, mobile shops, services, and more.
      </p>
      <Link
        href={businessOrderPath("hethu")}
        className="mt-8 rounded-2xl bg-hethu-red px-8 py-4 text-lg font-bold text-white"
      >
        Hethu Mobile Butcher — demo
      </Link>
      <p className="mt-6 text-sm text-gray-400">
        Business owner? Use your personal link:{" "}
        <span className="font-mono">yoursite.co.za/b/your-name/order</span>
      </p>
    </div>
  );
}
