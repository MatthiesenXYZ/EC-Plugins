import {
	ExpressiveCodeAnnotation,
	type ExpressiveCodeLine,
	type AnnotationRenderOptions,
} from "@expressive-code/core";
import {
	h,
	type Root,
	type Element,
	type ElementContent,
} from "@expressive-code/core/hast";
import type { NodeCompletion, NodeError, NodeHover, NodeQuery } from "twoslash";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { toHast } from "mdast-util-to-hast";
import {
	reFunctionCleanup,
	reImportStatement,
	reInterfaceOrNamespace,
	reJsDocLink,
	reJsDocTagFilter,
	reLeadingPropertyMethod,
	reTypeCleanup,
} from "./regex";
import type { CompletionItem } from "./helpers";

/**
 * The default hover info processor, which will do some basic cleanup
 */
function defaultHoverInfoProcessor(type: string): string {
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

	return content;
}

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
function renderMarkdown(md: string): ElementContent[] {
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
function renderMarkdownInline(md: string): ElementContent[] {
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
function filterTags(tag: string) {
	return reJsDocTagFilter.test(tag);
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
function getErrorLevelClass(error: NodeError): string {
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
function getErrorLevelString(error: NodeError): string {
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
 * Represents an annotation for displaying error boxes in Twoslash.
 * Extends the `ExpressiveCodeAnnotation` class.
 */
export class TwoslashErrorBoxAnnotation extends ExpressiveCodeAnnotation {
	/**
	 * Creates an instance of `TwoslashErrorBoxAnnotation`.
	 *
	 * @param error - The error object containing error details.
	 * @param line - The line of code where the error occurred.
	 */
	constructor(
		readonly error: NodeError,
		readonly line: ExpressiveCodeLine,
	) {
		super({
			inlineRange: {
				columnStart: line.text.length,
				columnEnd: line.text.length + error.length,
			},
		});
	}

	/**
	 * Renders the error box annotation.
	 *
	 * @param nodesToTransform - The nodes to transform with the error box annotation.
	 * @returns An array of transformed nodes with the error box annotation.
	 */
	render({ nodesToTransform }: AnnotationRenderOptions): Element[] {
		const error = this.error;
		const errorLevelClass = getErrorLevelClass(error);

		return nodesToTransform.map((node) => {
			return h("span.twoslash.twoerror", [
				node,
				h(
					"div.twoslash-error-box",
					{
						class: errorLevelClass,
					},
					[
						h("span.twoslash-error-box-icon"),
						h("span.twoslash-error-box-content", [
							h("span.twoslash-error-box-content-title", [
								`${getErrorLevelString(error)} ${error.code && `ts(${error.code}) `} ― `,
							]),
							h("span.twoslash-error-box-content-message", [error.text]),
						]),
					],
				),
			]);
		});
	}
}

function getTextWidthInPixels(
	textLoc: number,
	fontSize = 16,
	charWidth = 8,
): number {
	return textLoc * charWidth * (fontSize / 16);
}

export class TwoslashStaticAnnotation extends ExpressiveCodeAnnotation {
	constructor(
		readonly hover: NodeHover,
		readonly line: ExpressiveCodeLine,
		readonly includeJsDoc: boolean,
		readonly query: NodeQuery,
	) {
		super({
			inlineRange: {
				columnStart: line.text.length,
				columnEnd: line.text.length + hover.length,
			},
		});
	}

	/**
	 * Renders the error box annotation.
	 *
	 * @param nodesToTransform - The nodes to transform with the error box annotation.
	 * @returns An array of transformed nodes with the error box annotation.
	 */
	render({ nodesToTransform }: AnnotationRenderOptions) {
		return nodesToTransform.map((node) => {
			return h("span.twoslash-noline", [
				node,
				h(
					"div.twoslash-static",
					{
						style: {
							"margin-left": `${getTextWidthInPixels(this.query.character)}px`,
						},
					},
					[
						h("div.twoslash-static-container", [
							h("code.twoslash-popup-code", [
								h(
									"span.twoslash-popup-code-type",
									defaultHoverInfoProcessor(this.hover.text),
								),
							]),
							...(this.hover.docs && this.includeJsDoc
								? [
										h("div.twoslash-popup-docs", [
											h("p", [renderMarkdown(this.hover.docs)]),
										]),
									]
								: []),
							...(this.hover.tags && this.includeJsDoc
								? [
										h("div.twoslash-popup-docs.twoslash-popup-docs-tags", [
											h("p", [
												...this.hover.tags.map((tag) =>
													h("p", [
														h(
															"span.twoslash-popup-docs-tag-name",
															`@${tag[0]}`,
														),
														tag[1]
															? [
																	filterTags(tag[0]) ? " ― " : " ",
																	h(
																		"span.twoslash-popup-docs-tag-value",
																		renderMarkdownInline(tag[1]),
																	),
																]
															: [],
													]),
												),
											]),
										]),
									]
								: []),
						]),
					],
				),
			]);
		});
	}
}

/**
 * Represents a hover annotation for Twoslash.
 * Extends the `ExpressiveCodeAnnotation` class to provide hover functionality.
 */
export class TwoslashHoverAnnotation extends ExpressiveCodeAnnotation {
	/**
	 * Creates an instance of `TwoslashHoverAnnotation`.
	 * @param hover - The hover information including character position and text.
	 */
	constructor(
		readonly hover: NodeHover,
		readonly includeJsDoc: boolean,
	) {
		super({
			inlineRange: {
				columnStart: hover.character,
				columnEnd: hover.character + hover.length,
			},
		});
	}

	/**
	 * Renders the hover annotation.
	 * @param nodesToTransform - The nodes to be transformed with hover annotations.
	 * @returns The transformed nodes with hover annotations.
	 */
	render({ nodesToTransform }: AnnotationRenderOptions): (Root | Element)[] {
		return nodesToTransform.map((node) => {
			if (node.type === "element") {
				return h("span.twoslash", node.properties, [
					h("span.twoslash-hover", [
						h(
							"div.twoslash-popup-container",

							[
								h("code.twoslash-popup-code", node.properties, [
									h(
										"span.twoslash-popup-code-type",
										defaultHoverInfoProcessor(this.hover.text),
									),
								]),
								...(this.hover.docs && this.includeJsDoc
									? [
											h("div.twoslash-popup-docs", [
												h("p", [renderMarkdown(this.hover.docs)]),
											]),
										]
									: []),
								...(this.hover.tags && this.includeJsDoc
									? [
											h("div.twoslash-popup-docs.twoslash-popup-docs-tags", [
												h("p", [
													...this.hover.tags.map((tag) =>
														h("p", [
															h(
																"span.twoslash-popup-docs-tag-name",
																`@${tag[0]}`,
															),
															tag[1]
																? [
																		filterTags(tag[0]) ? " ― " : " ",
																		h(
																			"span.twoslash-popup-docs-tag-value",
																			renderMarkdownInline(tag[1]),
																		),
																	]
																: [],
														]),
													),
												]),
											]),
										]
									: []),
							],
						),
						node,
					]),
				]);
			}
			return node;
		});
	}
}

export class TwoslashCompletionAnnotation extends ExpressiveCodeAnnotation {
	constructor(
		readonly completion: CompletionItem,
		readonly query: NodeCompletion,
	) {
		super({
			inlineRange: {
				columnStart: completion.startCharacter,
				columnEnd: completion.startCharacter + completion.length,
			},
		});
	}

	/**
	 * Renders the error box annotation.
	 *
	 * @param nodesToTransform - The nodes to transform with the error box annotation.
	 * @returns An array of transformed nodes with the error box annotation.
	 */
	render({ nodesToTransform }: AnnotationRenderOptions) {
		return nodesToTransform.map((node) => {
			return h("span", [
				h("span.twoslash-cursor", [node]),
				h(
					"div.twoslash-completion",
					{
						style: {
							"margin-left": `${getTextWidthInPixels(this.completion.startCharacter)}px`,
						},
					},
					[
						h("div.twoslash-completion-container", [
							...this.completion.items.map((item, index) => {
								return h(
									"div.twoslash-completion-item",
									{
										class: `
										${
											item.isDeprecated
												? "twoslash-completion-item-deprecated"
												: ""
										} ${index === 0 ? "" : "twoslash-completion-item-separator"}`,
									},
									[
										h("span.twoslash-completion-icon", item.icon),
										h("span.twoslash-completion-name", [
											h("span.twoslash-completion-name-matched", [
												item.name.startsWith(this.query.completionsPrefix)
													? this.query.completionsPrefix
													: "",
											]),
											h("span.twoslash-completion-name-unmatched", [
												item.name.startsWith(this.query.completionsPrefix)
													? item.name.slice(
															this.query.completionsPrefix.length || 0,
														)
													: item.name,
											]),
										]),
									],
								);
							}),
						]),
					],
				),
			]);
		});
	}
}
