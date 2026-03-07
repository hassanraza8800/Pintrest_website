import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credential.json');

// We use the environment variable for the folder ID if present.
// The user can define GOOGLE_DRIVE_FOLDER_ID in .env.local
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';

/**
 * Loads the saved credentials.
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH, 'utf8');
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        console.error('Error loading token.json:', err);
        return null;
    }
}

/**
 * Validates and initializes the Google Drive Client
 */
export async function getGoogleDriveClient() {
    const authClient = await loadSavedCredentialsIfExist();
    if (!authClient) {
        throw new Error('Could not load Google authentication. Have you run the generate-token.js script?');
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

        // The webContentLink is a direct download link, but webViewLink displays it better in the browser on its own.
        // For Next.js <img src=""> tags to work gracefully with Google Drive without a workaround, 
        // you often use the webContentLink or a modified URL formula.
        // webContentLink example: https://drive.google.com/uc?id={fileId}&export=download
        // However, webContentLink is safer to use for direct rendering.
        const directImageUrl = `https://drive.google.com/uc?id=${fileId}`;

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

    const drive = await getGoogleDriveClient();

    try {
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
