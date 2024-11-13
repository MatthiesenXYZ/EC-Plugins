import {
	type AnnotationRenderOptions,
	ExpressiveCodeAnnotation,
	type ExpressiveCodeLine,
} from "@expressive-code/core";
import { type Element, h } from "@expressive-code/core/hast";
import type { NodeError } from "twoslash";
import { getErrorLevelClass, getErrorLevelString } from "../helpers";

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
