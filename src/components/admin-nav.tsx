"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Pending", exact: true },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/practitioners", label: "Practitioners" },
  { href: "/admin/import", label: "Import" },
  { href: "/admin/subscribers", label: "Subscribers" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 mb-8">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? "bg-ocean text-white"
                : "bg-black/5 text-text-soft hover:bg-black/10"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
