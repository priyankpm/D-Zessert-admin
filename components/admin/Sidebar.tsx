"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { authStorage } from "@/lib/auth";

const menuItems = [
  { icon: "dashboard", label: "Dashboard", href: "/admin" },
  { icon: "cake", label: "Products", href: "/admin/products" },
  // { icon: "shopping_bag", label: "Orders", href: "/admin/orders" },
  // { icon: "group", label: "Customers", href: "/admin/customers" },
  // { icon: "settings", label: "Settings", href: "/admin/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 border-r border-[#725550]/5 bg-[#fcf9f4] dark:bg-stone-900 flex flex-col py-8 px-6 font-headline text-sm tracking-wide z-50">
      <div className="mb-12 px-2">
        <h1 className="text-3xl font-bold text-[#725550] dark:text-[#fcf9f4] italic font-serif">
          d'zessert
        </h1>
        <p className="text-[9px] uppercase tracking-[0.3em] text-[#725550]/60 font-bold mt-1.5 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-[#E91E63]/20"></span>
          The Artisanal Gallery
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-300 active:scale-95",
                isActive
                  ? "text-[#725550] dark:text-[#fcf9f4] font-bold border-r-4 border-[#E91E63] bg-stone-200/50"
                  : "text-stone-500 dark:text-stone-400 opacity-80 hover:bg-stone-200/50 dark:hover:bg-stone-800/50",
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-outline-variant/10 space-y-2">
        <button
          onClick={() => {
            authStorage.clearAuth();
            window.location.href = "/";
          }}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-stone-500 dark:text-stone-400 opacity-80 font-medium hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors duration-300"
        >
          <span className="material-symbols-outlined">logout</span>
          Log Out
        </button>
      </div>
    </aside>
  );
}
