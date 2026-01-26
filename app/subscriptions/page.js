"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { Plus, Check, X } from "lucide-react";

export default function SubscriptionsPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await api.get("/admin/plans");
            setPlans(res.data.plans);
        } catch (err) {
            console.error("Failed to fetch plans", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
                <Link
                    href="/subscriptions/create"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    Create Plan
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <p className="text-gray-500 mb-4 h-12">{plan.description}</p>

                        <div className="mb-6">
                            <span className="text-3xl font-bold">${plan.price_monthly}</span>
                            <span className="text-gray-500">/month</span>
                            <div className="text-sm text-gray-400 mt-1">or ${plan.price_yearly}/year</div>
                        </div>

                        <div className="space-y-3 mb-6 flex-1">
                            {/* We could list features here if we had them in the DB object */}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Full Platform Access</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Unlimited Tenants</span>
                            </div>
                        </div>

                        <button className="w-full py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition font-medium">
                            Edit Plan
                        </button>
                    </div>
                ))}

                {plans.length === 0 && (
                    <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 mb-4">No subscription plans defined.</p>
                        <Link href="/subscriptions/create" className="text-blue-600 hover:underline">Create your first plan</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
