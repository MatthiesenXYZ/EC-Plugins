import { definePlugin, type ExpressiveCodeBlock } from "@expressive-code/core";
import { createTwoslasher, type TwoslashOptions } from "twoslash";
import ts from "typescript";
import type { CompilerOptions } from "typescript";
import popupModule from "./module-code/popup.min";
import { TwoslashHoverAnnotation } from "./annotation";
import { getTwoSlashBaseStyles, twoSlashStyleSettings } from "./styles";

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
	 * If `true`, includes JSDoc comments in the hover popup.
	 *
	 * @default true
	 */
	readonly includeJsDoc?: boolean;

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
 * import ecTwoSlash from "@matthiesenxyz/ec-twoslash";
 *
 * // https://astro.build/config
 * export default defineConfig({
 *   integrations: [
 *     starlight({
 *       title: "Starlight",
 *       expressiveCode: {
 *         plugins: [ecTwoSlash()],
 *       },
 *     }),
 *   ],
 * });
 * ```
 *
 * @returns A plugin object with the specified configuration.
 */
export default function ecTwoSlash(options: PluginTwoslashOptions = {}) {
	const {
		explicitTrigger = true,
		languages = ["ts", "tsx"],
		includeJsDoc = true,
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
		name: "@matthiesenxyz/ec-twoslash",
		jsModules: [popupModule],
		styleSettings: twoSlashStyleSettings,
		baseStyles: (context) => getTwoSlashBaseStyles(context),
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
							line.addAnnotation(
								new TwoslashHoverAnnotation(hover, includeJsDoc),
							);
						}
					}
				}
			},
		},
	});
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
