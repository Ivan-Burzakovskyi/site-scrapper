const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const getFavicon = require('./scripts/getFavicon');
// const {
// 	extractColorsFromInlineStyles,
// 	extractColorsFromCSS,
// 	getExternalCSS,
// } = require('./scripts/getColors');
const {
	takeScreenshot,
	analyzePixels,
} = require('./scripts/getColorsRank');

async function scrapeWebsite(websiteUrl) {
	try {
		const response = await axios.get(websiteUrl);
		const websiteDocument = cheerio.load(response.data);

		// Extract favicon
		const favicon = await getFavicon(websiteUrl, websiteDocument);

		// Take a screenshot of the website
		const screenshotPath = await takeScreenshot(websiteUrl);

		if (!screenshotPath) {
			console.error('Failed to take a screenshot of the website.');
			return {
				favicon,
				colors: null,
			};
		}

		// Analyze the screenshot for dominant colors
		const colorPercentages = await analyzePixels(screenshotPath);

		// Remove the screenshot after processing
		fs.unlinkSync(screenshotPath);

		return {
			favicon,
			colors: colorPercentages,
		};
	} catch (error) {
		console.error('Error scraping the website:', error.message);
		return null;
	}
}

const websiteUrl = process.argv[2];
if (!websiteUrl) {
	console.error('Please provide a website URL');
	process.exit(1);
}

scrapeWebsite(websiteUrl)
	.then((result) => {
		if (!result) {
			console.log('Failed to scrape the website.');
			return;
		}
		console.log(`Favicon URL: ${result.favicon}`);
		console.log('Colors used on the page (sorted by pixel coverage):');
		const sortedColors = Object.entries(result.colors).sort((colorA, colorB) => colorB[1] - colorA[1]);
		sortedColors.forEach(([color, percentage]) => {
            if (
                parseFloat(percentage) < 1 ||
                ['#ffffff', '#fff', '#000000', '#000'].includes(color.toLowerCase())
            ) return;
			console.log(`Color: ${color}, Coverage: ${percentage}%`);
		});
	})
	.catch((error) => {
		console.error('Error:', error.message);
	});
