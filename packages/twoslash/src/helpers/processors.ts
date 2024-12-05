import type { ExpressiveCodeBlock } from "expressive-code";
import type { NodeCompletion, TwoslashReturn } from "twoslash";
import { completionIcons } from "../icons/completionIcons";
import type { CompletionIcon, CompletionItem } from "../types";

/**
 * Splits the given code string into an array of objects, each containing the line index and the line content.
 *
 * @param code - The code string to be split into lines.
 * @returns An array of objects, each with an `index` representing the line number and a `line` containing the line content.
 */
export function splitCodeToLines(code: string): {
	index: number;
	line: string;
}[] {
	return code.split("\n").map((line, index) => ({ index, line }));
}

/**
 * Processes a code block by replacing its content with the provided Twoslash code block.
 *
 * @param codeBlock - The ExpressiveCodeBlock instance representing the code block to be processed.
 * @param codeWithIncludes - The original code block content including any includes.
 * @param twoslashCode - The Twoslash code block to replace the original content with.
 */
export function processTwoslashCodeBlock(
	codeBlock: ExpressiveCodeBlock,
	codeWithIncludes: string,
	twoslashCode: TwoslashReturn["code"],
) {
	// Get the EC and Twoslash code blocks
	const ecCodeBlock = splitCodeToLines(codeWithIncludes);
	const twoslashCodeBlock = splitCodeToLines(twoslashCode);

	// Replace the EC code block with the Twoslash code block
	for (const line of twoslashCodeBlock) {
		const ln = codeBlock.getLine(line.index);
		if (ln) ln.editText(0, ln.text.length, line.line);
	}

	// Remove any extra lines from the EC code block
	if (twoslashCodeBlock.length < ecCodeBlock.length) {
		for (let i = twoslashCodeBlock.length; i < ecCodeBlock.length; i++) {
			codeBlock.deleteLine(twoslashCodeBlock.length);
		}
	}
}

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

	const { character, start, completionsPrefix } = completion;

	const length = start - character;

	return {
		startCharacter: character,
		completionsPrefix,
		start,
		length,
		items,
	};
}
