import type {
	ExpressiveCodeBlock,
	ExpressiveCodeLine,
} from "@expressive-code/core";
import {
	reFunctionCleanup,
	reImportStatement,
	reInterfaceOrNamespace,
	reJsDocLink,
	reJsDocTagFilter,
	reLeadingPropertyMethod,
	reTrigger,
	reTypeCleanup,
	twoslashDefaultTags,
} from "./regex";
import type {
	NodeCompletion,
	NodeError,
	TwoslashInstance,
	TwoslashOptions,
	TwoslashReturn,
} from "twoslash";
import { completionIcons } from "./completionIcons";
import {
	TwoslashCompletionAnnotation,
	TwoslashCustomTagsAnnotation,
	TwoslashErrorBoxAnnotation,
	TwoslashErrorUnderlineAnnotation,
	TwoslashHighlightAnnotation,
	TwoslashHoverAnnotation,
	TwoslashStaticAnnotation,
} from "./annotation";
import ts, { type CompilerOptions } from "typescript";
import type { CompletionItem, CompletionIcon, TwoslashTag } from "./types";
import type { Element, ElementContent } from "@expressive-code/core/hast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { toHast } from "mdast-util-to-hast";

/**
 * Converts a markdown string into an array of ElementContent objects.
 *
 * This function processes the input markdown string, replacing JSDoc links with their
 * corresponding text, and then parses the markdown into an MDAST (Markdown Abstract Syntax Tree).
 * The MDAST is then transformed into a HAST (Hypertext Abstract Syntax Tree) and the children
 * of the resulting HAST element are returned.
 *
 * @param md - The markdown string to be converted.
 * @returns An array of ElementContent objects representing the parsed markdown.
 */
export function renderMarkdown(md: string): ElementContent[] {
	const mdast = fromMarkdown(
		md.replace(reJsDocLink, "$1"), // replace jsdoc links
		{ mdastExtensions: [gfmFromMarkdown()] },
	);

	return (
		toHast(mdast, {
			handlers: {
				// code: (state, node) => {
				//     const lang = node.lang || '';
				//     if (lang) {
				//         return {
				//             type: 'element',
				//             tagName: 'code',
				//             properties: {},
				//             children: this.codeToHast(node.value, {
				//                 ...this.options,
				//                 transformers: [],
				//                 lang,
				//                 structure: node.value.trim().includes('\n') ? 'classic' : 'inline',
				//             }).children,
				//         } as Element;
				//     }
				//     return defaultHandlers.code(state, node);
				// },
			},
		}) as Element
	).children;
}

/**
 * Renders the given markdown string as an array of ElementContent.
 * If the rendered markdown consists of a single paragraph element,
 * it returns the children of that paragraph instead.
 *
 * @param md - The markdown string to render.
 * @returns An array of ElementContent representing the rendered markdown.
 */
export function renderMarkdownInline(md: string): ElementContent[] {
	const betterMD = md;

	const children = renderMarkdown(betterMD);
	if (
		children.length === 1 &&
		children[0].type === "element" &&
		children[0].tagName === "p"
	)
		return children[0].children;
	return children;
}

/**
 * Filters tags based on specific keywords.
 *
 * @param tag - The tag string to be checked.
 * @returns A boolean indicating whether the tag includes any of the specified keywords: "param", "returns", "type", or "template".
 */
export function filterTags(tag: string) {
	return reJsDocTagFilter.test(tag);
}

/**
 * Calculates the width of a given text in pixels based on the character location, font size, and character width.
 *
 * @param textLoc - The location of the text (number of characters).
 * @param fontSize - The font size in pixels. Defaults to 16.
 * @param charWidth - The width of a single character in pixels. Defaults to 8.
 * @returns The width of the text in pixels.
 */
export function getTextWidthInPixels(
	textLoc: number,
	fontSize = 16,
	charWidth = 8,
): number {
	return textLoc * charWidth * (fontSize / 16);
}

