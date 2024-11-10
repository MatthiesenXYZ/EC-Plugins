import {
	type AnnotationRenderOptions,
	ExpressiveCodeAnnotation,
	type ExpressiveCodeLine,
} from "@expressive-code/core";
import { type Element, type Root, h } from "@expressive-code/core/hast";
import type {
	NodeCompletion,
	NodeError,
	NodeHighlight,
	NodeHover,
	NodeQuery,
	NodeTag,
} from "twoslash";
import { customTagsIcons } from "./customTagsIcons";
import {
	checkIfSingleParagraph,
	defaultHoverInfoProcessor,
	filterTags,
	getCustomTagClass,
	getCustomTagString,
	getErrorLevelClass,
	getErrorLevelString,
	getTextWidthInPixels,
	renderMarkdown,
	renderMarkdownInline,
} from "./helpers";
import type { CompletionItem, CustomTagsIcon, TwoslashTag } from "./types";
import { jsdocTags } from "./regex";

export class TwoslashErrorUnderlineAnnotation extends ExpressiveCodeAnnotation {
	readonly name = "twoslash-error-underline";

	constructor(readonly error: NodeError) {
		super({
			inlineRange: {
				columnStart: error.character,
				columnEnd: error.character + error.length,
			},
		});
	}

	render({ nodesToTransform }: AnnotationRenderOptions): Element[] {
		return nodesToTransform.map((node) => {
			return h("span.twoslash.twoslash-error-underline", [node]);
		});
	}
}

/**
 * Represents an annotation for displaying error boxes in Twoslash.
 * Extends the `ExpressiveCodeAnnotation` class.
 */
export class TwoslashErrorBoxAnnotation extends ExpressiveCodeAnnotation {
	readonly name = "twoslash-error-box";

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

/**
 * Represents a custom annotation for Twoslash tags.
 * Extends the `ExpressiveCodeAnnotation` class to provide custom rendering for Twoslash tags.
 */
export class TwoslashCustomTagsAnnotation extends ExpressiveCodeAnnotation {
	readonly name = "twoslash-custom-tags";

	/**
	 * Creates an instance of TwoslashCustomTagsAnnotation.
	 * @param tag - The NodeTag object representing the Twoslash tag.
	 */
	constructor(
		readonly tag: NodeTag,
		readonly line: ExpressiveCodeLine,
	) {
		super({
			inlineRange: {
				columnStart: 0,
				columnEnd: line.text.length,
			},
		});
	}

	render({ nodesToTransform }: AnnotationRenderOptions): Element[] {
		const tag = this.tag;
		const customTagClass = getCustomTagClass(tag.name as TwoslashTag);

		return nodesToTransform.map((node) => {
			return h("span.twoslash.twocustom", [
				h(
					"div.twoslash-custom-box",
					{
						class: customTagClass,
					},
					[
						h("span.twoslash-custom-box-icon", [
							customTagsIcons[tag.name as CustomTagsIcon],
						]),
						h("span.twoslash-custom-box-content", [
							h("span.twoslash-custom-box-content-title", [
								`${getCustomTagString(tag.name as TwoslashTag)}:`,
							]),
							h("span.twoslash-custom-box-content-message", [` ${tag.text}`]),
						]),
					],
				),
				node,
			]);
		});
	}
}

/**
 * Represents a static annotation for Twoslash.
 * Extends the ExpressiveCodeAnnotation class.
 */
export class TwoslashStaticAnnotation extends ExpressiveCodeAnnotation {
	readonly name = "twoslash-static-annotation";
	/**
	 * Creates an instance of TwoslashStaticAnnotation.
	 *
	 * @param hover - The hover information for the node.
	 * @param line - The line of code associated with the annotation.
	 * @param includeJsDoc - A flag indicating whether to include JSDoc comments.
	 * @param query - The query information for the node.
	 */
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

	private getHoverInfo(text: string) {
		const info = defaultHoverInfoProcessor(text);

		if (info === false) {
			return [];
		}

		if (typeof info === "string") {
			return h("code.twoslash-popup-code", [
				h("span.twoslash-popup-code-type", info),
			]);
		}
	}

