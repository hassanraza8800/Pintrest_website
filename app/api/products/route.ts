import { NextResponse } from 'next/server';
import { readProducts, addProduct, updateProduct, deleteProduct } from '@/lib/fileHandler';
import { uploadImageToDrive, deleteImageFromDrive } from '@/lib/googleDrive';

// GET all products
export async function GET() {
    const products = await readProducts();
    return NextResponse.json(products);
}

// POST new product
export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const imageUrls: string[] = [];
        
        // Handle direct image URLs (if any, though UI currently sends one)
        const imageParam = formData.get('image') as string;
        if (imageParam) imageUrls.push(imageParam);

        // Handle multiple file uploads
        const imageFiles = formData.getAll('image_file') as File[];
        
        for (const file of imageFiles) {
            if (file && file.name) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const url = await uploadImageToDrive(buffer, file.type, file.name);
                imageUrls.push(url);
            }
        }

        const tagsString = formData.get('tags') as string || '';
        const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);

        const newProduct = await addProduct({
            title: formData.get('title') as string || '',
            slug: formData.get('slug') as string || '',
            description: formData.get('description') as string || '',
            price: formData.get('price') as string || '',
            images: imageUrls,
            affiliate_link: formData.get('affiliate_link') as string || '',
            category: formData.get('category') as string || '',
            tags,
        });

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error: any) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
    }
}

// PUT update product
export async function PUT(request: Request) {
    try {
        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const existingImages = formData.getAll('images') as string[];
        const imageUrls: string[] = [...existingImages];

        // Handle multiple new file uploads
        const imageFiles = formData.getAll('image_file') as File[];
        
        for (const file of imageFiles) {
            if (file && file.name) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const url = await uploadImageToDrive(buffer, file.type, file.name);
                imageUrls.push(url);
            }
        }

        const tagsString = formData.get('tags') as string || '';
        const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);

        const updates = {
            title: formData.get('title') as string || '',
            slug: formData.get('slug') as string || '',
            description: formData.get('description') as string || '',
            price: formData.get('price') as string || '',
            images: imageUrls,
            affiliate_link: formData.get('affiliate_link') as string || '',
            category: formData.get('category') as string || '',
            tags,
        };

        const updated = await updateProduct(id, updates);
        if (!updated) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        return NextResponse.json(updated);
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
        // Find product to get the image URL before deletion
        const products = await readProducts();
        const product = products.find((p: any) => p.id === id);

        if (product && product.images && product.images.length > 0) {
            // Cleanup the first image from Google Drive
            await deleteImageFromDrive(product.images[0]);
        }

        const deleted = await deleteProduct(id);
        if (!deleted) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        console.error('Error in DELETE handler:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
