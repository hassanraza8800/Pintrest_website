"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function CreateProduct() {
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
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = new FormData();
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
                method: "POST",
                // Notice: DO NOT set 'Content-Type' manually when sending FormData
                body: payload,
            });

            if (res.ok) {
                router.push("/admin-secret/dashboard");
            } else {
                const errorData = await res.json();
                alert(`Failed to create product: ${errorData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Error creating product:', err);
            alert("An error occurred while creating the product.");
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="text-2xl font-black">Add New Product</h1>
                        <p className="text-white/80 text-sm">Create a new affiliate listing for your Pinterest audience</p>
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
                                    placeholder="e.g. Minimalist Ceramic Vase"
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
                                    placeholder="e.g. minimalist-ceramic-vase"
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
                                placeholder="Write a compelling description that Pinterest users will love..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Upload Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setImageFile(e.target.files[0]);
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                />
                                <p className="text-xs text-gray-500">To upload to Google Drive automatically</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">OR Image URL</label>
                                <input
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                    placeholder="https://images.unsplash.com/..."
                                />
                                <p className="text-xs text-gray-500">Provide a direct URL if not uploading</p>
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
                                placeholder="https://amzn.to/..."
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
                                    placeholder="e.g. Home Decor"
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
                                    placeholder="decor, minimal, kitchen"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary hover:bg-green-700 text-gray-600 font-black rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center hover:text-white justify-center space-x-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                            <span>Save Product Listing</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
