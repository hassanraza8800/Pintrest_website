import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';

async function testDrive() {
    try {
        const TOKEN_PATH = path.join(process.cwd(), 'data/data.json');
        console.log('Reading token from:', TOKEN_PATH);

        const content = await fs.readFile(TOKEN_PATH, 'utf8');
        const creds = JSON.parse(content);

        const auth = google.auth.fromJSON(creds);
        const drive = google.drive({ version: 'v3', auth: auth as any });

        console.log('Attempting to list files...');
        const response = await drive.files.list({
            pageSize: 5,
            fields: 'files(id, name)',
        });

        const files = response.data.files;
        if (files && files.length > 0) {
            console.log('Successfully connected! Found files:');
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('Connected, but no files found (or only showing first 5).');
        }
    } catch (error: any) {
        console.error('Test failed:', error.message);
        if (error.message.includes('refresh_token')) {
            console.error('TIP: It looks like the refresh_token is missing. Please run "node data/auth_.js" to re-authenticate.');
        }
    }
}

testDrive();
