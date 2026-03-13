import { readProducts } from "@/lib/fileHandler";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink, Tag, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
    const products = await readProducts();
    const product = products.find((p) => p.slug.toLowerCase().trim() === decodedSlug);

    if (!product) return { title: "Product Not Found" };

    return {
        title: `${product.title} | AffiliateShop`,
        openGraph: {
            title: product.title,
            description: product.description,
            images: (product.images && product.images.length > 0) ? [product.images[0]] : [],
        },
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
    const products = await readProducts();
    const product = products.find((p) => p.slug.toLowerCase().trim() === decodedSlug);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8 md:mb-12">
                    <Link href="/" className="hover:text-primary transition-colors flex items-center">
                        Home
                    </Link>
                    <span className="text-gray-300">/</span>
                    <Link href="/products" className="hover:text-primary transition-colors">
                        Collections
                    </Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    {/* Left: Product Image */}
                    <div className="lg:col-span-7">
                        <div className="relative aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden bg-gray-50 shadow-2xl shadow-gray-200/50 group">
                            <Image
                                src={(product.images && product.images.length > 0) ? product.images[0] : "/placeholder.jpg"}
                                alt={product.title}
                                fill
                                className="object-contain p-4 md:p-8 hover:scale-105 transition-transform duration-700"
                                priority
                                sizes="(max-width: 1024px) 100vw, 60vw"
                            />
                        </div>
                    </div>

                    {/* Right: Product Details */}
                    <div className="lg:col-span-5 flex flex-col pt-4">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                                    {product.category}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
                                    {product.title}
                                </h1>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {product.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-500 text-[11px] font-bold rounded-lg border border-gray-100 uppercase tracking-wider">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-gray-100">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Product Overview</h3>
                                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                    {product.description}
                                </div>
                            </div>

                            <div className="bg-gray-50/50 rounded-3xl p-6 md:p-8 space-y-6 border border-gray-100">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3 p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
                                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Quality</span>
                                            <span className="text-xs font-bold text-gray-900">Verified</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Offer</span>
                                            <span className="text-xs font-bold text-gray-900">Limited</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <a
                                        href={product.affiliate_link}
                                        target="_blank"
                                        rel="nofollow sponsored"
                                        className="flex items-center justify-center w-full py-5 px-8 bg-gray-900 hover:bg-primary text-white hover:text-green-500 font-black rounded-2xl transition-all shadow-xl shadow-gray-200 hover:shadow-green-200 hover:-translate-y-1 active:scale-[0.98] group"
                                    >
                                        <span className="mr-3">Shop Now </span>
                                        <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </a>
                                    <p className="text-center text-[10px] text-gray-400 font-medium">
                                        Pricing and availability are subject to merchant site.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
