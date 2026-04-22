"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChefService, Chef } from "@/lib/api/chef-service";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

function ChefsPageContent() {
  const router = useRouter();
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        setIsLoading(true);
        const data = await ChefService.findAll();
        setChefs(data);
      } catch {
        toast.error("Failed to load chefs. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchChefs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to archive this chef?")) return;
    try {
      await ChefService.remove(id);
      setChefs((prev) => prev.map((c) => (c.id === id ? { ...c, isDeleted: true } : c)));
      toast.success("Chef archived successfully.");
    } catch {
      toast.error("Failed to archive chef.");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const fd = new FormData();
      fd.append("isDeleted", "false");
      await ChefService.update(id, fd);
      setChefs((prev) => prev.map((c) => (c.id === id ? { ...c, isDeleted: false } : c)));
      toast.success("Chef restored successfully.");
    } catch {
      toast.error("Failed to restore chef.");
    }
  };

  const filteredChefs = chefs?.filter((chef) =>
    chef.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-stone-900 mb-2">
            The Artisans
          </h2>
          <p className="text-stone-500 font-body flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Curating {chefs?.length} culinary masters behind our creations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
            <input
              type="text"
              placeholder="Search artisans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500/40 transition-all w-64 shadow-sm"
            />
          </div>
          <Link
            href="/admin/chefs/add"
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-600/10 hover:shadow-amber-600/20 transition-all active:scale-95 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="font-headline font-bold text-sm tracking-wider uppercase">
              Add Artisan
            </span>
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Artisan</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Bio Summary</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Verification</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Summoning profiles...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredChefs.length > 0 ? (
                filteredChefs.map((chef) => (
                  <tr 
                    key={chef.id} 
                    className={cn(
                      "group hover:bg-stone-50/50 transition-colors cursor-pointer",
                      chef.isDeleted && "opacity-60 bg-stone-50/30"
                    )}
                    onClick={() => router.push(`/admin/chefs/${chef.id}`)}
                  >
                    {/* Artisan Name & Profile */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                          <Image
                            src={chef.image || "https://images.unsplash.com/photo-1577214281217-4024b104c1f5?q=80&w=200"}
                            alt={chef.name}
                            fill
                            className="object-cover"
                            unoptimized={chef.image?.startsWith("blob:")}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 font-headline leading-tight">{chef.name}</p>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Professional Chef</p>
                        </div>
                      </div>
                    </td>

                    {/* Bio Summary */}
                    <td className="px-8 py-5 max-w-xs">
                      <p className="text-xs text-stone-500 font-medium line-clamp-2 leading-relaxed">
                        {chef.shortInfo || "No professional summary provided."}
                      </p>
                    </td>

                    {/* Verification */}
                    <td className="px-8 py-5">
                      {chef.verified ? (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 w-fit px-3 py-1.5 rounded-full border border-amber-100 shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-stone-400 bg-stone-50 w-fit px-3 py-1.5 rounded-full border border-stone-100">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Standard</span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          chef.isDeleted ? "bg-red-500" : "bg-emerald-500 animate-pulse"
                        )} />
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          chef.isDeleted ? "text-red-500" : "text-emerald-600"
                        )}>
                          {chef.isDeleted ? "Archived" : "Active"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/chefs/${chef.id}`);
                          }}
                          className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="View Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                         onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/chefs/${chef.id}`);
                        }}
                          className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {chef.isDeleted ? (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestore(chef.id);
                            }}
                            className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Restore Chef"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(chef.id);
                            }}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Archive Chef"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="max-w-xs mx-auto space-y-4">
                      <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto">
                        <Search className="w-6 h-6 text-stone-200" />
                      </div>
                      <h3 className="text-xl font-bold text-stone-900 font-headline uppercase">No Artisans Found</h3>
                      <p className="text-stone-400 text-sm font-medium">Try adjusting your search criteria or add a new master chef.</p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-amber-600 font-black text-[10px] uppercase tracking-[0.2em] hover:underline underline-offset-8"
                      >
                        Reset Application
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="px-8 py-5 border-t border-stone-50 flex items-center justify-between bg-stone-50/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            Displaying {filteredChefs.length} of {chefs.length} Artisans
          </p>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg border border-stone-200 text-stone-400 disabled:opacity-30" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg bg-stone-900 text-white text-[10px] font-black shadow-md">1</button>
            </div>
            <button className="p-2 rounded-lg border border-stone-200 text-stone-400 disabled:opacity-30" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChefsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center text-stone-400 font-bold uppercase tracking-widest">
          Loading Registry...
        </div>
      }
    >
      <ChefsPageContent />
    </Suspense>
  );
}
