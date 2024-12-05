import {
	type AnnotationRenderOptions,
	ExpressiveCodeAnnotation,
	type ExpressiveCodeLine,
} from "@expressive-code/core";
import { h } from "@expressive-code/core/hast";
import type { NodeCompletion } from "twoslash";
import { getTextWidthInPixels } from "../helpers";
import type { CompletionItem } from "../types";

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
