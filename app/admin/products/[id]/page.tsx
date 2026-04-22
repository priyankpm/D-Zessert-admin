"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductService, Product, ProductRecommendation } from "@/lib/api/product-service";
import { Ingredient } from "@/lib/api/ingredient-service";
import { Topping } from "@/lib/api/topping-service";
import {
  ChevronRight,
  Trash2,
  Edit,
  Camera,
  Image as ImageIcon,
  Star,
  Package,
  ChefHat,
} from "lucide-react";
import { toast } from "@/lib/toast";

// ── Read-only field ──────────────────────────────────────────
function ReadField({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | number | null;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 text-stone-700 font-medium min-h-[52px] flex items-center">
        {value ?? <span className="text-stone-300 italic text-xs">—</span>}
      </div>
    </div>
  );
}

function ReadTextarea({
  label,
  value,
  rows = 5,
}: {
  label: string;
  value?: string | null;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div
        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 text-stone-700 font-medium leading-relaxed"
        style={{ minHeight: `${rows * 1.75 + 2}rem` }}
      >
        {value || (
          <span className="text-stone-300 italic text-xs">
            No description provided.
          </span>
        )}
      </div>
    </div>
  );
}

export default function ViewProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setIsFetching(true);
        const data = await ProductService.findOne(id as string);
        setProduct(data);
        setSelectedImage(data.imageUrl || data.gallery?.[0] || "");
      } catch (err: unknown) {
        toast.error("Failed to load product.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!product) return;
    if (confirm("Archive this masterpiece?")) {
      try {
        await ProductService.remove(product.id);
        toast.success("Product archived.");
        router.push("/admin/products");
      } catch {
        toast.error("Failed to archive product.");
      }
    }
  };

  if (isFetching)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );

  if (!product)
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 border-dashed">
        <p className="text-stone-400 font-bold uppercase">Product not found</p>
      </div>
    );

  const allImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...(product.gallery || []),
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <nav className="flex items-center gap-2 text-[10px] text-stone-400 uppercase tracking-[0.2em] font-black mb-3">
            <Link
              href="/admin/products"
              className="hover:text-amber-600 transition-colors"
            >
              Masterpieces
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-600">{product.name}</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-stone-900 font-headline">
            {product.name}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDelete}
            className="px-6 py-3.5 border border-red-200 rounded-xl text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Archive
          </button>
          <button
            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
            className="px-8 py-3.5 bg-amber-600 text-white rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/10"
          >
            <Edit className="w-4 h-4" />
            Edit Product
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-12 text-stone-900">
        {/* ══ LEFT COLUMN ══════════════════════════════════════════ */}
        <div className="col-span-12 lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
          {/* General Information */}
          <section className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-[1px] bg-amber-500/50" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                General Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <ReadField
                label="Confection Name"
                value={product.name}
                className="col-span-2"
              />
              <ReadField label="Artisan Chef" value={product.chef?.name} />
              <ReadTextarea
                label="Sensory Description"
                value={product.description}
                rows={5}
              />
            </div>
          </section>

          {/* Pricing & Inventory */}
          <section className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-[1px] bg-amber-500/50" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                Pricing & Inventory
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ReadField
                label="Base Price ($)"
                value={
                  product.price != null ? `$${product.price.toFixed(2)}` : null
                }
              />
              <ReadField
                label="Compare Price ($)"
                value={
                  product.discountedPrice != null
                    ? `$${product.discountedPrice.toFixed(2)}`
                    : "—"
                }
              />
              <ReadField label="Stock Count" value={product.stock} />
              <ReadField label="Calories (Kcal)" value={product.calories} />

              {/* Status badge */}
              <div className="col-span-2 space-y-2">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                  Status
                </label>
                <div className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 flex items-center gap-3">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      product.isActive ? "bg-green-500" : "bg-stone-400",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-bold uppercase tracking-widest",
                      product.isActive ? "text-green-600" : "text-stone-400",
                    )}
                  >
                    {product.isActive
                      ? "Active — visible in catalogue"
                      : "Inactive — hidden from users"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ══ RIGHT COLUMN ═════════════════════════════════════════ */}
        <div className="col-span-12 lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
          {/* Imagery */}
          <section className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-[1px] bg-amber-500/50" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                Imagery
              </h3>
            </div>
            <div className="space-y-6">
              {/* Hero Image */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                  Hero Image
                </label>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-50 border border-stone-200">
                  {selectedImage ? (
                    <img
                      className="w-full h-full object-cover"
                      src={selectedImage}
                      alt={product.name}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 gap-3">
                      <Camera className="w-10 h-10 stroke-[1.5]" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        No image
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery thumbnails */}
              {allImages.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                    Gallery
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {allImages.slice(0, 5).map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={cn(
                          "aspect-square rounded-xl overflow-hidden border-2 transition-all",
                          selectedImage === img
                            ? "border-amber-500 scale-105 shadow-md shadow-amber-500/20"
                            : "border-stone-200 hover:border-amber-400/60",
                        )}
                      >
                        <img
                          className="w-full h-full object-cover"
                          src={img}
                          alt={`Gallery ${i + 1}`}
                        />
                      </button>
                    ))}
                    {/* Empty slots to fill to 5 */}
                    {Array.from({
                      length: Math.max(0, 5 - allImages.length),
                    }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="aspect-square rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-200"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Ingredients & Toppings */}
          <section className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-[1px] bg-amber-500/50" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                Ingredients & Toppings
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-3">
                  Ingredients
                </label>
                <div className="flex flex-wrap gap-2 text-stone-700">
                  {product.ingredients && product.ingredients.length > 0 ? (
                    product.ingredients.map((ing: Ingredient) => (
                      <div
                        key={ing.id}
                        className="flex items-center gap-2 bg-stone-50 border border-stone-100 px-4 py-2 rounded-full"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700">
                          {ing.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-stone-300 italic text-xs ml-1">
                      No ingredients listed.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-3">
                  Premium Toppings
                </label>
                <div className="flex flex-wrap gap-2 text-stone-700">
                  {product.toppings && product.toppings.length > 0 ? (
                    product.toppings.map((top: Topping) => (
                      <div
                        key={top.id}
                        className="flex items-center gap-2 bg-stone-50 border border-stone-100 pl-3 pr-2 py-1.5 rounded-full"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700">
                          {top.name}
                        </span>
                        {top.price != null && (
                          <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-1.5 py-0.5">
                            ${top.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="text-stone-300 italic text-xs ml-1">
                      No toppings listed.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
          {/* Recommended Products */}
          {product.recommendations && product.recommendations.length > 0 && (
            <section className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-8">
                <span className="w-8 h-[1px] bg-amber-500/50" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                  Recommended Masterpieces
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {product.recommendations.map((recLink: ProductRecommendation) => {
                  const rec = recLink.recommended;
                  if (!rec) return null;
                  return (
                    <div
                      key={recLink.id}
                      onClick={() => router.push(`/admin/products/${rec.id}`)}
                      className="flex items-center gap-4 p-3 bg-stone-50 border border-stone-100 rounded-2xl hover:border-amber-500/30 transition-all cursor-pointer group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-stone-200 bg-white flex-shrink-0">
                        <img
                          src={rec.imageUrl || "/placeholder.png"}
                          alt={rec.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-stone-800 uppercase tracking-widest mb-1 truncate">
                          {rec.name}
                        </h4>
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                          ${rec.price != null ? rec.price.toFixed(2) : "0.00"}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
