import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';

const DATA_TOKEN_PATH = path.join(process.cwd(), 'data/data.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// We use the environment variable for the folder ID if present.
// The user can define GOOGLE_DRIVE_FOLDER_ID in .env.local
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1K4t2FaeGftzf8udEbH0KVWErhRYBypQk';

/**
 * Loads the credentials from environment variables or saved files.
 */
async function loadSavedCredentialsIfExist() {
    try {
        // Priority 1: Environment Variable (for Vercel)
        if (process.env.GOOGLE_TOKEN) {
            return google.auth.fromJSON(JSON.parse(process.env.GOOGLE_TOKEN));
        }

        // Priority 2: Local File (for Development)
        const content = await fs.readFile(DATA_TOKEN_PATH, 'utf8');
        const creds = JSON.parse(content);

        return google.auth.fromJSON(creds);
    } catch (err) {
        console.error('Error loading Google authentication:', err);
        return null;
    }
}

/**
 * Gets the OAuth client configuration from env or file.
 */
export async function getGoogleAuthConfiguration() {
    // Priority 1: Environment Variable (for Vercel)
    if (process.env.GOOGLE_CREDENTIALS) {
        try {
            const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
            return creds.web || creds.installed || creds;
        } catch (e) {
            console.error('Error parsing GOOGLE_CREDENTIALS env:', e);
        }
    }

    // Priority 2: Local Files (for Development)
    try {
        const content = await fs.readFile(CREDENTIALS_PATH, 'utf8');
        const creds = JSON.parse(content);
        // Handle nested web/installed keys from Google Console exports
        return creds.web || creds.installed || creds;
    } catch (err) {
        return null;
    }
}

/**
 * Validates and initializes the Google Drive Client
 */
export async function getGoogleDriveClient() {
    const authClient = await loadSavedCredentialsIfExist();
    if (!authClient) {
        throw new Error('Google Drive not connected. Please go to the dashboard and click "Connect Google Drive".');
    }
    return google.drive({ version: 'v3', auth: authClient as any });
}



/**
 * Uploads an image buffer to Google Drive and makes it public.
 * @param buffer The file content buffer
 * @param mimeType The file mime type (e.g. image/jpeg)
 * @param fileName The original file name
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToDrive(buffer: Buffer, mimeType: string, fileName: string): Promise<string> {
    const drive = await getGoogleDriveClient();

    // Convert Buffer to a Readable stream for Google Drive API
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata: any = {
        name: `${Date.now()}-${fileName}`,
    };

    if (FOLDER_ID) {
        fileMetadata.parents = [FOLDER_ID];
    }

    const media = {
        mimeType: mimeType,
        body: stream,
    };

    try {
        // Upload the file
        const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });

        const fileId = file.data.id;

        if (!fileId) throw new Error("Failed to get file ID after upload.");

        // Make the file publicly accessible
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // The thumbnail API is the most reliable way to embed Drive images in web applications.
        // It bypasses common permission/cookie issues that the "uc" links sometimes face.
        const directImageUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

        return directImageUrl;
    } catch (error) {
        console.error('Error uploading file to Drive:', error);
        throw new Error(`Google Drive upload failed: ${(error as any).message}`);
    }
}

/**
 * Deletes an image from Google Drive given its URL.
 * @param imageUrl The Google Drive direct link URL
 */
export async function deleteImageFromDrive(imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.includes('drive.google.com')) return;

    try {
        const drive = await getGoogleDriveClient();

        // Extract file ID from URL (formula: https://drive.google.com/uc?id=FILE_ID)
        const urlObj = new URL(imageUrl);
        const fileId = urlObj.searchParams.get('id');

        if (fileId) {
            await drive.files.delete({ fileId });
            console.log(`Successfully deleted file ${fileId} from Google Drive`);
        }
    } catch (error) {
        // We log but don't throw, so product deletion can still finish even if image cleanup fails
        console.error('Error deleting file from Drive:', error);
    }
}

/**
 * Saves a JSON object to a file on Google Drive.
 * @param fileName Name of the file (e.g. products.json)
 * @param data The object to save
 */
export async function saveJsonToDrive(fileName: string, data: any, fileId?: string): Promise<void> {
    try {
        const drive = await getGoogleDriveClient();
        const content = JSON.stringify(data, null, 2);

        const media = {
            mimeType: 'application/json',
            body: Readable.from([content]),
        };

        let targetFileId = fileId;

        // 1. If fileId is not provided, check if the file already exists in the folder by name
        if (!targetFileId) {
            const response = await drive.files.list({
                q: `name = '${fileName}' and '${FOLDER_ID}' in parents and trashed = false`,
                fields: 'files(id)',
            });
            targetFileId = response.data.files?.[0]?.id ?? undefined;
        }

        if (targetFileId) {
            // Update existing file
            await drive.files.update({
                fileId: targetFileId,
                media: media,
            });
        } else {
            // Create new file
            await drive.files.create({
                requestBody: {
                    name: fileName,
                    parents: [FOLDER_ID],
                },
                media: media,
            });
        }
    } catch (error) {
        console.error(`Error saving ${fileName} to Drive:`, error);
        throw error;
    }
}

/**
 * Reads a JSON file from Google Drive.
 * @param fileName Name of the file (e.g. products.json)
 * @returns The parsed JSON content or null if not found
 */
export async function readJsonFromDrive(fileName: string, fileId?: string): Promise<any> {
    try {
        const drive = await getGoogleDriveClient();

        let targetFileId = fileId;

        // 1. If fileId is not provided, find the file by name
        if (!targetFileId) {
            const response = await drive.files.list({
                q: `name = '${fileName}' and '${FOLDER_ID}' in parents and trashed = false`,
                fields: 'files(id)',
            });
            targetFileId = response.data.files?.[0]?.id ?? undefined;
        }
        
        if (!targetFileId) return null;

        // 2. Download the content
        const file = await drive.files.get({
            fileId: targetFileId,
            alt: 'media',
        });

        return file.data;
    } catch (error) {
        console.error(`Error reading ${fileName} from Drive:`, error);
        return null;
    }
}
