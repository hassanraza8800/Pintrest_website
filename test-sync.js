const { readProducts, addProduct } = require('./lib/fileHandler');

async function testSync() {
    try {
        console.log('1. Reading current products...');
        const products = await readProducts();
        console.log(`Found ${products.length} products.`);

        console.log('2. Adding a test product to trigger Drive sync...');
        const newProduct = await addProduct({
            title: "Drive Sync Test",
            slug: "drive-sync-test-" + Date.now(),
            description: "Testing Vercel persistence fix",
            images: ["https://via.placeholder.com/150"],
            affiliate_link: "https://example.com",
            category: "test",
            tags: ["test", "sync"]
        });

        console.log('3. Success! Product added with ID:', newProduct.id);
        console.log('Please check your Google Drive folder for "products.json"');
    } catch (err) {
        console.error('Test failed:', err);
    }
}

testSync();
