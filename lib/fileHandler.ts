import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

export interface Product {
    id: string;
    title: string;
    slug: string;
    description: string;
    image: string;
    affiliate_link: string;
    category: string;
    tags: string[];
    created_at: string;
}

export async function readProducts(): Promise<Product[]> {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading products:', error);
        return [];
    }
}

export async function writeProducts(products: Product[]): Promise<void> {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing products:', error);
        throw new Error('Failed to save product data.');
    }
}

export async function addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const products = await readProducts();
    const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
    };
    products.push(newProduct);
    await writeProducts(products);
    return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const products = await readProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products[index] = { ...products[index], ...updates };
    await writeProducts(products);
    return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
    const products = await readProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;

    await writeProducts(filtered);
    return true;
}
