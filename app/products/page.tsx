import ProductGrid from "@/components/ProductGrid";
import { readProducts } from "@/lib/fileHandler";

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}) {
    const { category } = await searchParams;
    const allProducts = await readProducts();

    const filteredProducts = category
        ? allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase())
        : allProducts;

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection` : "Virelle Collections"}
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    Explore our curated selection of premium beauty essentials and stylish bags, all handpicked for you.
                </p>
            </div>

            <ProductGrid products={filteredProducts} />
        </div>
    );
}
