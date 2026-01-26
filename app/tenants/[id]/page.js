"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { ArrowLeft, Check, X } from "lucide-react";
import { cn } from '@/lib/utils';

export default function TenantDetailsPage({ params }) {
    // Fix for Next.js 15+ param handling - assume params is a promise we need to unwrap
    // But strictly in Next 14 app directory params is prop. 
    // However, user setup uses latest nextjs which might need React.use()
    // Let's safe guard. In client components, params passed as prop might be async in 15.
    // We'll trust the prop is passed directly for now or handle use().

    // NOTE: In Next.js 15, params is async. Let's use React.use() if strictly needed, 
    // but for standard scaffolding let's assume standard prop access or await.
    // Actually, let's play safe and allow the component to resolve it if it's a promise,
    // but standard client components receive them as props. 

    const router = useRouter();
    const [tenant, setTenant] = useState(null);
    const [modules, setModules] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resetPasswordModal, setResetPasswordModal] = useState({ isOpen: false, user: null, password: '' });

    // Unwrap params safely
    const { id } = use(params);

    useEffect(() => {
        if (id) {
            fetchDetails();
        }
    }, [id]);

    const fetchDetails = async () => {
        try {
            // 1. Get Tenant Details
            const tenantRes = await api.get(`/tenants/${id}`); // Note: Backend route needs to be authenticated
            setTenant(tenantRes.data.tenant);

            // 2. Get Modules for this tenant (using our new Super Admin route)
            const modulesRes = await api.get(`/modules/admin/tenants/${id}/modules`);
            setModules(modulesRes.data.modules);

            // 3. Get Users for this tenant
            const usersRes = await api.get(`/admin/tenants/${id}/users`);
            setUsers(usersRes.data.users);

        } catch (err) {
            console.error("Failed to fetch tenant details", err);
        } finally {
            setLoading(false);
        }
    };

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, module: null });

    const initiateToggle = (module) => {
        setConfirmModal({ isOpen: true, module });
    };

    const handleConfirmToggle = async () => {
        if (!confirmModal.module) return;

        const { name, is_enabled } = confirmModal.module;
        const newStatus = !is_enabled;

        // Optimistic update
        setModules(mods => mods.map(m =>
            m.name === name ? { ...m, is_enabled: newStatus } : m
        ));

        setConfirmModal({ isOpen: false, module: null });

        try {
            await api.post(`/modules/admin/tenants/${id}/modules/${name}/toggle`, {
                is_enabled: newStatus
            });
        } catch (err) {
            console.error("Failed to toggle module", err);
            fetchDetails(); // Revert on failure
            alert("Failed to update module status");
        }
    };

    const handleResetPassword = async () => {
        if (!resetPasswordModal.user || !resetPasswordModal.password) {
            alert("Please enter a password");
            return;
        }

        try {
            await api.post(`/admin/tenants/${id}/users/${resetPasswordModal.user.id}/reset-password`, {
                password: resetPasswordModal.password
            });
            alert(`Password reset successfully for ${resetPasswordModal.user.email}`);
            setResetPasswordModal({ isOpen: false, user: null, password: '' });
        } catch (err) {
            console.error("Failed to reset password", err);
            alert("Failed to reset password");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!tenant) return <div>Tenant not found</div>;

    return (
        <div>
            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tenants
            </button>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">{tenant.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{tenant.id}</span>
                            <span>•</span>
                            <span className="font-mono text-blue-600">{tenant.subdomain}.platform.com</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={`/tenants/${id}/rate-limit`}
                            className="text-sm bg-amber-100 text-amber-800 px-3 py-1.5 rounded hover:bg-amber-200 transition flex items-center gap-2"
                        >
                            Rate limit settings
                        </Link>
                        <Link
                            href={`/tenants/${id}/products`}
                            className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-800 transition flex items-center gap-2"
                        >
                            Manage Products (Test)
                        </Link>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                <span>Module Management</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((mod) => (
                    <div key={mod.name} className={cn(
                        "border rounded-lg p-5 flex flex-col justify-between transition-all",
                        mod.is_enabled ? "bg-white border-green-200 shadow-sm" : "bg-gray-50 border-gray-200 opacity-75"
                    )}>
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900">{mod.display_name}</h3>
                                {mod.is_core && <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-600">CORE</span>}
                            </div>
                            <p className="text-sm text-gray-500 mb-4">{mod.description}</p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t">
                            <span className={cn("text-xs font-bold uppercase", mod.is_enabled ? "text-green-600" : "text-gray-400")}>
                                {mod.is_enabled ? "Enabled" : "Disabled"}
                            </span>

                            {!mod.is_core && (
                                <button
                                    onClick={() => initiateToggle(mod)}
                                    className={cn(
                                        "px-3 py-1.5 rounded text-xs font-bold transition-colors",
                                        mod.is_enabled
                                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                                            : "bg-green-50 text-green-600 hover:bg-green-100"
                                    )}
                                >
                                    {mod.is_enabled ? "Disable" : "Enable"}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Users Section */}
            <h2 className="text-xl font-bold mb-4 mt-12">Tenant Users</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">Name</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">Email</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">Role</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">Status</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">Last Login</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No users found for this tenant.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        {user.first_name || user.last_name
                                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                            : '—'}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                            {user.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2 py-1 rounded text-xs font-medium",
                                            user.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                                        )}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {user.last_login_at
                                            ? new Date(user.last_login_at).toLocaleDateString()
                                            : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setResetPasswordModal({ isOpen: true, user, password: '' })}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            Reset Password
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Reset Password Modal */}
            {resetPasswordModal.isOpen && resetPasswordModal.user && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-bold mb-2">
                            Reset Password for {resetPasswordModal.user.email}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Enter a new password for this user. They will be able to log in with this password immediately.
                        </p>
                        <input
                            type="text"
                            placeholder="New password"
                            value={resetPasswordModal.password}
                            onChange={(e) => setResetPasswordModal(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full border rounded px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setResetPasswordModal({ isOpen: false, user: null, password: '' })}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetPassword}
                                className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
                            >
                                Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.isOpen && confirmModal.module && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-bold mb-2">
                            {confirmModal.module.is_enabled ? 'Disable' : 'Enable'} {confirmModal.module.display_name}?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to {confirmModal.module.is_enabled ? 'disable' : 'enable'} the <strong>{confirmModal.module.display_name}</strong> module for this tenant?
                            {confirmModal.module.is_enabled && " This may restrict access to related features."}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, module: null })}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmToggle}
                                className={cn(
                                    "px-4 py-2 rounded text-white font-medium",
                                    confirmModal.module.is_enabled
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-green-600 hover:bg-green-700"
                                )}
                            >
                                Confirm {confirmModal.module.is_enabled ? 'Disable' : 'Enable'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
