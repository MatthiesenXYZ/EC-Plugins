import { definePlugin, type ExpressiveCodePlugin } from "@expressive-code/core";
import { createTwoslasher } from "twoslash";
import popupModule from "./module-code/popup.min";
import { getTwoSlashBaseStyles, twoSlashStyleSettings } from "./styles";
import {
	addCompletionAnnotations,
	addCustomTagAnnotations,
	addErrorAnnotations,
	addHighlightAnnotations,
	addHoverOrStaticAnnotations,
	buildMetaChecker,
	checkForCustomTagsAndMerge,
	replaceECBlockWithTwoslashBlock,
	ecTwoslasher,
} from "./helpers";
import type { PluginTwoslashOptions } from "./types";

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
		twoslashOptions = checkForCustomTagsAndMerge(options.twoslashOptions),
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
			preprocessCode({ codeBlock }) {
				if (shouldTransform(codeBlock)) {
					// Run twoslash on the code block
					const twoslash = ecTwoslasher(twoslasher, twoslashOptions, codeBlock);

					// Hippo, I'm sorry for this function, but without it, the twoslash code
					// overlays could find themselves in the wrong place of the codeblock
					// depending on how much is going on in the code block.

					// Most users should not need to worry about this, as it is only used in the
					// codeblocks that have the `twoslash` meta tag, and this tag is configured as
					// an explicit trigger in the plugin options by default.

					// This hack simply replaces the existing codeblock lines with the twoslash code output.
					// (This is how `shiki-twoslash` works, by REPLACING the shiki highlighter function with its own when active)

					// Replace the EC code block with the twoslash code block
					replaceECBlockWithTwoslashBlock(twoslash, codeBlock);

					// Generate the error annotations
					addErrorAnnotations(twoslash, codeBlock);

					// Generate the Hover and Static Annotations
					addHoverOrStaticAnnotations(twoslash, codeBlock, includeJsDoc);

					// Generate the Completion annotations
					addCompletionAnnotations(twoslash, codeBlock);

					// Generate the Twoslash Highlight annotations
					addHighlightAnnotations(twoslash, codeBlock);

					// Generate the Custom Tag annotations
					addCustomTagAnnotations(twoslash, codeBlock);
				}
			},
		},
	});
}
