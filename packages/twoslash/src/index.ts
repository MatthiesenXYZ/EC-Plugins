import { definePlugin, type ExpressiveCodeBlock } from "@expressive-code/core";
import {
	createTwoslasher,
	type NodeError,
	type TwoslashOptions,
} from "twoslash";
import ts from "typescript";
import type { CompilerOptions } from "typescript";
import popupModule from "./module-code/popup.min";
import { TwoslashErrorAnnotation, TwoslashHoverAnnotation } from "./annotation";
import { getTwoSlashBaseStyles, twoSlashStyleSettings } from "./styles";

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
 * Returns a string representation of the error level.
 *
 * @param error - The error object containing the level property.
 * @returns A string that represents the error level. Possible values are:
 * - "Warning" for level "warning"
 * - "Suggestion" for level "suggestion"
 * - "Message" for level "message"
 * - "Error" for any other level
 */
function getErrorLevelString(error: NodeError) {
	switch (error.level) {
		case "warning":
			return "Warning";
		case "suggestion":
			return "Suggestion";
		case "message":
			return "Message";
		default:
			return "Error";
	}
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

					// Split the code block into lines
					const code = context.codeBlock.code.split("\n");

					// Find the TS flags in the code
					const tsFlags: number[] = code.reduce((acc, line, index) => {
						const match = line.match(/\/\/\s*@\w+/);
						if (match) {
							acc.push(index);
						}
						return acc;
					}, [] as number[]);

					// Find the two-slash flags in the code
					const twoSlashFlags: number[] = code.reduce((acc, line, index) => {
						const matchExtraction = line.match(/^\/\/\s*\^\?\s*$/gm);
						if (matchExtraction) {
							acc.push(index);
						}
						const matchCompletion = line.match(/^\/\/\s*\^\|\s*$/gm);
						if (matchCompletion) {
							acc.push(index);
						}
						return acc;
					}, [] as number[]);

					const flags = [...tsFlags, ...twoSlashFlags];

					// Remove the collections of Flags
					context.codeBlock.deleteLines(flags);

					const cutOffCode = context.codeBlock.code.split("\n");

					// Find the cut-off point for the code
					const cutOffStart = cutOffCode.findIndex(
						(line) =>
							line.includes("// ---cut---") ||
							line.includes("// ---cut-before---"),
					);

					const cutOffEnd = cutOffCode.findIndex((line) =>
						line.includes("// ---cut-after---"),
					);

					const linesToCut: number[] = [];

					if (cutOffStart !== -1) {
						for (let i = 0; i <= cutOffStart; i++) {
							linesToCut.push(i);
						}
					}

					if (cutOffEnd !== -1) {
						for (let i = cutOffEnd; i < cutOffCode.length; i++) {
							linesToCut.push(i);
						}
					}

					if (linesToCut.length) {
						context.codeBlock.deleteLines(linesToCut);
					}

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
							const errorType = getErrorLevelString(error);

							const annotationStartPoint = line.text.length + 1;

							line.editText(
								line.text.length + 1,
								line.text.length + 1 + error.text.length,
								` // ${errorType}: [${error.code}] ${error.text}`,
							);

							if (annotationStartPoint) {
								line.addAnnotation(
									new TwoslashErrorAnnotation(
										error,
										annotationStartPoint,
										line.text.length,
									),
								);
							}
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
