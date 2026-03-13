import fs from 'fs/promises';
import path from 'path';
import { readJsonFromDrive, saveJsonToDrive } from './googleDrive';

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');
const CLOUD_FILENAME = 'products.json';

export interface Product {
    id: string;
    title: string;
    slug: string;
    description: string;
    images: string[];
    affiliate_link: string;
    category: string;
    tags: string[];
    created_at: string;
}

export async function readProducts(): Promise<Product[]> {
    try {
        let products: any[] = [];

        // 1. Try reading from Google Drive (Primary for Vercel)
        const cloudData = await readJsonFromDrive(CLOUD_FILENAME);
        if (cloudData) {
            products = Array.isArray(cloudData) ? cloudData : [];
        } else {
            // 2. Fallback to local file (Primary for Development)
            try {
                const data = await fs.readFile(DATA_FILE, 'utf8');
                products = JSON.parse(data);
            } catch (err) {
                console.warn('Local products.json not found, starting with empty list.');
                products = [];
            }
        }

        // Migration: Ensure all products use the 'images' array
        return products.map((p: any) => {
            if (p.image && !p.images) {
                const { image, ...rest } = p;
                return { ...rest, images: [image] };
            }
            if (!p.images) {
                return { ...p, images: [] };
            }
            return p;
        });
    } catch (error) {
        console.error('Error reading products:', error);
        return [];
    }
}

export async function writeProducts(products: Product[]): Promise<void> {
    let success = false;
    let errorMsg = '';

    // 1. Try saving to Google Drive (Required for Vercel production)
    try {
        await saveJsonToDrive(CLOUD_FILENAME, products);
        success = true;
    } catch (err) {
        console.error('Failed to save products to Google Drive:', err);
        errorMsg = (err as any).message;
    }

    // 2. Also try saving locally (Good for local dev persistence/backup)
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), 'utf8');
        success = true; // Local success counts if Drive failed (locally)
    } catch (err) {
        // This is expected to fail on Vercel production
        console.warn('Local filesystem write failed (expected on Vercel):', err);
        if (!success) {
            errorMsg = 'Filesystem is read-only and Google Drive connection failed.';
        }
    }

    if (!success) {
        throw new Error(`Failed to save product data: ${errorMsg}`);
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
