"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { authStorage } from "@/lib/auth";
import { LayoutDashboard, UtensilsCrossed, LogOut } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    {
      icon: UtensilsCrossed,
      label: "Product Management",
      href: "/admin/products",
    },
    {
      icon: UtensilsCrossed,
      label: "Chef Management",
      href: "/admin/chefs",
    },
  ];

  return (
    <aside className="h-screen w-72 fixed left-0 top-0 z-40 bg-white flex flex-col p-6 gap-2 border-r border-stone-200">
      <div className="mb-10 px-2 flex justify-center">
        <img
          alt="D'Zessert Therapy Logo"
          className="w-30 object-contain relative z-10"
          src="/dzessertTherapy.png"
        />
      </div>
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-all rounded-xl group",
                isActive
                  ? "bg-amber-50 text-amber-700 translate-x-1 border border-amber-200/60"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-800",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="pt-6 border-t border-stone-200 space-y-1">
        <button
          onClick={() => {
            authStorage.clearAuth();
            window.location.href = "/";
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors rounded-xl"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
