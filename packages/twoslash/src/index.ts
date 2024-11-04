import {
	definePlugin,
	ExpressiveCodeAnnotation,
	PluginStyleSettings,
	type AnnotationRenderOptions,
	type ExpressiveCodeBlock,
} from "@expressive-code/core";
import { h } from "@expressive-code/core/hast";
import {
	createTwoslasher,
	type NodeHover,
	type TwoslashOptions,
} from "twoslash";
import ts from "typescript";
import type { CompilerOptions } from "typescript";
import type { Element, ElementContent } from "hast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { defaultHandlers, toHast } from "mdast-util-to-hast";

const defaultCompilerOptions: CompilerOptions = {
	strict: true,
	target: ts.ScriptTarget.ES2022,
	exactOptionalPropertyTypes: true,
	downlevelIteration: true,
	skipLibCheck: true,
	lib: ["ES2022", "DOM", "DOM.Iterable"],
	noEmit: true,
};

/**
 * Interface representing the options for the PluginTwoslash.
 */
export interface PluginTwoslashOptions {
	/**
	 * If `true`, requires `twoslash` to be present in the code block meta for
	 * this transformer to be applied.
	 *
	 * If a `RegExp`, requires the `RegExp` to match a directive in the code
	 * block meta for this transformer to be applied.
	 *
	 * If `false`, this transformer will be applied to all code blocks.
	 *
	 * @default true
	 */
	readonly explicitTrigger?: boolean | RegExp;

	/**
	 * The languages to apply this transformer to.
	 *
	 * @default ["ts", "tsx"]
	 */
	readonly languages?: ReadonlyArray<string>;

	/**
	 * Options to forward to `twoslash`.
	 *
	 * @default {}
	 */
	readonly twoslashOptions?: TwoslashOptions;
}

/**
 * A Expressive Code Plugin that transforms code blocks with Twoslash annotations.
 *
 * @param options - Configuration options for the plugin.
 * @param options.explicitTrigger - A boolean or RegExp to explicitly trigger the transformation. Defaults to `true`.
 * @param options.languages - An array of languages to apply the transformation to. Defaults to `["ts", "tsx"]`.
 * @param options.twoslashOptions - Additional options to pass to the twoslasher.
 *
 * @example
 * ```ts
 * import { defineConfig } from "astro/config";
 * import starlight from "@astrojs/starlight";
 * import ectwoslash from "@matthiesenxyz/ec-twoslash";
 *
 * // https://astro.build/config
 * export default defineConfig({
 *   integrations: [
 *     starlight({
 *       title: "Starlight",
 *       customCss: ["@matthiesenxyz/ec-twoslash/css"],
 *       expressiveCode: {
 *         plugins: [ectwoslash()],
 *       },
 *     }),
 *   ],
 * });
 * ```
 *
 * @returns A plugin object with the specified configuration.
 */
