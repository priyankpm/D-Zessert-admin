"use client";

import { Settings, Shield, Bell, CreditCard, Palette, Globe } from "lucide-react";

const sections = [
  { icon: Palette, label: "Appearance", desc: "Customize your dashboard theme and branding colors.", color: "text-brand bg-brand/5" },
  { icon: Bell, label: "Notifications", desc: "Manage how you receive order updates and system alerts.", color: "text-accent bg-accent/5" },
  { icon: Shield, label: "Security", desc: "Update your password and manage team permissions.", color: "text-emerald-600 bg-emerald-50" },
  { icon: CreditCard, label: "Payments", desc: "Configure your payment gateways and tax settings.", color: "text-chocolate bg-chocolate/5" },
  { icon: Globe, label: "Stores", desc: "Manage multi-location settings and regional availability.", color: "text-indigo-600 bg-indigo-50" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-4xl font-extrabold text-chocolate tracking-tight">Admin Settings</h2>
        <p className="text-brand font-medium">Fine-tune your management experience and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((section, idx) => (
          <div key={idx} className="glass-card p-10 rounded-3xl group hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-brand/10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${section.color}`}>
                <section.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-chocolate mb-2">{section.label}</h3>
            <p className="text-sm font-medium text-chocolate/40 leading-relaxed italic italic italic italic">{section.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-10 rounded-3xl bg-brand text-white overflow-hidden relative group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                  <h3 className="text-2xl font-black">System Version 2.4.0 (Gold)</h3>
                  <p className="text-white/60 text-sm font-bold opacity-80 decoration-white/20 underline decoration-2 underline-offset-4">Everything is running fresh and smooth like buttercream.</p>
              </div>
              <button className="px-10 py-5 rounded-2xl bg-white text-brand font-black hover:bg-cream transition-colors text-sm shadow-2xl">
                  CHECK UPDATES
              </button>
          </div>
      </div>
    </div>
  );
}
