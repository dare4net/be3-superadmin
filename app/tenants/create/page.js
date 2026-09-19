"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

export default function CreateTenantPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        subdomain: "",
        currency: "USD",
        currency_symbol: "$",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const CURRENCIES = [
        { code: "USD", symbol: "$", name: "USD ($) - US Dollar" },
        { code: "NGN", symbol: "₦", name: "NGN (₦) - Nigerian Naira" },
        { code: "XOF", symbol: "CFA", name: "XOF (CFA) - West African CFA Franc" },
        { code: "EUR", symbol: "€", name: "EUR (€) - Euro" },
        { code: "GBP", symbol: "£", name: "GBP (£) - British Pound" },
        { code: "CAD", symbol: "CA$", name: "CAD (CA$) - Canadian Dollar" },
        { code: "AUD", symbol: "A$", name: "AUD (A$) - Australian Dollar" },
        { code: "KES", symbol: "KSh", name: "KES (KSh) - Kenyan Shilling" },
        { code: "GHS", symbol: "GH₵", name: "GHS (GH₵) - Ghanaian Cedi" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Create Tenant
            await api.post("/tenants", formData);
            router.push("/tenants");
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to create tenant";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Tenant</h1>

            <div className="bg-white rounded-lg shadow p-6">
                {error && (
                    <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tenant Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded border border-gray-300 p-2"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Acme Corp"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subdomain</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                                type="text"
                                required
                                className="block w-full rounded-l border border-gray-300 p-2"
                                value={formData.subdomain}
                                onChange={e => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                                placeholder="acme"
                            />
                            <span className="inline-flex items-center rounded-r border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                                .platform.com
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Only lowercase letters, numbers, and hyphens.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Store Base Currency</label>
                        <select
                            className="mt-1 block w-full rounded border border-gray-300 p-2 bg-white"
                            value={formData.currency}
                            onChange={(e) => {
                                const code = e.target.value;
                                const curr = CURRENCIES.find(c => c.code === code);
                                setFormData({
                                    ...formData,
                                    currency: code,
                                    currency_symbol: curr ? curr.symbol : "$"
                                });
                            }}
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-sm text-gray-500">Default currency for all products and checkout transactions in this store.</p>
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
                            {loading ? "Creating..." : "Create Tenant"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
