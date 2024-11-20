import type { Element } from "@expressive-code/core/hast";
import type { TwoslashOptions } from "twoslash";
import type { completionIcons } from "./icons/completionIcons";
import type { customTagsIcons } from "./icons/customTagsIcons";

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
	 * If `false`, this transformer will be applied to all code blocks that match
	 * the specified languages.
	 *
	 * It is recommended to keep this as `true` to avoid unnecessary processing.
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
	 * Allows non-standard JSDoc tags to be included in the hover popup.
	 *
	 * Non-standard tags are tags that are not included in the default JSDoc tag list.
	 *
	 * @example `@customTag, @docs, @omglookatthis`
	 * @default false
	 */
	readonly allowNonStandardJsDocTags?: boolean;

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
 * Twoslash Main Styles
 */
interface TwoSlashMainStyles {
	/**
	 * Style (Border Color) for the Twoslash Popups
	 */
	borderColor: string;
	/**
	 * Style (Background) for the Twoslash Popups
	 */
	background: string;
	/**
	 * Style (Hover Underline color) for the Twoslash Popups
	 */
	hoverUnderlineColor: string;
	/**
	 * Style (Text Color) for the Twoslash Popups
	 */
	textColor: string;
	/**
	 * Style (Docs Max Element Height) for the Twoslash Popups
	 */
	popupDocsMaxHeight: string;
	/**
	 * Style (Tag Color) for the Twoslash JSDoc Tags
	 */
	tagColor: string;
}

/**
 * Twoslash Link Styles
 */
interface TwoSlashLinkStyles {
	/**
	 * Style (Link Color) for the Twoslash Popups
	 */
	linkColor: string;
	/**
	 * Style (Link Hover Color) for the Twoslash Popups
	 */
	linkColorHover: string;
	/**
	 * Style (Link Visited Color) for the Twoslash Popups
	 */
	linkColorVisited: string;
	/**
	 * Style (Link Active Color) for the Twoslash Popups
	 */
	linkColorActive: string;
}

/**
 * Twoslash Highlight Styles
 */
interface TwoSlashHighlightStyles {
	/**
	 * Style (Hue) for the Twoslash Highlights
	 *
	 * Used to calculate the `highlightBackground` and `highlightBorderColor` styles.
	 */
	highlightHue: string;
	/**
	 * Style (Luminance) for the Twoslash Highlights
	 *
	 * Used to calculate the `highlightBackground` and `highlightBorderColor` styles.
	 */
	highlightDefaultLuminance: string;
	/**
	 * Style (Chroma) for the Twoslash Highlights
	 *
	 * Used to calculate the `highlightBackground` and `highlightBorderColor` styles.
	 */
	highlightDefaultChroma: string;
	/**
	 * Style (Background Opacity) for the Twoslash Highlights
	 *
	 * Used to calculate the `highlightBackground` and `highlightBorderColor` styles.
	 */
	highlightBackgroundOpacity: string;
	/**
	 * Style (Border Luminance) for the Twoslash Highlights
	 *
	 * Used to calculate the `highlightBackground` and `highlightBorderColor` styles.
	 */
	highlightBorderLuminance: string;
	/**
	 * Style (Border Opacity) for the Twoslash Highlights
	 *
	 * Used to calculate the `highlightBackground` and `highlightBorderColor` styles.
	 */
	highlightBorderOpacity: string;
	/**
	 * Style (Background) for the Twoslash Highlights
	 */
	highlightBackground: string;
	/**
	 * Style (Border) for the Twoslash Highlights
	 */
	highlightBorderColor: string;
}

/**
 * Twoslash Error and Custom Tags Styles
 */
interface TwoSlashErrorAndCustomTagsStyles {
	/**
	 * Style (Error Color) for the Twoslash Error/Custom Annotations
	 */
	errorColor: string;
	/**
	 * Style (Warning Color) for the Twoslash Custom Annotations
	 */
	warnColor: string;
	/**
	 * Style (Suggestion Color) for the Twoslash Custom Annotations
	 */
	suggestionColor: string;
	/**
	 * Style (Message Color) for the Twoslash Custom Annotations
	 */
	messageColor: string;
}

