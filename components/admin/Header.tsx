"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { authStorage } from "@/lib/auth";

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
    
    // Only update search params if we are on the products gallery page
    if (pathname === "/admin/products") {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("search", value);
      else params.delete("search");
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <header className="flex items-center justify-between px-10 sticky top-0 z-40 w-full h-20 bg-[#fcf9f4]/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-[#725550]/5">
      <div className="flex-1 max-w-xl mx-auto">
        <div className="flex items-center bg-[#725550]/5 rounded-full px-5 py-2 group focus-within:ring-2 focus-within:ring-[#725550]/10 transition-all">
          <span className="material-symbols-outlined text-[#725550]/40 mr-3 text-xl">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm font-body w-full placeholder:text-[#725550]/30 outline-none" 
            placeholder="Search gallery inventory..." 
            type="text"
            value={query}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 text-[#725550]/60 hover:text-[#725550] transition-all group">
          <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#E91E63] rounded-full border-2 border-[#fcf9f4]"></span>
        </button>
        
        <div className="h-8 w-px bg-[#725550]/10 mx-4"></div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#725550] font-headline leading-tight">
              {user?.phone || "Artisanal Admin"}
            </p>
            <p className="text-[11px] text-[#725550]/50 font-body uppercase tracking-wider font-medium">
              Authorized Curator
            </p>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden ring-4 ring-[#725550]/5 hover:ring-[#725550]/10 transition-all cursor-pointer shadow-sm bg-[#725550]/5 flex items-center justify-center">
            {user?.phone ? (
              <div className="w-full h-full bg-[#725550] text-[#fcf9f4] flex items-center justify-center font-bold text-xs">
                {user.phone.slice(-2)}
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
