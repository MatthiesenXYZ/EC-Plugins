import { definePlugin, type ExpressiveCodePlugin } from "@expressive-code/core";
import { createTwoslasher, type TwoslashOptions } from "twoslash";
import ts from "typescript";
import type { CompilerOptions } from "typescript";
import popupModule from "./module-code/popup.min";
import { getTwoSlashBaseStyles, twoSlashStyleSettings } from "./styles";
import {
	addCompletionAnnotations,
	addCustomTagAnnotations,
	addErrorAnnotations,
	addHighlightAnnotations,
	addHoverOrStaticAnnotations,
	buildMetaChecker,
	cleanFlags,
	processCutOffPoints,
} from "./helpers";
import { twoslashDefaultTags } from "./regex";

/**
 * Default TypeScript compiler options used in TwoSlash.
 *
 * @constant
 * @type {CompilerOptions}
 * @property {boolean} strict - Enable all strict type-checking options.
 * @property {ts.ScriptTarget} target - Specify ECMAScript target version.
 * @property {boolean} exactOptionalPropertyTypes - Ensure optional property types are exactly as declared.
 * @property {boolean} downlevelIteration - Provide full support for iterables in ES5/ES3.
 * @property {boolean} skipLibCheck - Skip type checking of declaration files.
 * @property {string[]} lib - List of library files to be included in the compilation.
 * @property {boolean} noEmit - Do not emit outputs.
 */
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
 * Merges custom tags from the provided `twoslashOptions` with the default tags.
 * Ensures that there are no duplicate tags in the final list.
 *
 * @param twoslashOptions - The options object containing custom tags to be merged.
 * @returns A new `TwoslashOptions` object with merged custom tags.
 */
export function checkForCustomTagsAndMerge(twoslashOptions: TwoslashOptions) {
	const customTags = twoslashOptions.customTags ?? [];
	const defaultTags = twoslashDefaultTags;

	const allTags: string[] = [...defaultTags];

	for (const tag of customTags) {
		if (!allTags.includes(tag)) {
			allTags.push(tag);
		}
	}

	return {
		...twoslashOptions,
		customTags: allTags,
	} as TwoslashOptions;
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
 * import ecTwoSlash from "expressive-code-twoslash";
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
export default function ecTwoSlash(
	options: PluginTwoslashOptions = {},
): ExpressiveCodePlugin {
	/**
	 * Destructures the options object to extract configuration settings.
	 *
	 * @param options - The options object containing configuration settings.
	 * @param options.explicitTrigger - Determines if the trigger should be explicit. Defaults to `true`.
	 * @param options.languages - An array of languages to be included. Defaults to `["ts", "tsx"]`.
	 * @param options.includeJsDoc - Indicates whether to include JSDoc comments. Defaults to `true`.
	 * @param options.twoslashOptions - Additional options for the twoslash plugin.
	 */
	const {
		explicitTrigger = true,
		languages = ["ts", "tsx"],
		includeJsDoc = true,
		twoslashOptions = checkForCustomTagsAndMerge(options.twoslashOptions ?? {}),
	} = options;

	/**
	 * Initializes and returns a new instance of the Twoslasher.
	 *
	 * @returns {Twoslasher} A new instance of the Twoslasher.
	 */
	const twoslasher = createTwoslasher();

	const shouldTransform = buildMetaChecker(languages, explicitTrigger);

	return definePlugin({
		name: "expressive-code-twoslash",
		jsModules: [popupModule],
		styleSettings: twoSlashStyleSettings,
		baseStyles: (context) => getTwoSlashBaseStyles(context),
		hooks: {
			preprocessCode(context) {
				if (shouldTransform(context.codeBlock)) {
					// Run twoslash on the code block
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

					// Clean TypeScript and TwoSlash flags
					cleanFlags(context.codeBlock);

					// Process cut-off points
					processCutOffPoints(context.codeBlock);

					// Generate the Custom Tag annotations
					addCustomTagAnnotations(twoslash, context.codeBlock);

					// Generate the error annotations
					addErrorAnnotations(twoslash, context.codeBlock);

					// Generate the Hover and Static Annotations
					addHoverOrStaticAnnotations(
						twoslash,
						context.codeBlock,
						includeJsDoc,
					);

					// Generate the Completion annotations
					addCompletionAnnotations(twoslash, context.codeBlock);

					// Generate the Twoslash Highlight annotations
					addHighlightAnnotations(twoslash, context.codeBlock);
				}
			},
		},
	});
}
