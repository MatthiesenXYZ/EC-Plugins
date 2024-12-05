import {
	type AnnotationRenderOptions,
	ExpressiveCodeAnnotation,
} from "@expressive-code/core";
import { type Element, type Root, h } from "@expressive-code/core/hast";
import type { NodeHighlight } from "twoslash";

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
