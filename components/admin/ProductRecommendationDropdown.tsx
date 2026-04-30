"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle2, ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/api/product-service";

interface ProductRecommendationDropdownProps {
  label: string;
  allProducts: Product[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}

export function ProductRecommendationDropdown({
  label,
  allProducts,
  selectedIds,
  onChange,
  error,
}: ProductRecommendationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProducts = allProducts.filter((p) => selectedIds.includes(p.id));

  const toggleProduct = (productId: string) => {
    const next = selectedIds.includes(productId)
      ? selectedIds.filter((id) => id !== productId)
      : [...selectedIds, productId];
    onChange(next);
  };

  const removeProduct = (productId: string) => {
    onChange(selectedIds.filter((id) => id !== productId));
  };

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      dropdownRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-2" ref={dropdownRef}>
      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
        {label}
      </label>

      {/* Selected Items Wrap */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedProducts.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 pl-1 pr-2 py-1 rounded-full animate-in zoom-in-95 duration-200"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-amber-200 bg-stone-100 flex-shrink-0">
              <img
                src={p.imageUrl || "/placeholder.png"}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight truncate max-w-[120px]">
              {p.name}
            </span>
            <button
              onClick={() => removeProduct(p.id)}
              className="text-amber-400 hover:text-amber-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-stone-50 border rounded-xl p-4 flex items-center justify-between transition-all group",
          isOpen
            ? "border-amber-500 bg-white ring-4 ring-amber-500/5 shadow-sm"
            : "border-stone-200 hover:border-amber-400/40",
          error && "border-red-400 bg-red-50/30"
        )}
      >
        <span
          className={cn(
            "text-[11px] font-bold uppercase tracking-wider",
            selectedIds.length > 0 ? "text-stone-800" : "text-stone-300"
          )}
        >
          {selectedIds.length > 0
            ? `${selectedIds.length} Recommended Products`
            : `Search & Select ${label}...`}
        </span>
        <ChevronRight
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isOpen ? "rotate-90 text-amber-500" : "text-stone-300 group-hover:text-amber-400"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-stone-100 rounded-2xl shadow-2xl shadow-stone-900/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
          {/* Search Bar */}
          <div className="p-3 border-b border-stone-50 bg-stone-50/30 flex items-center gap-2">
            <Search className="w-4 h-4 text-stone-400" />
            <input
              autoFocus
              placeholder="Search products..."
              className="flex-1 bg-transparent border-none outline-none text-xs font-bold uppercase tracking-wide text-stone-700 placeholder:text-stone-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="p-2 max-h-[280px] overflow-y-auto custom-scrollbar">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className={cn(
                    "flex items-center gap-3 p-2 cursor-pointer rounded-xl transition-all group",
                    selectedIds.includes(p.id) ? "bg-amber-50" : "hover:bg-stone-50"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-100 bg-stone-50 flex-shrink-0">
                    <img
                      src={p.imageUrl || "/placeholder.png"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-stone-800 uppercase tracking-wide truncate">
                      {p.name}
                    </p>
                    <p className="text-[9px] font-medium text-stone-400 uppercase tracking-wider">
                      ${p.price.toFixed(2)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                      selectedIds.includes(p.id)
                        ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/20"
                        : "border-stone-200 group-hover:border-amber-400"
                    )}
                  >
                    {selectedIds.includes(p.id) && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
                  No products found
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-[10px] font-bold text-red-500 ml-1 uppercase">{error}</p>}
    </div>
  );
}
