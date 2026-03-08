"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ArrowLeft, Plus, Edit2, Trash2, X, Tag, Shield, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SystemAttributesPage({ params }) {
    const router = useRouter();
    const { id } = use(params);

    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        label: '', code: '', type: 'select',
        options: [], is_system: true
    });
    const [optionInput, setOptionInput] = useState('');

    useEffect(() => {
        if (id) fetchAttributes();
    }, [id]);

    const fetchAttributes = async () => {
        try {
            const res = await api.get(`/products/admin/tenants/${id}/attributes`);
            if (res.data.success) {
                const parsed = (res.data.data || []).map(attr => ({
                    ...attr,
                    options: typeof attr.options === 'string' ? JSON.parse(attr.options || '[]') : (attr.options || [])
                }));
                setAttributes(parsed);
            }
        } catch (error) {
            console.error('Failed to fetch attributes', error);
        } finally {
            setLoading(false);
        }
    };

    const systemAttributes = attributes.filter(a => a.is_system);
    const regularAttributes = attributes.filter(a => !a.is_system);

    const handleCreate = () => {
        setEditingAttribute(null);
        setFormData({ label: '', code: '', type: 'select', options: [], is_system: true });
        setOptionInput('');
        setIsModalOpen(true);
    };

    const handleEdit = (attr) => {
        setEditingAttribute(attr);
        setFormData({
            label: attr.label,
            code: attr.code,
            type: attr.type,
            options: attr.options || [],
            is_system: attr.is_system ?? true
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (attr) => {
        if (!confirm(`Delete system attribute "${attr.label}"? This will remove it from all products.`)) return;
        try {
            await api.delete(`/products/admin/tenants/${id}/attributes/${attr.id}`);
            fetchAttributes();
        } catch (error) {
            alert('Failed to delete attribute');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                options: JSON.stringify(formData.options)
            };

            if (editingAttribute) {
                await api.put(`/products/admin/tenants/${id}/attributes/${editingAttribute.id}`, payload);
            } else {
                await api.post(`/products/admin/tenants/${id}/attributes`, payload);
            }

            fetchAttributes();
            setIsModalOpen(false);
        } catch (error) {
            alert('Save failed');
        }
    };

    const addOption = () => {
        const clean = optionInput.trim();
        if (clean && !formData.options.includes(clean)) {
            setFormData(prev => ({ ...prev, options: [...prev.options, clean] }));
            setOptionInput('');
        }
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
                Back to Tenant
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="w-6 h-6 text-indigo-600" />
                        System Attributes
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Managed exclusively by the super admin. Hidden from the admin dashboard.
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    New System Attribute
                </button>
            </div>

            {/* System Attributes */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
                    <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        System Attributes ({systemAttributes.length})
                    </h2>
                </div>
                {systemAttributes.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-400 text-sm">
                        No system attributes defined yet. Create one to get started.
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Label</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Code</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Type</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Options</th>
                                <th className="px-6 py-3 text-right font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {systemAttributes.map(attr => (
                                <tr key={attr.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-indigo-500" />
                                        {attr.label}
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{attr.code}</code>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{attr.type}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {(attr.options || []).slice(0, 3).map((o, i) => (
                                                <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                                                    {typeof o === 'string' ? o : o.label}
                                                </span>
                                            ))}
                                            {(attr.options || []).length > 3 && (
                                                <span className="text-xs text-gray-400">+{attr.options.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleEdit(attr)} className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(attr)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Regular Attributes (read-only view) */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Regular Attributes ({regularAttributes.length})
                    </h2>
                </div>
                {regularAttributes.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-400 text-sm">
                        No regular attributes defined by the tenant admin.
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Label</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Code</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {regularAttributes.map(attr => (
                                <tr key={attr.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-medium text-gray-900">{attr.label}</td>
                                    <td className="px-6 py-3">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{attr.code}</code>
                                    </td>
                                    <td className="px-6 py-3 text-gray-600">{attr.type}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-5 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingAttribute ? 'Edit' : 'Create'} System Attribute
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Label</label>
                                    <input
                                        type="text" required
                                        className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. Vendor"
                                        value={formData.label}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                label: val,
                                                code: editingAttribute ? prev.code : val.toLowerCase().replace(/[^a-z0-9_]+/g, '_')
                                            }));
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Code</label>
                                    <input
                                        type="text" required
                                        className="w-full px-3 py-2.5 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.code}
                                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, '_') }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
                                <select
                                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                >
                                    <option value="select">Dropdown</option>
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="multiselect">Multi-select</option>
                                    <option value="boolean">Boolean</option>
                                </select>
                            </div>

                            {(formData.type === 'select' || formData.type === 'multiselect') && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Options</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Add option..."
                                            value={optionInput}
                                            onChange={(e) => setOptionInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }}
                                        />
                                        <button type="button" onClick={addOption} className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200">
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {formData.options.map((o, i) => (
                                            <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs">
                                                {typeof o === 'string' ? o : o.label}
                                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, options: prev.options.filter((_, idx) => idx !== i) }))} className="hover:text-red-600">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-indigo-600 rounded"
                                    checked={formData.is_system}
                                    onChange={(e) => setFormData(prev => ({ ...prev, is_system: e.target.checked }))}
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">System Attribute</p>
                                    <p className="text-xs text-gray-500">Hidden from tenant admin. Only manageable here.</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                                    {editingAttribute ? 'Update' : 'Create'} Attribute
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
