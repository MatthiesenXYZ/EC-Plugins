import {
	ExpressiveCodeAnnotation,
	type AnnotationRenderOptions,
} from "@expressive-code/core";
import {
	h,
	type Element,
	type ElementContent,
} from "@expressive-code/core/hast";
import type { NodeHover } from "twoslash";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { toHast } from "mdast-util-to-hast";

const regexType = /^[A-Z]\w*(<[^>]*>)?:/;
const regexFunction = /^\w*\(/;

/**
 * The default hover info processor, which will do some basic cleanup
 */
function defaultHoverInfoProcessor(type: string): string {
	let content = type
		// remove leading `(property)` or `(method)` on each line
		.replace(/^\(([\w-]+)\)\s+/gm, "")
		// remove import statement
		.replace(/\nimport .*$/, "")
		// remove interface or namespace lines with only the name
		.replace(/^(interface|namespace) \w+$/gm, "")
		.trim();

	// Add `type` or `function` keyword if needed
	if (content.match(regexType)) content = `type ${content}`;
	else if (content.match(regexFunction)) content = `function ${content}`;

	return content;
}

function renderMarkdown(md: string): ElementContent[] {
	const mdast = fromMarkdown(
		md.replace(/\{@link ([^}]*)\}/g, "$1"), // replace jsdoc links
		{ mdastExtensions: [gfmFromMarkdown()] },
	);

	return (toHast(mdast) as Element).children;
}

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

function filterTags(tag: string) {
	return (
		tag.includes("param") ||
		tag.includes("returns") ||
		tag.includes("type") ||
		tag.includes("template")
	);
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
	render({ nodesToTransform }: AnnotationRenderOptions) {
		return nodesToTransform.map((node) => {
			if (node.type === "element") {
				return h("span.twoslash", node.properties, [
					h("span.twoslash-hover", [
						h("div.twoslash-popup-container", [
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
						]),
						node,
					]),
				]);
			}
			return node;
		});
	}
}
