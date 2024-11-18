import {
	type AnnotationRenderOptions,
	ExpressiveCodeAnnotation,
	type ExpressiveCodeLine,
} from "@expressive-code/core";
import { type Element, h } from "@expressive-code/core/hast";
import type { NodeQuery } from "twoslash";
import { getTextWidthInPixels } from "../helpers";
import type { RenderJSDocs } from "../types";

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
		readonly codeType: Element,
		readonly renderedDocs: RenderJSDocs,
	) {
		super({
			inlineRange: {
				columnStart: line.text.length,
				columnEnd: line.text.length + query.length,
			},
		});
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
							h("code.twoslash-popup-code", [
								h("span.twoslash-popup-code-type", this.codeType),
							]),
							this.renderedDocs.docs,
							this.renderedDocs.tags,
						]),
					],
				),
			]);
		});
	}
}
