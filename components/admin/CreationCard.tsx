"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface CreationCardProps {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  tags?: string[];
  onClick?: (id: string) => void;
}

export function CreationCard({
  id,
  name,
  price,
  description = "A delicate masterpiece from our pastry studio.",
  image = "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800",
  tags = ["CLASSIC", "TRENDING"],
  onClick,
}: CreationCardProps) {
  return (
    <div 
      onClick={() => onClick?.(id)}
      className="bg-white rounded-[2rem] p-3 shadow-[0px_10px_35px_rgba(43,22,19,0.03)] border border-outline-variant/10 group cursor-pointer hover:-translate-y-1 transition-all duration-500"
    >
      {/* Image Container */}
      <div className="aspect-[4/3] rounded-[1.5rem] overflow-hidden relative mb-4">
        <Image
          src={image}
          alt={name}
          fill
          unoptimized={
            image.startsWith("blob:") ||
            image.includes("localhost") ||
            image.includes("127.0.0.1")
          }
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
        />
      </div>

      {/* Content */}
      <div className="px-2 pb-3">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-lg font-extrabold text-on-surface font-headline tracking-tight group-hover:text-primary transition-colors">
            {name}
          </h4>
          <span className="text-sm font-bold text-on-surface-variant font-headline">
            ${price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-xs text-on-surface-variant/70 font-medium mb-4 line-clamp-1 leading-relaxed">
          {description}
        </p>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span 
              key={tag}
              className={cn(
                "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                tag === "TRENDING" 
                  ? "bg-secondary-fixed text-on-secondary-fixed shadow-sm" 
                  : "bg-surface-variant/30 text-on-surface-variant border border-outline-variant/10"
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
