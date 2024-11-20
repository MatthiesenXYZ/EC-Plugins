import type { NodeError } from "twoslash";
import type { TwoslashTag } from "../types";

/**
 * Returns a string representation of a custom tag.
 *
 * @param tag - The custom tag to convert to a string. Can be one of "warn", "annotate", or "log".
 * @returns A string that represents the custom tag. Returns "Warning" for "warn", "Message" for "annotate",
 * "Log" for "log", and "Error" for any other value.
 */
export function getCustomTagString(tag: TwoslashTag): string {
	switch (tag) {
		case "warn":
			return "Warning";
		case "annotate":
			return "Message";
		case "log":
			return "Log";
		default:
			return "Error";
	}
}

/**
 * Returns a custom CSS class name based on the provided TwoslashTag.
 *
 * @param tag - The TwoslashTag to get the custom class for. Possible values are "warn", "annotate", "log", or any other string.
 * @returns The corresponding CSS class name as a string.
 *          - "twoslash-custom-level-warning" for "warn"
 *          - "twoslash-custom-level-suggestion" for "annotate"
 *          - "twoslash-custom-level-message" for "log"
 *          - "twoslash-custom-level-error" for any other value
 */
export function getCustomTagClass(tag: TwoslashTag): string {
	switch (tag) {
		case "warn":
			return "twoslash-custom-level-warning";
		case "annotate":
			return "twoslash-custom-level-suggestion";
		case "log":
			return "twoslash-custom-level-message";
		default:
			return "twoslash-custom-level-error";
	}
}

/**
 * Returns a CSS class name based on the error level of the provided NodeError.
 *
 * @param error - The NodeError object containing the error level.
 * @returns A string representing the CSS class name corresponding to the error level.
 *
 * The possible error levels and their corresponding CSS class names are:
 * - "warning" -> "twoslash-error-level-warning"
 * - "suggestion" -> "twoslash-error-level-suggestion"
 * - "message" -> "twoslash-error-level-message"
 * - Any other value -> "twoslash-error-level-error"
 */
export function getErrorLevelClass(error: NodeError): string {
	switch (error.level) {
		case "warning":
			return "twoslash-error-level-warning";
		case "suggestion":
			return "twoslash-error-level-suggestion";
		case "message":
			return "twoslash-error-level-message";
		default:
			return "twoslash-error-level-error";
	}
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
export function getErrorLevelString(error: NodeError): string {
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
