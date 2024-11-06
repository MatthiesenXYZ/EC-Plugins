import type { ExpressiveCodeBlock } from "@expressive-code/core";
import {
	reAnnonateMarkers,
	reCutAfter,
	reCutBefore,
	reCutEnd,
	reCutStart,
	reFlagNotations,
	reTrigger,
} from "./regex";
import type { NodeCompletion } from "twoslash";
import { type CompletionIcon, completionIcons } from "./completionIcons";
import type { Element } from "@expressive-code/core/hast";

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

/**
 * Extracts the indices of lines in the provided code array that contain TypeScript flags.
 *
 * A TypeScript flag is identified by a comment in the format `// @<flag>`.
 *
 * @param code - An array of strings representing lines of code.
 * @returns An array of indices where TypeScript flags are found.
 */
function cleanTSFlags(code: string[]): number[] {
	return code.reduce((acc, line, index) => {
		const match = line.startsWith("// @");
		if (match) {
			acc.push(index);
		}
		return acc;
	}, [] as number[]);
}

/**
 * Extracts the line numbers of specific flags from a given array of code lines.
 *
 * This function scans through an array of strings representing lines of code and identifies
 * lines that contain specific flags used for type extraction (`// ^?`) and type completion (`// ^|`).
 * It returns an array of line numbers where these flags are found.
 *
 * @param code - An array of strings, each representing a line of code.
 * @returns An array of numbers, each representing the line number where a flag was found.
 */
function cleanTwoSlashFlags(code: string[]): number[] {
	return code.reduce((acc, line, index) => {
		const matchTwoSlash = line.match(reAnnonateMarkers);
		if (matchTwoSlash) {
			acc.push(index);
		}
		return acc;
	}, [] as number[]);
}

/**
 * Cleans TypeScript and TwoSlash flags from the given code block.
 *
 * @param codeBlock - The code block from which flags should be removed.
 */
export function cleanFlags(codeBlock: ExpressiveCodeBlock): void {
	const code = codeBlock.code.split("\n");
	const tsFlags = cleanTSFlags(code);
	const twoSlashFlags = cleanTwoSlashFlags(code);

	const linesToRemove = [...tsFlags, ...twoSlashFlags];

	if (linesToRemove.length) {
		codeBlock.deleteLines(linesToRemove);
	}
}

/**
 * Generates an array of numbers starting from `start` and ending at `end`.
 *
 * @param start - The starting number of the sequence.
 * @param end - The ending number of the sequence.
 * @returns An array of numbers from `start` to `end`.
 */
function counter(start: number, end: number): number[] {
	const array: number[] = [];
	for (let i = start; i <= end; i++) {
		array.push(i);
	}
	return array;
}

/**
 * Processes the cut-off points in a given code block and removes the lines
 * between the specified cut-off markers.
 *
 * @param {ExpressiveCodeBlock} codeBlock - The code block to process.
 *
 * The function looks for the following markers in the code block:
 * - `// ---cut---` or `// ---cut-before---`: Marks the start of the cut-off section.
 * - `// ---cut-after---`: Marks the end of the cut-off section.
 *
 * It then removes all lines from the start of the code block to the start cut-off marker,
 * and from the end cut-off marker to the end of the code block.
 */
export function processCutOffPoints(codeBlock: ExpressiveCodeBlock): void {
	const code = codeBlock.code.split("\n");

	// Find the cut-off start point for the code
	const cutOffStart = code.findIndex((line) => reCutBefore.test(line));

	// Find the cut-off end point for the code
	const cutOffEnd = code.findIndex((line) => reCutAfter.test(line));

	const cutSections: { start: number; end: number }[] = [];
	let currentIndex = 0;

	while (currentIndex < code.length) {
		// Find the next start and end points from the current index
		const cutBetweenStart = code.findIndex(
			(line, index) => index >= currentIndex && reCutStart.test(line),
		);
		const cutBetweenEnd = code.findIndex(
			(line, index) => index > cutBetweenStart && reCutEnd.test(line),
		);

		// Check if both start and end points are found
		if (cutBetweenStart !== -1 && cutBetweenEnd !== -1) {
			// Store the indices of the found start-end pair
			cutSections.push({
				start: cutBetweenStart,
				end: cutBetweenEnd,
			});

			// Move the current index past the found end point to continue searching
			currentIndex = cutBetweenEnd + 1;
		} else {
			// Break the loop if no more pairs are found
			break;
		}
	}

	// Find the lines to cut
	const linesToCut: number[] = [];

	// Start cutting from the beginning of the code block
	if (cutOffStart !== -1) {
		// Count from the beginning of the code block to the cut-off point
		linesToCut.push(...counter(0, cutOffStart));
	}

	// Start cutting from the end of the code block
	if (cutOffEnd !== -1) {
		// Count from the cut-off point to the end of the code block
		linesToCut.push(...counter(cutOffEnd, code.length - 1));
	}

	// Start cutting between the section cut points
	for (const section of cutSections) {
		// Count from the start to the end of the section
		linesToCut.push(...counter(section.start, section.end));
	}

	// Delete the lines
	if (linesToCut.length) {
		codeBlock.deleteLines(linesToCut);
	}
}

export type CompletionItem = {
	startCharacter: number;
	length: number;
	items: {
		name: string;
		kind: string;
		icon: Element;
		isDeprecated: boolean;
	}[];
};

export function processCompletion(completion: NodeCompletion): CompletionItem {
	const items = completion.completions
		.map((c) => {
			const kind = c.kind || "property";
			const isDeprecated =
				"kindModifiers" in c &&
				typeof c.kindModifiers === "string" &&
				c.kindModifiers.split(",").includes("deprecated");

			const icon = completionIcons[kind as CompletionIcon];

			return {
				name: c.name,
				kind,
				icon,
				isDeprecated,
			};
		})
		.slice(0, 5);

	const { character, start } = completion;

	const length = start - character;

	return {
		startCharacter: character,
		length,
		items,
	};
}
