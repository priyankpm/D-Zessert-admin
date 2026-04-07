"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Country {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

export const COUNTRIES: Country[] = [
  { name: "India", code: "IN", flag: "🇮🇳", dialCode: "+91" },
  { name: "United States", code: "US", flag: "🇺🇸", dialCode: "+1" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", dialCode: "+44" },
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", dialCode: "+971" },
  { name: "Canada", code: "CA", flag: "🇨🇦", dialCode: "+1" },
  { name: "Australia", code: "AU", flag: "🇦🇺", dialCode: "+61" },
  { name: "Singapore", code: "SG", flag: "🇸🇬", dialCode: "+65" },
];

interface CountrySelectorProps {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
  disabled?: boolean;
}

export function CountrySelector({ selectedCountry, onSelect, disabled }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 px-4 bg-white border border-neutral-200 hover:border-brand-500/30 rounded-xl flex items-center gap-2 transition-all outline-none focus:border-brand-500 disabled:opacity-50 group"
      >
        <span className="text-xl">{selectedCountry.flag}</span>
        <span className="font-bold text-neutral-600 text-xs whitespace-nowrap">{selectedCountry.dialCode}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-300 transition-transform group-hover:text-brand-500 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 mt-2 w-56 bg-white border border-neutral-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-50 overflow-hidden"
          >
            <div className="p-1.5 space-y-0.5 max-h-64 overflow-y-auto custom-scrollbar">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onSelect(country);
                    setIsOpen(false);
                  }}
                  className="w-full h-11 px-3 rounded-lg flex items-center justify-between hover:bg-brand-50 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{country.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-neutral-800 leading-none">{country.name}</span>
                      <span className="text-[9px] text-neutral-400 font-bold mt-0.5">{country.dialCode}</span>
                    </div>
                  </div>
                  {selectedCountry.code === country.code && <Check className="w-3.5 h-3.5 text-brand-500" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
