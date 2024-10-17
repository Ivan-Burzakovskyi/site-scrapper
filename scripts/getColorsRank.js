const puppeteer = require('puppeteer');
const getPixels = require('get-pixels');

// Launch a headless browser and take a screenshot
async function takeScreenshot(websiteUrl) {
	try {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto(websiteUrl, { waitUntil: 'networkidle2' });

		// Take a screenshot of the page
		const screenshotPath = 'screenshot.png';
		await page.screenshot({ path: screenshotPath, fullPage: true });

		await browser.close();

		return screenshotPath;
	} catch (error) {
		console.error('Error taking screenshot:', error.message);
		return null;
	}
}

// Helper function to convert RGB to hex
function rgbToHex(r, g, b) {
	return (
		'#' +
		((1 << 24) + (r << 16) + (g << 8) + b)
			.toString(16)
			.slice(1)
			.toUpperCase()
	);
}

// Analyze the pixels of the screenshot and calculate color percentages
async function analyzePixels(screenshotPath) {
	return new Promise((resolve, reject) => {
		getPixels(screenshotPath, (err, pixels) => {
			if (err) {
				return reject('Error getting pixels: ' + err);
			}

			const colorCount = {};
			const totalPixels = pixels.shape[0] * pixels.shape[1]; // Width * Height of the image

			// Iterate over each pixel
			for (let i = 0; i < pixels.data.length; i += 4) {
				const r = pixels.data[i];
				const g = pixels.data[i + 1];
				const b = pixels.data[i + 2];
				const alpha = pixels.data[i + 3];

				// Ignore transparent pixels
				if (alpha === 0) continue;

				// Convert the RGB color to a hex code
				const hexColor = rgbToHex(r, g, b);

				// Count occurrences of each color
				colorCount[hexColor] = (colorCount[hexColor] || 0) + 1;
			}

			// Calculate the percentage of each color
			const colorPercentage = {};
			for (const color in colorCount) {
				colorPercentage[color] = (
					(colorCount[color] / totalPixels) *
					100
				).toFixed(2);
			}

			resolve(colorPercentage);
		});
	});
}

module.exports = {
	takeScreenshot,
	analyzePixels,
};