/**
 * Returns a string representation of a custom tag.
 *
 * @param tag - The custom tag to convert to a string. Can be one of "warn", "annotate", or "log".
 * @returns A string that represents the custom tag. Returns "Warning" for "warn", "Message" for "annotate",
 * "Log" for "log", and "Error" for any other value.
 */
export function getCustomTagString(tag: TwoslashTag): string {
	switch (tag) {
		case "warn":
			return "Warning";
		case "annotate":
			return "Message";
		case "log":
			return "Log";
		default:
			return "Error";
	}
}

/**
 * Returns a custom CSS class name based on the provided TwoslashTag.
 *
 * @param tag - The TwoslashTag to get the custom class for. Possible values are "warn", "annotate", "log", or any other string.
 * @returns The corresponding CSS class name as a string.
 *          - "twoslash-custom-level-warning" for "warn"
 *          - "twoslash-custom-level-suggestion" for "annotate"
 *          - "twoslash-custom-level-message" for "log"
 *          - "twoslash-custom-level-error" for any other value
 */
export function getCustomTagClass(tag: TwoslashTag): string {
	switch (tag) {
		case "warn":
			return "twoslash-custom-level-warning";
		case "annotate":
			return "twoslash-custom-level-suggestion";
		case "log":
			return "twoslash-custom-level-message";
		default:
			return "twoslash-custom-level-error";
	}
}

/**
 * Returns a CSS class name based on the error level of the provided NodeError.
 *
 * @param error - The NodeError object containing the error level.
 * @returns A string representing the CSS class name corresponding to the error level.
 *
 * The possible error levels and their corresponding CSS class names are:
 * - "warning" -> "twoslash-error-level-warning"
 * - "suggestion" -> "twoslash-error-level-suggestion"
 * - "message" -> "twoslash-error-level-message"
 * - Any other value -> "twoslash-error-level-error"
 */
export function getErrorLevelClass(error: NodeError): string {
	switch (error.level) {
		case "warning":
			return "twoslash-error-level-warning";
		case "suggestion":
			return "twoslash-error-level-suggestion";
		case "message":
			return "twoslash-error-level-message";
		default:
			return "twoslash-error-level-error";
	}
}

/**
 * Returns a string representation of the error level.
 *
 * @param error - The error object containing the level property.
 * @returns A string that represents the error level. Possible values are:
 * - "Warning" for level "warning"
 * - "Suggestion" for level "suggestion"
 * - "Message" for level "message"
 * - "Error" for any other level
 */
export function getErrorLevelString(error: NodeError): string {
	switch (error.level) {
		case "warning":
			return "Warning";
		case "suggestion":
			return "Suggestion";
		case "message":
			return "Message";
		default:
			return "Error";
	}
}

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

export function ecTwoslasher(
	twoslasher: TwoslashInstance,
	twoslashOptions: TwoslashOptions,
	codeBlock: ExpressiveCodeBlock,
) {
	return twoslasher(codeBlock.code, codeBlock.language, {
		...twoslashOptions,
		compilerOptions: {
			...defaultCompilerOptions,
			...(twoslashOptions?.compilerOptions ?? {}),
		},
	});
}

/**
 * Merges custom tags from the provided `twoslashOptions` with the default tags.
 * Ensures that there are no duplicate tags in the final list.
 *
 * @param twoslashOptions - The options object containing custom tags to be merged.
 * @returns A new `TwoslashOptions` object with merged custom tags.
 */
export function checkForCustomTagsAndMerge(
	twoslashOptions: TwoslashOptions | undefined,
) {
	const customTags = twoslashOptions?.customTags ?? [];
	const defaultTags = twoslashDefaultTags;

	const allTags: string[] = [...defaultTags];

	for (const tag of customTags) {
		if (!allTags.includes(tag)) {
			allTags.push(tag);
		}
	}

	return {
		...twoslashOptions,
		customTags: allTags,
	} as TwoslashOptions;
}

/**
 * Builds a function to check if a code block should be transformed based on the provided languages and trigger.
 *
 * @param languages - An array of languages that should be checked.
 * @param explicitTrigger - A boolean or RegExp that determines the trigger condition. If it's a RegExp, it will be used to test the code block's meta. If it's a boolean, a default RegExp (`/\btwoslash\b/`) will be used.
 * @returns A function that takes an `ExpressiveCodeBlock` and returns a boolean indicating whether the code block should be transformed.
 */
