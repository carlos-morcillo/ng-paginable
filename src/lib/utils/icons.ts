/**
 * Checks if any Font Awesome base class is present in the input string.
 *
 * @param {string} input - The `containsFontAwesomeClass` function takes a string input and checks if it contains any of the Font
 * Awesome base classes such as 'fa-solid', 'fa-regular', 'fa-light', 'fa-duotone', 'fa-thin', or 'fa-brands'.
 *
 * @returns A boolean value - `true` if any of the Font Awesome base classes are
 * present in the input string, and `false` otherwise.
 */
export function containsFontAwesomeClass(input: string): boolean {
	// Define an array of Font Awesome base classes to check for
	const faClasses = ['fa-solid', 'fa-regular', 'fa-light', 'fa-duotone', 'fa-thin', 'fa-brands'];

	// Use a regular expression to check if any of the Font Awesome classes are present in the input string
	const faClassRegex = new RegExp(`\\b(${faClasses.join('|')})\\b`, 'i');

	// Return true if any class matches, false otherwise
	return faClassRegex.test(input);
}

/**
 * Checks if a string contains the 'bi' class using a regular expression in TypeScript.
 *
 * @param {string} input - The `input` parameter in the `containsBootstrapIconsClass` function is a string that represents a CSS
 * class or a list of CSS classes. The function checks if the input string contains the Bootstrap Icons class 'bi'.
 *
 * @returns returns a boolean value - `true` if the input string contains the 'bi'
 * class, and `false` otherwise.
 */
export function containsBootstrapIconsClass(input: string): boolean {
	// Define a regular expression pattern to match 'bi' class
	const biClassRegex = /\bbi\b/;

	// Return true if the class matches, false otherwise
	return biClassRegex.test(input);
}
