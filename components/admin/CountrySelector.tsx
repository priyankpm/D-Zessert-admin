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
        className="h-16 px-4 bg-chocolate/5 border-2 border-transparent hover:bg-chocolate/10 rounded-2xl flex items-center gap-2 transition-all outline-none focus:border-brand/20 disabled:opacity-50"
      >
        <span className="text-2xl">{selectedCountry.flag}</span>
        <span className="font-bold text-chocolate/60 text-sm whitespace-nowrap">{selectedCountry.dialCode}</span>
        <ChevronDown className={`w-4 h-4 text-chocolate/30 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-56 bg-white border border-chocolate/5 rounded-2xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto"
          >
            <div className="p-2 space-y-1">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onSelect(country);
                    setIsOpen(false);
                  }}
                  className="w-full h-12 px-4 rounded-xl flex items-center justify-between hover:bg-brand/5 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{country.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-chocolate leading-none">{country.name}</span>
                      <span className="text-[10px] text-chocolate/40 font-bold">{country.dialCode}</span>
                    </div>
                  </div>
                  {selectedCountry.code === country.code && <Check className="w-4 h-4 text-brand" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
