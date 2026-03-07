"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Image from "next/image";

export default function EditProduct() {
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        image: "",
        affiliate_link: "",
        category: "",
        tags: "",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        const res = await fetch("/api/products");
        const products = await res.json();
        const product = products.find((p: any) => p.id === id);

        if (product) {
            setFormData({
                ...product,
                tags: product.tags.join(", "),
            });
        } else {
            alert("Product not found");
            router.push("/admin-secret/dashboard");
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = new FormData();
            payload.append("id", id as string);
            payload.append("title", formData.title);
            payload.append("slug", formData.slug);
            payload.append("description", formData.description);
            payload.append("affiliate_link", formData.affiliate_link);
            payload.append("category", formData.category);
            payload.append("tags", formData.tags);

            if (formData.image) {
                payload.append("image", formData.image);
            }
            if (imageFile) {
                payload.append("image_file", imageFile);
            }

            const res = await fetch("/api/products", {
                method: "PUT",
                body: payload,
            });

            if (res.ok) {
                router.push("/admin-secret/dashboard");
            } else {
                const errorData = await res.json();
                alert(`Failed to update product: ${errorData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Error updating product:', err);
            alert("An error occurred while updating the product.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link
                    href="/admin-secret/dashboard"
                    className="inline-flex items-center text-gray-500 hover:text-primary mb-8 font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-primary px-8 py-6 text-white">
                        <h1 className="text-2xl font-black">Edit Product</h1>
                        <p className="text-white/80 text-sm">Modify existing details for ID: {id}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Product Title</label>
                                <input
                                    required
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">URL Slug</label>
                                <input
                                    required
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Description</label>
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none resize-none"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Product Image</label>

                            {/* Current Image Preview */}
                            {formData.image && (
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                    <Image
                                        src={formData.image}
                                        alt="Current product image"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Upload New Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setImageFile(e.target.files[0]);
                                            }
                                        }}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-sm"
                                    />
                                    <p className="text-[10px] text-gray-400">Replaces the current image on Drive</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">OR Edit Image URL</label>
                                    <input
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-sm"
                                        placeholder="https://drive.google.com/..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Affiliate Link</label>
                            <input
                                required
                                name="affiliate_link"
                                value={formData.affiliate_link}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none font-mono text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Category</label>
                                <input
                                    required
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Tags (comma separated)</label>
                                <input
                                    required
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center w-full py-3 bg-primary border border-gray-200 text-gray-900 hover:bg-orange-500 hover:text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.98]"
                        >
                            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                            <span>Update Product Listing</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
