import { type ExpressiveCodePlugin, definePlugin } from "@expressive-code/core";
import { createTwoslasher } from "twoslash";
import {
	buildMetaChecker,
	checkForCustomTagsAndMerge,
	processCompletion,
	splitCodeToLines,
	compareNodes,
} from "./helpers";
import floatingUiCore from "./module-code/floating-ui-core.min";
import floatingUiDom from "./module-code/floating-ui-dom.min";
import hoverDocsManager from "./module-code/popup.min";
import { getTwoSlashBaseStyles, twoSlashStyleSettings } from "./styles";
import type { PluginTwoslashOptions, TwoSlashStyleSettings } from "./types";
import { parseIncludeMeta, TwoslashIncludesManager } from "./includes";
import ts, { type CompilerOptions } from "typescript";
import {
	TwoslashCompletionAnnotation,
	TwoslashCustomTagsAnnotation,
	TwoslashErrorBoxAnnotation,
	TwoslashErrorUnderlineAnnotation,
	TwoslashHighlightAnnotation,
	TwoslashHoverAnnotation,
	TwoslashStaticAnnotation,
} from "./annotations";

export type { PluginTwoslashOptions, TwoSlashStyleSettings };

/**
 * Default TypeScript compiler options used in TwoSlash.
 *
 * @constant
 * @type {CompilerOptions}
 * @property {boolean} strict - Enable all strict type-checking options.
 * @property {ts.ScriptTarget} target - Specify ECMAScript target version.
 * @property {boolean} exactOptionalPropertyTypes - Ensure optional property types are exactly as declared.
 * @property {boolean} downlevelIteration - Provide full support for iterables in ES5/ES3.
 * @property {boolean} skipLibCheck - Skip type checking of declaration files.
 * @property {string[]} lib - List of library files to be included in the compilation.
 * @property {boolean} noEmit - Do not emit outputs.
 */
const defaultCompilerOptions: CompilerOptions = {
	strict: true,
	target: ts.ScriptTarget.ES2022,
	exactOptionalPropertyTypes: true,
	downlevelIteration: true,
	skipLibCheck: true,
	lib: ["ES2022", "DOM", "DOM.Iterable"],
	noEmit: true,
};

/**
 * Add Twoslash support to your Expressive Code TypeScript code blocks.
 *
 * @param {PluginTwoslashOptions} options - Configuration options for the plugin.
 * @param {Boolean | RegExp} options.explicitTrigger - Settings for the explicit trigger.
 * @param {String[]} options.languages - The languages to apply this transformer to.
 * @param {Boolean} options.includeJsDoc - If `true`, includes JSDoc comments in the hover popup.
 * @param {PluginTwoslashOptions['twoslashOptions']} options.twoslashOptions - Options to forward to `twoslash`.
 * @see https://twoslash.matthiesen.dev for the full documentation.
 * @returns A plugin object with the specified configuration.
 */
