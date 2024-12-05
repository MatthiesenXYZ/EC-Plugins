import { type Element, h } from "@expressive-code/core/hast";
import type { ExpressiveCode } from "expressive-code";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { toHast } from "mdast-util-to-hast";
import type { NodeHover, NodeQuery } from "twoslash";
import type { RenderJSDocs } from "../types";
import {
	jsdocTags,
	reFunctionCleanup,
	reImportStatement,
	reInterfaceOrNamespace,
	reJsDocLink,
	reJsDocTagFilter,
	reLeadingPropertyMethod,
	reTypeCleanup,
} from "./regex";

/**
 * Renders markdown content with code blocks using ExpressiveCode.
 *
 * This function processes the given markdown string, converts it to an MDAST (Markdown Abstract Syntax Tree),
 * and then transforms it into HAST (Hypertext Abstract Syntax Tree) with custom handlers for code blocks.
 * It then uses ExpressiveCode to render the code blocks with syntax highlighting and other features.
 *
 * @param md - The markdown string to be processed.
 * @param ec - An instance of ExpressiveCode used to render the code blocks.
 * @returns A promise that resolves to an array of HAST nodes representing the processed markdown content.
 */
export async function renderMarkdownWithCodeBlocks(
	md: string,
	ec: ExpressiveCode,
) {
	const mdast = fromMarkdown(
		md.replace(reJsDocLink, "$1"), // replace jsdoc links
		{ mdastExtensions: [gfmFromMarkdown()] },
	);

	const nodes = toHast(mdast, {
		handlers: {
			code: (_, node) => {
				const lang = (node.lang as string) || "plaintext";
				return {
					type: "element",
					tagName: "div",
					properties: {
						class: "expressive-code",
						"data-lang": lang,
					},
					children: [
						{
							type: "text",
							value: node.value,
						},
					],
				} as Element;
			},
		},
	}) as Element;

	const codeBlocks = nodes.children
		? nodes.children.filter(
				(node) =>
					node.type === "element" &&
					node.tagName === "div" &&
					node.properties.class === "expressive-code",
			)
		: [];

	for (const codeBlock of codeBlocks) {
		if (codeBlock.type === "element") {
			codeBlock.children =
				codeBlock.type === "element" && codeBlock.children[0].type === "text"
					? // Render the code block using ExpressiveCode
						(
							await ec
								.render({
									code: codeBlock.children[0].value,
									language: codeBlock.properties["data-lang"] as string,
								})
								.then((res) => {
									// Remove the data-lang attribute after rendering
									codeBlock.properties["data-lang"] = null;

									return res;
								})
						).renderedGroupAst.children
					: [];
		}
	}

	return nodes.children;
}

/**
 * Renders the given markdown string inline using the ExpressiveCode instance.
 *
 * This function processes the markdown string and returns the rendered children.
 * If the rendered children contain a single paragraph element, it returns the children of that paragraph.
 * Otherwise, it returns the entire rendered children array.
 *
 * @param md - The markdown string to be rendered.
 * @param ec - The ExpressiveCode instance used for rendering.
 * @returns A promise that resolves to the rendered children.
 */
export async function renderMDInline(md: string, ec: ExpressiveCode) {
	const children = await renderMarkdownWithCodeBlocks(md, ec);

	if (
		children.length === 1 &&
		children[0].type === "element" &&
		children[0].tagName === "p"
	)
		return children[0].children;
	return children;
}

/**
 * Checks if the given markdown string consists of a single paragraph element.
 *
 * @param md - The markdown string to check.
 * @param filterTags - A boolean indicating whether to filter tags.
 * @returns A boolean indicating if the markdown string is a single paragraph element.
 */
export async function checkIfSingleParagraph(
	md: string,
	filterTags: boolean,
	ec: ExpressiveCode,
): Promise<boolean> {
	const children = await renderMDInline(md, ec);
	if (filterTags) {
		return !(
			children.length === 1 &&
			children[0].type === "element" &&
			children[0].tagName === "p"
		);
	}
	return false;
}

/**
 * The default hover info processor, which will do some basic cleanup
 */
export function defaultHoverInfoProcessor(type: string): string | boolean {
	let content = type
		// remove leading `(property)` or `(method)` on each line
		.replace(reLeadingPropertyMethod, "")
		// remove import statement
		.replace(reImportStatement, "")
		// remove interface or namespace lines with only the name
		.replace(reInterfaceOrNamespace, "")
		.trim();

	// Add `type` or `function` keyword if needed
	if (content.match(reTypeCleanup)) content = `type ${content}`;
	else if (content.match(reFunctionCleanup)) content = `function ${content}`;

	if (content.length === 0) {
		return false;
	}

	return content;
}

/**
 * Filters tags based on specific keywords.
 *
 * @param tag - The tag string to be checked.
 * @returns A boolean indicating whether the tag includes any of the specified keywords
 */
export function filterTags(tag: string) {
	return !reJsDocTagFilter.test(tag);
}

/**
 * Renders the type information for the given text using the provided ExpressiveCode instance.
 *
 * @param text - The text to be processed and rendered.
 * @param ec - An instance of ExpressiveCode used for rendering the text.
 * @returns A promise that resolves to the rendered group AST.
 */
export async function renderType(text: string, ec: ExpressiveCode) {
	const info = defaultHoverInfoProcessor(text);
	if (typeof info === "string") {
		const { renderedGroupAst } = await ec.render({
			code: info,
			language: "ts",
			meta: "",
		});
		return renderedGroupAst;
	}
	const { renderedGroupAst } = await ec.render({
		code: text,
		language: "ts",
		meta: "",
	});
	return renderedGroupAst;
}

/**
 * Renders JSDoc comments for a given hover node.
 *
 * @param hover - The hover node containing documentation and tags.
 * @param includeJsDoc - A boolean indicating whether to include JSDoc comments.
 * @param ec - The ExpressiveCode instance used for rendering.
 * @returns A promise that resolves to an object containing rendered documentation and tags.
 */
export async function renderJSDocs(
	hover: NodeHover | NodeQuery,
	includeJsDoc: boolean,
	ec: ExpressiveCode,
	allowNonStandardJsDocTags: boolean,
): Promise<RenderJSDocs> {
	if (!includeJsDoc) return { docs: [], tags: [] };
	return {
		docs: hover.docs
			? h("div.twoslash-popup-docs", [
					h(
						"p",
						hover.docs
							? await renderMarkdownWithCodeBlocks(hover.docs, ec)
							: [],
					),
				])
			: [],
		tags: hover.tags
			? h("div.twoslash-popup-docs.twoslash-popup-docs-tags", [
					...(await Promise.all(
						hover.tags
							? hover.tags.map(async (tag) =>
									(
										allowNonStandardJsDocTags
											? true
											: jsdocTags.includes(tag[0])
									)
										? h("p.twoslash-popup-docs-tagline", [
												h("span.twoslash-popup-docs-tag-name", `@${tag[0]}`),
												tag[1]
													? [
															(await checkIfSingleParagraph(
																tag[1],
																filterTags(tag[0]),
																ec,
															))
																? " ― "
																: " ",
															h(
																"span.twoslash-popup-docs-tag-value",
																await renderMDInline(tag[1], ec),
															),
														]
													: [],
											])
										: [],
								)
							: [],
					)),
				])
			: [],
	};
}
