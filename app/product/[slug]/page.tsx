import { readProducts } from "@/lib/fileHandler";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink, Tag, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const products = await readProducts();
    const product = products.find((p) => p.slug === params.slug);

    if (!product) return { title: "Product Not Found" };

    return {
        title: `${product.title} | AffiliateShop`,
        description: product.description,
        openGraph: {
            title: product.title,
            description: product.description,
            images: [product.image],
        },
    };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const products = await readProducts();
    const product = products.find((p) => p.slug === params.slug);

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Image Gallery (Simplified) */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl ring-1 ring-gray-200">
                        <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col space-y-8">
                        <nav className="flex text-sm text-gray-500 space-x-2">
                            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                            <span>/</span>
                            <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
                            <span>/</span>
                            <span className="text-gray-900 font-medium truncate">{product.title}</span>
                        </nav>

                        <div className="space-y-4">
                            <span className="inline-flex items-center px-3 py-1 bg-red-50 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                                {product.category}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                                {product.title}
                            </h1>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {product.tags.map(tag => (
                                <span key={tag} className="flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                                    <Tag className="w-4 h-4 mr-2 text-gray-400" />
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg text-gray-900 underline decoration-primary decoration-4 underline-offset-4">Why we love this</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {product.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />
                                    <span>Quality Assured</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-blue-500" />
                                    <span>Limited Time Deal</span>
                                </div>
                            </div>

                            <a
                                href={product.affiliate_link}
                                target="_blank"
                                rel="nofollow sponsored"
                                className="relative group w-full flex items-center justify-center space-x-3 bg-primary hover:bg-red-700 text-white font-black py-5 px-8 rounded-xl transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1 text-xl overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 group-active:bg-white/20 transition-colors" />
                                <span>Check Price on Merchant</span>
                                <ExternalLink className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </a>

                            <p className="text-center text-xs text-gray-400">
                                You will be redirected to an external website. Ad-supported link.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
