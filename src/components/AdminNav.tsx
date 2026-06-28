"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tenantAdminPath } from "@/lib/paths";

function useAdminSlug(): string | null {
  const pathname = usePathname();
  const match = pathname.match(/^\/b\/([^/]+)\/admin/);
  return match?.[1] ?? null;
}

export function AdminNav() {
  const pathname = usePathname();
  const slug = useAdminSlug();

  if (!slug || pathname.endsWith("/admin/login")) return null;

  const tabs = [
    { path: "", label: "Dashboard", icon: "📊", exact: true },
    { path: "orders", label: "Orders", icon: "📦" },
    { path: "owing", label: "Owing", icon: "💰" },
    { path: "menu", label: "Menu", icon: "📋" },
    { path: "more", label: "More", icon: "☰" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const href = tenantAdminPath(slug, tab.path);
          const active = tab.exact
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center py-2 text-xs font-semibold ${
                active ? "text-hethu-red" : "text-gray-400"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
