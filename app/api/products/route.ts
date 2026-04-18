import { NextResponse } from 'next/server';
import { uploadImageToDrive, deleteImageFromDrive } from '@/lib/googleDrive';
import { getExternalApiBaseUrl, getRemoteProductById, getRemoteProducts } from '@/lib/remoteApi';
import { normalizeDriveImageUrl } from '@/lib/imageHelper';

function mapRemoteProductToApp(product: any) {
    const rawImages = Array.isArray(product.images) ? product.images : [];
    const normalizedImages = rawImages.map(normalizeDriveImageUrl);

    return {
        id: String(product.id ?? ''),
        title: product.title ?? '',
        slug: product.slug ?? '',
        description: product.description ?? '',
        price: product.price ?? '',
        images: normalizedImages,
        affiliate_link: product.affiliateLink ?? product.affiliate_link ?? '',
        category: product.category ?? '',
        tags: Array.isArray(product.tags) ? product.tags : [],
        created_at: product.createdAt ?? product.created_at ?? '',
        updated_at: product.updatedAt ?? product.updated_at ?? '',
        externalId: product.externalId ?? undefined,
    };
}

async function postToRemoteApi(path: string, payload: any, method = 'POST') {
    const base = getExternalApiBaseUrl();
    const options: RequestInit = {
        method,
        headers: {},
    };

    if (payload != null) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(payload);
    }

    const res = await fetch(`${base}${path}`, options);

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Remote API error ${res.status}: ${errorText}`);
    }

    if (res.status === 204) return null;
    return await res.json();
}

// GET all products or a single product by ID
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
        const product = await getRemoteProductById(id);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        return NextResponse.json(product);
    }

    const products = await getRemoteProducts();
    return NextResponse.json(products);
}

// POST new product
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const imageUrls: string[] = [];

        const directUrls = formData.getAll('images') as string[];
        for (const url of directUrls) {
            if (typeof url === 'string' && url.trim()) {
                imageUrls.push(url.trim());
            }
        }

        const imageFiles = formData.getAll('image_file') as File[];
        for (const file of imageFiles) {
            if (file && file.name) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const url = await uploadImageToDrive(buffer, file.type, file.name);
                imageUrls.push(url);
            }
        }

        const tagsString = (formData.get('tags') as string) || '';
        const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
        const title = (formData.get('title') as string) || '';
        const slug = (formData.get('slug') as string) || '';

        const payload = {
            externalId: `${slug || title || 'product'}-${Date.now()}`,
            title,
            slug,
            description: (formData.get('description') as string) || '',
            price: (formData.get('price') as string) || '',
            images: imageUrls,
            affiliateLink: (formData.get('affiliate_link') as string) || '',
            category: (formData.get('category') as string) || '',
            tags,
        };

        const remoteProduct = await postToRemoteApi('/products', payload, 'POST');
        return NextResponse.json(mapRemoteProductToApp(remoteProduct), { status: 201 });
    } catch (error: any) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
    }
}

// PUT update product
export async function PUT(request: Request) {
    try {
        const formData = await request.formData();
        const id = (formData.get('id') as string) || '';
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const existingImages = formData.getAll('images') as string[];
        const imageUrls: string[] = existingImages.filter((url) => typeof url === 'string' && url.trim()).map((url) => url.trim());

        const imageFiles = formData.getAll('image_file') as File[];
        for (const file of imageFiles) {
            if (file && file.name) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const url = await uploadImageToDrive(buffer, file.type, file.name);
                imageUrls.push(url);
            }
        }

        const tagsString = (formData.get('tags') as string) || '';
        const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
        const title = (formData.get('title') as string) || '';
        const slug = (formData.get('slug') as string) || '';

        const currentProduct = await getRemoteProductById(id);
        if (!currentProduct) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        const removedImages = currentProduct.images.filter((img) => !imageUrls.includes(img));
        await Promise.all(
            removedImages.map(async (img) => {
                if (img.includes('drive.google.com')) {
                    try {
                        await deleteImageFromDrive(img);
                    } catch (cleanupError) {
                        console.warn('Failed to delete removed image from Drive:', cleanupError);
                    }
                }
            })
        );

        const payload = {
            title,
            slug,
            description: (formData.get('description') as string) || '',
            price: (formData.get('price') as string) || '',
            images: imageUrls,
            affiliateLink: (formData.get('affiliate_link') as string) || '',
            category: (formData.get('category') as string) || '',
            tags,
        };

        const remoteProduct = await postToRemoteApi(`/products/${encodeURIComponent(id)}`, payload, 'PATCH');
        return NextResponse.json(mapRemoteProductToApp(remoteProduct));
    } catch (error: any) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
    }
}

// DELETE product
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    try {
        const currentProduct = await getRemoteProductById(id);
        if (!currentProduct) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        await Promise.all(
            currentProduct.images
                .filter((img) => img.includes('drive.google.com'))
                .map(async (img) => {
                    try {
                        await deleteImageFromDrive(img);
                    } catch (cleanupError) {
                        console.warn('Failed to delete image from Drive during deletion:', cleanupError);
                    }
                })
        );

        await postToRemoteApi(`/products/${encodeURIComponent(id)}`, null, 'DELETE');
        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        console.error('Error in DELETE handler:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
    }
}
