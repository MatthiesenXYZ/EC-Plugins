import { definePlugin, type ExpressiveCodeBlock } from "@expressive-code/core";
import { createTwoslasher, type TwoslashOptions } from "twoslash";
import ts from "typescript";
import type { CompilerOptions } from "typescript";
import popupModule from "./module-code/popup.min";
import {
	TwoslashErrorBoxAnnotation,
	TwoslashHoverAnnotation,
} from "./annotation";
import { getTwoSlashBaseStyles, twoSlashStyleSettings } from "./styles";
import { cleanFlags, processCutOffPoints } from "./helpers";

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
export default function ecTwoSlash(options: PluginTwoslashOptions = {}) {
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
		twoslashOptions,
	} = options;

	/**
	 * Initializes and returns a new instance of the Twoslasher.
	 *
	 * @returns {Twoslasher} A new instance of the Twoslasher.
	 */
	const twoslasher = createTwoslasher();

	/**
	 * Determines the trigger pattern for the twoslash functionality.
	 * If `explicitTrigger` is an instance of `RegExp`, it uses that as the trigger.
	 * Otherwise, it defaults to the regular expression pattern `\btwoslash\b`.
	 *
	 * @param explicitTrigger - The explicit trigger which can be a `RegExp` instance.
	 * @returns The trigger pattern as a `RegExp`.
	 */
	const trigger =
		explicitTrigger instanceof RegExp ? explicitTrigger : /\btwoslash\b/;

	/**
	 * Determines if a given code block should be transformed based on its language and metadata.
	 *
	 * @param codeBlock - The code block to check for transformation eligibility.
	 * @returns `true` if the code block's language is included in the list of languages and, if an explicit trigger is defined, the code block's metadata matches the trigger pattern; otherwise, `false`.
	 */
	function shouldTransform(codeBlock: ExpressiveCodeBlock) {
		return (
			languages.includes(codeBlock.language) &&
			(!explicitTrigger || trigger.test(codeBlock.meta))
		);
	}

	return definePlugin({
		name: "@matthiesenxyz/expressive-code-twoslash",
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

					// Generate the hover annotations
					for (const hover of twoslash.hovers) {
						const line = context.codeBlock.getLine(hover.line);
						if (line) {
							line.addAnnotation(
								new TwoslashHoverAnnotation(
									hover,
									includeJsDoc,
									twoslash.queries,
								),
							);
						}
					}

					// Generate the error annotations
					for (const error of twoslash.errors) {
						const line = context.codeBlock.getLine(error.line);

						if (line) {
							line.addAnnotation(new TwoslashErrorBoxAnnotation(error, line));
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