export default function ecTwoSlash(
	options: PluginTwoslashOptions = {},
): ExpressiveCodePlugin {
	/**
	 * Destructures the options object to extract configuration settings.
	 */
	const {
		explicitTrigger = true,
		languages = ["ts", "tsx"],
		includeJsDoc = true,
		twoslashOptions = checkForCustomTagsAndMerge(options.twoslashOptions),
	} = options;

	/**
	 * Initializes and returns a new instance of the Twoslasher.
	 *
	 * @returns {Twoslasher} A new instance of the Twoslasher.
	 */
	const twoslasher = createTwoslasher({
		...twoslashOptions,
	});

	const shouldTransform = buildMetaChecker(languages, explicitTrigger);

	const includesMap = new Map();

	return definePlugin({
		name: "expressive-code-twoslash",
		jsModules: [floatingUiCore, floatingUiDom, hoverDocsManager],
		styleSettings: twoSlashStyleSettings,
		baseStyles: (context) => getTwoSlashBaseStyles(context),
		hooks: {
			preprocessCode({ codeBlock }) {
				if (shouldTransform(codeBlock)) {
					// Create a new instance of the TwoslashIncludesManager
					const includes = new TwoslashIncludesManager(includesMap);

					// Apply the includes to the code block
					const codeWithIncludes = includes.applyInclude(codeBlock.code);

					// Parse the include meta
					const include = parseIncludeMeta(codeBlock.meta);

					// Add the include to the includes map if it exists
					if (include) includes.add(include, codeWithIncludes);

					// Twoslash the code block
					const twoslash = twoslasher(codeWithIncludes, codeBlock.language, {
						...twoslashOptions,
						compilerOptions: {
							...defaultCompilerOptions,
							...(twoslashOptions?.compilerOptions ?? {}),
						},
					});

					// Update EC code block with the twoslash information
					if (twoslash.extension) {
						codeBlock.language = twoslash.extension;
					}

					// Get the EC and Twoslash code blocks
					const ecCodeBlock = splitCodeToLines(codeWithIncludes);
					const twoslashCodeBlock = splitCodeToLines(twoslash.code);

					// Replace the EC code block with the Twoslash code block
					for (const line of twoslashCodeBlock) {
						const ln = codeBlock.getLine(line.index);
						if (ln) ln.editText(0, ln.text.length, line.line);
					}

					// Remove any extra lines from the EC code block
					if (twoslashCodeBlock.length < ecCodeBlock.length) {
						for (
							let i = twoslashCodeBlock.length;
							i < ecCodeBlock.length;
							i++
						) {
							codeBlock.deleteLine(twoslashCodeBlock.length);
						}
					}

					// Process the Twoslash Error Annotations
					for (const node of twoslash.errors) {
						const line = codeBlock.getLine(node.line);

						if (line) {
							line.addAnnotation(new TwoslashErrorUnderlineAnnotation(node));
							line.addAnnotation(new TwoslashErrorBoxAnnotation(node, line));
						}
					}

					// Process the Twoslash Static (Query) Annotations
					for (const node of twoslash.queries) {
						const line = codeBlock.getLine(node.line);

						if (line) {
							line.addAnnotation(
								new TwoslashStaticAnnotation(node, line, includeJsDoc),
							);
						}
					}

					// Process the Twoslash Highlight Annotations
					for (const node of twoslash.highlights) {
						const line = codeBlock.getLine(node.line);
						if (line) {
							line.addAnnotation(new TwoslashHighlightAnnotation(node));
						}
					}

					// Process the Twoslash Hover Annotations
					for (const node of twoslash.hovers) {
						// Check if the node is already added as a static
						const query = twoslash.queries.find((q) =>
							compareNodes(q, node, { line: true, text: true }),
						);

						// Check if the node is already added as an error
						const error = twoslash.errors.find((e) =>
							compareNodes(e, node, {
								line: true,
								start: true,
								length: true,
								character: true,
							}),
						);

						// Skip if the node is already added as a static or error annotation
						if (query || error) {
							continue;
						}

						const line = codeBlock.getLine(node.line);

						if (line) {
							line.addAnnotation(
								new TwoslashHoverAnnotation(node, includeJsDoc),
							);
						}
					}

					// Process the Twoslash Completion Annotations
					for (const node of twoslash.completions) {
						// Process the completion item
						const proccessed = processCompletion(node);
						const line = codeBlock.getLine(node.line);

						if (line) {
							// Check if the node has a hover annotation
							const currentHoverAnnotations = line
								.getAnnotations()
								.filter((a) => a instanceof TwoslashHoverAnnotation);

							// Modify the inline range of the hover annotation
							for (const annotation of currentHoverAnnotations) {
								if (annotation.inlineRange) {
									const { columnStart, columnEnd } = annotation.inlineRange;
									if (
										proccessed.startCharacter >= columnStart &&
										proccessed.startCharacter <= columnEnd
									) {
										annotation.inlineRange.columnStart =
											proccessed.startCharacter;
									}
								}

								if (
									annotation.hover.start === proccessed.startCharacter &&
									annotation.hover.length === proccessed.length
								) {
									line.deleteAnnotation(annotation);
								}
							}

							line.addAnnotation(
								new TwoslashCompletionAnnotation(proccessed, node, line),
							);
						}
					}

					// Process the Twoslash Custom Tags Annotations
					for (const node of twoslash.tags) {
						const line = codeBlock.getLine(node.line);

						if (line) {
							line.addAnnotation(new TwoslashCustomTagsAnnotation(node, line));
						}
					}
				}
			},
		},
	});
}
