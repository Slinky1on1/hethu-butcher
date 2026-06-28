import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hethu-cream p-6 text-center">
      <p className="text-5xl">🥩</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-sm text-gray-500">This link does not exist.</p>
      <Link
        href="/order"
        className="mt-6 rounded-xl bg-hethu-red px-8 py-4 font-bold text-white"
      >
        Order meat
      </Link>
    </div>
  );
}
