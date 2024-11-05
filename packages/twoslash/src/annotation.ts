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

/**
 * A regular expression to match a type annotation in the format of an uppercase letter followed by word characters,
 * optionally followed by a generic type parameter enclosed in angle brackets, and ending with a colon.
 *
 * Examples of matching strings:
 * - `TypeName:`
 * - `GenericType<T>:`
 */
const regexType = /^[A-Z]\w*(<[^>]*>)?:/;

/**
 * A regular expression to match the beginning of a function name.
 * The pattern matches zero or more word characters followed by an opening parenthesis.
 */
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

/**
 * Converts a markdown string into an array of ElementContent objects.
 *
 * This function processes the input markdown string, replacing JSDoc links with their
 * corresponding text, and then parses the markdown into an MDAST (Markdown Abstract Syntax Tree).
 * The MDAST is then transformed into a HAST (Hypertext Abstract Syntax Tree) and the children
 * of the resulting HAST element are returned.
 *
 * @param md - The markdown string to be converted.
 * @returns An array of ElementContent objects representing the parsed markdown.
 */
function renderMarkdown(md: string): ElementContent[] {
	const mdast = fromMarkdown(
		md.replace(/\{@link ([^}]*)\}/g, "$1"), // replace jsdoc links
		{ mdastExtensions: [gfmFromMarkdown()] },
	);

	return (toHast(mdast) as Element).children;
}

/**
 * Renders the given markdown string as an array of ElementContent.
 * If the rendered markdown consists of a single paragraph element,
 * it returns the children of that paragraph instead.
 *
 * @param md - The markdown string to render.
 * @returns An array of ElementContent representing the rendered markdown.
 */
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

/**
 * Filters tags based on specific keywords.
 *
 * @param tag - The tag string to be checked.
 * @returns A boolean indicating whether the tag includes any of the specified keywords: "param", "returns", "type", or "template".
 */
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
