"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Loader2 } from "lucide-react";
import { authStorage } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push("/");
    } else {
      setIsAuthorized(true);  
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-cream">
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface selection:bg-primary selection:text-white">
      <Sidebar />
      <div className="flex-1 ml-72 transition-all">
        <Header />
        <main className="p-10 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
