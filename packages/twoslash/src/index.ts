import {
	definePlugin,
	ExpressiveCodeAnnotation,
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
 * A plugin function that processes code blocks with the twoslash syntax.
 *
 * @param options - Configuration options for the plugin.
 * @param options.explicitTrigger - A boolean or RegExp to explicitly trigger the transformation. Defaults to `true`.
 * @param options.languages - An array of languages to apply the transformation to. Defaults to `["ts", "tsx"]`.
 * @param options.twoslashOptions - Additional options to pass to the twoslasher.
 *
 * @example config
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
			'import{computePosition as e,offset as t,shift as s,size as o}from"https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.10/+esm";function setupTooltip(a){let i=document.body,r=a.querySelector(".twoslash-popup-container"),n=`twoslash_popup_${[Math.random(),Date.now()].map(e=>e.toString(36).substring(2,10)).join("_")}`;r&&r.parentNode&&r.parentNode.removeChild(r),a.addEventListener("mouseenter",()=>{i.appendChild(r),new Promise(e=>requestAnimationFrame(()=>{requestAnimationFrame(e)})).then(()=>e(a,r,{placement:"bottom-start",middleware:[t({mainAxis:1}),s({padding:10}),o({padding:10,apply({availableHeight:e,availableWidth:t}){Object.assign(r.style,{maxWidth:`${Math.max(0,t)}px`,maxHeight:`${Math.max(0,e)}px`})}}),]})).then(({x:e,y:t})=>{Object.assign(r.style,{display:"block",left:`${e}px`,top:`${t}px`})}),r.setAttribute("aria-hidden","false"),a.querySelector(".twoslash-hover span")?.setAttribute("aria-describedby",n),r.setAttribute("id",n)}),a.addEventListener("mouseleave",()=>{i.removeChild(r),r.setAttribute("aria-hidden","true"),a.querySelector(".twoslash-hover span")?.removeAttribute("aria-describedby"),r.removeAttribute("id")})}function initTwoslashPopups(e){e.querySelectorAll?.(".twoslash").forEach(e=>{setupTooltip(e)})}initTwoslashPopups(document);let newTwoslashPopupObserver=new MutationObserver(e=>e.forEach(e=>e.addedNodes.forEach(e=>{initTwoslashPopups(e)})));newTwoslashPopupObserver.observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("astro:page-load",()=>{initTwoslashPopups(document)});',
		],
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
							h("code.twoslash-popup-code", node.properties, [this.hover.text]),
							...(this.hover.docs
								? [h("div.twoslash-popup-docs", [h("p", [this.hover.docs])])]
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
