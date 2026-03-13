"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/fileHandler";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const handleSearch = (e: any) => {
            setSearchQuery(e.detail.toLowerCase());
        };
        window.addEventListener('productSearch', handleSearch);
        return () => window.removeEventListener('productSearch', handleSearch);
    }, []);

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchQuery) ||
        p.description.toLowerCase().includes(searchQuery) ||
        p.category.toLowerCase().includes(searchQuery) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery))
    );

    if (filteredProducts.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-400 text-lg italic">No products match your search.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
            {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
