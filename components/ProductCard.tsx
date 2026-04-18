import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Product } from "@/lib/fileHandler";

export default function ProductCard({ product }: { product: Product }) {
    const imageSrc = (product.images && product.images.length > 0) ? product.images[0] : "/logo.png";

    return (
        <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full relative">
            {/* Link to Detail Page */}
            <Link
                href={`/product/${encodeURIComponent(product.slug)}`}
                className="flex flex-col h-full"
            >
                <div className="relative aspect-[1/1] overflow-hidden bg-gray-50/50">
                    <img
                        src={imageSrc}
                        alt={product.title}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            img.onerror = null;
                            img.src = "/logo.png";
                        }}
                    />
                    <div className="absolute top-2 left-2">
                        <span className="bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[7px] sm:text-[9px] font-black text-gray-700 shadow-sm uppercase tracking-tighter">
                            {product.category || 'All'}
                        </span>
                    </div>
                </div>

                <div className="p-2 sm:p-4 mb-12 sm:mb-16 flex flex-col flex-grow">
                    <div className="mb-1 flex flex-wrap gap-1">
                        {product.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[7px] sm:text-[10px] uppercase tracking-tighter text-gray-400 font-black">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <h3 className="font-bold text-[11px] sm:text-lg text-gray-900 line-clamp-1 group-hover:text-primary transition-colors leading-tight">
                        {product.title}
                    </h3>
                    {product.price && (
                        <p className="text-gray-600 font-bold text-[11px] sm:text-lg mt-0.5">
                            {product.price}
                        </p>
                    )}

                    <p className="text-gray-500 text-[10px] sm:text-sm mt-1 line-clamp-1 sm:line-clamp-2 leading-relaxed italic">
                        {product.description}
                    </p>
                </div>
            </Link>

            {/* Shop Now Button - Direct to Affiliate Link */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 pt-0 bg-white">
                <a
                    href={product.affiliate_link}
                    target="_blank"
                    rel="nofollow sponsored"
                    className="w-full flex items-center justify-center space-x-1 sm:space-x-2 bg-gray-50 group-hover:bg-primary border border-gray-100 group-hover:border-primary text-gray-900 group-hover:text-green-500 font-black py-1.5 sm:py-2.5 px-2 rounded-lg transition-all duration-200 text-[9px] sm:text-sm shadow-sm"
                >
                    <span>Shop Now</span>
                    <ExternalLink className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                </a>
            </div>
        </div>
    );
}
