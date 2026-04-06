"use client";

import { useState, useEffect } from "react";
import { ProductService, Product } from "@/lib/api/product-service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CreationCard } from "@/components/admin/CreationCard";

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
        const nonDeleted = allData.filter((p) => !p.isDeleted);

        const active = nonDeleted.filter((p) => p.isActive).length;
        const deactivated = nonDeleted.filter((p) => !p.isActive).length;
        const total = nonDeleted.length;

        setStats({ active, deactivated, total });

        // Take the 5 most recent active products
        setRecentProducts(nonDeleted.filter((p) => p.isActive).slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
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
        <h2 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight">
          DASHBOARD.
        </h2>
      </section>

      {/* Secondary Metrics Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Product Card */}
        <div className="bg-[#fcf9f4] p-6 rounded-[2rem] border border-[#725550]/10 shadow-[0_4px_20px_rgba(114,85,80,0.05)] relative overflow-hidden group hover:shadow-[0_12px_40px_rgba(114,85,80,0.1)] transition-all duration-500">
          {/* <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[3rem] group-hover:bg-primary/10 transition-colors" /> */}
          <div className="flex justify-between items-start relative z-10 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-2xl font-bold">
                inventory_2
              </span>
            </div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-full">
              Live
            </span>
          </div>
          <div className="relative z-10">
            <h4 className="text-[10px] text-[#725550]/50 font-black uppercase tracking-[0.2em] mb-1.5">
              Active Product
            </h4>
            <p className="text-4xl font-extrabold text-[#725550] font-headline tracking-tighter">
              {stats.active}
            </p>
          </div>
        </div>

        {/* Deactivated Product Card */}
        <div className="bg-[#fcf9f4] p-6 rounded-[2rem] border border-[#725550]/10 shadow-[0_4px_20px_rgba(114,85,80,0.05)] relative overflow-hidden group hover:shadow-[0_12px_40px_rgba(114,85,80,0.1)] transition-all duration-500">
          {/* <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-[3rem] group-hover:bg-secondary/10 transition-colors" /> */}
          <div className="flex justify-between items-start relative z-10 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-2xl font-bold">
                visibility_off
              </span>
            </div>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary/5 border border-secondary/10 px-3 py-1.5 rounded-full">
              Hidden
            </span>
          </div>
          <div className="relative z-10">
            <h4 className="text-[10px] text-[#725550]/50 font-black uppercase tracking-[0.2em] mb-1.5">
              Deactivated Product
            </h4>
            <p className="text-4xl font-extrabold text-[#725550] font-headline tracking-tighter">
              {stats.deactivated}
            </p>
          </div>
        </div>

        {/* Total Products Card */}
        <div className="bg-[#fcf9f4] p-6 rounded-[2rem] border border-[#725550]/10 shadow-[0_4px_20px_rgba(114,85,80,0.05)] relative overflow-hidden group hover:shadow-[0_12px_40px_rgba(114,85,80,0.1)] transition-all duration-500">
          {/* <div className="absolute top-0 right-0 w-24 h-24 bg-[#725550]/5 rounded-bl-[3rem] group-hover:bg-[#725550]/10 transition-colors" /> */}
          <div className="flex justify-between items-start relative z-10 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#725550]/10 text-[#725550] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-2xl font-bold">
                full_coverage
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#725550] uppercase tracking-widest bg-[#725550]/5 border border-[#725550]/10 px-3 py-1.5 rounded-full">
              All
            </span>
          </div>
          <div className="relative z-10">
            <h4 className="text-[10px] text-[#725550]/50 font-black uppercase tracking-[0.2em] mb-1.5">
              Total Products
            </h4>
            <p className="text-4xl font-extrabold text-[#725550] font-headline tracking-tighter">
              {stats.total}
            </p>
          </div>
        </div>
      </section>

      {/* Recently Added Creations Gallery */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-extrabold font-headline text-on-surface tracking-tight">
              Recently Added Creations
            </h3>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              The latest masterpieces from our pastry studio.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="group flex items-center gap-3 text-sm font-bold text-primary hover:opacity-80 transition-all uppercase tracking-widest"
          >
            Explore Full Gallery
            <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full h-[360px] bg-surface-container-low rounded-[2rem] animate-pulse p-4 space-y-4"
                >
                  <div className="aspect-[4/3] w-full bg-surface-container-high rounded-[1.5rem]"></div>
                  <div className="space-y-4">
                    <div className="h-6 w-2/3 bg-surface-container-high rounded-full"></div>
                    <div className="h-4 w-1/3 bg-surface-container-high rounded-full"></div>
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
                  tags={
                    product.tags && product.tags.length > 0
                      ? product.tags
                      : ["CLASSIC", "TRENDING"]
                  }
                  onClick={(id) => router.push(`/admin/products/${id}`)}
                />
              ))}
        </div>
      </section>

      {/* Floating Action Button - The "Satin" Primary CTA */}
      {/* <Link
        href="/admin/products/add"
        className="fixed bottom-10 right-10 satin-gradient text-on-primary w-14 h-14 rounded-full shadow-2xl flex items-center justify-center group hover:scale-110 active:scale-95 transition-all z-50"
      >
        <span className="material-symbols-outlined">add</span>
        <span className="absolute right-full mr-4 bg-on-surface text-surface text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-widest pointer-events-none">
          New Creation
        </span>
      </Link> */}
    </div>
  );
}
