import { Product } from './fileHandler';
import { normalizeDriveImageUrl } from './imageHelper';

const PRODUCT_API_BASE_URL = process.env.PRODUCT_API_BASE_URL || 'https://41e08247-a146-48d0-ac07-951c23ec408f-00-3c8mb61dridov.worf.replit.dev/api';

// normalizeDriveImageUrl removed, now imported from ./imageHelper

function mapRemoteProduct(remote: any): Product {
    // Collect images from multiple possible field names
    let remoteImages: any[] = [];
    
    if (Array.isArray(remote.images)) {
        remoteImages = remote.images;
    } else if (remote.images && typeof remote.images === 'string') {
        remoteImages = [remote.images];
    } else if (Array.isArray(remote.image)) {
        remoteImages = remote.image;
    } else if (remote.image && typeof remote.image === 'string') {
        remoteImages = [remote.image];
    } else if (remote.image_url && typeof remote.image_url === 'string') {
        remoteImages = [remote.image_url];
    } else if (remote.img && typeof remote.img === 'string') {
        remoteImages = [remote.img];
    }

    return {
        id: String(remote.id ?? ''),
        externalId: remote.externalId ?? remote.externalID ?? undefined,
        title: remote.title ?? '',
        slug: remote.slug ?? '',
        description: remote.description ?? '',
        price: remote.price ?? '',
        images: remoteImages
            .filter((img: any) => {
                if (typeof img === 'string' && img.trim()) return true;
                if (typeof img === 'object' && img !== null) return true;
                return false;
            })
            .map((img: any) => {
                let url = '';
                if (typeof img === 'object' && img !== null) {
                    url = img.url || img.link || img.src || img.image || '';
                } else {
                    url = String(img).trim();
                }

                // Extra safety: if it looks like a stringified JSON array "["http..."]"
                // it will be handled inside normalizeDriveImageUrl
                return normalizeDriveImageUrl(url);
            })
            .filter(Boolean),
        affiliate_link: remote.affiliateLink ?? remote.affiliate_link ?? '',
        category: remote.category ?? '',
        tags: Array.isArray(remote.tags) ? remote.tags.filter((tag: any) => typeof tag === 'string').map((tag: string) => tag.trim()).filter(Boolean) : [],
        created_at: remote.createdAt ?? remote.created_at ?? '',
        updated_at: remote.updatedAt ?? remote.updated_at ?? '',
    };
}

export async function getRemoteProducts(): Promise<Product[]> {
    try {
        const res = await fetch(`${PRODUCT_API_BASE_URL}/products`, { cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`Remote products fetch failed: ${res.status} ${res.statusText}`);
        }

        const products = await res.json();
        return Array.isArray(products) ? products.map(mapRemoteProduct) : [];
    } catch (error) {
        console.error('Failed to fetch remote products:', error);
        return [];
    }
}

export async function getRemoteProductById(id: string): Promise<Product | null> {
    try {
        const res = await fetch(`${PRODUCT_API_BASE_URL}/products/${encodeURIComponent(id)}`, { cache: 'no-store' });
        if (res.status === 404) return null;
        if (!res.ok) {
            throw new Error(`Remote product fetch failed: ${res.status} ${res.statusText}`);
        }

        const product = await res.json();
        return mapRemoteProduct(product);
    } catch (error) {
        console.error('Failed to fetch remote product:', error);
        return null;
    }
}

export function getExternalApiBaseUrl() {
    return PRODUCT_API_BASE_URL;
}
