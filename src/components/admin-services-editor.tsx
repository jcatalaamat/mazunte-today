"use client";

import { useState } from "react";
import { categoryConfig } from "@/lib/utils";

const allCategories = Object.keys(categoryConfig);

type ServiceEntry = {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  category: string;
};

export function AdminServicesEditor({
  initialServices,
}: {
  initialServices: ServiceEntry[];
}) {
  const [services, setServices] = useState<ServiceEntry[]>(initialServices);

  function addService() {
    setServices([
      ...services,
      {
        id: `svc-${Date.now()}`,
        name: "",
        description: "",
        duration: "",
        price: "",
        category: "other",
      },
    ]);
  }

  function removeService(id: string) {
    setServices(services.filter((s) => s.id !== id));
  }

  function updateService(id: string, field: keyof ServiceEntry, value: string) {
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Services</label>

      {services.length > 0 && (
        <div className="space-y-3 mb-4">
          {services.map((svc) => (
            <div key={svc.id} className="bg-cream rounded-xl p-4 border border-black/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-lighter">Service</span>
                <button
                  type="button"
                  onClick={() => removeService(svc.id)}
                  className="text-xs text-red-500 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
              <input
                value={svc.name}
                onChange={(e) => updateService(svc.id, "name", e.target.value)}
                placeholder="Service name"
                className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-white text-[0.85rem] outline-none focus:border-ocean transition-colors"
              />
              <input
                value={svc.description}
                onChange={(e) => updateService(svc.id, "description", e.target.value)}
                placeholder="Description"
                className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-white text-[0.85rem] outline-none focus:border-ocean transition-colors"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={svc.duration}
                  onChange={(e) => updateService(svc.id, "duration", e.target.value)}
                  placeholder="Duration (e.g. 60 min)"
                  className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-white text-[0.85rem] outline-none focus:border-ocean transition-colors"
                />
                <input
                  value={svc.price}
                  onChange={(e) => updateService(svc.id, "price", e.target.value)}
                  placeholder="Price (e.g. $500 MXN)"
                  className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-white text-[0.85rem] outline-none focus:border-ocean transition-colors"
                />
              </div>
              <select
                value={svc.category}
                onChange={(e) => updateService(svc.id, "category", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-white text-[0.85rem] outline-none focus:border-ocean transition-colors"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryConfig[cat].emoji} {categoryConfig[cat].label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addService}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-black/15 text-sm text-text-soft hover:border-ocean/30 transition-colors cursor-pointer"
      >
        + Add a service
      </button>

      <input
        type="hidden"
        name="servicesJson"
        value={JSON.stringify(
          services.filter((s) => s.name.trim()).map((s) => ({
            name: s.name,
            description: s.description || undefined,
            duration: s.duration || undefined,
            price: s.price || undefined,
            category: s.category,
          }))
        )}
      />
    </div>
  );
}
