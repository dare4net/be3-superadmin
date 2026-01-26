"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap, RefreshCw } from "lucide-react";
import api from "@/lib/axios";

export default function TenantRateLimitPage({ params }) {
    const router = useRouter();
    const { id } = use(params);

    const [tenant, setTenant] = useState(null);
    const [rateLimit, setRateLimit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState(null);
    const [error, setError] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const [tenantRes, rlRes] = await Promise.all([
                api.get(`/admin/tenants/${id}`),
                api.get(`/admin/rate-limit`)
            ]);
            setTenant(tenantRes.data.tenant);
            setRateLimit(rlRes.data.rateLimit);
        } catch (e) {
            setError(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) load();
    }, [id]);

    const setExempt = async (exempt) => {
        setAction("exempt");
        setError(null);
        try {
            const res = await api.post(`/admin/tenants/${id}/rate-limit-exempt`, { exempt });
            setTenant(res.data.tenant);
        } catch (e) {
            setError(e?.response?.data?.message || e.message);
        } finally {
            setAction(null);
        }
    };

    const clearNow = async () => {
        setAction("clear");
        setError(null);
        try {
            await api.post(`/admin/tenants/${id}/rate-limit-clear`);
        } catch (e) {
            setError(e?.response?.data?.message || e.message);
        } finally {
            setAction(null);
        }
    };

    if (loading) {
        return <div className="py-12 text-gray-600">Loading…</div>;
    }

    if (!tenant) {
        return (
            <div className="space-y-4">
                <Link href="/tenants" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Tenants
                </Link>
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
                    {error || "Tenant not found"}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <Link
                    href={`/tenants/${id}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                    Tenant overview
                </Link>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Tenant</p>
                        <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
                        <p className="text-sm text-gray-600">{tenant.subdomain}.platform.com</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase text-gray-500">Rate limit status</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {tenant.rate_limit_exempt ? "Exempt" : "Limited"}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-700">Exempt from rate limit:</span>
                        <button
                            onClick={() => setExempt(!tenant.rate_limit_exempt)}
                            disabled={action === "exempt"}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${tenant.rate_limit_exempt ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                            {action === "exempt" ? "…" : tenant.rate_limit_exempt ? "Yes" : "No"}
                        </button>
                    </div>
                    <button
                        onClick={clearNow}
                        disabled={action === "clear" || tenant.rate_limit_exempt}
                        title={tenant.rate_limit_exempt ? "Exempt tenants are not limited" : "Clear Redis counters (one-time relief)"}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Clear now
                    </button>
                </div>
            </div>

            {rateLimit && (
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        How it works
                    </h2>
                    <p className="text-sm text-gray-700">{rateLimit.howItWorks?.scope}</p>
                    <p className="text-sm text-gray-700">{rateLimit.howItWorks?.skip}</p>
                    <p className="text-sm text-gray-500">Store: {rateLimit.howItWorks?.store}</p>
                    <div className="text-sm text-gray-800">
                        <p>Window: <strong>{rateLimit.config?.windowMinutes ?? "—"} minutes</strong></p>
                        <p>Max: <strong>{rateLimit.config?.max ?? "—"} requests</strong></p>
                    </div>
                </div>
            )}
        </div>
    );
}
