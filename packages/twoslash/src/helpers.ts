import type {
	ExpressiveCodeBlock,
	ExpressiveCodeLine,
} from "@expressive-code/core";
import {
	reAnnonateMarkers,
	reCutAfter,
	reCutBefore,
	reCutEnd,
	reCutStart,
	reFlagNotations,
	reTrigger,
} from "./regex";
import type { NodeCompletion, NodeTag, TwoslashReturn } from "twoslash";
import { type CompletionIcon, completionIcons } from "./completionIcons";
import type { Element } from "@expressive-code/core/hast";
import {
	TwoslashCompletionAnnotation,
	TwoslashCustomTagsAnnotation,
	TwoslashErrorBoxAnnotation,
	TwoslashHighlightAnnotation,
	TwoslashHoverAnnotation,
	TwoslashStaticAnnotation,
} from "./annotation";

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
		const match = reFlagNotations.test(line);
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
		const matchTwoSlash = reAnnonateMarkers.test(line);
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
 * Adds completion annotations to the provided code block based on the twoslash completions.
 *
 * @param twoslash - The TwoslashReturn object containing completion information.
 * @param codeBlock - The ExpressiveCodeBlock object representing the code block to annotate.
 */
export function addCompletionAnnotations(
	twoslash: TwoslashReturn,
	codeBlock: ExpressiveCodeBlock,
) {
	for (const completion of twoslash.completions) {
		const proccessed = processCompletion(completion);
		const line = codeBlock.getLine(completion.line);
		if (line) {
			// Remove any Hover annotations that match the completion
			// This is to avoid `any` type completions being shown as hovers for completions
			removeHoverFromCompletions(line, proccessed);

			line.addAnnotation(
				new TwoslashCompletionAnnotation(proccessed, completion),
			);
		}
	}
}

/**
 * Adds error annotations to the given code block based on the errors found in the Twoslash return object.
 *
 * @param twoslash - The Twoslash return object containing error information.
 * @param codeBlock - The code block to which error annotations will be added.
 */
export function addErrorAnnotations(
	twoslash: TwoslashReturn,
	codeBlock: ExpressiveCodeBlock,
) {
	for (const error of twoslash.errors) {
		const line = codeBlock.getLine(error.line);

		if (line) {
			line.addAnnotation(new TwoslashErrorBoxAnnotation(error, line));
		}
	}
}

// /**
//  * Replaces lines in a code block that match a specific tag with a blank space and adds a custom annotation.
//  *
//  * @param lines - An array of strings representing the lines of code.
//  * @param tag - The tag to search for in the lines.
//  * @param codeBlock - The code block where the lines will be replaced and annotated.
//  */
// const findAndReplace = (
// 	lines: string[],
// 	tag: NodeTag,
// 	codeBlock: ExpressiveCodeBlock,
// ) => {
// 	const lineMap = lines.map((line, index) => {
// 		return {
// 			line: index,
// 			text: line,
// 		};
// 	});

// 	for (const line of lineMap) {
// 		if (
// 			line.text.endsWith(tag.text ?? "") &&
// 			line.text.startsWith(`// @${tag.name}:`)
// 		) {
// 			const pickedLine = codeBlock.getLine(line.line);

// 			if (pickedLine) {
// 				pickedLine.editText(0, pickedLine.text.length, " ");
// 				pickedLine.addAnnotation(new TwoslashCustomTagsAnnotation(tag));
// 			}
// 		}
// 	}
// };

function checkForNextDefinedLine(codeBlock: ExpressiveCodeBlock, tag: NodeTag) {
	const lines = codeBlock.code.split("\n").length;
	const desiredLine = tag.line;

	while (desiredLine < lines) {
		const nextLine = codeBlock.getLine(desiredLine + 1);
		if (nextLine) {
			return nextLine;
		}
	}

	if (desiredLine === lines) {
		const reverse = tag.line;
		while (reverse > 0) {
			const prevLine = codeBlock.getLine(reverse - 1);
			if (prevLine) {
				return prevLine;
			}
		}
	}
}
/**
 * Adds custom tag annotations to the provided code block based on the tags found in the twoslash return object.
 *
 * @param twoslash - The TwoslashReturn object containing the tags to be added as annotations.
 * @param codeBlock - The ExpressiveCodeBlock object representing the code block to which annotations will be added.
 */
