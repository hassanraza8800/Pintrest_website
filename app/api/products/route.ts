import { NextResponse } from 'next/server';
import { readProducts, addProduct, updateProduct, deleteProduct } from '@/lib/fileHandler';

// GET all products
export async function GET() {
    const products = await readProducts();
    return NextResponse.json(products);
}

// POST new product
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newProduct = await addProduct(body);
        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

// PUT update product
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const updated = await updateProduct(id, updates);
        if (!updated) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE product
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const deleted = await deleteProduct(id);
    if (!deleted) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    return NextResponse.json({ message: 'Product deleted successfully' });
}
