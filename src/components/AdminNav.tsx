"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/owing", label: "Owing", icon: "💰" },
  { href: "/admin/menu", label: "Menu", icon: "🥩" },
  { href: "/admin/more", label: "More", icon: "☰" },
];

export function AdminNav() {
  const pathname = usePathname();

  if (pathname === "/admin/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
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
