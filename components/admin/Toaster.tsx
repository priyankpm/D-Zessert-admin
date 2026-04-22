"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast, ToastEvent } from "@/lib/toast";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 flex-shrink-0" />,
  error: <XCircle className="w-4 h-4 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 flex-shrink-0" />,
  info: <Info className="w-4 h-4 flex-shrink-0" />,
};

const STYLES = {
  success: "bg-emerald-600 text-white shadow-emerald-600/20",
  error: "bg-red-600 text-white shadow-red-600/20",
  warning: "bg-amber-500 text-white shadow-amber-500/20",
  info: "bg-stone-800 text-white shadow-stone-800/20",
};

function ToastItem({ t, onDismiss }: { t: ToastEvent; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const enterTimer = setTimeout(() => setVisible(true), 10);
    const exitTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, t.duration ?? 3500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [t.duration, onDismiss]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl text-sm font-bold transition-all duration-300 ease-out max-w-sm w-full",
        STYLES[t.type],
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95"
      )}
    >
      {ICONS[t.type]}
      <span className="flex-1 leading-tight text-[11px] uppercase tracking-wider">
        {t.message}
      </span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onDismiss, 300);
        }}
        className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => {
    const unsub = toast._subscribe((t) => {
      setToasts((prev) => [...prev, t]);
    });
    return () => { unsub(); };
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem t={t} onDismiss={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
