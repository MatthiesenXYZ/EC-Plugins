import {
	type AnnotationRenderOptions,
	ExpressiveCodeAnnotation,
	type ExpressiveCodeLine,
} from "@expressive-code/core";
import { type Element, h } from "@expressive-code/core/hast";
import type { NodeTag } from "twoslash";
import { getCustomTagClass, getCustomTagString } from "../helpers";
import { customTagsIcons } from "../icons/customTagsIcons";
import type { CustomTagsIcon, TwoslashTag } from "../types";

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
