"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Vibe } from "@/lib/api/vibe-service";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 mt-1.5 ml-1 text-[10px] text-red-500 font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {message}
    </p>
  );
}

interface VibeSelectDropdownProps {
  label: string;
  allVibes: Vibe[];
  selectedNames: string[];
  onChange: (names: string[]) => void;
  error?: string;
  required?: boolean;
}

export function VibeSelectDropdown({
  label,
  allVibes,
  selectedNames,
  onChange,
  error,
  required,
}: VibeSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedVibes = allVibes.filter((v) => selectedNames.includes(v.name));
  const filteredVibes = allVibes.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleVibe = (name: string) => {
    const next = selectedNames.includes(name)
      ? selectedNames.filter((n) => n !== name)
      : [...selectedNames, name];
    onChange(next);
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
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-2" ref={dropdownRef}>
      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {/* Selected Chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedVibes.map((v) => (
          <div
            key={v.id}
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 pl-3 pr-2 py-1.5 rounded-full animate-in zoom-in-95 duration-200"
          >
            <span className="text-[10px]">{v.icon}</span>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">
              {v.name}
            </span>
            <button
              type="button"
              onClick={() => toggleVibe(v.name)}
              className="text-amber-400 hover:text-amber-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Trigger Button */}
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
            selectedNames.length > 0 ? "text-stone-800" : "text-stone-300"
          )}
        >
          {selectedNames.length > 0
            ? `${selectedNames.length} Selected`
            : `Select ${label}...`}
        </span>
        <ChevronRight
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isOpen ? "rotate-90 text-amber-500" : "text-stone-300 group-hover:text-amber-400"
          )}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-2 bg-white border border-stone-100 rounded-2xl shadow-2xl shadow-stone-900/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
            {/* Search */}
            <div className="p-3 border-b border-stone-50 bg-stone-50/30 flex items-center gap-2">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                autoFocus
                placeholder={`Search ${label.toLowerCase()}...`}
                className="flex-1 bg-transparent border-none outline-none text-xs font-bold uppercase tracking-wide text-stone-700 placeholder:text-stone-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* List */}
            <div className="p-2 max-h-[280px] overflow-y-auto custom-scrollbar">
              {filteredVibes.length > 0 ? (
                filteredVibes.map((vibe) => (
                  <div
                    key={vibe.id}
                    onClick={() => toggleVibe(vibe.name)}
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-colors group",
                      selectedNames.includes(vibe.name) ? "bg-amber-50/50" : "hover:bg-stone-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0",
                        selectedNames.includes(vibe.name)
                          ? "bg-amber-600 border-amber-600 text-white"
                          : "border-stone-200 group-hover:border-amber-400"
                      )}
                    >
                      {selectedNames.includes(vibe.name) && (
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      )}
                    </div>
                    <span className="text-lg">{vibe.icon}</span>
                    <span className="text-[11px] uppercase tracking-wide font-bold text-stone-700 flex-1">
                      {vibe.name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
                    No matching vibes
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <FieldError message={error} />
    </div>
  );
}