	/**
	 * Renders the static annotation.
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
						h("div.twoslash-static-container.not-content", [
							this.getHoverInfo(this.hover.text),
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
											...this.hover.tags.map((tag) =>
												jsdocTags.includes(tag[0])
													? h("p", [
															h(
																"span.twoslash-popup-docs-tag-name",
																`@${tag[0]}`,
															),
															tag[1]
																? [
																		checkIfSingleParagraph(
																			tag[1],
																			filterTags(tag[0]),
																		)
																			? " ― "
																			: " ",
																		h(
																			"span.twoslash-popup-docs-tag-value",
																			renderMarkdownInline(tag[1]),
																		),
																	]
																: [],
														])
													: [],
											),
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
 * Represents a highlight annotation for Twoslash.
 * Extends the `ExpressiveCodeAnnotation` class.
 */
export class TwoslashHighlightAnnotation extends ExpressiveCodeAnnotation {
	readonly name = "twoslash-highlight-annotation";
	/**
	 * Creates an instance of `TwoslashHighlightAnnotation`.
	 * @param highlight - The highlight details including start position and length.
	 */
	constructor(readonly highlight: NodeHighlight) {
		super({
			inlineRange: {
				columnStart: highlight.start,
				columnEnd: highlight.start + highlight.length,
			},
		});
	}

	/**
	 * Renders the highlight annotation.
	 * @param nodesToTransform - The nodes to be transformed.
	 * @returns An array of transformed nodes wrapped in a span with the class `twoslash-highlighted`.
	 */
	render({ nodesToTransform }: AnnotationRenderOptions): (Root | Element)[] {
		return nodesToTransform.map((node) => {
			return h("span.twoslash-highlighted", [node]);
		});
	}
}

/**
 * Represents a hover annotation for Twoslash.
 * Extends the `ExpressiveCodeAnnotation` class to provide hover functionality.
 */
export class TwoslashHoverAnnotation extends ExpressiveCodeAnnotation {
	readonly name = "twoslash-hover-annotation";
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

	private getHoverInfo(text: string) {
		const info = defaultHoverInfoProcessor(text);

		if (info === false) {
			return [];
		}

		if (typeof info === "string") {
			return h("code.twoslash-popup-code", [
				h("span.twoslash-popup-code-type", info),
			]);
		}
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
							"div.twoslash-popup-container.not-content",

							[
								this.getHoverInfo(this.hover.text),
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
												...this.hover.tags.map((tag) =>
													jsdocTags.includes(tag[0])
														? h("p", [
																h(
																	"span.twoslash-popup-docs-tag-name",
																	`@${tag[0]}`,
																),
																tag[1]
																	? [
																			checkIfSingleParagraph(
																				tag[1],
																				filterTags(tag[0]),
																			)
																				? " ― "
																				: " ",
																			h(
																				"span.twoslash-popup-docs-tag-value",
																				renderMarkdownInline(tag[1]),
																			),
																		]
																	: [],
															])
														: [],
												),
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

/**
 * Represents a completion annotation for Twoslash.
 * Extends the `ExpressiveCodeAnnotation` class.
 */
export class TwoslashCompletionAnnotation extends ExpressiveCodeAnnotation {
	readonly name = "twoslash-completion-annotation";
	/**
	 * Creates an instance of TwoslashCompletionAnnotation.
	 *
	 * @param completion - The completion item to be annotated.
	 * @param query - The node completion query.
	 */
	constructor(
		readonly completion: CompletionItem,
		readonly query: NodeCompletion,
		readonly line: ExpressiveCodeLine,
	) {
		super({
			inlineRange: {
				columnStart: completion.startCharacter,
				columnEnd: completion.startCharacter + line.text.length,
			},
		});
	}

	/**
	 * Renders the completion annotation.
	 * @param nodesToTransform - The nodes to transform with the error box annotation.
	 * @returns An array of transformed nodes with the error box annotation.
	 */
	render({ nodesToTransform }: AnnotationRenderOptions) {
		return nodesToTransform.map((node) => {
			return h("span.twoslash-noline", [
				h("span.twoslash-cursor", [" "]),
				node,
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
										h(
											"span.twoslash-completion-icon",
											{
												class: item.kind,
											},
											item.icon,
										),
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
