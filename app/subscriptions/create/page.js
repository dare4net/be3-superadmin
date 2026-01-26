"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

export default function CreatePlanPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price_monthly: "",
        price_yearly: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/admin/plans", {
                ...formData,
                price_monthly: parseFloat(formData.price_monthly),
                price_yearly: parseFloat(formData.price_yearly)
            });
            router.push("/subscriptions");
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to create plan";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create Subscription Plan</h1>

            <div className="bg-white rounded-lg shadow p-6">
                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded border border-gray-300 p-2"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Pro Plan"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            required
                            className="mt-1 block w-full rounded border border-gray-300 p-2"
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Features included..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Monthly Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="mt-1 block w-full rounded border border-gray-300 p-2"
                                value={formData.price_monthly}
                                onChange={e => setFormData({ ...formData, price_monthly: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Yearly Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="mt-1 block w-full rounded border border-gray-300 p-2"
                                value={formData.price_yearly}
                                onChange={e => setFormData({ ...formData, price_yearly: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700",
                                loading && "opacity-50"
                            )}
                        >
                            {loading ? "Create Plan" : "Create Plan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
