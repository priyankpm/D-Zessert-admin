"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ProductService,
  Product,
  ProductRecommendation,
} from "@/lib/api/product-service";
import {
  Camera,
  Trash2,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
  Plus,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { IngredientService, Ingredient } from "@/lib/api/ingredient-service";
import { ToppingService, Topping } from "@/lib/api/topping-service";
import { ChefService, Chef } from "@/lib/api/chef-service";
import { IngredientSelectDropdown } from "@/components/admin/IngredientSelectDropdown";
import { ProductRecommendationDropdown } from "@/components/admin/ProductRecommendationDropdown";
import { ToppingSelectDropdown } from "@/components/admin/ToppingSelectDropdown";
import { MultiSelectDropdown } from "@/components/admin/MultiSelectDropdown";
import { VibeService, Vibe } from "@/lib/api/vibe-service";
import { VibeSelectDropdown } from "@/components/admin/VibeSelectDropdown";
import { toast } from "@/lib/toast";

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

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discountedPrice: "",
    description: "",
    calories: "",
    chefId: "",
    stock: "",
    moodType: [] as string[],
    ingredients: [] as string[],
    toppings: [] as string[],
    vibes: [] as string[],
    recommendationIds: [] as string[],
  });

  const [availableIngredients, setAvailableIngredients] = useState<
    Ingredient[]
  >([]);
  const [availableToppings, setAvailableToppings] = useState<Topping[]>([]);
  const [availableVibes, setAvailableVibes] = useState<Vibe[]>([]);
  const [availableChefs, setAvailableChefs] = useState<Chef[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  const fetchResources = useCallback(async () => {
    try {
      const [ings, tops, vibes, chefs, prods] = await Promise.all([
        IngredientService.findAll(),
        ToppingService.findAll(),
        VibeService.findAll(),
        ChefService.findAll(),
        ProductService.findAll(),
      ]);
      setAvailableIngredients(ings);
      setAvailableToppings(tops);
      setAvailableVibes(vibes);
      setAvailableChefs(chefs);
      setAvailableProducts(prods);
    } catch {
      toast.error("Failed to load resources. Please refresh.");
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

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
            discountedPrice: product.discountedPrice?.toString() || "",
            description: product.description || "",
            calories: product.calories?.toString() || "",
            chefId: product.chefId || "",
            stock: product.stock?.toString() || "",
            moodType: product.moodType || [],
            ingredients:
              product.ingredients
                ?.map((i: Ingredient) => i?.name)
                .filter(Boolean) || [],
            toppings:
              product.toppings?.map((t: Topping) => t?.name).filter(Boolean) ||
              [],
            vibes:
              product.vibes
                ?.map((v: any) => v.name || v.vibe?.name)
                .filter(Boolean) || [],
            recommendationIds:
              product.recommendations?.map(
                (r: ProductRecommendation) => r.recommendedId,
              ) || [],
          });
          setImagePreview(product.imageUrl || null);
          if (product.gallery) {
            const dims = [...product.gallery] as (string | null)[];
            if (
              dims.length < 5 &&
              dims.length > 0 &&
              dims[dims.length - 1] !== null
            ) {
              dims.push(null);
            }
            while (dims.length < 3) dims.push(null);
            setGalleryPreviews(dims);
            setGalleryImageFiles(new Array(dims.length).fill(null));
          }
        }
      } catch (err: unknown) {
        let message = "Failed to load product. Redirecting back.";
        if (err instanceof Error) message = err.message;
        toast.error(message);
        router.back();
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

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

  // ── Validation ───────────────────────────────────────────────────
  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Please enter a name for the confection.";
    }

    if (!formData.chefId) {
      errors.chefId = "Please select the artisan chef responsible.";
    }

    if (!formData.description.trim()) {
      errors.description = "Please describe the sensory profile.";
    }

    if (!formData.price) {
      errors.price = "Price is required.";
    }

    if (!formData.stock) {
      errors.stock = "Stock quantity is required.";
    }

    if (!formData.calories) {
      errors.calories = "Caloric value is required.";
    }

    if (!imagePreview) {
      errors.mainImage = "A hero image is required.";
    }

    const filledGallery = galleryPreviews.filter((p) => p !== null).length;
    if (filledGallery < 2) {
      errors.gallery =
        "Please upload at least 2 gallery images to showcase angles.";
    }

    if (formData.ingredients.length === 0) {
      errors.ingredients = "Please select or add at least one ingredient.";
    }

    if (formData.moodType.length === 0) {
      errors.moodType = "Please select at least one mood for the product.";
    }

    if (formData.vibes.length === 0) {
      errors.vibes = "Please select at least one vibe for the product.";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitError(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitError("Please fix the errors below before saving.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let mainImageUrl = imagePreview || "";
      if (mainImageFile)
        mainImageUrl = await ProductService.uploadFile(mainImageFile);

      let galleryUrls: string[] = [];
      galleryPreviews.forEach((url, i) => {
        if (url && !galleryImageFiles[i]) galleryUrls.push(url);
      });

      const newFiles = galleryImageFiles.filter((f): f is File => f !== null);
      if (newFiles.length > 0) {
        const uploaded = await ProductService.uploadGallery(newFiles);
        galleryUrls = [...galleryUrls, ...uploaded];
      }

      const ingredientIds = formData.ingredients
        .map((name) => availableIngredients.find((i) => i.name === name)?.id)
        .filter((id): id is string => id !== undefined);

      const toppingIds = formData.toppings
        .map((name) => availableToppings.find((t) => t.name === name)?.id)
        .filter((id): id is string => id !== undefined);

      const vibeIds = formData.vibes
        .map((name) => availableVibes.find((v) => v.name === name)?.id)
        .filter((id): id is string => id !== undefined);

      await ProductService.update(id as string, {
        name: formData.name,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice
          ? parseFloat(formData.discountedPrice)
          : undefined,
        description: formData.description,
        calories: parseInt(formData.calories) || 0,
        stock: parseInt(formData.stock) || 0,
        moodType: formData.moodType,
        chefId: formData.chefId,
        ingredientIds,
        toppingIds,
        vibeIds,
        recommendations: formData.recommendationIds.map((id) => ({
          recommendedId: id,
        })),
        imageUrl: mainImageUrl,
        gallery: galleryUrls.slice(0, 5),
      });

      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setSubmitError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  if (isFetching)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen pb-20">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <nav className="flex items-center gap-2 text-[10px] text-stone-400 uppercase tracking-[0.2em] font-black mb-3">
            <span>Menu Management</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-600">Edit Product</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-stone-900 font-headline">
            {formData.name || "Edit Masterpiece"}
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
            {loading ? "Saving..." : "Save Changes"}
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
              formErrors.name || formErrors.chefId || formErrors.description
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
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
                  Artisan Chef <span className="text-red-400">*</span>
                </label>
                <select
                  name="chefId"
                  value={formData.chefId}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-stone-50 border rounded-xl p-4 outline-none text-stone-800 transition-colors focus:border-amber-500/40 appearance-none cursor-pointer font-bold uppercase text-[11px] tracking-wider",
                    formErrors.chefId
                      ? "border-red-400 bg-red-50/30"
                      : "border-stone-200",
                  )}
                >
                  <option value="">— Select Chef —</option>
                  {availableChefs.map((chef) => (
                    <option key={chef.id} value={chef.id}>
                      {chef.name}
                    </option>
                  ))}
                </select>
                <FieldError message={formErrors.chefId} />
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
                formErrors.discountedPrice ||
                formErrors.stock ||
                formErrors.calories
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

              {/* Discounted Price */}
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2">
                  Compare Price ($)
                </label>
                <input
                  name="discountedPrice"
                  value={formData.discountedPrice}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full bg-stone-50 border rounded-xl p-4 outline-none text-stone-800 transition-colors focus:border-amber-500/40",
                    formErrors.discountedPrice
                      ? "border-red-400 bg-red-50/30"
                      : "border-stone-200",
                  )}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                />
                <FieldError message={formErrors.discountedPrice} />
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
            </div>
          </section>
          <section className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-[1px] bg-amber-500/50" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                Upsell & Recommendations
              </h3>
            </div>
            <div className="space-y-6">
              <ProductRecommendationDropdown
                label="Recommended Masterpieces"
                allProducts={availableProducts}
                selectedIds={formData.recommendationIds}
                onChange={(ids) =>
                  setFormData((prev) => ({ ...prev, recommendationIds: ids }))
                }
              />
            </div>
          </section>
        </div>
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

          <section className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-[1px] bg-amber-500/50" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                Resource Management
              </h3>
            </div>
            <div className="space-y-6">
              <MultiSelectDropdown
                label="Mood Type"
                required
                options={[
                  "Happy",
                  "Sad",
                  "Calm",
                  "Romantic",
                  "Stressed",
                  "Angry",
                ]}
                selectedValues={formData.moodType}
                onChange={(vals) =>
                  setFormData((prev) => ({ ...prev, moodType: vals }))
                }
                error={formErrors.moodType}
              />

              <IngredientSelectDropdown
                label="Ingredients"
                allIngredients={availableIngredients}
                selectedNames={formData.ingredients}
                onChange={(vals: string[]) =>
                  setFormData((prev) => ({ ...prev, ingredients: vals }))
                }
                error={formErrors.ingredients}
                onAdd={async (name: string) => {
                  try {
                    await IngredientService.create({ name });
                    await fetchResources();
                    toast.success("Ingredient added.");
                  } catch {
                    toast.error("Failed to add ingredient.");
                  }
                }}
                onEdit={async (oldName: string, newName: string) => {
                  try {
                    const item = availableIngredients.find(
                      (i) => i.name === oldName,
                    );
                    if (item)
                      await IngredientService.update(item.id, {
                        name: newName,
                      });
                    await fetchResources();
                    toast.success("Ingredient updated.");
                  } catch {
                    toast.error("Failed to update ingredient.");
                  }
                }}
                onDelete={async (name: string) => {
                  try {
                    const item = availableIngredients.find(
                      (i) => i.name === name,
                    );
                    if (item) await IngredientService.remove(item.id);
                    await fetchResources();
                    toast.success("Ingredient deleted.");
                  } catch {
                    toast.error("Failed to delete ingredient.");
                  }
                }}
              />

              <VibeSelectDropdown
                label="Product Vibe"
                required
                allVibes={availableVibes}
                selectedNames={formData.vibes}
                onChange={(names) =>
                  setFormData((prev) => ({ ...prev, vibes: names }))
                }
                error={formErrors.vibes}
              />

              <ToppingSelectDropdown
                label="Premium Toppings"
                allToppings={availableToppings}
                selectedNames={formData.toppings}
                onChange={(names) =>
                  setFormData((prev) => ({ ...prev, toppings: names }))
                }
                error={formErrors.toppings}
                onAdd={async (name, price) => {
                  try {
                    await ToppingService.create({ name, price });
                    await fetchResources();
                    toast.success("Topping added.");
                  } catch {
                    toast.error("Failed to add topping.");
                  }
                }}
                onEdit={async (oldName, newName, price) => {
                  try {
                    const item = availableToppings.find(
                      (i) => i.name === oldName,
                    );
                    if (item)
                      await ToppingService.update(item.id, {
                        name: newName,
                        price,
                      });
                    await fetchResources();
                    toast.success("Topping updated.");
                  } catch {
                    toast.error("Failed to update topping.");
                  }
                }}
                onDelete={async (name) => {
                  try {
                    const item = availableToppings.find((i) => i.name === name);
                    if (item) await ToppingService.remove(item.id);
                    await fetchResources();
                    toast.success("Topping deleted.");
                  } catch {
                    toast.error("Failed to delete topping.");
                  }
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
