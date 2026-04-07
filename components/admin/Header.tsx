"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { authStorage } from "@/lib/auth";
import { Search, Bell } from "lucide-react";

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(authStorage.getUser());
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (pathname === "/admin/products") {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("search", value);
      else params.delete("search");
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <header className="flex items-center justify-between px-10 sticky top-0 z-40 w-full h-20 bg-white/95 backdrop-blur-xl border-b border-stone-200 transition-colors">
      <div className="flex-1 max-w-xl mx-auto">
        <div>
          {/* <Search className="w-4 h-4 text-stone-400 mr-3" />
          <input
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-stone-400 outline-none text-stone-800"
            placeholder="Search gallery inventory..."
            type="text"
            value={query}
            onChange={handleSearch}
          /> */}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 text-stone-400 hover:text-amber-600 transition-all group">
          {/* <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" /> */}
          {/* <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></span> */}
        </button>
        <div className="h-8 w-px bg-stone-200 mx-4"></div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-amber-700 font-headline leading-tight">
              {user?.phone || "Artisanal Admin"}
            </p>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] opacity-70">
              Authorized Curator
            </p>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden ring-4 ring-stone-100 hover:ring-amber-500/20 transition-all cursor-pointer shadow-sm bg-stone-200 flex items-center justify-center">
            {user?.phone ? (
              <div className="w-full h-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                USER
              </div>
            ) : (
              <img
                className="w-full h-full object-cover"
                alt="Admin"
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&h=150&auto=format&fit=crop"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
