import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Product } from "@/lib/fileHandler";

export default function ProductCard({ product }: { product: Product }) {
    return (
        <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full relative">
            {/* Link to Detail Page */}
            <Link
                href={`/product/${encodeURIComponent(product.slug)}`}
                className="flex flex-col h-full"
            >
                <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                        src={(product.images && product.images.length > 0) ? product.images[0] : "/placeholder.jpg"}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-3 right-3">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-gray-700 shadow-sm uppercase">
                            {product.category}
                        </span>
                    </div>
                </div>

                <div className="p-4 mb-16 flex flex-col flex-grow">
                    <div className="mb-2">
                        {product.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mr-2">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {product.title}
                    </h3>

                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                        {product.description}
                    </p>
                </div>
            </Link>

            {/* Shop Now Button - Direct to Affiliate Link */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pt-0 bg-white">
                <a
                    href={product.affiliate_link}
                    target="_blank"
                    rel="nofollow sponsored"
                    className="w-full flex items-center justify-center space-x-2 bg-white group-hover:bg-primary border border-gray-200 group-hover:border-primary text-gray-900 group-hover:text-orange-500 font-bold py-2.5 px-4 rounded-lg transition-all duration-200 text-sm shadow-sm"
                >
                    <span>Shop Now</span>
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
}
