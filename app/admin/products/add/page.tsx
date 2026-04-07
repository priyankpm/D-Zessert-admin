"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProductService } from "@/lib/api/product-service";
import {
  Camera,
  Trash2,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const PREDEFINED_MOODS = [
  "Serenity",
  "Indulgence",
  "Vitality",
  "Melancholy Cure",
  "Nostalgia",
  "Deep Focus",
];

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

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    oldPrice: "",
    description: "",
    calories: "",
    chefName: "",
    match: "",
    stock: "",
    experienceType: "",
    tags: [] as string[],
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const [galleryImageFiles, setGalleryImageFiles] = useState<(File | null)[]>([
    null,
    null,
    null,
  ]);

  // Clear individual field error on change
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      clearError("mainImage");
    }
  };

  const handleGalleryChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setGalleryImageFiles((prev) => {
        const next = [...prev];
        next[index] = file;
        if (
          next.filter((f) => f !== null).length === next.length &&
          next.length < 5
        )
          next.push(null);
        return next;
      });
      const url = URL.createObjectURL(file);
      setGalleryPreviews((prev) => {
        const next = [...prev];
        next[index] = url;
        if (
          next.filter((p) => p !== null).length === next.length &&
          next.length < 5
        )
          next.push(null);
        return next;
      });
      clearError("gallery");
    }
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
    clearError("tags");
  };

  // ── Validation ───────────────────────────────────────────────────
  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Please enter a name for the confection.";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters long.";
    }

    if (!formData.chefName) {
      errors.chefName = "Please select the artisan chef responsible.";
    }

    if (!formData.experienceType) {
      errors.experienceType =
        "Please select an experience type for this product.";
    }

    if (!formData.description.trim()) {
      errors.description =
        "Please describe the sensory profile of this confection.";
    } else if (formData.description.trim().length < 20) {
      errors.description = "Description should be at least 20 characters.";
    }

    if (!formData.price) {
      errors.price = "Price is required.";
    } else if (
      isNaN(parseFloat(formData.price)) ||
      parseFloat(formData.price) <= 0
    ) {
      errors.price = "Please enter a valid price greater than $0.";
    }

    if (
      formData.oldPrice &&
      parseFloat(formData.oldPrice) <= parseFloat(formData.price)
    ) {
      errors.oldPrice = "Compare price must be higher than the base price.";
    }

    if (!formData.stock) {
      errors.stock = "Stock quantity is required.";
    } else if (parseInt(formData.stock) < 0) {
      errors.stock = "Stock cannot be a negative number.";
    }

    if (!formData.calories) {
      errors.calories = "Caloric value is required.";
    } else if (parseInt(formData.calories) < 0) {
      errors.calories = "Calories cannot be a negative number.";
    }

    if (
      formData.match &&
      (parseInt(formData.match) < 0 || parseInt(formData.match) > 100)
    ) {
      errors.match = "Match percentage must be between 0 and 100.";
    }

    if (formData.tags.length === 0) {
      errors.tags =
        "Select at least one emotional tone / mood for this confection.";
    }

    if (!imagePreview) {
      errors.mainImage = "A hero image is required to publish this product.";
    }

    const filledGallery = galleryPreviews.filter((p) => p !== null).length;
    if (filledGallery < 2) {
      errors.gallery =
        "Please upload at least 2 gallery images to showcase angles.";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitError("Please fix the errors below before publishing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let mainImageUrl = imagePreview || "";
      if (mainImageFile)
        mainImageUrl = await ProductService.uploadFile(mainImageFile);

      let galleryUrls: string[] = [];
      const validFiles = galleryImageFiles.filter((f): f is File => f !== null);
      if (validFiles.length > 0)
        galleryUrls = await ProductService.uploadGallery(validFiles);

      await ProductService.create({
        name: formData.name,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
        description: formData.description,
        calories: parseInt(formData.calories) || 0,
        stock: parseInt(formData.stock) || 0,
        match: parseInt(formData.match) || 95,
        chefName: formData.chefName,
        tags: formData.tags,
        experienceType: formData.experienceType,
        imageUrl: mainImageUrl,
        gallery: galleryUrls,
        preferredMood: formData.tags[0] || "",
        rating: 4.5,
        reviews: 0,
      });

      router.push("/admin/products");
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <nav className="flex items-center gap-2 text-[10px] text-stone-400 uppercase tracking-[0.2em] font-black mb-3">
            <span>Menu Management</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-600">Create Product</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-stone-900 font-headline">
            New Confection
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
            {loading ? "Publishing..." : "Publish Product"}
          </button>
        </div>
      </header>

      {/* ── Global submission error banner ───────────────── */}
      {submitError && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">
              {submitError}
            </p>
            <p className="text-[10px] text-red-400 mt-0.5">
              Scroll down to see all highlighted fields.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-12 text-stone-900">
        {/* ══ LEFT COLUMN ══════════════════════════════════════════ */}
        <div className="col-span-12 lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
          {/* General Information */}
          <section
            className={cn(
              "bg-white p-8 rounded-[2rem] border shadow-sm transition-colors",
              formErrors.name ||
                formErrors.chefName ||
                formErrors.experienceType ||
                formErrors.description
                ? "border-red-200"
                : "border-stone-200",
            )}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-[1px] bg-amber-500/50" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                General Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {/* Name */}
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
                  Confection Name <span className="text-red-400">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-stone-50 border rounded-xl p-4 outline-none text-stone-800 font-medium placeholder:text-stone-300 transition-colors focus:border-amber-500/40",
                    formErrors.name
                      ? "border-red-400 bg-red-50/30"
                      : "border-stone-200",
                  )}
                  placeholder="e.g. Lavender Infused Honey Meringue"
                />
                <FieldError message={formErrors.name} />
              </div>

              {/* Chef */}
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
                  Artisan Chef <span className="text-red-400">*</span>
                </label>
                <select
                  name="chefName"
                  value={formData.chefName}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-stone-50 border rounded-xl p-4 outline-none text-stone-800 transition-colors focus:border-amber-500/40 appearance-none cursor-pointer",
                    formErrors.chefName
                      ? "border-red-400 bg-red-50/30"
                      : "border-stone-200",
                  )}
                >
                  <option value="">— Select Chef —</option>
                  <option>Executive Chef Liz</option>
                  <option>Chef Marc-Antoine</option>
                  <option>Chef Sofia Rossi</option>
                </select>
                <FieldError message={formErrors.chefName} />
              </div>

              {/* Experience Type */}
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
                  Experience Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="experienceType"
                  value={formData.experienceType}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-stone-50 border rounded-xl p-4 outline-none text-stone-800 transition-colors focus:border-amber-500/40 appearance-none cursor-pointer",
                    formErrors.experienceType
                      ? "border-red-400 bg-red-50/30"
                      : "border-stone-200",
                  )}
                >
                  <option value="">— Select Type —</option>
                  <option>In-Studio Ritual</option>
                  <option>Gifting Collection</option>
                  <option>Seasonal Flight</option>
                </select>
                <FieldError message={formErrors.experienceType} />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
                  Sensory Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-stone-50 border rounded-xl p-4 outline-none text-stone-800 font-medium leading-relaxed placeholder:text-stone-300 transition-colors focus:border-amber-500/40 resize-none",
                    formErrors.description
                      ? "border-red-400 bg-red-50/30"
                      : "border-stone-200",
                  )}
                  placeholder="Describe the texture, aromatic notes, and emotional journey…"
                  rows={5}
                />
                <div className="flex items-start justify-between mt-1">
                  <FieldError message={formErrors.description} />
                  <span className="text-[9px] text-stone-300 font-bold ml-auto">
                    {formData.description.length} chars
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing & Inventory */}
          <section
            className={cn(
              "bg-white p-8 rounded-[2rem] border shadow-sm transition-colors",
              formErrors.price ||
                formErrors.oldPrice ||
                formErrors.stock ||
                formErrors.calories ||
                formErrors.match
                ? "border-red-200"
                : "border-stone-200",
            )}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-[1px] bg-amber-500/50" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                Pricing & Inventory
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Base Price */}
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
                  Base Price ($) <span className="text-red-400">*</span>
                </label>
                <input
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-stone-50 border rounded-xl p-4 outline-none text-stone-800 transition-colors focus:border-amber-500/40",
                    formErrors.price
                      ? "border-red-400 bg-red-50/30"
                      : "border-stone-200",
                  )}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                />
                <FieldError message={formErrors.price} />
              </div>

              {/* Compare Price */}
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
                  Compare At ($)
                </label>
                <input
                  name="oldPrice"
                  value={formData.oldPrice}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-stone-50 border rounded-xl p-4 outline-none text-stone-800 transition-colors focus:border-amber-500/40",
                    formErrors.oldPrice
                      ? "border-red-400 bg-red-50/30"
                      : "border-stone-200",
                  )}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                />
                <FieldError message={formErrors.oldPrice} />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
                  Stock Count <span className="text-red-400">*</span>
                </label>
                <input
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-stone-50 border rounded-xl p-4 outline-none text-stone-800 transition-colors focus:border-amber-500/40",
                    formErrors.stock
                      ? "border-red-400 bg-red-50/30"
                      : "border-stone-200",
                  )}
                  placeholder="0"
                  type="number"
                  min="0"
                />
                <FieldError message={formErrors.stock} />
              </div>

              {/* Calories */}
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
                  Calories (Kcal) <span className="text-red-400">*</span>
                </label>
                <input
                  name="calories"
                  value={formData.calories}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-stone-50 border rounded-xl p-4 outline-none text-stone-800 transition-colors focus:border-amber-500/40",
                    formErrors.calories
                      ? "border-red-400 bg-red-50/30"
                      : "border-stone-200",
                  )}
                  placeholder="0"
                  type="number"
                  min="0"
                />
                <FieldError message={formErrors.calories} />
              </div>

              {/* Match % */}
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
                  Mood Match %{" "}
                  <span className="text-stone-300 font-normal">(optional)</span>
                </label>
                <input
                  name="match"
                  value={formData.match}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-stone-50 border rounded-xl p-4 outline-none text-stone-800 transition-colors focus:border-amber-500/40",
                    formErrors.match
                      ? "border-red-400 bg-red-50/30"
                      : "border-stone-200",
                  )}
                  placeholder="95"
                  type="number"
                  min="0"
                  max="100"
                />
                <FieldError message={formErrors.match} />
              </div>
            </div>
          </section>
        </div>

        {/* ══ RIGHT COLUMN ═════════════════════════════════════════ */}
        <div className="col-span-12 lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
          {/* Imagery */}
          <section
            className={cn(
              "bg-white p-8 rounded-[2rem] border shadow-sm transition-colors",
              formErrors.mainImage || formErrors.gallery
                ? "border-red-200"
                : "border-stone-200",
            )}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-[1px] bg-amber-500/50" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                Imagery
              </h3>
            </div>
            <div className="space-y-6">
              {/* Hero Image */}
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
                  Hero Image <span className="text-red-400">*</span>
                </label>
                <div
                  className={cn(
                    "relative group aspect-video rounded-xl overflow-hidden bg-stone-50 border transition-colors",
                    formErrors.mainImage
                      ? "border-red-400 ring-1 ring-red-200"
                      : "border-stone-200 hover:border-amber-400/40",
                  )}
                >
                  {imagePreview ? (
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      src={imagePreview}
                      alt="Hero preview"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 gap-3">
                      <Camera className="w-10 h-10 stroke-[1.5]" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Click to upload hero image
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleMainImageChange}
                    accept="image/*"
                  />
                </div>
                <FieldError message={formErrors.mainImage} />
              </div>

              {/* Gallery Grid */}
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
                  Gallery Images <span className="text-red-400">*</span>{" "}
                  <span className="text-stone-300 font-normal normal-case">
                    (min 2)
                  </span>
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {galleryPreviews.map((preview, i) => (
                    <div
                      key={i}
                      className={cn(
                        "aspect-square rounded-xl bg-stone-50 border overflow-hidden relative group",
                        formErrors.gallery && !preview
                          ? "border-red-300"
                          : "border-stone-200",
                      )}
                    >
                      {preview ? (
                        <>
                          <img
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            src={preview}
                            alt={`Gallery ${i + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setGalleryPreviews((prev) => {
                                const next = prev.filter((_, idx) => idx !== i);
                                while (next.length < 3) next.push(null);
                                return next;
                              });
                              setGalleryImageFiles((prev) => {
                                const next = prev.filter((_, idx) => idx !== i);
                                while (next.length < 3) next.push(null);
                                return next;
                              });
                            }}
                            className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-200 gap-1">
                          <ImageIcon className="w-5 h-5" />
                          <span className="text-[7px] font-black uppercase text-stone-300">
                            {i + 1}
                          </span>
                          <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleGalleryChange(i, e)}
                            accept="image/*"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <FieldError message={formErrors.gallery} />
              </div>
            </div>
          </section>

          {/* Emotional Tones */}
          <section
            className={cn(
              "bg-white p-8 rounded-[2rem] border shadow-sm transition-colors",
              formErrors.tags ? "border-red-200" : "border-stone-200",
            )}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-[1px] bg-amber-500/50" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                Emotional Tones <span className="text-red-400">*</span>
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {PREDEFINED_MOODS.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => toggleTag(mood)}
                  className={cn(
                    "px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95",
                    formData.tags.includes(mood)
                      ? "border-amber-500 bg-amber-50 text-amber-600 shadow-sm"
                      : "border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600",
                  )}
                >
                  {mood}
                </button>
              ))}
            </div>
            {formData.tags.length > 0 && (
              <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest mt-3 ml-1">
                {formData.tags.length} mood{formData.tags.length > 1 ? "s" : ""}{" "}
                selected
              </p>
            )}
            <FieldError message={formErrors.tags} />
          </section>
        </div>
      </div>
    </div>
  );
}