interface TwoSlashCompletionStyles {
	/**
	 * Style (Cursor Color) for the Twoslash Completion Box
	 */
	cursorColor: string;
	/**
	 * Style (Background) for the Twoslash Completion Box
	 */
	completionBoxBackground: string;
	/**
	 * Style (Border) for the Twoslash Completion Box
	 */
	completionBoxBorder: string;
	/**
	 * Style (Color) for the Twoslash Completion Box
	 */
	completionBoxColor: string;
	/**
	 * Style (Matched Color) for the Twoslash Completion Box
	 */
	completionBoxMatchedColor: string;
	/**
	 * Style (Hover Background) for the Twoslash Completion Box
	 */
	completionBoxHoverBackground: string;
	/**
	 * Style (String Icon) for the Twoslash Completion Icons
	 */
	completionIconString: string;
	/**
	 * Style (Function Icon) for the Twoslash Completion Icons
	 */
	completionIconFunction: string;
	/**
	 * Style (Class Icon) for the Twoslash Completion Icons
	 */
	completionIconClass: string;
	/**
	 * Style (Property Icon) for the Twoslash Completion Icons
	 */
	completionIconProperty: string;
	/**
	 * Style (Module Icon) for the Twoslash Completion Icons
	 */
	completionIconModule: string;
	/**
	 * Style (Method Icon) for the Twoslash Completion Icons
	 */
	completionIconMethod: string;
	/**
	 * Style (Constructor Icon) for the Twoslash Completion Icons
	 */
	completionIconConstructor: string;
	/**
	 * Style (Interface Icon) for the Twoslash Completion Icons
	 */
	completionIconInterface: string;
}

/**
 * Interface representing the style settings for TwoSlash.
 */
export interface TwoSlashStyleSettings
	extends TwoSlashMainStyles,
		TwoSlashLinkStyles,
		TwoSlashHighlightStyles,
		TwoSlashErrorAndCustomTagsStyles,
		TwoSlashCompletionStyles {}

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

/**
 * Represents a collection of custom tag icons.
 * Each property corresponds to a specific type of log icon.
 *
 * @property log - The icon element for log messages.
 * @property warn - The icon element for warning messages.
 * @property error - The icon element for error messages.
 * @property annotate - The icon element for annotation messages.
 */
export type CustomTagsIcons = {
	log: Element;
	warn: Element;
	error: Element;
	annotate: Element;
};

/**
 * Represents the type for custom tag icons.
 * This type is derived from the keys of the `customTagsIcons` object.
 */
export type CustomTagsIcon = keyof typeof customTagsIcons;

/**
 * Represents a set of icons used for different types of code completions.
 * Each property corresponds to a specific type of code element.
 *
 * @property {Element} module - Icon for a module.
 * @property {Element} class - Icon for a class.
 * @property {Element} method - Icon for a method.
 * @property {Element} property - Icon for a property.
 * @property {Element} constructor - Icon for a constructor.
 * @property {Element} interface - Icon for an interface.
 * @property {Element} function - Icon for a function.
 * @property {Element} string - Icon for a string.
 */
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

/**
 * Represents the type for completion icons.
 * This type is derived from the keys of the `completionIcons` object.
 */
export type CompletionIcon = keyof typeof completionIcons;

/**
 * Represents the different types of tags that can be used in Twoslash.
 *
 * - `annotate`: Used to add annotations.
 * - `log`: Used to log information.
 * - `warn`: Used to issue warnings.
 * - `error`: Used to indicate errors.
 */
export type TwoslashTag = "annotate" | "log" | "warn" | "error";

/**
 * Represents the structure for rendering JSDocs.
 *
 * @property {Element | never[]} docs - The documentation elements.
 * @property {Element | never[]} tags - The tag elements.
 */
export type RenderJSDocs = {
	docs: Element | never[];
	tags: Element | never[];
};
