"use client";

import { useState, useEffect } from "react";
import { ProductService, Product } from "@/lib/api/product-service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CreationCard } from "@/components/admin/CreationCard";
import { toast } from "@/lib/toast";
import { 
  Package, 
  EyeOff, 
  LayoutPanelTop, 
  ArrowRight,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    active: 0,
    deactivated: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const allData = await ProductService.findAll();

        // Filter out deleted products first
        const nonDeleted = allData?.filter((p) => !p.isDeleted);

        const active = nonDeleted.filter((p) => p.isActive).length;
        const deactivated = nonDeleted.filter((p) => !p.isActive).length;
        const total = nonDeleted.length;

        setStats({ active, deactivated, total });

        // Take the 5 most recent active products
        setRecentProducts(nonDeleted.filter((p) => p.isActive).slice(0, 5));
      } catch {
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <section className="flex items-center justify-between">
        <h2 className="text-4xl font-extrabold text-stone-900 font-headline tracking-tight">
          DASHBOARD.
        </h2>
      </section>

      {/* Secondary Metrics Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Product Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm relative overflow-hidden group hover:border-amber-500/20 transition-all duration-500">
          <div className="flex justify-between items-start relative z-10 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
              Live
            </span>
          </div>
          <div className="relative z-10">
            <h4 className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em] mb-1.5">
              Active Product
            </h4>
            <p className="text-4xl font-extrabold text-stone-900 font-headline tracking-tighter">
              {stats.active}
            </p>
          </div>
        </div>

        {/* Deactivated Product Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm relative overflow-hidden group hover:border-amber-500/20 transition-all duration-500">
          <div className="flex justify-between items-start relative z-10 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-600 flex items-center justify-center shadow-inner">
              <EyeOff className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full">
              Hidden
            </span>
          </div>
          <div className="relative z-10">
            <h4 className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em] mb-1.5">
              Deactivated Product
            </h4>
            <p className="text-4xl font-extrabold text-stone-900 font-headline tracking-tighter">
              {stats.deactivated}
            </p>
          </div>
        </div>

        {/* Total Products Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm relative overflow-hidden group hover:border-amber-500/20 transition-all duration-500">
          <div className="flex justify-between items-start relative z-10 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-stone-50 text-stone-800 flex items-center justify-center shadow-inner border border-stone-200">
              <LayoutPanelTop className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-stone-800 uppercase tracking-widest bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-full">
              All
            </span>
          </div>
          <div className="relative z-10">
            <h4 className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em] mb-1.5">
              Total Products
            </h4>
            <p className="text-4xl font-extrabold text-stone-900 font-headline tracking-tighter">
              {stats.total}
            </p>
          </div>
        </div>
      </section>

      {/* Recently Added Creations Gallery */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-extrabold font-headline text-stone-900 tracking-tight">
              Recently Added Creations
            </h3>
            <p className="text-sm text-stone-500 font-medium mt-1">
              The latest masterpieces from our pastry studio.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="group flex items-center gap-3 text-sm font-bold text-amber-600 hover:opacity-80 transition-all uppercase tracking-widest"
          >
            Explore Full Gallery
            <div className="w-8 h-8 rounded-full border border-amber-200 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-full h-[360px] bg-white rounded-[2rem] animate-pulse p-4 space-y-4 border border-stone-100"
                >
                  <div className="aspect-[4/3] w-full bg-stone-100 rounded-[1.5rem]"></div>
                  <div className="space-y-4 px-2">
                    <div className="h-6 w-2/3 bg-stone-100 rounded-full"></div>
                    <div className="h-4 w-1/3 bg-stone-100 rounded-full"></div>
                  </div>
                </div>
              ))
            : recentProducts.map((product) => (
                <CreationCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  description={product.description}
                  image={product.imageUrl}
                  chefName={product.chef?.name}
                  stock={product.stock}
                  tags={product.grade ? [product.grade] : ["CLASSIC"]}
                  onClick={(id) => router.push(`/admin/products/${id}`)}
                />
              ))}
        </div>
      </section>

    </div>
  );
}
