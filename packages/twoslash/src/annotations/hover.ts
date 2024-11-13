import {
	ExpressiveCodeAnnotation,
	type AnnotationRenderOptions,
} from "@expressive-code/core";
import { h, type Root, type Element } from "@expressive-code/core/hast";
import type { NodeHover } from "twoslash";
import {
	defaultHoverInfoProcessor,
	renderMarkdown,
	checkIfSingleParagraph,
	filterTags,
	renderMarkdownInline,
} from "../helpers";
import { jsdocTags } from "../regex";

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
