"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  rating?: number;
  reviews?: number;
  image: string;
  description?: string;
  calories?: number;
  chefName?: string;
  sku?: string;
  stock?: number;
  maxStock?: number;
  isDeleted?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onView?: (id: string) => void;
}

export function ProductCard({
  id,
  name,
  price,
  image,
  chefName = "Julian Valery",
  description = "A delicate masterpiece handcrafted by our head curator.",
  sku = "",
  stock = 85,
  maxStock = 100,
  isDeleted,
  onEdit,
  onDelete,
  onRestore,
  onView,
}: ProductCardProps) {
  const stockPercentage = (stock / maxStock) * 100;
  const isLowStock = stockPercentage < 20;

  return (
    <div
      onClick={() => onView?.(id)}
      className={cn(
        "bg-white rounded-[1.5rem] overflow-hidden group cursor-pointer hover:border-amber-500/30 transition-all duration-300 border border-stone-200 flex flex-col h-full shadow-sm",
        isDeleted && "opacity-75 grayscale-[0.5]",
      )}
    >
      {/* Image Container with Badges */}
      <div className="relative h-60 overflow-hidden m-4 rounded-xl bg-stone-100">
        <Image
          src={image}
          alt={name}
          fill
          unoptimized={
            image.startsWith("blob:") ||
            image.includes("localhost") ||
            image.includes("127.0.0.1")
          }
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {isDeleted && (
          <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">
              Archived
            </span>
          </div>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm">
          <p className="text-sm font-black text-amber-600 font-headline">
            ${price != null ? price.toFixed(2) : "0.00"}
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 mr-2">
            <h3
              className={cn(
                "font-headline font-bold text-stone-900 text-xl leading-tight mb-1",
                isDeleted && "line-through opacity-60",
              )}
            >
              {name}
            </h3>
            <p className="text-[11px] text-stone-500 font-medium line-clamp-1">
              {description}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="text-stone-400 hover:text-stone-900 transition-colors p-1"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-[10px] font-black border border-amber-200">
            {chefName
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </div>
          <span className="text-xs font-bold text-stone-600 group-hover:text-amber-600 transition-colors">
            {chefName}
          </span>
        </div>

        <div className="pt-5 border-t border-stone-100 mt-auto">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">
              Inventory
            </span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase",
                isLowStock ? "text-red-500" : "text-amber-600",
              )}
            >
              {isLowStock ? "Critically Low" : "Healthy Stock"}
            </span>
          </div>

          <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden mb-2">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                isLowStock ? "bg-red-500 animate-pulse" : "bg-amber-500/80",
              )}
              style={{ width: `${stockPercentage}%` }}
            ></div>
          </div>

          <p className="text-[10px] text-right font-black text-stone-400 uppercase tracking-widest">
            {stock}/{maxStock} units
          </p>
        </div>
      </div>
    </div>
  );
}
