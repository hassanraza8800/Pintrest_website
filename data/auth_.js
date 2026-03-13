const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const url = require('url');
const opn = require('open'); // local-auth uses this or similar, usually available in this env

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'data/data.json');

async function authorize() {
    // 1. Load credentials
    const content = await fs.readFile(CREDENTIALS_PATH, 'utf8');
    const keys = JSON.parse(content);
    const key = keys.web || keys.installed;

    if (!key || !key.client_id) {
        throw new Error('No client_id found in credentials.json. Please make sure the file is valid.');
    }

    console.log(`Using Client ID: ${key.client_id}`);

    const oauth2Client = new google.auth.OAuth2(
        key.client_id,
        key.client_secret,
        key.redirect_uris[0]
    );

    // 2. Generate Auth URL
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/drive.file'],
        prompt: 'consent'
    });

    console.log('Authorize this app by visiting this url:');
    console.log(authUrl);

    // 3. Start temporary server to catch the code
    const server = http.createServer(async (req, res) => {
        try {
            if (req.url.indexOf('/api/auth/google/callback') > -1) {
                const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
                const code = qs.get('code');
                console.log(`Code received: ${code.substring(0, 5)}...`);
                
                res.end('Authentication successful! You can close this tab and return to the terminal.');
                server.destroy();

                const { tokens } = await oauth2Client.getToken(code);
                console.log('Tokens received successfully.');

                await fs.writeFile(TOKEN_PATH, JSON.stringify({
                    type: 'authorized_user',
                    client_id: key.client_id,
                    client_secret: key.client_secret,
                    refresh_token: tokens.refresh_token,
                    // Optional: include access token for immediate use
                    token: tokens.access_token
                }, null, 2));

                console.log('Successfully saved to data/data.json');
                process.exit(0);
            }
        } catch (e) {
            console.error('Error during callback processing:', e);
            res.end('Authentication failed. Check terminal for details.');
        }
    }).listen(3000, () => {
        // Open the browser
        // Since I don't know if 'open' is installed, I'll log it clearly
        console.log('Server is listening on port 3000 to catch the callback.');
    });

    // Handle server destruction helper
    const connections = new Set();
    server.on('connection', conn => {
        connections.add(conn);
        conn.on('close', () => connections.delete(conn));
    });
    server.destroy = () => {
        for (const conn of connections) conn.destroy();
        server.close();
    };
}

authorize().catch(err => {
    console.error('Authorization failed:', err.message);
    if (err.message.includes('EADDRINUSE')) {
        console.error('ERROR: Port 3000 is already in use. Please stop your dev server (npm run dev) first!');
    }
});
