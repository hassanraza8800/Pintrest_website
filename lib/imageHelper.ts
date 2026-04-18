
/**
 * Normalizes an image URL, specifically handling Google Drive links
 * to convert them into reliable thumbnail/preview URLs.
 */
export function normalizeDriveImageUrl(url: string): string {
    if (!url || typeof url !== 'string') return url || '';

    // Defensive parsing: 
    // 1. Strip extra quotes (common in double-stringified JSON)
    // 2. Extract first element if it's a literal stringified array like '["http..."]'
    let cleaned = url.trim();
    
    // Handle literal stringified arrays: ["https://..."]
    if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
        try {
            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed) && parsed.length > 0) {
                cleaned = String(parsed[0]);
            }
        } catch (e) {
            // Not JSON, just strip brackets
            cleaned = cleaned.substring(1, cleaned.length - 1);
        }
    }

    // Strip surrounding quotes: "https://..." or 'https://...'
    cleaned = cleaned.replace(/^["']|["']$/g, '').trim();

    if (!cleaned) return '';

    // Only process Google Drive related URLs
    const isGoogleDrive = 
        cleaned.includes('drive.google.com') || 
        cleaned.includes('docs.google.com') ||
        cleaned.includes('googleusercontent.com');
    
    if (!isGoogleDrive) return cleaned;

    // Helper to extract file ID from various Google Drive URL formats
    let fileId = '';

    // Format 1: uc?id=... or open?id=... (handles &amp; and other variations)
    const idMatch = cleaned.match(/[?&](?:amp;)?id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
        fileId = idMatch[1];
    } 
    // Format 2: /file/d/ID/view
    else {
        const pathMatch = cleaned.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (pathMatch && pathMatch[1]) {
            fileId = pathMatch[1];
        }
    }

    if (fileId) {
        // The lh3.googleusercontent.com/d/ format is the most stable CDN for Google Drive images
        // and is highly reliable for web embedding.
        return `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
    }

    return cleaned;
}
