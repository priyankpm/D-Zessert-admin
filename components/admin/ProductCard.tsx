"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  description?: string;
  tags: string[];
  calories?: number;
  match?: number;
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
  tags,
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
        "bg-surface-container-lowest rounded-2xl overflow-hidden velvet-shadow group cursor-pointer hover:-translate-y-1 transition-all duration-300 border border-outline-variant/10 flex flex-col h-full",
        isDeleted && "opacity-75 grayscale-[0.5]"
      )}
    >
      <div className="relative h-56 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          unoptimized={
            image.startsWith("blob:") ||
            image.includes("localhost") ||
            image.includes("127.0.0.1")
          }
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {isDeleted ? (
            <span className="px-3 py-1 bg-on-surface text-surface rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-lg">
              Archived
            </span>
          ) : (
            <span className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-md bg-opacity-90 shadow-sm">
              {tags[0] || "Artisanal"}
            </span>
          )}
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="bg-surface-container-lowest/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-outline-variant/20 shadow-sm">
            <p className="text-lg font-bold text-primary font-headline">
              ${price.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className={cn(
              "font-headline font-extrabold text-on-surface text-lg leading-tight group-hover:text-primary transition-colors",
              isDeleted && "text-on-surface-variant line-through opacity-60"
            )}>
              {name}
            </h3>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5 line-clamp-2">
              {description}
            </p>
          </div>
          <div className="relative group/menu">
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full text-outline hover:text-primary hover:bg-primary/5 transition-all outline-none"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
            <div className="absolute right-0 top-full pt-2 w-40 opacity-0 group-hover/menu:opacity-100 scale-95 group-hover/menu:scale-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all duration-200 z-50 origin-top-right">
              {/* Frictionless Bridge: Ensures the menu doesn't disappear when moving the mouse */}
              <div className="absolute -top-2 left-0 w-full h-2 pointer-events-auto" />
              
              <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-outline-variant/10 overflow-hidden">
                {isDeleted ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore?.(id);
                  }}
                  className="w-full text-left px-4 py-2.5 text-[11px] font-extrabold text-primary hover:bg-primary/5 flex items-center gap-3 transition-all first:rounded-t-xl last:rounded-b-xl"
                >
                  <span className="material-symbols-outlined text-lg">restore_from_trash</span>
                  RESTORE
                </button>
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(id);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[11px] font-extrabold text-on-surface hover:bg-surface-container-low flex items-center gap-3 transition-all first:rounded-t-xl"
                  >
                    <span className="material-symbols-outlined text-lg">edit_note</span>
                    EDIT
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(id);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[11px] font-extrabold text-secondary hover:bg-secondary/5 flex items-center gap-3 transition-all last:rounded-b-xl"
                  >
                    <span className="material-symbols-outlined text-lg">archive</span>
                    ARCHIVE
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

        <div className="flex items-center gap-2 mb-4 mt-3">
          <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-on-primary-fixed ring-2 ring-surface">
            {chefName
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </div>
          <span className="text-xs font-semibold text-on-surface-variant">
            {chefName}
          </span>
        </div>

        <div className="pt-4 border-t border-outline-variant/10 mt-auto">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Inventory
            </span>
            <span
              className={cn(
                "text-[10px] font-bold",
                isLowStock ? "text-secondary" : "text-tertiary",
              )}
            >
              {isLowStock ? "Critically Low" : "Healthy Stock"}
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                isLowStock ? "bg-secondary animate-pulse" : "bg-tertiary",
              )}
              style={{ width: `${stockPercentage}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-right mt-1.5 font-bold text-on-surface">
            {stock}/{maxStock} units
          </p>
        </div>
      </div>
    </div>
  );
}
