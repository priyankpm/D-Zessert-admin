"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Plus,
  Pencil,
  Save,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";

// ── Inline error helper ──────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 mt-1.5 ml-1 text-[10px] text-red-500 font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {message}
    </p>
  );
}

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (vals: string[]) => void;
  error?: string;
  required?: boolean;
  onAdd?: (name: string) => Promise<void>;
  onEdit?: (oldName: string, newName: string) => Promise<void>;
  onDelete?: (name: string) => Promise<void>;
}

export function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  error,
  required,
  onAdd,
  onEdit,
  onDelete,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleOption = (option: string) => {
    const next = selectedValues.includes(option)
      ? selectedValues.filter((v) => v !== option)
      : [...selectedValues, option];
    onChange(next);
  };

  const handleAdd = async () => {
    if (!newName.trim() || !onAdd) return;
    await onAdd(newName);
    setNewName("");
    setIsAdding(false);
  };

  const handleEditSave = async (oldName: string) => {
    if (!editValue.trim() || !onEdit) return;
    await onEdit(oldName, editValue);
    setEditingIndex(null);
  };

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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

      {/* Selected Items Wrap */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedValues.map((val) => (
          <div
            key={val}
            className="flex items-center gap-2 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full animate-in zoom-in-95 duration-200"
          >
            <span className="text-[10px] font-bold text-stone-600 uppercase tracking-tight">
              {val}
            </span>
            <button
              type="button"
              onClick={() => toggleOption(val)}
              className="text-stone-400 hover:text-red-500 transition-colors"
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
          error && "border-red-400 bg-red-50/30",
        )}
      >
        <span
          className={cn(
            "text-[11px] font-bold uppercase tracking-wider text-left",
            selectedValues.length > 0 ? "text-stone-800" : "text-stone-300",
          )}
        >
          {selectedValues.length > 0
            ? `${selectedValues.length} Selected`
            : `Select ${label}...`}
        </span>
        <ChevronRight
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isOpen
              ? "rotate-90 text-amber-500"
              : "text-stone-300 group-hover:text-amber-400",
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-white border border-stone-100 rounded-2xl shadow-2xl shadow-stone-900/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
            {/* Search Bar */}
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

            <div className="p-2 max-h-[280px] overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, idx) => (
                  <div
                    key={option}
                    className={cn(
                      "flex items-center gap-2 p-1 rounded-xl transition-colors group",
                      selectedValues.includes(option)
                        ? "bg-amber-50/50"
                        : "hover:bg-stone-50",
                    )}
                  >
                    {editingIndex === idx ? (
                      <div className="flex-1 flex gap-2 p-1 animate-in fade-in slide-in-from-left-2 duration-200">
                        <input
                          className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-amber-500/10 text-stone-800"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave(option);
                            if (e.key === "Escape") setEditingIndex(null);
                          }}
                        />
                        <button
                          onClick={() => handleEditSave(option)}
                          className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="p-2 bg-stone-100 text-stone-400 rounded-lg hover:bg-stone-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div
                          onClick={() => toggleOption(option)}
                          className="flex-1 flex items-center gap-3 p-2 cursor-pointer rounded-lg"
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-all",
                              selectedValues.includes(option)
                                ? "bg-amber-600 border-amber-600 text-white"
                                : "border-stone-200 group-hover:border-amber-400",
                            )}
                          >
                            {selectedValues.includes(option) && (
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            )}
                          </div>
                          <span className="text-[11px] uppercase tracking-wide font-bold text-stone-700">
                            {option}
                          </span>
                        </div>

                        <div className="flex gap-1 pr-2">
                          {onEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingIndex(idx);
                                setEditValue(option);
                              }}
                              className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete ${option}?`))
                                  onDelete(option);
                              }}
                              className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
                    No matching options
                  </p>
                </div>
              )}
            </div>

            {onAdd && (
              <div className="p-2 border-t border-stone-50 bg-stone-50/30">
                {isAdding ? (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <input
                      placeholder={`New ${label.toLowerCase()}...`}
                      className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wide outline-none focus:border-amber-500/40 transition-all text-stone-800"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAdd();
                        if (e.key === "Escape") setIsAdding(false);
                      }}
                    />
                    <button
                      onClick={handleAdd}
                      className="px-4 bg-amber-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-amber-700 transition-all active:scale-95 shadow-lg shadow-amber-600/10"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded-xl transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-2.5 flex items-center justify-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-50 rounded-xl transition-all active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                    Add New {label.split(" ").pop()?.slice(0, -1)}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
      <FieldError message={error} />
    </div>
  );
}
