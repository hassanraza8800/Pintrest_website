import { readProducts } from "@/lib/fileHandler";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink, Tag, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ProductDescription from "@/components/ProductDescription";

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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
                    {/* Left: Product Image Gallery */}
                    <div className="lg:col-span-7">
                        <ProductGallery images={product.images} title={product.title} />
                    </div>

                    {/* Right: Product Details */}
                    <div className="lg:col-span-5 flex flex-col pt-0 lg:pt-4">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                                    {product.category || 'All'}
                                </span>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
                                    {product.title}
                                </h1>
                                {product.price && (
                                    <p className="text-xl sm:text-2xl text-gray-500 font-bold mt-1">
                                        {product.price}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {product.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="px-2.5 py-1 bg-gray-50 text-gray-400 text-[10px] sm:text-[11px] font-bold rounded-lg border border-gray-100 uppercase tracking-wider">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-6 sm:pt-8 border-t border-gray-100">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Product Overview</h3>
                                <ProductDescription description={product.description} />
                            </div>

                            <div className="bg-gray-50/50 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 space-y-6 border border-gray-100">
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-50">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Quality</span>
                                            <span className="text-[11px] font-bold text-gray-900 truncate">Verified</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-50">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Offer</span>
                                            <span className="text-[11px] font-bold text-gray-900 truncate">Limited</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <a
                                        href={product.affiliate_link}
                                        target="_blank"
                                        rel="nofollow sponsored"
                                        className="flex items-center justify-center w-full py-4 sm:py-5 px-6 sm:px-8 bg-gray-900 hover:bg-primary text-white hover:text-green-500 font-black rounded-xl sm:rounded-2xl transition-all shadow-xl shadow-gray-200 hover:shadow-green-200 hover:-translate-y-1 active:scale-[0.98] group text-sm sm:text-base"
                                    >
                                        <span className="mr-2 sm:mr-3">Shop Now </span>
                                        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </a>
                                    <p className="text-center text-[9px] text-gray-400 font-medium">
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
