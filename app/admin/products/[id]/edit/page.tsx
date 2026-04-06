"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductService } from "@/lib/api/product-service";

const PREDEFINED_MOODS = [
  "Romantic",
  "Energetic",
  "Zen",
  "Festive",
  "Nostalgic",
  "Productive",
  "Adventurous",
];

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showMoods, setShowMoods] = useState(false);
  const [isCustomMood, setIsCustomMood] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    oldPrice: "",
    description: "",
    calories: "420",
    chefName: "Chef Julianne Moretti",
    match: "95",
    stock: "24",
    experienceType: "Calm",
    tags: [] as string[],
    currentTag: "",
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setIsFetching(true);
        const product = await ProductService.findOne(id as string);
        if (product) {
          setFormData({
            name: product.name || "",
            price: product.price?.toString() || "",
            oldPrice: product.oldPrice?.toString() || "",
            description: product.description || "",
            calories: product.calories?.toString() || "420",
            chefName: product.chefName || "Chef Julianne Moretti",
            match: product.match?.toString() || "95",
            stock: product.stock?.toString() || "24",
            experienceType: product.experienceType || "Calm",
            tags: product.tags || [],
            currentTag: "",
          });
          setImagePreview(product.imageUrl || null);
          if (product.gallery && product.gallery.length > 0) {
            const dims = [...product.gallery, null, null, null].slice(0, 3);
            setGalleryPreviews(dims);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleGalleryChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setGalleryImageFiles((prev) => {
        const next = [...prev];
        next[index] = file;
        return next;
      });
      const url = URL.createObjectURL(file);
      setGalleryPreviews((prev) => {
        const next = [...prev];
        next[index] = url;
        return next;
      });
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddField = (field: "tags", value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
        currentTag: "",
      }));
    }
  };

  const removeField = (field: "tags", valueToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((v) => v !== valueToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.name.trim()) {
      setError("Product Name is required.");
      setLoading(false);
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid price.");
      setLoading(false);
      return;
    }

    try {
      // 1. Upload Main Image if new file exists
      let mainImageUrl = imagePreview || "";
      if (mainImageFile) {
        mainImageUrl = await ProductService.uploadFile(mainImageFile);
      }

      // 2. Upload Gallery Images
      let galleryUrls: string[] = [];
      // Keep existing ones that aren't replaced
      galleryPreviews.forEach((url, i) => {
        if (url && !galleryImageFiles[i]) galleryUrls.push(url);
      });

      const newFiles = galleryImageFiles.filter((f): f is File => f !== null);
      if (newFiles.length > 0) {
        const uploaded = await ProductService.uploadGallery(newFiles);
        galleryUrls = [...galleryUrls, ...uploaded];
      }

      // Derive preferredMood from tags
      const preferredMood =
        formData.tags.find((t) => PREDEFINED_MOODS.includes(t)) ||
        formData.tags[0];

      const updateData = {
        name: formData.name,
        price: priceNum,
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
        description: formData.description,
        calories: parseInt(formData.calories) || 0,
        match: parseInt(formData.match) || 95,
        chefName: formData.chefName,
        tags: formData.tags,
        stock: parseInt(formData.stock) || 0,
        experienceType: formData.experienceType,
        imageUrl: mainImageUrl,
        gallery: galleryUrls.slice(0, 3), // Limit to 3 for now
        preferredMood,
      };

      await ProductService.update(id as string, updateData);
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Failed to update product:", error);
      setError(error.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-body pb-20">
      {/* Page Header */}
      <div className="py-12 flex items-end justify-between">
        <div className="max-w-2xl">
          <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant mb-3 uppercase tracking-widest">
            <Link
              href="/admin/products"
              className="hover:text-primary transition-colors"
            >
              Products
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-secondary">{formData.name}</span>
          </nav>
          <p className="mt-3 text-on-surface-variant font-body leading-relaxed max-w-lg">
            Updating "{formData.name}". Adjust the ingredients, pricing, or
            narrative to reflect its current artisanal soul.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl text-primary font-bold label-md border border-outline-variant/30 hover:bg-white transition-all active:scale-95"
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-xl satin-gradient text-white font-bold label-md shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 uppercase tracking-widest flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : null}
            SAVE REVISIONS
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-12 gap-8 items-start"
      >
        {error && (
          <div className="col-span-12 p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-sm font-bold uppercase tracking-wide">{error}</p>
          </div>
        )}
        {/* Left Column: Primary Details */}
        <div className="col-span-8 flex flex-col gap-8">
          {/* Main Identity Card */}
          <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_10px_30px_rgba(43,22,19,0.02)]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Product Essentials
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  Product Name
                </label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all text-lg font-medium"
                  placeholder="e.g. Midnight Lavender Ganache Tart"
                  type="text"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  Lead Chef
                </label>
                <div className="relative">
                  <select
                    name="chefName"
                    value={formData.chefName}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                  >
                    <option>Chef Julianne Moretti</option>
                    <option>Chef Marc-Antoine</option>
                    <option>Chef Elena Rossi</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    unfold_more
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  Artisanal Stock
                </label>
                <input
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="24"
                  type="number"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  The Narrative (Description)
                </label>
                <textarea
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  placeholder="Describe the flavor journey, the textures, and the secret behind the creation..."
                  rows={4}
                ></textarea>
              </div>
            </div>
          </section>

          {/* Pricing & Nutrition Bento Row */}
          <div className="grid grid-cols-2 gap-8">
            {/* Pricing Card */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_10px_30px_rgba(43,22,19,0.02)]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                Commercial Value
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                    Base Price (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">
                      $
                    </span>
                    <input
                      required
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border-none rounded-lg pl-8 py-4 text-on-surface font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="0.00"
                      type="text"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                    Compare Price (Discounted)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant/40">
                      $
                    </span>
                    <input
                      name="oldPrice"
                      value={formData.oldPrice}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border-none rounded-lg pl-8 py-4 text-on-surface/40 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="0.00"
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Nutrition Card */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_10px_30px_rgba(43,22,19,0.02)]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                Nutritional Balance
              </h3>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      Energy Density (kcal)
                    </label>
                    <span className="text-primary font-bold">
                      {formData.calories}{" "}
                      <small className="text-xs font-normal">kcal</small>
                    </span>
                  </div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(parseInt(formData.calories) / 10, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    name="calories"
                    value={formData.calories}
                    onChange={handleInputChange}
                    className="w-full h-1 mt-4 accent-primary"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Column: Curated Attributes */}
        <div className="col-span-4 flex flex-col gap-8">
          {/* Mood & Type Card */}
          <section className="bg-surface-container-low rounded-xl p-8 border-2 border-dashed border-outline-variant/30 relative">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-primary/5 blur-3xl"></div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">
                temp_preferences_custom
              </span>
              Experience Curating
            </h3>
            <div className="space-y-8 relative z-10">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">
                  Flavor Experience Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      id: "Calm",
                      icon: "spa",
                      desc: "Smooth, floral, low-sugar",
                      color: "bg-tertiary-fixed text-on-tertiary-fixed",
                    },
                    {
                      id: "Light",
                      icon: "air",
                      desc: "Crisp, citrus, airy texture",
                      color: "bg-secondary-fixed text-on-secondary-fixed",
                    },
                    {
                      id: "Comfort",
                      icon: "volcano",
                      desc: "Rich, warm, heavy ganache",
                      color: "bg-primary-fixed text-on-primary-fixed",
                    },
                  ].map((type) => (
                    <label
                      key={type.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl bg-white cursor-pointer border-2 transition-all group",
                        formData.experienceType === type.id
                          ? "border-primary bg-primary-fixed/30"
                          : "border-transparent hover:border-primary/20",
                      )}
                    >
                      <input
                        type="radio"
                        name="experienceType"
                        value={type.id}
                        checked={formData.experienceType === type.id}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform",
                          type.color,
                        )}
                      >
                        <span className="material-symbols-outlined">
                          {type.icon}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">
                          {type.id}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">
                          {type.desc}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="relative">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[14px]">
                    psychology
                  </span>
                  Mood Match
                </label>
                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-outline-variant/10 shadow-inner group-focus-within:border-primary/20 transition-all transition-all">
                  <div className="flex flex-wrap gap-2.5 mb-5 min-h-[32px]">
                    {formData.tags.length > 0 ? (
                      formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-4 py-1.5 bg-[#fcf9f4] border border-primary/10 text-primary text-[11px] font-bold rounded-xl flex items-center gap-2 uppercase tracking-wide shadow-sm animate-in fade-in zoom-in duration-300"
                        >
                          {tag}{" "}
                          <button
                            type="button"
                            onClick={() => removeField("tags", tag)}
                            className="material-symbols-outlined text-[14px] hover:text-[#E91E63] transition-colors"
                          >
                            close
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-on-surface-variant/40 italic">
                        No moods selected yet...
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      autoComplete="off"
                      className="w-full text-sm border-none focus:ring-0 p-0 text-on-surface placeholder:text-on-surface-variant/30 outline-none bg-transparent font-semibold"
                      placeholder={
                        isCustomMood
                          ? "Describe the custom mood..."
                          : "Select palettes or start typing..."
                      }
                      type="text"
                      name="currentTag"
                      value={formData.currentTag}
                      onChange={(e) => {
                        handleInputChange(e);
                        setShowMoods(true);
                      }}
                      onFocus={() => {
                        setShowMoods(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (formData.currentTag.trim()) {
                            handleAddField("tags", formData.currentTag);
                            setIsCustomMood(false);
                          }
                        }
                      }}
                    />

                    {/* Realistic Mood Dropdown - Always accessible */}
                    {showMoods && (
                      <div className="absolute left-0 top-full mt-3 w-full bg-white rounded-2xl shadow-premium border border-outline-variant/10 z-50 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="px-5 py-2 flex items-center justify-between border-b border-outline-variant/5 mb-2">
                          <p className="text-[10px] uppercase font-bold text-on-surface-variant/40 tracking-[0.2em]">
                            {isCustomMood
                              ? "Custom Entry Mode"
                              : "Select Palette"}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (isCustomMood) {
                                setIsCustomMood(false);
                                setFormData((p) => ({ ...p, currentTag: "" }));
                              } else {
                                setFormData((p) => ({ ...p, currentTag: "" }));
                              }
                            }}
                            className="text-[10px] text-primary font-bold hover:underline"
                          >
                            {isCustomMood ? "Back to List" : "Clear"}
                          </button>
                        </div>

                        {!isCustomMood ? (
                          <div className="max-h-56 overflow-y-auto custom-scrollbar">
                            {PREDEFINED_MOODS.filter(
                              (m) => !formData.tags.includes(m),
                            )
                              .filter((m) =>
                                m
                                  .toLowerCase()
                                  .includes(formData.currentTag.toLowerCase()),
                              )
                              .map((mood) => (
                                <button
                                  key={mood}
                                  type="button"
                                  onClick={() => {
                                    handleAddField("tags", mood);
                                    setShowMoods(false);
                                    setIsCustomMood(false);
                                  }}
                                  className="w-full text-left px-5 py-3 text-[13px] hover:bg-primary/5 transition-all font-semibold text-on-surface flex items-center justify-between group/item"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full border-2 border-primary/20 group-hover/item:border-primary/60 transition-all"></span>
                                    {mood}
                                  </div>
                                  <span className="material-symbols-outlined opacity-0 group-hover/item:opacity-100 text-primary text-sm transition-all">
                                    add_circle
                                  </span>
                                </button>
                              ))}

                            {PREDEFINED_MOODS.filter(
                              (m) =>
                                !formData.tags.includes(m) &&
                                m
                                  .toLowerCase()
                                  .includes(formData.currentTag.toLowerCase()),
                            ).length === 0 && (
                              <div className="px-5 py-4 text-center">
                                <p className="text-[11px] text-on-surface-variant italic mb-2">
                                  No matching palette found
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsCustomMood(true);
                                  }}
                                  className="text-xs font-bold text-primary px-4 py-2 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all"
                                >
                                  DESCRIBE CUSTOM MOOD
                                </button>
                              </div>
                            )}

                            <div className="mt-2 px-3 pt-2 border-t border-outline-variant/10">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustomMood(true);
                                  // Auto focus for immediate typing
                                  const inputs =
                                    document.getElementsByName("currentTag");
                                  const input = inputs[inputs.length - 1]; // Pick the last one which is usually the tag input
                                  if (input) input.focus();
                                }}
                                className="w-full text-left px-4 py-3 text-[12px] bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-xl transition-all font-bold uppercase tracking-wider flex items-center justify-between shadow-sm group/custom"
                              >
                                Other / Custom
                                <span className="material-symbols-outlined text-[16px] group-hover/custom:rotate-12 transition-transform">
                                  edit_note
                                </span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="px-5 py-6 text-center animate-in fade-in zoom-in duration-300">
                            <span className="material-symbols-outlined text-primary text-3xl mb-3">
                              edit_note
                            </span>
                            <p className="text-[13px] font-semibold text-on-surface mb-1">
                              Editing Custom Mood
                            </p>
                            <p className="text-[11px] text-on-surface-variant/70 mb-4 px-4 leading-relaxed">
                              Type your creation's mood above and press{" "}
                              <span className="font-bold text-primary italic">
                                Enter
                              </span>{" "}
                              to add it to the palette.
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsCustomMood(false)}
                              className="px-6 py-2 border border-primary text-primary hover:bg-primary/5 text-[11px] font-bold rounded-full transition-all uppercase tracking-widest"
                            >
                              Back to Selection
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Backdrop */}
                    {showMoods && (
                      <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setShowMoods(false)}
                      ></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Media Upload */}
          <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_10px_30px_rgba(43,22,19,0.02)]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">
                camera
              </span>
              Visual Presentation
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 aspect-[16/9] rounded-xl bg-surface-container-low border-2 border-dashed border-outline-variant/40 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-surface-container transition-all relative overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-on-surface-variant group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">
                        add_a_photo
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-on-surface uppercase tracking-wider">
                        Upload Main Image
                      </p>
                      <p className="text-[9px] text-on-surface-variant mt-0.5 opacity-70">
                        Hero shot for the gallery
                      </p>
                    </div>
                  </>
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleMainImageChange}
                />
              </div>
              {galleryPreviews.map((preview, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-surface-container-low border-2 border-dashed border-outline-variant/40 flex flex-col items-center justify-center gap-1 group cursor-pointer hover:bg-surface-container transition-all relative overflow-hidden"
                >
                  {preview ? (
                    <img
                      src={preview}
                      className="w-full h-full object-cover"
                      alt={`Gallery ${i}`}
                    />
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-on-surface-variant group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-xl">
                          add
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-on-surface-variant/80">
                        {i === 0 ? "Angle 1" : i === 1 ? "Angle 2" : "Detail"}
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleGalleryChange(i, e)}
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-on-surface-variant/60 mt-4 text-center italic">
              Accepted formats: PNG, JPG (Max 10MB per image)
            </p>
          </section>
        </div>
      </form>
    </div>
  );
}