export function addCustomTagAnnotations(
	twoslash: TwoslashReturn,
	codeBlock: ExpressiveCodeBlock,
) {
	const lines = codeBlock.code.split("\n");

	const lineMap = lines.map((line, index) => {
		return {
			line: index,
			text: line,
		};
	});

	for (const tag of twoslash.tags) {
		const lineToRemove = lineMap.find((line) => {
			return (
				line.text.endsWith(tag.text ?? "") &&
				line.text.startsWith(`// @${tag.name}:`)
			);
		});
		if (lineToRemove) {
			codeBlock.deleteLines([lineToRemove.line]);

			const tagLine = codeBlock.getLine(tag.line);

			if (tagLine) {
				tagLine.addAnnotation(new TwoslashCustomTagsAnnotation(tag, tagLine));
				// Stop processing this tag and move to the next one
				continue;
			}

			const nextLine = checkForNextDefinedLine(codeBlock, tag);

			if (nextLine) {
				nextLine.addAnnotation(new TwoslashCustomTagsAnnotation(tag, nextLine));
			}
		}
	}
}

/**
 * Adds hover or static annotations to the provided code block based on the twoslash results.
 *
 * @param twoslash - The result object from running twoslash, containing hover and query information.
 * @param codeBlock - The code block to which annotations will be added.
 * @param includeJsDoc - A boolean indicating whether to include JSDoc comments in the annotations.
 */
export function addHoverOrStaticAnnotations(
	twoslash: TwoslashReturn,
	codeBlock: ExpressiveCodeBlock,
	includeJsDoc: boolean,
) {
	for (const hover of twoslash.hovers) {
		const line = codeBlock.getLine(hover.line);
		if (line) {
			const query = twoslash.queries.find((q) => q.text === hover.text);
			if (query) {
				line.addAnnotation(
					new TwoslashStaticAnnotation(hover, line, includeJsDoc, query),
				);
			} else {
				line.addAnnotation(new TwoslashHoverAnnotation(hover, includeJsDoc));
			}
		}
	}
}

/**
 * Adds highlight annotations to the given code block based on the highlights from the twoslash return object.
 *
 * @param twoslash - The object containing the highlights information.
 * @param codeBlock - The code block to which the highlight annotations will be added.
 */
export function addHighlightAnnotations(
	twoslash: TwoslashReturn,
	codeBlock: ExpressiveCodeBlock,
) {
	for (const highlight of twoslash.highlights) {
		const line = codeBlock.getLine(highlight.line);
		if (line) {
			line.addAnnotation(new TwoslashHighlightAnnotation(highlight));
		}
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
 * Removes hover annotations from a given line of code if they match the start character and length of the processed completion item.
 *
 * @param line - The line of code from which hover annotations should be removed.
 * @param proccessed - The completion item containing the start character and length to match against hover annotations.
 */
export function removeHoverFromCompletions(
	line: ExpressiveCodeLine,
	proccessed: CompletionItem,
) {
	for (const annotation of line.getAnnotations()) {
		if (annotation instanceof TwoslashHoverAnnotation) {
			if (
				annotation.hover.start === proccessed.startCharacter &&
				annotation.hover.length === proccessed.length
			) {
				line.deleteAnnotation(annotation);
			}
		}
	}
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

/**
 * Represents a completion item used in the editor.
 *
 * @property {number} startCharacter - The starting character position of the completion item.
 * @property {number} length - The length of the completion item.
 * @property {Object[]} items - An array of completion details.
 * @property {string} items[].name - The name of the completion item.
 * @property {string} items[].kind - The kind/type of the completion item.
 * @property {Element} items[].icon - The icon representing the completion item.
 * @property {boolean} items[].isDeprecated - Indicates if the completion item is deprecated.
 */
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

/**
 * Processes a NodeCompletion object and returns a CompletionItem.
 *
 * @param completion - The NodeCompletion object to process.
 * @returns A CompletionItem containing the processed completion data.
 */
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
