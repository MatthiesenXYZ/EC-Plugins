import type { ExpressiveCodeBlock } from "@expressive-code/core";
import type { TwoslashOptions } from "twoslash";
import { reTrigger, twoslashDefaultTags } from "./regex";

/**
 * Calculates the width of a given text in pixels based on the character location, font size, and character width.
 *
 * @param textLoc - The location of the text (number of characters).
 * @param fontSize - The font size in pixels. Defaults to 16.
 * @param charWidth - The width of a single character in pixels. Defaults to 8.
 * @returns The width of the text in pixels.
 */
export function getTextWidthInPixels(
	textLoc: number,
	fontSize = 16,
	charWidth = 8,
): number {
	return textLoc * charWidth * (fontSize / 16);
}

/**
 * Merges custom tags from the provided `twoslashOptions` with the default tags.
 * Ensures that there are no duplicate tags in the final list.
 *
 * @param twoslashOptions - The options object containing custom tags to be merged.
 * @returns A new `TwoslashOptions` object with merged custom tags.
 */
export function checkForCustomTagsAndMerge(
	twoslashOptions: TwoslashOptions | undefined,
) {
	const customTags = twoslashOptions?.customTags ?? [];
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
 * Builds a function to check if a code block should be transformed based on the provided languages and trigger.
 *
 * @param languages - An array of languages that should be checked.
 * @param explicitTrigger - A boolean or RegExp that determines the trigger condition. If it's a RegExp, it will be used to test the code block's meta. If it's a boolean, a default RegExp (`/\btwoslash\b/`) will be used.
 * @returns A function that takes an `ExpressiveCodeBlock` and returns a boolean indicating whether the code block should be transformed.
 */
export function buildMetaChecker(
	languages: readonly string[],
	explicitTrigger: boolean | RegExp,
) {
	const trigger =
		explicitTrigger instanceof RegExp ? explicitTrigger : reTrigger;

	/**
	 * A function that takes an `ExpressiveCodeBlock` and returns a boolean indicating whether the code block should be transformed.
	 */
	return function shouldTransform(codeBlock: ExpressiveCodeBlock): boolean {
		return (
			languages.includes(codeBlock.language) &&
			(!explicitTrigger || trigger.test(codeBlock.meta))
		);
	};
}
