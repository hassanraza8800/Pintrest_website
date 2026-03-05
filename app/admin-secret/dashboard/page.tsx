"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, LogOut, Package, AlertTriangle, X } from "lucide-react";
import { Product } from "@/lib/fileHandler";
import { useRouter } from "next/navigation";

// ─── Delete Confirmation Modal ──────────────────────────────────────────────
function DeleteModal({
    product,
    onClose,
    onConfirm,
}: {
    product: Product;
    onClose: () => void;
    onConfirm: () => void;
}) {
    const [input, setInput] = useState("");
    const matches = input === product.title;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <h2 className="font-black text-gray-900 text-lg">Delete Product</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    <p className="text-gray-500 text-sm">
                        This action is <span className="font-bold text-gray-800">permanent</span> and cannot be undone.
                        To confirm, type the product name below.
                    </p>

                    {/* Display product name to match */}
                    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold mb-1">Product to delete</p>
                        <p className="font-bold text-gray-900 text-sm select-all">{product.title}</p>
                    </div>

                    {/* Input */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                            Type product name to confirm
                        </label>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`e.g. ${product.title}`}
                            className="w-full px-4 py-3 border rounded-xl outline-none text-sm transition-all
                                border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100
                                placeholder-gray-300"
                            autoFocus
                        />
                        {input.length > 0 && !matches && (
                            <p className="text-xs text-red-500 mt-1.5 font-medium">Name does not match — please type it exactly.</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!matches}
                        className="px-5 py-2.5 text-sm font-black text-white rounded-lg transition-all
                            bg-red-500 hover:bg-red-600 shadow-sm
                            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-500"
                    >
                        Delete Product
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
        setLoading(false);
    };

    const handleDeleteConfirmed = async () => {
        if (!deleteTarget) return;
        const res = await fetch(`/api/products?id=${deleteTarget.id}`, { method: "DELETE" });
        if (res.ok) {
            setProducts(products.filter((p) => p.id !== deleteTarget.id));
        } else {
            alert("Failed to delete product");
        }
        setDeleteTarget(null);
    };

    const handleLogout = async () => {
        await fetch("/api/auth", { method: "DELETE" });
        router.push("/admin-secret");
    };

    return (
        <>
            {/* Delete Modal */}
            {deleteTarget && (
                <DeleteModal
                    product={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDeleteConfirmed}
                />
            )}

            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0 text-center md:text-left">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Dashboard</h1>
                            <p className="text-gray-500">Manage your affiliate catalogue</p>
                        </div>
                        <div className="flex items-center justify-center space-x-4">
                            <Link
                                href="/admin-secret/create"
                                className="flex items-center justify-center px-5 py-2.5 bg-primary border border-gray-200 text-gray-900 hover:bg-orange-500 hover:text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.98]"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Product
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="p-3 text-gray-400 hover:text-red-600 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">No products yet</h3>
                            <p className="text-gray-500 mb-6">Start by adding your first affiliate product.</p>
                            <Link href="/admin-secret/create" className="text-primary font-bold hover:underline">
                                Create a new product now &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Product</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Category</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Tags</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {products.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-4">
                                                        <img
                                                            src={product.image}
                                                            alt=""
                                                            className="w-12 h-12 rounded-lg object-cover ring-1 ring-gray-100"
                                                        />
                                                        <div>
                                                            <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{product.title}</div>
                                                            <div className="text-xs text-gray-400 font-mono truncate max-w-[200px]">{product.slug}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {product.tags.slice(0, 3).map((tag) => (
                                                            <span key={tag} className="text-[10px] text-gray-400">#{tag}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <Link
                                                            href={`/admin-secret/edit/${product.id}`}
                                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => setDeleteTarget(product)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