export function buildMetaChecker(
	languages: readonly string[],
	explicitTrigger: boolean | RegExp,
) {
	const trigger =
		explicitTrigger instanceof RegExp ? explicitTrigger : reTrigger;

	/**
	 * A function that takes an `ExpressiveCodeBlock` and returns a boolean indicating whether the code block should be transformed.
	 */
	return function shouldTransform(codeBlock: ExpressiveCodeBlock): boolean {
		return (
			languages.includes(codeBlock.language) &&
			(!explicitTrigger || trigger.test(codeBlock.meta))
		);
	};
}

/**
 * Adds completion annotations to the provided code block based on the twoslash completions.
 *
 * @param twoslash - The TwoslashReturn object containing completion information.
 * @param codeBlock - The ExpressiveCodeBlock object representing the code block to annotate.
 */
export function addCompletionAnnotations(
	twoslash: TwoslashReturn,
	codeBlock: ExpressiveCodeBlock,
) {
	for (const completion of twoslash.completions) {
		const proccessed = processCompletion(completion);
		const line = codeBlock.getLine(completion.line);
		if (line) {
			// Remove any Hover annotations that match the completion
			// This is to avoid `any` type completions being shown as hovers for completions
			removeHoverFromCompletions(line, proccessed);

			line.addAnnotation(
				new TwoslashCompletionAnnotation(proccessed, completion, line),
			);
		}
	}
}

/**
 * Adds error annotations to the given code block based on the errors found in the Twoslash return object.
 *
 * @param twoslash - The Twoslash return object containing error information.
 * @param codeBlock - The code block to which error annotations will be added.
 */
export function addErrorAnnotations(
	twoslash: TwoslashReturn,
	codeBlock: ExpressiveCodeBlock,
) {
	for (const error of twoslash.errors) {
		const line = codeBlock.getLine(error.line);

		if (line) {
			line.addAnnotation(new TwoslashErrorUnderlineAnnotation(error));
			line.addAnnotation(new TwoslashErrorBoxAnnotation(error, line));
		}
	}
}

/**
 * Replaces the code in an ExpressiveCodeBlock with the code from a TwoslashReturn object.
 *
 * @param twoslash - The TwoslashReturn object containing the new code.
 * @param codeBlock - The ExpressiveCodeBlock object to be updated.
 */
export function replaceECBlockWithTwoslashBlock(
	twoslash: TwoslashReturn,
	codeBlock: ExpressiveCodeBlock,
) {
	const ecCodeBlock = codeBlock.code.split("\n").map((line, index) => {
		return { index, line };
	});
	const twoslashCodeBlock = twoslash.code.split("\n").map((line, index) => {
		return { index, line };
	});

	for (const line of twoslashCodeBlock) {
		const ln = codeBlock.getLine(line.index);

		if (ln) {
			ln.editText(0, ln.text.length, line.line);
		}
	}

	if (twoslashCodeBlock.length < ecCodeBlock.length) {
		for (let i = twoslashCodeBlock.length; i < ecCodeBlock.length; i++) {
			codeBlock.deleteLine(twoslashCodeBlock.length);
		}
	}
}

/**
 * Adds custom tag annotations to the provided code block based on the tags found in the twoslash return object.
 *
 * @param twoslash - The TwoslashReturn object containing the tags to be added as annotations.
 * @param codeBlock - The ExpressiveCodeBlock object representing the code block to which annotations will be added.
 */
export function addCustomTagAnnotations(
	twoslash: TwoslashReturn,
	codeBlock: ExpressiveCodeBlock,
) {
	for (const tag of twoslash.tags) {
		const line = codeBlock.getLine(tag.line);

		if (line) {
			line.addAnnotation(new TwoslashCustomTagsAnnotation(tag, line));
		}
	}
}

