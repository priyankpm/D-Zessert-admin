"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { MoreVertical, CheckCircle2, Trash2, Edit2, Eye } from "lucide-react";
import { useState } from "react";

interface ChefCardProps {
  id: string;
  name: string;
  shortInfo?: string;
  image?: string;
  verified: boolean;
  isDeleted: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onView?: (id: string) => void;
}

export function ChefCard({
  id,
  name,
  shortInfo = "Master Patissier",
  image = "https://images.unsplash.com/photo-1577214281217-4024b104c1f5?q=80&w=800",
  verified,
  isDeleted,
  onEdit,
  onDelete,
  onRestore,
  onView,
}: ChefCardProps) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div
      onClick={() => onView?.(id)}
      className={cn(
        "bg-white rounded-[2rem] p-6 border border-stone-200 group cursor-pointer hover:border-amber-500/30 transition-all duration-500 shadow-sm relative overflow-hidden h-full flex flex-col",
        isDeleted && "opacity-75 grayscale-[0.5]"
      )}
    >
      {/* Verification Badge */}
      {verified && (
        <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md p-1.5 rounded-full border border-stone-100 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-amber-600" />
        </div>
      )}

      {/* Options Menu */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(!showOptions);
          }}
          className="p-2 rounded-full hover:bg-stone-50 text-stone-400 hover:text-stone-900 transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        
        {showOptions && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-20 py-2 border border-stone-100 animate-in fade-in zoom-in-95 duration-200">
            <button
               onClick={(e) => { e.stopPropagation(); onView?.(id); setShowOptions(false); }}
               className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-600 hover:bg-stone-50 hover:text-amber-600 flex items-center gap-3"
            >
              <Eye className="w-4 h-4" /> View Profile
            </button>
            <button
               onClick={(e) => { e.stopPropagation(); onEdit?.(id); setShowOptions(false); }}
               className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-600 hover:bg-stone-50 hover:text-amber-600 flex items-center gap-3"
            >
              <Edit2 className="w-4 h-4" /> Edit Details
            </button>
            {isDeleted ? (
              <button
                onClick={(e) => { e.stopPropagation(); onRestore?.(id); setShowOptions(false); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 flex items-center gap-3"
              >
                <CheckCircle2 className="w-4 h-4" /> Restore Chef
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(id); setShowOptions(false); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 flex items-center gap-3"
              >
                <Trash2 className="w-4 h-4" /> Archive Chef
              </button>
            )}
          </div>
        )}
      </div>

      {/* Avatar / Portrait */}
      <div className="flex flex-col items-center text-center mt-4 mb-6">
        <div className="relative w-32 h-32 mb-6 group-hover:scale-105 transition-transform duration-700">
          <div className="absolute inset-0 rounded-full border-4 border-amber-500/10 group-hover:border-amber-500/30 transition-colors invisible md:visible" />
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl relative">
            <Image
              src={image || "https://images.unsplash.com/photo-1577214281217-4024b104c1f5?q=80&w=800"}
              alt={name}
              fill
              className="object-cover"
              unoptimized={image?.startsWith("blob:")}
            />
          </div>
        </div>

        <h3 className="text-xl font-bold text-stone-900 font-headline mb-1 tracking-tight">
          {name}
        </h3>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-4 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
          {shortInfo || "Culinary Artisan"}
        </p>
      </div>

      {/* Stats or Info */}
      <div className="mt-auto pt-6 border-t border-stone-100 grid grid-cols-2 gap-4">
        <div className="text-center border-r border-stone-100">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Status</p>
          <p className={cn(
            "text-xs font-bold uppercase tracking-wide",
            isDeleted ? "text-red-500" : "text-emerald-600"
          )}>
            {isDeleted ? "Archived" : "Active"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Portfolio</p>
          <p className="text-xs font-bold text-stone-600 uppercase tracking-wide">
            Master Chef
          </p>
        </div>
      </div>

      {isDeleted && (
        <div className="absolute inset-0 bg-stone-100/40 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
           <div className="bg-stone-900/80 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full">
             Archived
           </div>
        </div>
      )}
    </div>
  );
}
