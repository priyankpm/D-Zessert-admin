"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Plus,
  Pencil,
  Save,
  X,
  Search,
  CheckCircle2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Topping } from "@/lib/api/topping-service";
import { toast } from "@/lib/toast";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 mt-1.5 ml-1 text-[10px] text-red-500 font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {message}
    </p>
  );
}

interface ToppingSelectDropdownProps {
  label: string;
  allToppings: Topping[];
  selectedNames: string[];
  onChange: (names: string[]) => void;
  error?: string;
  onAdd?: (name: string, price: number) => Promise<void>;
  onEdit?: (oldName: string, newName: string, price: number) => Promise<void>;
  onDelete?: (name: string) => Promise<void>;
}

export function ToppingSelectDropdown({
  label,
  allToppings,
  selectedNames,
  onChange,
  error,
  onAdd,
  onEdit,
  onDelete,
}: ToppingSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Add-new state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const [addError, setAddError] = useState(false);
  const [editError, setEditError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedToppings = allToppings.filter((t) => selectedNames.includes(t.name));
  const filteredToppings = allToppings.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTopping = (name: string) => {
    const next = selectedNames.includes(name)
      ? selectedNames.filter((n) => n !== name)
      : [...selectedNames, name];
    onChange(next);
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newPrice.trim()) {
      setAddError(true);
      toast.error("Name and Price are required.");
      return;
    }
    if (!onAdd) return;
    await onAdd(newName.trim(), parseFloat(newPrice) || 0);
    setNewName("");
    setNewPrice("");
    setAddError(false);
    setIsAdding(false);
  };

  const handleEditSave = async (topping: Topping) => {
    if (!editName.trim() || !editPrice.trim()) {
      setEditError(true);
      toast.error("Name and Price are required.");
      return;
    }
    if (!onEdit) return;
    await onEdit(topping.name, editName.trim(), parseFloat(editPrice) || 0);
    setEditingId(null);
    setEditError(false);
  };

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
        {label}
      </label>

      {/* Selected Chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedToppings.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 pl-3 pr-2 py-1.5 rounded-full animate-in zoom-in-95 duration-200"
          >
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">
              {t.name}
            </span>
            {t.price != null && (
              <span className="text-[9px] font-black text-amber-500 bg-amber-100 rounded-full px-1.5 py-0.5">
                ${t.price.toFixed(2)}
              </span>
            )}
            <button
              type="button"
              onClick={() => toggleTopping(t.name)}
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
              {filteredToppings.length > 0 ? (
                filteredToppings.map((topping) => (
                  <div
                    key={topping.id}
                    className={cn(
                      "flex items-center gap-2 p-1 rounded-xl transition-colors group",
                      selectedNames.includes(topping.name) ? "bg-amber-50/50" : "hover:bg-stone-50"
                    )}
                  >
                    {editingId === topping.id ? (
                      <div className="flex-1 flex gap-2 p-1 animate-in fade-in slide-in-from-left-2 duration-200">
                        <input
                          className={cn(
                            "flex-1 bg-white border rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-amber-500/10 text-stone-800",
                            editError && !editName.trim() ? "border-red-500" : "border-amber-300"
                          )}
                          value={editName}
                          onChange={(e) => {
                            setEditName(e.target.value);
                            if (editError) setEditError(false);
                          }}
                          placeholder="Name"
                          autoFocus
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={cn(
                            "w-20 bg-white border rounded-lg px-2 py-1.5 text-xs font-bold text-stone-800 outline-none focus:ring-2 focus:ring-amber-500/10",
                            editError && !editPrice.trim() ? "border-red-500" : "border-amber-300"
                          )}
                          value={editPrice}
                          onChange={(e) => {
                            setEditPrice(e.target.value);
                            if (editError) setEditError(false);
                          }}
                          placeholder="Price"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave(topping);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <button
                          onClick={() => handleEditSave(topping)}
                          className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 bg-stone-100 text-stone-400 rounded-lg hover:bg-stone-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div
                          onClick={() => toggleTopping(topping.name)}
                          className="flex-1 flex items-center gap-3 p-2 cursor-pointer rounded-lg"
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0",
                              selectedNames.includes(topping.name)
                                ? "bg-amber-600 border-amber-600 text-white"
                                : "border-stone-200 group-hover:border-amber-400"
                            )}
                          >
                            {selectedNames.includes(topping.name) && (
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            )}
                          </div>
                          <span className="text-[11px] uppercase tracking-wide font-bold text-stone-700 flex-1">
                            {topping.name}
                          </span>
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5 flex-shrink-0">
                            ${(topping.price ?? 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex gap-1 pr-2">
                          {onEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(topping.id);
                                setEditName(topping.name);
                                setEditPrice(topping.price?.toString() ?? "0");
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
                                if (confirm(`Delete "${topping.name}"?`)) onDelete(topping.name);
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
                    No matching toppings
                  </p>
                </div>
              )}
            </div>

            {/* Add New */}
            {onAdd && (
              <div className="p-2 border-t border-stone-50 bg-stone-50/30">
                {isAdding ? (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <input
                      placeholder="Topping name..."
                      className={cn(
                        "flex-1 bg-white border rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wide outline-none focus:border-amber-500/40 transition-all text-stone-800",
                        addError && !newName.trim() ? "border-red-500" : "border-stone-200"
                      )}
                      value={newName}
                      onChange={(e) => {
                        setNewName(e.target.value);
                        if (addError) setAddError(false);
                      }}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAdd();
                        if (e.key === "Escape") setIsAdding(false);
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      className={cn(
                        "w-24 bg-white border rounded-xl px-3 py-2 text-xs font-bold text-stone-800 outline-none focus:border-amber-500/40 transition-all",
                        addError && !newPrice.trim() ? "border-red-500" : "border-stone-200"
                      )}
                      value={newPrice}
                      onChange={(e) => {
                        setNewPrice(e.target.value);
                        if (addError) setAddError(false);
                      }}
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
                      onClick={() => { setIsAdding(false); setNewName(""); setNewPrice(""); }}
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
                    Add New Topping
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
