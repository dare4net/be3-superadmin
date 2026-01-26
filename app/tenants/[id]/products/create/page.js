"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

export default function CreateTenantProductPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        sku: "",
        description: "",
        image_url: ""
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post(`/products/admin/tenants/${id}/products`, {
                ...formData,
                price: parseFloat(formData.price)
            });
            router.push(`/tenants/${id}/products`);
        } catch (err) {
            console.error(err);
            alert("Failed to create product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Add Product for Tenant</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded border border-gray-300 p-2"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="mt-1 block w-full rounded border border-gray-300 p-2"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">SKU</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded border border-gray-300 p-2"
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                        <input
                            type="url"
                            className="mt-1 block w-full rounded border border-gray-300 p-2"
                            placeholder="https://example.com/image.jpg"
                            value={formData.image_url}
                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Direct link to an image for testing.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            className="mt-1 block w-full rounded border border-gray-300 p-2"
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700",
                            loading && "opacity-50"
                        )}
                    >
                        {loading ? "Creating..." : "Create Product"}
                    </button>
                </form>
            </div>
        </div>
    );
}
