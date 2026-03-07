import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleAuthConfiguration } from '@/lib/googleDrive';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Code not found' }, { status: 400 });
    }

    const config = await getGoogleAuthConfiguration();
    if (!config) {
        return NextResponse.json({ error: 'Google credentials not configured.' }, { status: 500 });
    }

    const { client_id, client_secret } = config;
    const origin = url.origin;
    const redirect_uri = `${origin}/api/auth/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uri
    );

    try {
        const { tokens } = await oauth2Client.getToken(code);

        // Return a beautiful page with the token to copy
        return new NextResponse(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Google Drive Connected</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Inter', sans-serif; background: #f9fafb; color: #111827; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    .card { background: white; padding: 2.5rem; border-radius: 1.5rem; shadow: 0 25px 50px -12px rgba(0,0,0,0.1); max-width: 600px; width: 90%; border: 1px solid #e5e7eb; }
                    h1 { font-weight: 900; margin-bottom: 0.5rem; color: #ef4444; }
                    p { color: #6b7280; font-size: 0.95rem; line-height: 1.5; }
                    .code-box { background: #111827; color: #10b981; padding: 1.25rem; border-radius: 0.75rem; font-family: monospace; font-size: 0.85rem; overflow-x: auto; margin-top: 1.5rem; position: relative; }
                    .copy-btn { margin-top: 1.5rem; width: 100%; background: #111827; color: white; border: none; padding: 1rem; border-radius: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                    .copy-btn:hover { background: #374151; transform: translateY(-1px); }
                    .badge { display: inline-block; background: #ecfdf5; color: #059669; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; margin-bottom: 1rem; }
                </style>
            </head>
            <body>
                <div class="card">
                    <span class="badge">Connection Successful</span>
                    <h1>Google Drive Connected!</h1>
                    <p>Connection successful! To use this on Vercel, you must set these two <b>Environment Variables</b> in your Vercel Dashboard:</p>
                    
                    <div style="margin-top: 1.5rem; text-align: left;">
                        <p style="margin-bottom: 0.5rem; font-weight: bold; font-size: 0.8rem; color: #374151;">1. GOOGLE_TOKEN</p>
                        <p style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.5rem;">Copy the JSON below and paste it as the value for GOOGLE_TOKEN.</p>
                        <div class="code-box" id="token-box" style="margin-top: 0.25rem;">
                            ${JSON.stringify(tokens, null, 2)}
                        </div>
                    </div>

                    <div style="margin-top: 1.5rem; text-align: left; padding-top: 1.5rem; border-top: 1px solid #f3f4f6;">
                        <p style="margin-bottom: 0.5rem; font-weight: bold; font-size: 0.8rem; color: #374151;">2. GOOGLE_CREDENTIALS</p>
                        <p style="font-size: 0.75rem; color: #6b7280;">Also, copy the content of your <b>credential.json</b> file and paste it as the value for GOOGLE_CREDENTIALS on Vercel.</p>
                    </div>
                    
                    <button class="copy-btn" onclick="copyToken()">Copy Token JSON</button>
                    
                    <p style="margin-top: 1.5rem; font-size: 0.8rem; text-align: center;">
                        <a href="/admin-secret/dashboard" style="color: #ef4444; text-decoration: none; font-weight: bold;">Return to Dashboard</a>
                    </p>
                </div>

                <script>
                    function copyToken() {
                        const code = document.getElementById('token-box').innerText;
                        navigator.clipboard.writeText(code);
                        const btn = document.querySelector('.copy-btn');
                        btn.innerText = 'Copied to Clipboard!';
                        btn.style.background = '#10b981';
                        setTimeout(() => {
                            btn.innerText = 'Copy Token JSON';
                            btn.style.background = '#111827';
                        }, 2000);
                    }
                </script>
            </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html' }
        });
    } catch (error) {
        console.error('Error exchanging code:', error);
        return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 });
    }
}
