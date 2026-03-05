import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { secret } = body;

    const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'default-secret-key';

    if (secret === ADMIN_SECRET_KEY) {
        const response = NextResponse.json({ success: true });

        // Set cookie for 7 days
        response.cookies.set('admin_token', secret, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid secret key' }, { status: 401 });
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_token');
    return response;
}
