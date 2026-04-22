"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChefService, Chef } from "@/lib/api/chef-service";
import { toast } from "@/lib/toast";
import {
  Camera,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  User,
  ShieldCheck,
  Type,
  FileText,
  Trash2,
  ArrowLeft,
  Calendar,
  Clock,
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

export default function EditChefPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    shortInfo: "",
    verified: false,
  });

  const [chefData, setChefData] = useState<Chef | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch Chef data
  useEffect(() => {
    const fetchChef = async () => {
      try {
        setFetching(true);
        const data = await ChefService.findOne(id);
        setChefData(data);
        setFormData({
          name: data.name,
          shortInfo: data.shortInfo || "",
          verified: data.verified === true || String(data.verified) === "true",
        });
        setImagePreview(data.image || null);
      } catch {
        toast.error("Failed to load artisan profile.");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchChef();
  }, [id]);

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
      if (imageFile) fd.append("image", imageFile);
      await ChefService.update(id, fd);
      toast.success("Chef profile updated successfully!");
      router.push("/admin/chefs");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update artisan profile.";
      setSubmitError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Archive this artisan? They will no longer be visible on the menu.",
      )
    )
      return;
    try {
      await ChefService.remove(id);
      toast.success("Chef archived.");
      router.push("/admin/chefs");
    } catch {
      toast.error("Failed to archive chef.");
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
          Loading Profile
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="w-14 h-14 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-amber-600 hover:border-amber-500/20 hover:bg-amber-50 transition-all group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <nav className="flex items-center gap-2 text-[10px] text-stone-400 uppercase tracking-[0.2em] font-black mb-3">
              <span>Artisan Registry</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-amber-600">Edit Artisan</span>
            </nav>
            <h1 className="text-3xl font-extrabold text-stone-900 font-headline tracking-tight">
              Modify {formData.name}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDelete}
            className="p-3.5 rounded-xl text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
            title="Archive Artisan"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <div className="w-px h-8 bg-stone-200 mx-2" />
          <button
            onClick={() => router.back()}
            className="px-8 py-3.5 rounded-xl text-stone-500 font-bold text-xs uppercase border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            Discard
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
            {loading ? "Saving Changes..." : "Update Artisan"}
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
                Core Profile
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
                      Status verification badge
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
                  placeholder="Tell us about the chef's culinary philosophy..."
                  rows={8}
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

          {/* Record Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-stone-50 border border-stone-100 p-6 rounded-3xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-stone-400 shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                  Added to Registry
                </p>
                <p className="text-xs font-bold text-stone-700">
                  {chefData
                    ? new Date(chefData.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "..."}
                </p>
              </div>
            </div>
            <div className="bg-stone-50 border border-stone-100 p-6 rounded-3xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-stone-400 shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                  Last Modified
                </p>
                <p className="text-xs font-bold text-stone-700">
                  {chefData
                    ? new Date(chefData.updatedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "..."}
                </p>
              </div>
            </div>
          </div>
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
                Artisan Portrait
              </h3>
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-3">
                <User className="w-3 h-3 text-amber-500" /> Current Image{" "}
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
                        Update Portrait
                      </span>
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
        </div>
      </div>
    </div>
  );
}
