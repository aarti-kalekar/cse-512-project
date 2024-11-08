export const camelCaseToTitleCase = (camelCase) => {
	return camelCase
		.replace(/([A-Z])/g, (match) => ` ${match}`)
		.replace(/^./, (match) => match.toUpperCase());
};

export const titleToCamelCase = (title) => {
	return title
		.toLowerCase()
		.split(' ')
		.map((word, index) =>
			index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
		)
		.join('');
};
