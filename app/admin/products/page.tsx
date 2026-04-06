"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/admin/ProductCard";
import { ProductService, Product } from "@/lib/api/product-service";
import { cn } from "@/lib/utils";

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("All Masterpieces");
  const [refine, setRefine] = useState("All Collections");
  const [priceRange, setPriceRange] = useState("Any Price");
  const [stockStatus, setStockStatus] = useState("All Inventory");
  const [sortBy, setSortBy] = useState("Newest First");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Sync search state with URL params
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await ProductService.findAll();

        console.log("data", data);
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to archive this masterpiece?"))
      return;
    try {
      await ProductService.remove(id);
      // Soft delete: keep the product but mark it as deleted
      setProducts((prevProducts) =>
        prevProducts.map((p) => (p.id === id ? { ...p, isDeleted: true } : p)),
      );
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      // Assuming update can handle isDeleted: false
      await ProductService.update(id, { isDeleted: false });
      setProducts((prevProducts) =>
        prevProducts.map((p) => (p.id === id ? { ...p, isDeleted: false } : p)),
      );
    } catch (error) {
      console.error("Failed to restore product:", error);
    }
  };

  // Filtering & Sorting Logic
  const filteredProducts = products
    .filter((product) => {
      // Category Tab Filter (using tags)
      if (category !== "All Masterpieces") {
        const matchesCategory = product.tags?.some(
          (tag) => tag.toLowerCase() === category.toLowerCase(),
        );
        if (!matchesCategory) return false;
      }

      // Refine/Collection Filter (simplified matching for demo)
      if (refine !== "All Collections") {
        const matchesCollection = product.tags?.some(
          (tag) => tag.toLowerCase() === refine.toLowerCase(),
        );
        if (!matchesCollection) return false;
      }

      // Price Range Filter
      if (priceRange !== "Any Price") {
        if (priceRange === "Under $10" && product.price >= 10) return false;
        if (
          priceRange === "$10 - $50" &&
          (product.price < 10 || product.price > 50)
        )
          return false;
        if (priceRange === "$50+" && product.price <= 50) return false;
      }

      // Stock Status Filter
      if (stockStatus !== "All Inventory") {
        if (stockStatus === "In Stock" && product.isActive === false)
          return false;
        if (stockStatus === "Out of Stock" && product.isActive === true)
          return false;
      }

      // Search Query Filter
      if (
        searchQuery &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "Newest First")
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Price: High to Low") return b.price - a.price;
      if (sortBy === "Top Rated") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  console.log("filteredProducts", filteredProducts);
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">
            Product Gallery
          </h2>
          <p className="text-on-surface-variant font-body flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            Displaying {filteredProducts.length} artisanal masterpieces
            currently in stock
          </p>
        </div>
        <Link
          href="/admin/products/add"
          className="satin-gradient text-white px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 group w-fit"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">
            add
          </span>
          <span className="font-headline font-bold text-sm tracking-wider uppercase">
            Add New Product
          </span>
        </Link>
      </div>

      {/* Filters & Tabs Section */}
      <div className="flex flex-col gap-8 mb-10">
        {/* Category Tabs */}
        <div className="flex items-center gap-8 border-b border-outline-variant/10 overflow-x-auto custom-scrollbar">
          {["All Products"].map((tab) => (
            <button
              key={tab}
              onClick={() => setCategory(tab)}
              className={cn(
                "pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
                category === tab
                  ? "text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-primary after:rounded-t-full"
                  : "text-on-surface-variant hover:text-primary",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Refine Dropdown */}
          <div className="relative">
            <div
              onClick={() =>
                setActiveDropdown(activeDropdown === "refine" ? null : "refine")
              }
              className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                  Refine
                </p>
                <p className="font-headline font-bold text-primary">{refine}</p>
              </div>
              <span className="material-symbols-outlined text-outline">
                expand_more
              </span>
            </div>
            {activeDropdown === "refine" && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl z-50 py-2 border border-outline-variant/10">
                {["All Collections", "Summer", "Signature", "Gift Boxes"].map(
                  (opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setRefine(opt);
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-surface-container-low font-medium"
                    >
                      {opt}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Price Range Dropdown */}
          <div className="relative">
            <div
              onClick={() =>
                setActiveDropdown(activeDropdown === "price" ? null : "price")
              }
              className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                  Price Range
                </p>
                <p className="font-headline font-bold text-primary">
                  {priceRange}
                </p>
              </div>
              <span className="material-symbols-outlined text-outline">
                tune
              </span>
            </div>
            {activeDropdown === "price" && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl z-50 py-2 border border-outline-variant/10">
                {["Any Price", "Under $10", "$10 - $50", "$50+"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setPriceRange(opt);
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-surface-container-low font-medium"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stock Status Dropdown */}
          <div className="relative">
            <div
              onClick={() =>
                setActiveDropdown(activeDropdown === "stock" ? null : "stock")
              }
              className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                  Stock Status
                </p>
                <p className="font-headline font-bold text-primary">
                  {stockStatus}
                </p>
              </div>
              <span className="material-symbols-outlined text-outline">
                warning
              </span>
            </div>
            {activeDropdown === "stock" && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl z-50 py-2 border border-outline-variant/10">
                {["All Inventory", "In Stock", "Out of Stock"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setStockStatus(opt);
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-surface-container-low font-medium"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <div
              onClick={() =>
                setActiveDropdown(activeDropdown === "sort" ? null : "sort")
              }
              className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                  Sort By
                </p>
                <p className="font-headline font-bold text-primary">{sortBy}</p>
              </div>
              <span className="material-symbols-outlined text-outline">
                sort
              </span>
            </div>
            {activeDropdown === "sort" && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl z-50 py-2 border border-outline-variant/10">
                {[
                  "Newest First",
                  "Price: Low to High",
                  "Price: High to Low",
                  "Top Rated",
                ].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortBy(opt);
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-surface-container-low font-medium"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              image={product.imageUrl || "/placeholder.png"}
              isDeleted={product.isDeleted}
              onEdit={(id) => router.push(`/admin/products/${id}/edit`)}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onView={(id) => router.push(`/admin/products/${id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-low p-20 rounded-3xl text-center space-y-4">
          <p className="text-on-surface-variant font-bold text-xl uppercase tracking-widest">
            No delicacies match your selection.
          </p>
          <button
            onClick={() => {
              setCategory("All Masterpieces");
              setRefine("All Collections");
              setPriceRange("Any Price");
              setStockStatus("All Inventory");
              setSearchQuery("");
            }}
            className="text-primary font-black hover:underline underline-offset-4 decoration-2"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Table Footer/Pagination */}
      <div className="px-6 py-8 flex items-center justify-between border-t border-outline-variant/10">
        <p className="text-xs font-medium text-on-surface-variant font-body">
          Showing 1 - {filteredProducts.length} of {filteredProducts.length}{" "}
          artisanal products
        </p>
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high disabled:opacity-30"
            disabled
          >
            <span className="material-symbols-outlined text-sm">
              chevron_left
            </span>
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold font-headline shadow-md">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-sm">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={<div className="p-20 text-center">Loading Gallery...</div>}
    >
      <ProductsPageContent />
    </Suspense>
  );
}
