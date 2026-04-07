"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";

interface CreationCardProps {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  tags?: string[];
  chefName?: string;
  stock?: number;
  maxStock?: number;
  onClick?: (id: string) => void;
}

export function CreationCard({
  id,
  name,
  price,
  description = "A delicate masterpiece from our pastry studio.",
  image = "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800",
  tags = ["CLASSIC", "TRENDING"],
  chefName = "Chef Marc-Antoine",
  stock = 24,
  maxStock = 100,
  onClick,
}: CreationCardProps) {
  const stockPercentage = (stock / maxStock) * 100;

  return (
    <div
      onClick={() => onClick?.(id)}
      className="bg-white rounded-[1.5rem] p-4 border border-stone-200 group cursor-pointer hover:border-amber-500/30 transition-all duration-300 shadow-sm"
    >
      {/* Image */}
      <div className="aspect-[4/3] rounded-xl overflow-hidden relative mb-4 bg-stone-100">
        <Image
          src={image}
          alt={name}
          fill
          unoptimized={
            image.startsWith("blob:") ||
            image.includes("localhost") ||
            image.includes("127.0.0.1")
          }
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        {/* Price Badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-200 shadow-lg">
          <span className="text-amber-600 text-xs font-bold font-headline">
            ${price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Header & Description */}
      <div className="px-1 mb-4 flex justify-between items-start">
        <div className="flex-1 mr-2">
          <h4 className="text-lg font-bold text-stone-900 font-headline leading-tight mb-1">
            {name}
          </h4>
          <p className="text-[11px] text-stone-500 font-medium line-clamp-1">
            {description}
          </p>
        </div>
        <button className="p-1 px-2 text-stone-400 hover:text-stone-900 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Chef Section */}
      <div className="px-1 mb-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-[10px] font-black border border-amber-200">
          {chefName
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <span className="text-xs font-bold text-stone-600">{chefName}</span>
      </div>

      {/* Inventory Footer */}
      <div className="px-1 pt-4 border-t border-stone-100">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">
            Inventory
          </span>
          <span className="text-[10px] font-bold text-amber-600">
            {stock > 20 ? "Healthy" : "Low"} Stock
          </span>
        </div>
        <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-amber-500/80 rounded-full transition-all duration-1000"
            style={{ width: `${stockPercentage}%` }}
          />
        </div>
        <div className="text-[10px] font-black text-stone-400 text-right uppercase tracking-[0.1em]">
          {stock}/{maxStock} units
        </div>
      </div>
    </div>
  );
}
