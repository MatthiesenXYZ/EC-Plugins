import type { NodeCompletion, TwoslashNode } from "twoslash";

/**
 * Checks if the given node is of type `NodeCompletion`.
 *
 * @param node - The node to check.
 * @returns True if the node is of type `NodeCompletion`, otherwise false.
 */
function isNodeCompletion(node: TwoslashNode): node is NodeCompletion {
	return node.type === "completion";
}

/**
 * Compares two TwoslashNode objects based on specified criteria.
 *
 * @param node1 - The first TwoslashNode to compare.
 * @param node2 - The second TwoslashNode to compare.
 * @param checks - An object specifying which properties to check for equality.
 * @param checks.line - If true, compares the line property of the nodes.
 * @param checks.start - If true, compares the start property of the nodes.
 * @param checks.character - If true, compares the character property of the nodes.
 * @param checks.length - If true, compares the length property of the nodes.
 * @param checks.text - If true, compares the text property of the nodes.
 * @returns A boolean indicating whether the nodes are considered equal based on the specified criteria.
 */
export function compareNodes(
	node1: TwoslashNode,
	node2: TwoslashNode,
	checks: {
		line?: boolean;
		start?: boolean;
		character?: boolean;
		length?: boolean;
		text?: boolean;
	},
) {
	if (checks.line && node1.line !== node2.line) {
		return false;
	}
	if (checks.start && node1.start !== node2.start) {
		return false;
	}
	if (checks.character && node1.character !== node2.character) {
		return false;
	}
	if (checks.length && node1.length !== node2.length) {
		return false;
	}
	if (
		!isNodeCompletion(node1) &&
		!isNodeCompletion(node2) &&
		checks.text &&
		node1.text !== node2.text
	) {
		return false;
	}

	// If no checks failed, the nodes are considered equal
	return true;
}
