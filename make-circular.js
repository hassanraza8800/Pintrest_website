const Jimp = require('jimp');

async function main() {
    try {
        const image = await Jimp.read('public/logo.png');

        // Make it a square
        const size = Math.min(image.bitmap.width, image.bitmap.height);
        const x = (image.bitmap.width - size) / 2;
        const y = (image.bitmap.height - size) / 2;
        image.crop(x, y, size, size);

        // Make it circular
        image.circle({ radius: size / 2, x: size / 2, y: size / 2 });

        // Save outputs
        await image.writeAsync('app/icon.png');
        await image.writeAsync('app/apple-icon.png');

        // Resize for favicon.ico as it expects a small image
        image.resize(32, 32);
        await image.writeAsync('app/favicon.ico');
        await image.writeAsync('public/favicon.ico');

        console.log('Successfully made the icon circular!');
    } catch (err) {
        console.error('Error processing image:', err);
    }
}

main();
