/**
 * Default tags used in the twoslash plugin.
 *
 * @constant
 * @default ["annotate", "log", "warn", "error"]
 */
export const twoslashDefaultTags = ["annotate", "log", "warn", "error"];

/**
 * Regular expression to match the word "twoslash" as a whole word.
 *
 * @constant {RegExp} reTrigger - The regular expression pattern.
 * @type {RegExp}
 */
export const reTrigger: RegExp = /\btwoslash\b/;

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
 * @constant {RegExp} reJsDocTagFilter - The regular expression pattern.
 * @type {RegExp}
 */
export const reJsDocTagFilter: RegExp = /\b(example|description)\b/;

export const jsdocTags: string[] = [
	"abstract",
	"access",
	"alias",
	"async",
	"augments",
	"author",
	"borrows",
	"callback",
	"class",
	"classdesc",
	"constant",
	"constructs",
	"copyright",
	"default",
	"deprecated",
	"description",
	"enum",
	"event",
	"example",
	"exports",
	"external",
	"file",
	"fires",
	"function",
	"generator",
	"global",
	"hideconstructor",
	"ignore",
	"implements",
	"inheritdoc",
	"inner",
	"instance",
	"interface",
	"kind",
	"lends",
	"license",
	"listens",
	"member",
	"memberof",
	"mixes",
	"mixin",
	"module",
	"name",
	"namespace",
	"override",
	"package",
	"param",
	"private",
	"property",
	"protected",
	"public",
	"readonly",
	"requires",
	"returns",
	"see",
	"since",
	"static",
	"summary",
	"this",
	"throws",
	"todo",
	"tutorial",
	"type",
	"typedef",
	"variation",
	"version",
	"yields",
];
