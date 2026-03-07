import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect admin routes
    if (pathname.startsWith('/admin-secret')) {
        // Normalize pathname to check for the login page
        const normalizedPath = pathname.replace(/\/$/, '');

        // Skip protection for the login page itself to avoid infinite redirect
        if (normalizedPath === '/admin-secret') {
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
    matcher: ['/admin-secret', '/admin-secret/:path*'],
};
