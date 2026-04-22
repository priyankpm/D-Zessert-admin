"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChefService } from "@/lib/api/chef-service";
import {
  Camera,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  User,
  ShieldCheck,
  Type,
  FileText,
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

export default function AddChefPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    shortInfo: "",
    verified: false,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const clearError = (field: string) => {
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    clearError(name);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      clearError("image");
    }
  };

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Please enter the chef's name.";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters long.";
    }

    if (!formData.shortInfo.trim()) {
      errors.shortInfo = "Please provide a brief professional summary.";
    }

    if (!imagePreview) {
      errors.image = "A profile portrait is required.";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitError("Please provide all required information.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("shortInfo", formData.shortInfo);
      fd.append("verified", formData.verified ? "true" : "false");
      if (imageFile) {
        fd.append("image", imageFile);
      }

      await ChefService.create(fd);

      router.push("/admin/chefs");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create chef profile. Please try again.";
      setSubmitError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <nav className="flex items-center gap-2 text-[10px] text-stone-400 uppercase tracking-[0.2em] font-black mb-3">
            <span>Artisan Management</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-600">Onboard Chef</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-stone-900 font-headline tracking-tight">
            New Artisan Profile
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="px-8 py-3.5 rounded-xl text-stone-500 font-bold text-xs uppercase border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase shadow-lg shadow-amber-600/10 flex items-center gap-2 disabled:opacity-60 transition-all active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {loading ? "Creating..." : "Save Artisan"}
          </button>
        </div>
      </header>

      {/* ── Global submission error banner ───────────────── */}
      {submitError && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">
              {submitError}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-12 text-stone-900">
        {/* ══ LEFT COLUMN ══════════════════════════════════════════ */}
        <div className="col-span-12 lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
          <section
            className={cn(
              "bg-white p-10 rounded-[2.5rem] border shadow-sm transition-colors",
              formErrors.name || formErrors.shortInfo
                ? "border-red-200"
                : "border-stone-200",
            )}
          >
            <div className="flex items-center gap-3 mb-10">
              <span className="w-10 h-[1px] bg-amber-500/50" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
                Identity & Credentials
              </h3>
            </div>

            <div className="space-y-8">
              {/* Full Name */}
              <div className="relative">
                <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-3">
                  <Type className="w-3 h-3 text-amber-500" /> Full Name{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-stone-50 border rounded-2xl p-5 outline-none text-stone-800 font-medium placeholder:text-stone-300 transition-all focus:border-amber-500/40 focus:bg-white focus:shadow-inner",
                    formErrors.name
                      ? "border-red-400 bg-red-50/30"
                      : "border-stone-200",
                  )}
                  placeholder="e.g. Master Chef Julian Valery"
                />
                <FieldError message={formErrors.name} />
              </div>

              {/* Verified Toggle */}
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 flex items-center justify-between group hover:border-amber-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-stone-100 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-800">
                      Verified Artisan
                    </h4>
                    <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">
                      Authenticity Badge on Profile
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="verified"
                    checked={formData.verified}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Short Info / Bio */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-3">
                  <FileText className="w-3 h-3 text-amber-500" /> Professional
                  Summary <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="shortInfo"
                  value={formData.shortInfo}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-stone-50 border rounded-2xl p-5 outline-none text-stone-800 font-medium leading-relaxed placeholder:text-stone-300 transition-all focus:border-amber-500/40 focus:bg-white focus:shadow-inner resize-none",
                    formErrors.shortInfo
                      ? "border-red-400 bg-red-50/30"
                      : "border-stone-200",
                  )}
                  placeholder="Tell us about the chef's culinary philosophy, awards, or signature techniques..."
                  rows={6}
                />
                <div className="flex items-start justify-between mt-1">
                  <FieldError message={formErrors.shortInfo} />
                  <span className="text-[9px] text-stone-300 font-bold ml-auto">
                    {formData.shortInfo.length} characters
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ══ RIGHT COLUMN ═════════════════════════════════════════ */}
        <div className="col-span-12 lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
          <section
            className={cn(
              "bg-white p-10 rounded-[2.5rem] border shadow-sm transition-colors",
              formErrors.image ? "border-red-200" : "border-stone-200",
            )}
          >
            <div className="flex items-center gap-3 mb-10">
              <span className="w-10 h-[1px] bg-amber-500/50" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
                Visual Branding
              </h3>
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-3">
                <User className="w-3 h-3 text-amber-500" /> Profile Portrait{" "}
                <span className="text-red-400">*</span>
              </label>
              <div
                className={cn(
                  "relative group aspect-[4/5] rounded-[2rem] overflow-hidden bg-stone-50 border-2 border-dashed transition-all",
                  formErrors.image
                    ? "border-red-400 bg-red-50/20"
                    : "border-stone-200 hover:border-amber-500/40",
                )}
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      src={imagePreview}
                      alt="Chef preview"
                    />
                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-white/90 p-4 rounded-2xl shadow-xl">
                        <Camera className="text-amber-600 w-8 h-8" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 gap-4">
                    <div className="w-20 h-20 rounded-full border-2 border-stone-100 bg-white flex items-center justify-center shadow-sm">
                      <Camera className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Upload Professional
                      </span>
                      <p className="text-[9px] font-bold text-stone-400 mt-1 uppercase">
                        Recommended: 800x1000px
                      </p>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
              <FieldError message={formErrors.image} />
            </div>
          </section>

          {/* Guidelines Card */}
          <div className="bg-amber-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-amber-900/20">
            <div className="flex items-center gap-3 mb-6 font-headline">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-bold">Artisan Standards</h3>
            </div>
            <ul className="space-y-4">
              {[
                "Portraits should have professional lighting.",
                "Biographies must reflect culinary expertise.",
                "Verification status is subject to audit.",
                "Ensure names are formatted correctly.",
              ].map((text, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-xs font-medium text-amber-100/80 leading-relaxed"
                >
                  <span className="text-amber-500 font-black">•</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
