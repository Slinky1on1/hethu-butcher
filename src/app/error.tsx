"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hethu-cream p-6 text-center">
      <p className="text-5xl">⚠️</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        Please try again. If this keeps happening, refresh the page or come back later.
      </p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-hethu-red py-4 font-bold text-white"
        >
          Try again
        </button>
        <Link href="/order" className="text-sm text-gray-400">
          ← Back to order page
        </Link>
      </div>
    </div>
  );
}
