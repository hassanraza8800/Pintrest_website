import ProductGrid from "@/components/ProductGrid";
import { getRemoteProducts } from "@/lib/remoteApi";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function Home() {
    const products = await getRemoteProducts();
    const featuredProducts = products.slice(0, 4);

    return (
        <div className="flex flex-col space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative h-[400px] md:h-[500px] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop"
                        alt="Hero background"
                        className="w-full h-full object-cover opacity-40 shrink-0"
                    />
                </div>
                <div className="container mx-auto px-4 z-10 text-center">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 tracking-tight px-4 sm:px-0">
                        Beauty & Bags <span className="text-primary">Curated</span> for You
                    </h1>
                    <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                        Premium skincare, stunning bags, and beauty essentials —
                        handpicked to elevate your everyday style.
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-6 sm:px-8 py-3.5 sm:py-4 bg-primary hover:bg-red-700 text-white font-bold rounded-full transition-all text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
                    >
                        Explore Our Collection
                        <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                </div>
            </section>

            {/* Featured Products */}
            <section className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0 text-center md:text-left">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Our Collection</h2>
                        <p className="text-gray-500 mt-2">Premium beauty and stylish bags, curated for you.</p>
                    </div>
                </div>

                <ProductGrid products={featuredProducts} />

                <div className="mt-16 text-center">
                    <Link
                        href="/products"
                        className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-black transition-all shadow-md"
                    >
                        View More Products
                    </Link>
                </div>
            </section>
        </div>
    );
}
