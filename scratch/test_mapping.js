
function normalizeDriveImageUrl(url) {
    if (!url || typeof url !== 'string') return url || '';
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return '';

    const isGoogleDrive = 
        trimmedUrl.includes('drive.google.com') || 
        trimmedUrl.includes('docs.google.com') ||
        trimmedUrl.includes('googleusercontent.com');
    
    if (!isGoogleDrive) return trimmedUrl;

    let fileId = '';
    const idMatch = trimmedUrl.match(/[?&](?:amp;)?id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
        fileId = idMatch[1];
    } else {
        const pathMatch = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (pathMatch && pathMatch[1]) {
            fileId = pathMatch[1];
        }
    }

    if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
    }
    return trimmedUrl;
}

const testCases = [
    {
        name: "Standard uc link",
        input: "https://drive.google.com/uc?id=123"
    },
    {
        name: "Double-quoted link",
        input: "\"https://drive.google.com/uc?id=456\""
    },
    {
        name: "Stringified array link",
        input: "[\"https://drive.google.com/uc?id=789\"]"
    },
    {
        name: "Encoded amp; link",
        input: "https://drive.google.com/uc?export=view&amp;id=1x0VGYjKH7RYyMJJp9tODA_92sR5wTPtn"
    },
    {
        name: "File path link",
        input: "https://drive.google.com/file/d/ABC-123_xyz/view"
    },
    {
        name: "Non-google link (should not change)",
        input: "https://images.unsplash.com/photo-123?id=999"
    }
];

testCases.forEach(tc => {
    const result = normalizeDriveImageUrl(tc.input);
    console.log(`Test: ${tc.name}`);
    console.log(`Input: ${tc.input}`);
    console.log(`Result: ${result}`);
    console.log('---');
});
