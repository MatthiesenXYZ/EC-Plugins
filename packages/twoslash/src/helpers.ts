import type { ExpressiveCodeBlock } from "@expressive-code/core";
import type { Element, ElementContent } from "@expressive-code/core/hast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { toHast } from "mdast-util-to-hast";
import type {
	NodeCompletion,
	NodeError,
	TwoslashNode,
	TwoslashOptions,
} from "twoslash";
import { completionIcons } from "./completionIcons";
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
import type { CompletionIcon, CompletionItem, TwoslashTag } from "./types";

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
				// Replace this section with EC processing once it's available
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
 * Checks if the given markdown string consists of a single paragraph element.
 *
 * @param md - The markdown string to check.
 * @param filterTags - A boolean indicating whether to filter tags.
 * @returns A boolean indicating if the markdown string is a single paragraph element.
 */
export function checkIfSingleParagraph(
	md: string,
	filterTags: boolean,
): boolean {
	const children = renderMarkdownInline(md);
	if (filterTags) {
		return !(
			children.length === 1 &&
			children[0].type === "element" &&
			children[0].tagName === "p"
		);
	}
	return false;
}

/**
 * Filters tags based on specific keywords.
 *
 * @param tag - The tag string to be checked.
 * @returns A boolean indicating whether the tag includes any of the specified keywords
 */
export function filterTags(tag: string) {
	return !reJsDocTagFilter.test(tag);
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
 * Splits the given code string into an array of objects, each containing the line index and the line content.
 *
 * @param code - The code string to be split into lines.
 * @returns An array of objects, each with an `index` representing the line number and a `line` containing the line content.
 */
export function splitCodeToLines(code: string): {
	index: number;
	line: string;
}[] {
	return code.split("\n").map((line, index) => ({ index, line }));
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

/**
 * Checks if the given node is of type `NodeCompletion`.
 *
 * @param node - The node to check.
 * @returns True if the node is of type `NodeCompletion`, otherwise false.
 */
function isNodeCompletion(node: TwoslashNode): node is NodeCompletion {
	return node.type === "completion";
}

/**
 * Compares two TwoslashNode objects based on specified criteria.
 *
 * @param node1 - The first TwoslashNode to compare.
 * @param node2 - The second TwoslashNode to compare.
 * @param checks - An object specifying which properties to check for equality.
 * @param checks.line - If true, compares the line property of the nodes.
 * @param checks.start - If true, compares the start property of the nodes.
 * @param checks.character - If true, compares the character property of the nodes.
 * @param checks.length - If true, compares the length property of the nodes.
 * @param checks.text - If true, compares the text property of the nodes.
 * @returns A boolean indicating whether the nodes are considered equal based on the specified criteria.
 */
export function compareNodes(
	node1: TwoslashNode,
	node2: TwoslashNode,
	checks: {
		line?: boolean;
		start?: boolean;
		character?: boolean;
		length?: boolean;
		text?: boolean;
	},
) {
	if (checks.line && node1.line !== node2.line) {
		return false;
	}
	if (checks.start && node1.start !== node2.start) {
		return false;
	}
	if (checks.character && node1.character !== node2.character) {
		return false;
	}
	if (checks.length && node1.length !== node2.length) {
		return false;
	}
	if (
		!isNodeCompletion(node1) &&
		!isNodeCompletion(node2) &&
		checks.text &&
		node1.text !== node2.text
	) {
		return false;
	}

	// If no checks failed, the nodes are considered equal
	return true;
}
