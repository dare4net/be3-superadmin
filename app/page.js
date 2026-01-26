"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Users, DollarSign, Package, ShoppingCart } from "lucide-react";

export default function Dashboard() {
    const [stats, setStats] = useState({
        tenants: 0,
        revenue: 0,
        modules: 0,
        activeSubs: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/admin/stats");
                setStats({
                    tenants: res.data.stats.tenants,
                    revenue: 0, // Not yet implemented in backend
                    modules: 11, // Hardcoded total modules for now
                    activeSubs: res.data.stats.orders // Using orders as proxy for activity
                });
            } catch (err) {
                console.error("Failed to fetch stats", err);
            }
        };

        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Platform Overview</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Tenants"
                    value={stats.tenants}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={`$${stats.revenue}`}
                    icon={DollarSign}
                    color="green"
                />
                <StatCard
                    title="Active Modules"
                    value={stats.modules}
                    icon={Package}
                    color="purple"
                />
                <StatCard
                    title="Active Subscriptions"
                    value={stats.activeSubs}
                    icon={ShoppingCart}
                    color="orange"
                />
            </div>

            <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Recent Activity</h2>
                <div className="text-gray-500">No recent activity</div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }) {
    const colors = {
        blue: "bg-blue-100 text-blue-600",
        green: "bg-green-100 text-green-600",
        purple: "bg-purple-100 text-purple-600",
        orange: "bg-orange-100 text-orange-600",
    };

    return (
        <div className="flex items-center rounded-lg border bg-white p-6 shadow-sm">
            <div className={`mr-4 rounded-full p-3 ${colors[color]}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
