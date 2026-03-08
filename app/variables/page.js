"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ArrowLeft, Loader2, Braces, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VariablesPage() {
    const router = useRouter();
    const [variables, setVariables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedVar, setCopiedVar] = useState(null);

    useEffect(() => {
        fetchVariables();
    }, []);

    const fetchVariables = async () => {
        try {
            const res = await api.get('/admin/variables');
            if (res.data.success) {
                setVariables(res.data.variables || []);
            }
        } catch (error) {
            console.error('Failed to fetch variables', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (varName) => {
        navigator.clipboard.writeText(`[${varName}]`);
        setCopiedVar(varName);
        setTimeout(() => setCopiedVar(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </button>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Braces className="w-6 h-6 text-emerald-600" />
                    Variables Registry
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Dynamic variables registered by modules. Use <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">[VARIABLE_NAME]</code> syntax in attribute values for dynamic resolution.
                </p>
            </div>

            {/* Variables List */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
                    <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                        Registered Variables ({variables.length})
                    </h2>
                    <span className="text-xs text-emerald-400">
                        Click to copy variable syntax
                    </span>
                </div>
                {variables.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <Braces className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">No variables registered yet.</p>
                        <p className="text-xs text-gray-300 mt-1">
                            Enable modules like Vendor to register variables automatically.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {variables.map((v, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between group hover:bg-gray-50 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <Braces className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm font-mono font-bold text-gray-900">
                                                [{v.name}]
                                            </code>
                                            {v.module && (
                                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                                    {v.module}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {v.description || 'No description provided'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(v.name)}
                                    className={cn(
                                        "p-2 rounded-lg transition",
                                        copiedVar === v.name
                                            ? "bg-emerald-100 text-emerald-600"
                                            : "text-gray-300 hover:text-emerald-600 hover:bg-emerald-50"
                                    )}
                                    title="Copy variable syntax"
                                >
                                    {copiedVar === v.name ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Usage Guide */}
            <div className="mt-6 bg-gray-50 rounded-lg border p-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">How Variables Work</h3>
                <div className="space-y-2 text-xs text-gray-500">
                    <p>• Modules register variables when they bootstrap (e.g., Vendor registers <code className="bg-white px-1 py-0.5 rounded border">[BUSINESS_NAME]</code>)</p>
                    <p>• Variables are resolved dynamically based on context (current user, tenant, etc.)</p>
                    <p>• Use variable syntax in system attribute values for automatic substitution</p>
                    <p>• Example: A &quot;Vendor&quot; system attribute with value <code className="bg-white px-1 py-0.5 rounded border">[BUSINESS_NAME]</code> resolves to each vendor&apos;s actual business name</p>
                </div>
            </div>
        </div>
    );
}
