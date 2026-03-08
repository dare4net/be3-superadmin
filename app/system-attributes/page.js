"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ArrowLeft, Plus, Edit2, Trash2, X, Shield, Loader2, Braces, RefreshCw } from 'lucide-react';

export default function SystemAttributesPage() {
    const router = useRouter();

    const [attributes, setAttributes] = useState([]);
    const [variables, setVariables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState(null);
    const [backfilling, setBackfilling] = useState(false);

    const [formData, setFormData] = useState({
        label: '', code: '', default_value: '', description: ''
    });
    const [valueMode, setValueMode] = useState('text'); // 'text' or a variable name

    useEffect(() => {
        Promise.all([fetchAttributes(), fetchVariables()]).finally(() => setLoading(false));
    }, []);

    const fetchAttributes = async () => {
        try {
            const res = await api.get('/admin/system-attributes');
            if (res.data.success) setAttributes(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch system attributes', error);
        }
    };

    const fetchVariables = async () => {
        try {
            const res = await api.get('/admin/variables');
            if (res.data.success) setVariables(res.data.variables || []);
        } catch (error) {
            console.error('Failed to fetch variables', error);
        }
    };

    const isVariable = (val) => val && /^\[[A-Z_][A-Z0-9_]*\]$/.test(val);

    const handleCreate = () => {
        setEditingAttribute(null);
        setFormData({ label: '', code: '', default_value: '', description: '' });
        setValueMode('text');
        setIsModalOpen(true);
    };

    const handleEdit = (attr) => {
        setEditingAttribute(attr);
        const val = attr.default_value || '';
        // Detect if current value is a variable
        if (isVariable(val)) {
            const varName = val.slice(1, -1); // strip [ ]
            setValueMode(varName);
        } else {
            setValueMode('text');
        }
        setFormData({
            label: attr.label, code: attr.code,
            default_value: val, description: attr.description || ''
        });
        setIsModalOpen(true);
    };

    const handleValueModeChange = (mode) => {
        setValueMode(mode);
        if (mode === 'text') {
            setFormData(prev => ({ ...prev, default_value: '' }));
        } else {
            // Set value to [VARIABLE_NAME]
            setFormData(prev => ({ ...prev, default_value: `[${mode}]` }));
        }
    };

    const handleDelete = async (attr) => {
        if (!confirm(`Delete system attribute "${attr.label}"? This affects ALL tenants.`)) return;
        try {
            await api.delete(`/admin/system-attributes/${attr.id}`);
            fetchAttributes();
        } catch (error) {
            alert('Failed to delete attribute');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAttribute) {
                await api.put(`/admin/system-attributes/${editingAttribute.id}`, formData);
            } else {
                await api.post('/admin/system-attributes', formData);
            }
            fetchAttributes();
            setIsModalOpen(false);
        } catch (error) {
            alert('Save failed: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleBackfill = async () => {
        if (!confirm('Apply all system attributes to every existing product across all tenants?')) return;
        setBackfilling(true);
        try {
            const res = await api.post('/admin/system-attributes/backfill');
            alert(res.data.message || `Done! Updated ${res.data.updated} products.`);
        } catch (error) {
            alert('Backfill failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setBackfilling(false);
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
            <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="w-6 h-6 text-indigo-600" />
                        System Attributes
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Global read-only attributes. Automatically applied to every product across all tenants.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleBackfill} disabled={backfilling || attributes.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 border border-amber-300 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed">
                        <RefreshCw className={`w-4 h-4 ${backfilling ? 'animate-spin' : ''}`} />
                        {backfilling ? 'Applying...' : 'Backfill Products'}
                    </button>
                    <button onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
                        <Plus className="w-4 h-4" /> New Attribute
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                    <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        Platform-Wide ({attributes.length})
                    </h2>
                    <span className="text-xs text-indigo-400">Auto-applied on product creation</span>
                </div>
                {attributes.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-400 text-sm">
                        No system attributes defined yet.
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Label</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Code</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Value</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Description</th>
                                <th className="px-6 py-3 text-right font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {attributes.map(attr => (
                                <tr key={attr.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                        {attr.label}
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{attr.code}</code>
                                    </td>
                                    <td className="px-6 py-4">
                                        {attr.default_value ? (
                                            isVariable(attr.default_value) ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
                                                    <Braces className="w-3 h-3" />
                                                    {attr.default_value}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-700">&quot;{attr.default_value}&quot;</span>
                                            )
                                        ) : (
                                            <span className="text-xs text-gray-300">Not set</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs max-w-[200px] truncate">
                                        {attr.description || '—'}
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
                                    <input type="text" required
                                        className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. Vendor"
                                        value={formData.label}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData(prev => ({
                                                ...prev, label: val,
                                                code: editingAttribute ? prev.code : val.toLowerCase().replace(/[^a-z0-9_]+/g, '_')
                                            }));
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Code</label>
                                    <input type="text" required
                                        className="w-full px-3 py-2.5 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.code}
                                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, '_') }))}
                                    />
                                </div>
                            </div>

                            {/* Value: dropdown of Text + Variables */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Value Source</label>
                                <select
                                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    value={valueMode}
                                    onChange={(e) => handleValueModeChange(e.target.value)}
                                >
                                    <option value="text">Text (custom value)</option>
                                    {variables.map(v => (
                                        <option key={v.name} value={v.name}>
                                            [{v.name}] — {v.description || 'No description'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Text input only shows when 'text' is selected */}
                            {valueMode === 'text' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Text Value</label>
                                    <input type="text"
                                        className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Enter a fixed value..."
                                        value={formData.default_value}
                                        onChange={(e) => setFormData(prev => ({ ...prev, default_value: e.target.value }))}
                                    />
                                </div>
                            )}

                            {/* Variable feedback */}
                            {valueMode !== 'text' && (
                                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-xs text-emerald-700 flex items-center gap-2">
                                    <Braces className="w-4 h-4 flex-shrink-0" />
                                    <span>Value will be dynamically resolved from <strong>[{valueMode}]</strong> for each product</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                                <input type="text"
                                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="What is this attribute for?"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>

                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-xs text-indigo-700">
                                <strong>How it works:</strong> This attribute is automatically applied to every product when created.
                                Users never see or edit it.
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                                    {editingAttribute ? 'Update' : 'Create'}
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
