import type { ExpressiveCodeBlock } from "@expressive-code/core";

/**
 * Extracts the indices of lines in the provided code array that contain TypeScript flags.
 *
 * A TypeScript flag is identified by a comment in the format `//@<flag>`.
 *
 * @param code - An array of strings representing lines of code.
 * @returns An array of indices where TypeScript flags are found.
 */
function cleanTSFlags(code: string[]): number[] {
	return code.reduce((acc, line, index) => {
		const match = line.match(/\/\/\s*@\w+/);
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
		// Type Extraction flag (// ^?)
		const matchExtraction = line.match(/^\/\/\s*\^\?\s*$/gm);
		if (matchExtraction) {
			acc.push(index);
		}
		// Type Completion flag (// ^|)
		const matchCompletion = line.match(/^\/\/\s*\^\|\s*$/gm);
		if (matchCompletion) {
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
	codeBlock.deleteLines([...tsFlags, ...twoSlashFlags]);
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
export function processCutOffPoints(codeBlock: ExpressiveCodeBlock) {
	const code = codeBlock.code.split("\n");

	// Find the cut-off start point for the code
	const cutOffStart = code.findIndex(
		(line) =>
			line.includes("// ---cut---") || line.includes("// ---cut-before---"),
	);

	// Find the cut-off end point for the code
	const cutOffEnd = code.findIndex((line) =>
		line.includes("// ---cut-after---"),
	);

	// Find the lines to cut
	const linesToCut: number[] = [];

	// Start cutting from the beginning of the code block
	if (cutOffStart !== -1) {
		// Count from the beginning of the code block to the cut-off point
		for (let i = 0; i <= cutOffStart; i++) {
			linesToCut.push(i);
		}
	}

	// Start cutting from the end of the code block
	if (cutOffEnd !== -1) {
		// Count from the cut-off point to the end of the code block
		for (let i = cutOffEnd; i < code.length; i++) {
			linesToCut.push(i);
		}
	}

	// Delete the lines
	if (linesToCut.length) {
		codeBlock.deleteLines(linesToCut);
	}
}
