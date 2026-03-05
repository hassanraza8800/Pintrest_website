import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect admin routes
    if (pathname.startsWith('/admin-secret')) {
        // Skip protection for the login page itself to avoid infinite redirect
        if (pathname === '/admin-secret') {
            return NextResponse.next();
        }

        const token = request.cookies.get('admin_token')?.value;
        const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'default-secret-key';

        if (!token || token !== SECRET_KEY) {
            // Redirect to admin login page
            const url = request.nextUrl.clone();
            url.pathname = '/admin-secret';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin-secret/:path*',
};
