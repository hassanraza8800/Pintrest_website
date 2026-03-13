import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleAuthConfiguration } from '@/lib/googleDrive';

export async function GET(request: Request) {
    const config = await getGoogleAuthConfiguration();

    if (!config) {
        return NextResponse.json({ error: 'Google credentials not configured. Please add credentials.json or GOOGLE_CREDENTIALS env.' }, { status: 500 });
    }

    const { client_id, client_secret, redirect_uris } = config;

    // Use the first redirect URI (usually http://localhost:3000/api/auth/google/callback for dev)
    // For Vercel, the user must update this in Google Console to their production domain.
    const url = new URL(request.url);
    const origin = url.origin;
    const redirect_uri = `${origin}/api/auth/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uri
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.metadata.readonly'
        ],
        prompt: 'consent', // Force refresh token
    });

    return NextResponse.redirect(authUrl);
}
