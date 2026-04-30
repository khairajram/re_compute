import React, { useState } from "react";
import { X } from "lucide-react";
import { BASE_URL } from "@/app/config";

export default function AddMachineModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);

    const payload = {
      name: formData.get("name")?.toString().trim(),
      cpu: Number(formData.get("cpu")),
      gpu: Number(formData.get("gpu")),
      ram: Number(formData.get("ram")),
      storage: Number(formData.get("storage")),
      pricePerHour: Number(formData.get("pricePerHour")),
    };

    try {
      const res = await fetch(`${BASE_URL}/api/machines/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error("Failed to create machine");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);

      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {success && (
        <div className="fixed top-5 right-5 z-[100] bg-green-600 text-white px-4 py-2 rounded-md shadow-lg animate-in fade-in">
          Machine created successfully 🚀
        </div>
      )}

      <div className="relative bg-card rounded-xl p-6 w-full max-w-md border border-card-border shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center text-white">
          Add Machine
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-900 p-2 rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "name", type: "text", placeholder: "Machine Name" },
            { label: "cpu", type: "number", placeholder: "CPU Count" },
            { label: "gpu", type: "number", placeholder: "GPU Count" },
            { label: "ram", type: "number", placeholder: "RAM Size (GB)" },
            { label: "storage", type: "number", placeholder: "Storage Size (GB)" },
            { label: "pricePerHour", type: "number", placeholder: "Price per Hour" },
          ].map((field, i) => (
            <div key={i}>
              <label className="block text-sm text-gray-400 mb-1 capitalize">
                {field.label}
              </label>
              <input
                name={field.label}
                type={field.type}
                required
                placeholder={field.placeholder}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 px-4 py-2 bg-primary hover:bg-primary-hover rounded-md text-lg font-medium text-white transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Machine"}
          </button>
        </form>
      </div>
    </>
  );
}
