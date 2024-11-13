import {
	type AnnotationRenderOptions,
	ExpressiveCodeAnnotation,
	type ExpressiveCodeLine,
} from "@expressive-code/core";
import { h } from "@expressive-code/core/hast";
import type { NodeQuery } from "twoslash";
import {
	defaultHoverInfoProcessor,
	getTextWidthInPixels,
	renderMarkdown,
	checkIfSingleParagraph,
	filterTags,
	renderMarkdownInline,
} from "../helpers";
import { jsdocTags } from "../regex";

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
		readonly query: NodeQuery,
		readonly line: ExpressiveCodeLine,
		readonly includeJsDoc: boolean,
	) {
		super({
			inlineRange: {
				columnStart: line.text.length,
				columnEnd: line.text.length + query.length,
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
							this.getHoverInfo(this.query.text),
							...(this.query.docs && this.includeJsDoc
								? [
										h("div.twoslash-popup-docs", [
											h("p", [renderMarkdown(this.query.docs)]),
										]),
									]
								: []),
							...(this.query.tags && this.includeJsDoc
								? [
										h("div.twoslash-popup-docs.twoslash-popup-docs-tags", [
											...this.query.tags.map((tag) =>
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