export default function pluginCodeOutput(options: PluginTwoslashOptions = {}) {
	const {
		explicitTrigger = true,
		languages = ["ts", "tsx"],
		twoslashOptions,
	} = options;

	const twoslasher = createTwoslasher();

	const trigger =
		explicitTrigger instanceof RegExp ? explicitTrigger : /\btwoslash\b/;

	function shouldTransform(codeBlock: ExpressiveCodeBlock) {
		return (
			languages.includes(codeBlock.language) &&
			(!explicitTrigger || trigger.test(codeBlock.meta))
		);
	}

	return definePlugin({
		name: "@plugins/twoslash",
		jsModules: [
			// Minified ./module-code/popups.js
			'import{computePosition as e,offset as t,shift as s,size as o}from"https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.10/+esm";function setupTooltip(a){let i=document.querySelector(".main-pane") || document.body,r=a.querySelector(".twoslash-popup-container"),n=`twoslash_popup_${[Math.random(),Date.now()].map(e=>e.toString(36).substring(2,10)).join("_")}`;r&&r.parentNode&&r.parentNode.removeChild(r),a.addEventListener("mouseenter",()=>{i.appendChild(r),new Promise(e=>requestAnimationFrame(()=>{requestAnimationFrame(e)})).then(()=>e(a,r,{placement:"bottom-start",middleware:[t({mainAxis:1}),s({padding:10}),o({padding:10,apply({availableHeight:e,availableWidth:t}){Object.assign(r.style,{maxWidth:`${Math.max(0,t)}px`,maxHeight:`${Math.max(0,e)}px`})}}),]})).then(({x:e,y:t})=>{Object.assign(r.style,{display:"block",left:`${e}px`,top:`${t}px`})}),r.setAttribute("aria-hidden","false"),a.querySelector(".twoslash-hover span")?.setAttribute("aria-describedby",n),r.setAttribute("id",n)}),a.addEventListener("mouseleave",()=>{i.removeChild(r),r.setAttribute("aria-hidden","true"),a.querySelector(".twoslash-hover span")?.removeAttribute("aria-describedby"),r.removeAttribute("id")})}function initTwoslashPopups(e){e.querySelectorAll?.(".twoslash").forEach(e=>{setupTooltip(e)})}initTwoslashPopups(document);let newTwoslashPopupObserver=new MutationObserver(e=>e.forEach(e=>e.addedNodes.forEach(e=>{initTwoslashPopups(e)})));newTwoslashPopupObserver.observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("astro:page-load",()=>{initTwoslashPopups(document)});',
			// Minified ./module-code/resizer.js
			'const calculateTwoslashPopupSize=()=>{let e=document.querySelectorAll(".mane-pane");for(let t of e){let l=t.querySelectorAll(".twoslash-popup-container");for(let o of l){let i=t.clientWidth,n=o.getBoundingClientRect().left-t.getBoundingClientRect().left+16,a=o.clientWidth;a>i-n&&o.style.setProperty("width",`${i-n}px`,"important")}}};calculateTwoslashPopupSize(),document.addEventListener("resize",calculateTwoslashPopupSize);',
		],
		styleSettings: new PluginStyleSettings({
			defaultValues: {
				twoSlash: {
					borderColor: ({ theme }) => theme.colors["panel.border"],
					textColor: ({ theme }) => theme.fg,
					titleColor: ({ theme }) => theme.colors["terminal.ansiMagenta"],
					tagColor: ({ theme }) => theme.colors["terminal.ansiBrightBlue"],
					tagColorDark: ({ theme }) => theme.colors["terminal.ansiBlue"],
				},
			},
		}),
		baseStyles({ cssVar }) {
			return `
			:root[data-theme="dark"] {
				.twoslash-popup-code {
					color: var(--1, inherit);
				}
				
				.twoslash-popup-docs-tag-name {
					color: ${cssVar("twoSlash.tagColor")};
				}
			}

			:root {
				--twoslash-border: ${cssVar("twoSlash.borderColor")};
				--twoslash-text-color: ${cssVar("twoSlash.textColor")};
				--twoslash-underline-color: currentColor;
				--twoslash-tag-color: ${cssVar("twoSlash.tagColorDark")};
				--twoslash-title-color: ${cssVar("twoSlash.titleColor")};

				.main-pane { z-index: 1; }

				.twoslash-popup-docs-tag-name {
					color: var(--twoslash-tag-color);
					font-style: italic;
					--shiki-dark-font-style: italic;
					font-weight: 500;
				}

				.twoslash { position: relative; }

				@media (prefers-reduced-motion: reduce) {
					.twoslash * { 
						transition: none !important; 
					}
				}

				/* ===== Hover Info ===== */
				.twoslash .twoslash-hover {
					position: relative;
					border-bottom: 1px dotted transparent;
					transition-timing-function: ease;
					transition: border-color 0.3s;
				}

				.twoslash:hover .twoslash-hover {
					border-color: var(--twoslash-underline-color);
				}

				.twoslash .twoslash-popup-container {
					display: none;
				}

				.twoslash-popup-container {
					position: absolute;
					z-index: 10;
					background: var(--ec-frm-edBg);
					border: 1px solid var(--twoslash-border);
					border-radius: 4px;
					font-size: 90%;
					overflow-y: auto;
					white-space: nowrap !important;
					word-break: normal !important;
					overflow-wrap: normal !important;
					width: max-content !important;
				}

				.twoslash-popup-container * {
					white-space: wrap !important;
					word-break: normal !important;
					overflow-wrap: normal !important;
				}

				.twoslash-popup-code {
					display: block;
					width: fit-content;
					max-width: 600px;
					min-width: 100%;
					padding: 6px 12px;
  					color: var(--0);
					font-family: var(--__sl-font);
					font-size: var(--sl-text-code);
					font-weight: 400;
					line-height: var(--sl-line-height);
					white-space: pre-wrap;
				}

				.twoslash-popup-docs {
					max-width: 600px;
					max-height: 500px;
					padding: 12px;
					border-top: 1px solid var(--twoslash-border);
					font-size: var(--sl-text-code);
					font-weight: 400;
					line-height: var(--sl-line-height);
					text-wrap: balance;
				}

				.twoslash-popup-code,
				.twoslash-popup-docs {
					overflow: none !important;
				}

				.twoslash-popup-docs code:not(:has(.shiki)) {
					background-color: var(--ec-frm-edBg) !important;
					padding: .15rem !important;
					border-radius: 4px !important;
					position: relative !important;
					display: inline-block !important;
					line-height: 1 !important;
					border: 2px solid var(--ec-brdCol) !important;
				}

				.twoslash-popup-code-type {
					color: var(--twoslash-title-color) !important;
					font-weight: 600;
				}

				.twoslash-popup-docs.twoslash-popup-docs-tags {
					font-size: 14px !important;
					margin: 0 !important;
				}

				.twoslash-popup-docs pre code {
					border: none !important;
					outline: none !important;
					padding: 0 !important;
				}

				.twoslash-popup-docs code,
				.twoslash-popup-docs code span {
					white-space: preserve !important;
				}

				.twoslash-popup-docs code {
					margin: 0 !important;
					background-color: transparent !important;
					line-height: normal !important;
				}

				.twoslash-popup-docs code span::after {
					content: none !important;
				}
			}
			`;
		},
		hooks: {
			preprocessCode(context) {
				if (shouldTransform(context.codeBlock)) {
					const twoslash = twoslasher(
						context.codeBlock.code,
						context.codeBlock.language,
						{
							...twoslashOptions,
							compilerOptions: {
								...defaultCompilerOptions,
								...(twoslashOptions?.compilerOptions ?? {}),
							},
						},
					);

					for (const hover of twoslash.hovers) {
						const line = context.codeBlock.getLine(hover.line);
						if (line) {
							line.addAnnotation(new TwoslashHoverAnnotation(hover));
						}
					}
				}
			},
		},
	});
}

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
class TwoslashHoverAnnotation extends ExpressiveCodeAnnotation {
	/**
	 * Creates an instance of `TwoslashHoverAnnotation`.
	 * @param hover - The hover information including character position and text.
	 */
	constructor(readonly hover: NodeHover) {
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
							...(this.hover.docs
								? [
										h("div.twoslash-popup-docs", [
											h("p", [renderMarkdown(this.hover.docs)]),
										]),
									]
								: []),
							...(this.hover.tags
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

declare module "@expressive-code/core" {
	export interface StyleSettings {
		twoSlash: {
			borderColor: string;
			textColor: string;
			tagColor: string;
			tagColorDark: string;
			titleColor: string;
		};
	}
}