/**
 * Adds hover or static annotations to the provided code block based on the twoslash results.
 *
 * @param twoslash - The result object from running twoslash, containing hover and query information.
 * @param codeBlock - The code block to which annotations will be added.
 * @param includeJsDoc - A boolean indicating whether to include JSDoc comments in the annotations.
 */
export function addHoverOrStaticAnnotations(
	twoslash: TwoslashReturn,
	codeBlock: ExpressiveCodeBlock,
	includeJsDoc: boolean,
) {
	for (const hover of twoslash.hovers) {
		const line = codeBlock.getLine(hover.line);
		if (line) {
			const query = twoslash.queries.find((q) => q.text === hover.text);
			if (query) {
				line.addAnnotation(
					new TwoslashStaticAnnotation(hover, line, includeJsDoc, query),
				);
			} else {
				line.addAnnotation(new TwoslashHoverAnnotation(hover, includeJsDoc));
			}
		}
	}
}

/**
 * The default hover info processor, which will do some basic cleanup
 */
export function defaultHoverInfoProcessor(type: string): string | boolean {
	let content = type
		// remove leading `(property)` or `(method)` on each line
		.replace(reLeadingPropertyMethod, "")
		// remove import statement
		.replace(reImportStatement, "")
		// remove interface or namespace lines with only the name
		.replace(reInterfaceOrNamespace, "")
		.trim();

	// Add `type` or `function` keyword if needed
	if (content.match(reTypeCleanup)) content = `type ${content}`;
	else if (content.match(reFunctionCleanup)) content = `function ${content}`;

	if (content.length === 0) {
		return false;
	}

	return content;
}

/**
 * Adds highlight annotations to the given code block based on the highlights from the twoslash return object.
 *
 * @param twoslash - The object containing the highlights information.
 * @param codeBlock - The code block to which the highlight annotations will be added.
 */
export function addHighlightAnnotations(
	twoslash: TwoslashReturn,
	codeBlock: ExpressiveCodeBlock,
) {
	for (const highlight of twoslash.highlights) {
		const line = codeBlock.getLine(highlight.line);
		if (line) {
			line.addAnnotation(new TwoslashHighlightAnnotation(highlight));
		}
	}
}

/**
 * Removes hover annotations from a given line of code if they match the start character and length of the processed completion item.
 *
 * @param line - The line of code from which hover annotations should be removed.
 * @param proccessed - The completion item containing the start character and length to match against hover annotations.
 */
export function removeHoverFromCompletions(
	line: ExpressiveCodeLine,
	proccessed: CompletionItem,
) {
	for (const annotation of line.getAnnotations()) {
		if (annotation instanceof TwoslashHoverAnnotation) {
			const annotationInlineRange = annotation.inlineRange;
			const processedStart = proccessed.startCharacter;
			if (annotationInlineRange) {
				const { columnStart, columnEnd } = annotationInlineRange;
				if (processedStart >= columnStart && processedStart <= columnEnd) {
					annotation.inlineRange.columnStart = proccessed.startCharacter;
				}
			}
			if (
				annotation.hover.start === proccessed.startCharacter &&
				annotation.hover.length === proccessed.length
			) {
				line.deleteAnnotation(annotation);
			}
		}
	}
}

/**
 * Processes a NodeCompletion object and returns a CompletionItem.
 *
 * @param completion - The NodeCompletion object to process.
 * @returns A CompletionItem containing the processed completion data.
 */
export function processCompletion(completion: NodeCompletion): CompletionItem {
	const items = completion.completions
		.map((c) => {
			const kind = c.kind || "property";
			const isDeprecated =
				"kindModifiers" in c &&
				typeof c.kindModifiers === "string" &&
				c.kindModifiers.split(",").includes("deprecated");

			const icon = completionIcons[kind as CompletionIcon];

			return {
				name: c.name,
				kind,
				icon,
				isDeprecated,
			};
		})
		.slice(0, 5);

	const { character, start, completionsPrefix } = completion;

	const length = start - character;

	return {
		startCharacter: character,
		completionsPrefix,
		start,
		length,
		items,
	};
}
