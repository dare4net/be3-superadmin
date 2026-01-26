"use client";

import { useEffect, useState } from "react";
import { Shield, Server, Database, Globe } from "lucide-react";

export default function SettingsPage() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Platform Settings</h1>

            <div className="grid grid-cols-1 gap-6 max-w-4xl">

                {/* Profile Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Admin Profile
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <div className="mt-1 p-2 bg-gray-50 rounded border text-gray-900">{user?.email || "Loading..."}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <div className="mt-1 p-2 bg-gray-50 rounded border text-gray-900 capitalize">{user?.role?.replace('_', ' ') || "Super Admin"}</div>
                        </div>
                    </div>
                </div>

                {/* System Info Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5 text-purple-600" />
                        System Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                            <div className="bg-white p-2 rounded shadow-sm">
                                <Globe className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Environment</div>
                                <div className="font-semibold">Development</div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                            <div className="bg-white p-2 rounded shadow-sm">
                                <Database className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Database</div>
                                <div className="font-semibold">PostgreSQL (Connected)</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Version Control</h3>
                        <div className="text-sm text-gray-500">
                            <p>Core Platform: v1.0.0</p>
                            <p>Super Admin UI: v0.1.0 (Beta)</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
