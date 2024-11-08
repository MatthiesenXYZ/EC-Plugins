import ts from "typescript";
import {
	defaultHandbookOptions,
	type CompilerOptionDeclaration,
} from "twoslash";

/**
 * Creates a regular expression to match TypeScript compiler option flags and default handbook options.
 *
 * This function generates a regex pattern that matches lines containing TypeScript compiler option flags
 * or default handbook options, prefixed with `// @` and followed by optional whitespace.
 * The regex is designed to work in a global and multiline context.
 *
 * @returns {RegExp} A RegExp object configured to match the specified pattern.
 */
function createFlagRegex(): RegExp {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const tsOptionDeclarations = (ts as any)
		.optionDeclarations as CompilerOptionDeclaration[];

	// Get all flag keys from TypeScript
	const keys = [
		...tsOptionDeclarations.map((i) => i.name),
		...Object.keys(defaultHandbookOptions),
	].sort();

	// Escape each flag to avoid regex issues (in case flags contain special characters)
	const escapedFlags = keys.map((flag) =>
		flag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
	);

	// Join flags with OR (|) operator and create a regex pattern
	const pattern = `^\\s*\\/\\/\\s*@(?:${escapedFlags.join("|")}):?`;

	// Create and return the RegExp object with 'gm' flags for global, multiline matching
	return new RegExp(pattern, "gm");
}

/**
 * Default tags used in the twoslash plugin.
 *
 * @constant
 * @default ["annotate", "log", "warn", "error"]
 */
export const twoslashDefaultTags = ["annotate", "log", "warn", "error"];

/**
 * Creates a regular expression to match specific tags in comments.
 *
 * The tags are defined in the `twoslashDefaultTags` array. Each tag is escaped to ensure
 * special characters are treated literally in the regular expression.
 *
 * The resulting pattern matches lines that start with optional whitespace, followed by
 * `//`, more optional whitespace, and then an `@` symbol followed by one of the tags
 * from the `twoslashDefaultTags` array, ending with a colon.
 *
 * @returns {RegExp} The generated regular expression.
 */
function createTagRegex(): RegExp {
	const keys = twoslashDefaultTags;

	const escapedTags = keys.map((tag) =>
		tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
	);

	const pattern = `^\\s*\\/\\/\\s*@(${escapedTags.join("|")}):`;

	return new RegExp(pattern, "gm");
}

/**
 * Regular expression to match custom tags.
 *
 * This constant is initialized by calling the `createTagRegex` function.
 */
export const reCustomTags: RegExp = createTagRegex();

/**
 * Regular expression to match the word "twoslash" as a whole word.
 *
 * @constant {RegExp} reTrigger - The regular expression pattern.
 * @type {RegExp}
 */
export const reTrigger: RegExp = /\btwoslash\b/;

/**
 * Regular expression for flag notations.
 * This constant is created using the `createFlagRegex` function.
 *
 * @constant {RegExp} reFlagNotations - The regular expression pattern.
 * @type {RegExp}
 */
export const reFlagNotations: RegExp = createFlagRegex();

/**
 * Regular expression to match annotation markers in comments.
 *
 * This regex matches lines that start with optional whitespace, followed by
 * '//' and then a '^' character. The '^' character can be followed by
 * either '?', '|', or one or more '^' characters. Optionally, there can be
 * a space and any other characters after the marker.
 *
 * The regex is global and multiline.
 *
 * @constant {RegExp} reAnnonateMarkers - The regular expression pattern.
 * @type {RegExp}
 */
export const reAnnonateMarkers: RegExp = /^\s*\/\/\s*\^(\?|\||\^+)( .*)?$/gm;

/**
 * Regular expression to match lines that indicate a cut point in the code.
 * The pattern matches lines that start with optional whitespace, followed by `// ---cut---` or `// ---cut-before---`.
 *
 * @constant {RegExp} reCutBefore - The regular expression pattern.
 * @type {RegExp}
 * @example
 * // ---cut---
 * // ---cut-before---
 */
