const url = require('url');

async function getFavicon(websiteUrl, websiteDocument) {
	try {
		// Look for a <link> tag with rel="icon" or rel="shortcut icon"
		let favicon =
			websiteDocument('link[rel="icon"]').attr('href') ||
			websiteDocument('link[rel="shortcut icon"]').attr('href');

		// If the favicon is a relative URL, resolve it to an absolute URL
		if (favicon && !favicon.startsWith('http')) {
			favicon = url.resolve(websiteUrl, favicon);
		}

		// If no favicon is found in the HTML, return a default guess
		if (!favicon) {
			favicon = url.resolve(websiteUrl, '/favicon.ico');
		}

		return favicon;
	} catch (error) {
		console.error('Error fetching the favicon:', error.message);
		return null;
	}
}

module.exports = getFavicon;