const css = require('css');
const axios = require('axios');
const url = require('url');

function extractColorsFromInlineStyles(websiteDocument) {
	const colorProperties = ['color', 'background-color', 'border-color'];
	const colors = new Set();

	websiteDocument('[style]').each((i, element) => {
		const style = websiteDocument(element).attr('style');
		colorProperties.forEach((prop) => {
			const regex = new RegExp(`${prop}\\s*:\\s*([^;]+)`, 'i');
			const match = style.match(regex);
			if (match) {
				colors.add(match[1].trim());
			}
		});
	});

	return colors;
}

function extractColorsFromCSS(cssContent) {
	const colorProperties = ['color', 'background-color', 'border-color'];
	const colors = new Set();

	const parsedCSS = css.parse(cssContent);
	parsedCSS.stylesheet.rules.forEach((rule) => {
		rule.declarations?.forEach((declaration) => {
			if (
				colorProperties.includes(declaration.property) &&
				declaration.value.startsWith('#') // filter hex colors only
			) {
				// Remove !important
				const hexColor = declaration.value.split(' ')[0].toLowerCase();
				colors.add(hexColor);
			}
		});
	});

	return colors;
}

async function getExternalCSS(websiteUrl, websiteDocument) {
	const cssUrls = [];

	websiteDocument('link[rel="stylesheet"]').each((i, element) => {
		const cssHref = websiteDocument(element).attr('href');
		if (cssHref) {
			cssUrls.push(url.resolve(websiteUrl, cssHref));
		}
	});

	const cssPromises = cssUrls.map((cssUrl) =>
		axios.get(cssUrl).then((response) => response.data)
	);
	return Promise.all(cssPromises);
}

module.exports = {
	extractColorsFromInlineStyles,
	extractColorsFromCSS,
	getExternalCSS,
};
