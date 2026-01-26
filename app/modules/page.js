"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Package, CheckCircle, XCircle } from "lucide-react";

export default function ModulesPage() {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            // Use the public endpoint to list all modules
            const res = await api.get("/modules");
            setModules(res.data.modules);
        } catch (err) {
            console.error("Failed to fetch modules", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Module Registry</h1>
            <p className="mb-6 text-gray-600">These are the core and feature modules available in the platform.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((mod) => (
                    <div key={mod.name} className="bg-white rounded-lg shadow p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                <Package className="w-6 h-6" />
                            </div>
                            {mod.is_core ? (
                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">Core</span>
                            ) : (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Feature</span>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900">{mod.display_name}</h3>
                        <p className="text-sm text-gray-500 mb-4 font-mono">{mod.name} (v{mod.version})</p>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{mod.description || "No description available."}</p>

                    </div>
                ))}
            </div>
        </div>
    );
}