export const reCutBefore: RegExp = /^\s*\/\/\s*---cut(?:-before)?---\s*$/gm;

/**
 * Regular expression to match lines that contain the comment `// ---cut-after---`.
 * This can be used to identify and process sections of code that should be cut after the matched line.
 *
 * @constant {RegExp} reCutAfter - The regular expression pattern.
 * @type {RegExp}
 */
export const reCutAfter: RegExp = /^\s*\/\/\s*---cut-after---\s*$/;

/**
 * Regular expression to match the start of a cut section in a file.
 * The pattern matches lines that start with optional whitespace,
 * followed by '//' and the text '---cut-start---' with optional whitespace around it.
 *
 * @constant {RegExp} reCutStart - The regular expression pattern.
 * @type {RegExp}
 */
export const reCutStart: RegExp = /^\s*\/\/\s*---cut-start---\s*$/;

/**
 * Regular expression to match lines that indicate the end of a cut section.
 * The line should start with optional whitespace, followed by `//`,
 * optional whitespace, `---cut-end---`, and optional whitespace.
 *
 * @constant {RegExp} reCutEnd - The regular expression pattern.
 * @type {RegExp}
 */
export const reCutEnd: RegExp = /^\s*\/\/\s*---cut-end---\s*$/;

/**
 * A regular expression to match and clean up type annotations.
 *
 * This regular expression matches strings that start with an uppercase letter,
 * followed by any word characters, and optionally a generic type parameter enclosed in angle brackets.
 * The matched string ends with a colon.
 *
 * Example matches:
 * - `TypeName:`
 * - `GenericType<T>:`
 *
 * @constant {RegExp} reTypeCleanup - The regular expression pattern.
 * @type {RegExp}
 */
export const reTypeCleanup: RegExp = /^[A-Z]\w*(<[^>]*>)?:/;

/**
 * Regular expression to match the beginning of a function call.
 * It matches any word characters followed by an opening parenthesis.
 *
 * @constant {RegExp} reFunctionCleanup - The regular expression pattern.
 * @type {RegExp}
 */
export const reFunctionCleanup: RegExp = /^\w*\(/;

/**
 * Regular expression to match leading property method annotations.
 *
 * This regex matches lines that start with an optional whitespace, followed by an opening parenthesis,
 * and then any word characters or hyphens. The matched string ends with a closing parenthesis and optional whitespace.
 *
 * Example matches:
 * - `(property) `
 * - `(method) `
 *
 * @constant {RegExp} reLeadingPropertyMethod - The regular expression pattern.
 * @type {RegExp}
 */
export const reLeadingPropertyMethod: RegExp = /^\(([\w-]+)\)\s+/gm;

/**
 * Regular expression to match import statements.
 *
 * This regex matches lines that start with `import` followed by any characters until the end of the line.
 *
 * @constant {RegExp} reImportStatement - The regular expression pattern.
 * @type {RegExp}
 */
export const reImportStatement: RegExp = /\nimport .*$/;

/**
 * Regular expression to match interface or namespace declarations.
 *
 * This regex matches lines that start with `interface` or `namespace` followed by a space and any word characters.
 *
 * @constant {RegExp} reInterfaceOrNamespace - The regular expression pattern.
 * @type {RegExp}
 */
export const reInterfaceOrNamespace: RegExp = /^(interface|namespace) \w+$/gm;

/**
 * Regular expression to match JSDoc links.
 *
 * This regex matches `{@link ...}` patterns in a string.
 *
 * @constant {RegExp} reJsDocLink - The regular expression pattern.
 * @type {RegExp}
 */
export const reJsDocLink: RegExp = /\{@link ([^}]*)\}/g;

/**
 * Regular expression to match JSDoc tag filters.
 *
 * This regex matches the words `param`, `returns`, `type`, and `template`.
 *
 * @constant {RegExp} reJsDocTagFilter - The regular expression pattern.
 * @type {RegExp}
 */
export const reJsDocTagFilter: RegExp = /\b(param|returns|type|template)\b/;
