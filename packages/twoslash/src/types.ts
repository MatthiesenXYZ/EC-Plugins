import type { TwoslashOptions } from "twoslash";
import type { Element } from "@expressive-code/core/hast";
import type { customTagsIcons } from "./customTagsIcons";
import type { completionIcons } from "./completionIcons";

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
 * Interface representing the style settings for TwoSlash.
 */
export interface TwoSlashStyleSettings {
	highlightHue: string;
	highlightDefaultLuminance: string;
	highlightDefaultChroma: string;
	highlightBackgroundOpacity: string;
	highlightBorderLuminance: string;
	highlightBorderOpacity: string;
	borderColor: string;
	tagColor: string;
	tagColorDark: string;
	titleColor: string;
	titleColorDark: string;
	highlightBackground: string;
	highlightBorderColor: string;
	errorColor: string;
	warnColor: string;
	suggestionColor: string;
	messageColor: string;
	cursorColor: string;
	completionBoxBackground: string;
	completionBoxBorder: string;
	completionBoxColor: string;
	completionBoxMatchedColor: string;
	completionBoxHoverBackground: string;
	completionIconString: string;
	completionIconFunction: string;
	completionIconClass: string;
	completionIconProperty: string;
	completionIconModule: string;
	completionIconMethod: string;
	completionIconConstructor: string;
	completionIconInterface: string;
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
	start: number;
	completionsPrefix: string;
	length: number;
	items: {
		name: string;
		kind: string;
		icon: Element;
		isDeprecated: boolean;
	}[];
};

export type CustomTagsIcons = {
	log: Element;
	warn: Element;
	error: Element;
	annotate: Element;
};

export type CustomTagsIcon = keyof typeof customTagsIcons;

export type CompletionIcons = {
	module: Element;
	class: Element;
	method: Element;
	property: Element;
	constructor: Element;
	interface: Element;
	function: Element;
	string: Element;
};

export type CompletionIcon = keyof typeof completionIcons;

export type TwoslashTag = "annotate" | "log" | "warn" | "error";
