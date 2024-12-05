import {
	type AnnotationRenderOptions,
	ExpressiveCodeAnnotation,
} from "@expressive-code/core";
import { type Element, type Root, h } from "@expressive-code/core/hast";
import type { NodeHover } from "twoslash";
import type { RenderJSDocs } from "../types";

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
		readonly codeType: Element,
		readonly renderedDocs: RenderJSDocs,
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
							"div.twoslash-popup-container.not-content",

							[
								h("code.twoslash-popup-code", [
									h("span.twoslash-popup-code-type", this.codeType),
								]),
								this.renderedDocs.docs,
								this.renderedDocs.tags,
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
