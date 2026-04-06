"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductService, Product } from "@/lib/api/product-service";

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
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!product) return;
    if (confirm("Are you sure you want to archive this masterpiece?")) {
      try {
        await ProductService.remove(product.id);
        router.push("/admin/products");
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 bg-surface-container-low rounded-[3rem] border-2 border-dashed border-outline-variant/30">
        <p className="text-on-surface-variant font-bold text-2xl uppercase tracking-widest">
          Masterpiece not found
        </p>
        <Link
          href="/admin/products"
          className="text-primary font-bold hover:underline mt-4 inline-block"
        >
          Return to Gallery
        </Link>
      </div>
    );
  }

  const allImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...(product.gallery || []),
  ];
  console.log("product", product);
  return (
    <div className="min-h-screen font-body pb-20">
      {/* Breadcrumb & Actions */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-widest">
            <Link
              href="/admin/products"
              className="hover:text-primary transition-colors"
            >
              Products
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="text-secondary">{product.name}</span>
          </nav>
          {/* <h1 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight leading-tight">
            Artisanal <span className="text-primary italic">Deep Dive</span>
          </h1> */}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDelete}
            className="px-6 py-3 border border-error/20 rounded-xl text-error font-bold label-md hover:bg-error/5 transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
            DELETE
          </button>
          <button
            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
            className="px-8 py-3 satin-gradient text-white rounded-xl font-bold label-md tracking-wider uppercase shadow-lg shadow-primary/20 flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
            EDIT DETAILS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Section 1: Product Overview (Bento Style) */}
        <div className="col-span-12 lg:col-span-7 space-y-10">
          <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0px_20px_40px_rgba(43,22,19,0.03)] flex flex-col md:flex-row gap-8 overflow-hidden relative">
            {/* Gallery */}
            <div className="w-full md:w-1/2 space-y-4">
              {/* Main Selected Image */}
              <div className="aspect-square rounded-2xl overflow-hidden shadow-inner bg-surface-container group">
                <img
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  src={selectedImage}
                />
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={cn(
                      "aspect-square rounded-xl overflow-hidden cursor-pointer transition-all border-2",
                      selectedImage === image
                        ? "border-primary ring-2 ring-primary/30 scale-105"
                        : "border-transparent hover:border-primary/40",
                    )}
                  >
                    <img
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                      src={image}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="w-full md:w-1/2 flex flex-col justify-between py-2">
              <div>
                <span className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 inline-block">
                  {product.match > 90 ? "Best Seller" : "Special Edition"}
                </span>
                <h3 className="text-3xl font-headline font-bold text-on-surface leading-tight mb-2 tracking-tight">
                  {product.name}
                </h3>
                <p className="text-on-surface-variant text-sm mb-6 flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-primary text-base">
                    person
                  </span>
                  Crafted by {product.chefName}
                </p>
                <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-4xl font-headline font-extrabold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.oldPrice && (
                    <span className="text-on-surface-variant line-through text-sm opacity-50">
                      ${product.oldPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-on-surface uppercase tracking-widest">
                    <span>Inventory Status</span>
                    <span
                      className={cn(
                        product.stock < 20 ? "text-secondary" : "text-tertiary",
                      )}
                    >
                      {product.stock < 20
                        ? "Low Stock"
                        : product.stock < 50
                          ? "Limited Stock"
                          : "Healthy Stock"}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full relative overflow-hidden">
                    <div
                      className={cn(
                        "h-full absolute top-0 left-0 transition-all duration-1000 rounded-full",
                        product.stock < 20 ? "bg-secondary" : "bg-tertiary",
                      )}
                      style={{
                        width: `${Math.min((product.stock / 100) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider opacity-60">
                    {product.stock === 0
                      ? "Currently out of stock in central kitchen."
                      : `Only ${product.stock} units remaining in central kitchen.`}
                  </p>
                </div>
              </div>
              <div className="pt-8 flex gap-3">
                <div className="flex-1 bg-tertiary-fixed/20 p-4 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-on-tertiary-fixed-variant opacity-60">
                    Match Rate
                  </span>
                  <span className="text-xl font-extrabold text-tertiary font-headline">
                    {product.match}%
                  </span>
                </div>
                {/* <div className="flex-1 bg-primary-fixed/20 p-4 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-on-primary-fixed opacity-60">
                    Lead Time
                  </span>
                  <span className="text-xl font-extrabold text-primary font-headline">
                    45m
                  </span>
                </div> */}
              </div>
            </div>
          </div>

          {/* Section 2: The Narrative */}
          <div className="bg-surface-container-low rounded-[2.5rem] p-10 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
            <h4 className="text-xl font-bold text-primary mb-6 flex items-center gap-3 tracking-tight font-headline">
              <span className="material-symbols-outlined">auto_awesome</span>
              The Flavor Journey
            </h4>
            <div className="relative border-l-4 border-primary/20 pl-8 mb-8">
              <p className="text-xl font-semibold text-on-surface leading-relaxed italic mb-2">
                &quot;{product.description}&quot;
              </p>
              <footer className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                — Head Pâtissier, Julien Vasseur
              </footer>
            </div>
          </div>
        </div>

        {/* Sidebar Stats (Section 3, 4, 5) */}
        <div className="col-span-12 lg:col-span-5 space-y-10">
          {/* Section 3: Experience & Mood */}
          <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0px_20px_40px_rgba(43,22,19,0.03)] border border-outline-variant/10">
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">
              Experience Profiling
            </h4>
            <div className="space-y-8">
              <div>
                <p className="text-[10px] text-on-surface-variant mb-3 uppercase font-bold opacity-60 tracking-widest">
                  Sentiment Profile
                </p>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-primary/5 text-primary rounded-full font-extrabold uppercase tracking-widest border border-primary/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant mb-3 uppercase font-bold opacity-60 tracking-widest">
                  Ideal Context
                </p>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  <span className="px-4 py-2 bg-surface text-on-surface rounded-full font-bold uppercase tracking-widest border border-outline-variant/30">
                    Quiet Celebration
                  </span>
                  <span className="px-4 py-2 bg-surface text-on-surface rounded-full font-bold uppercase tracking-widest border border-outline-variant/30">
                    Rainy Afternoon
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Nutritional Profile */}
          <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0px_20px_40px_rgba(43,22,19,0.03)] border border-outline-variant/10">
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">
              Nutritional Harmony
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-container-low p-5 rounded-2xl text-center flex flex-col items-center">
                <p className="text-2xl font-extrabold text-primary font-headline">
                  {product.calories}
                </p>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest opacity-60">
                  Kcal
                </p>
              </div>
            </div>
            {/* <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                <span>Airy</span>
                <span>Density</span>
                <span>Dense</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full relative">
                <div className="w-4 h-4 bg-primary rounded-full absolute top-1/2 -translate-y-1/2 left-[65%] shadow-lg border-2 border-white"></div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
