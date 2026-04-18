"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, X, Upload, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

export default function EditProduct() {
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        price: "",
        affiliate_link: "",
        category: "",
        tags: "",
    });
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newUrl, setNewUrl] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products?id=${id}`);
            const product = await res.json();

            if (!product?.error) {
                setFormData({
                    title: product.title || "",
                    slug: product.slug || "",
                    description: product.description || "",
                    price: product.price || "",
                    affiliate_link: product.affiliate_link || "",
                    category: product.category || "",
                    tags: product.tags ? product.tags.join(", ") : "",
                });
                setExistingImages(product.images || []);
            } else {
                alert("Product not found");
                router.push("/admin-secret/dashboard");
            }
        } catch (error) {
            console.error("Error fetching product:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewImageFiles((prev) => [...prev, ...files]);
            
            const previews = files.map(file => URL.createObjectURL(file));
            setNewPreviews((prev) => [...prev, ...previews]);
        }
    };

    const removeNewFile = (index: number) => {
        URL.revokeObjectURL(newPreviews[index]);
        setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
        setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const addNewImageUrl = () => {
        if (newUrl.trim()) {
            setExistingImages((prev) => [...prev, newUrl.trim()]);
            setNewUrl("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (existingImages.length === 0 && newImageFiles.length === 0) {
            alert("Please keep or add at least one image.");
            return;
        }
        setSaving(true);

        try {
            const payload = new FormData();
            payload.append("id", id as string);
            payload.append("title", formData.title);
            payload.append("slug", formData.slug);
            payload.append("description", formData.description);
            payload.append("price", formData.price);
            payload.append("affiliate_link", formData.affiliate_link);
            payload.append("category", formData.category);
            payload.append("tags", formData.tags);

            // Send remaining existing images
            existingImages.forEach(url => payload.append("images", url));
            // Send new files
            newImageFiles.forEach(file => payload.append("image_file", file));

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
            <div className="container mx-auto px-4 max-w-4xl">
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
                        <p className="text-white/80 text-sm">Modify existing details and manage images for ID: {id}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Basic Info */}
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

                        {/* Image Management Section */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider block">Manage Images</label>
                            
                            {/* Current and New Previews */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                                {existingImages.map((src, index) => (
                                    <div key={`existing-${index}`} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                                        <Image src={src} alt="Existing" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gray-500/80 text-white text-[8px] py-0.5 text-center font-bold uppercase tracking-tighter">Current</div>
                                    </div>
                                ))}
                                {newPreviews.map((src, index) => (
                                    <div key={`new-${index}`} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-primary/20 shadow-sm">
                                        <Image src={src} alt="New Preview" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeNewFile(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[8px] py-0.5 text-center font-bold uppercase tracking-tighter">New</div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all bg-gray-50"
                                >
                                    <Upload className="w-6 h-6 mb-2" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Add More</span>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* Manual URL Input */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-sm"
                                        placeholder="Add more by URL..."
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={addNewImageUrl}
                                    className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-primary transition-colors text-sm"
                                >
                                    Add URL
                                </button>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Price</label>
                                    <input
                                        required
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                    />
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
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center w-full py-4 bg-primary border border-gray-200 text-gray-900 hover:bg-orange-500 hover:text-white font-black rounded-xl shadow-lg transition-all active:scale-[0.98]"
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
