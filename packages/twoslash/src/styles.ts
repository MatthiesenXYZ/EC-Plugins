import {
	PluginStyleSettings,
	type StyleResolverFn,
	toHexColor,
	type ResolverContext,
} from "@expressive-code/core";
import type { TwoSlashStyleSettings } from "./types";

declare module "@expressive-code/core" {
	export interface StyleSettings {
		twoSlash: TwoSlashStyleSettings;
	}
}

/**
 * Represents the style settings for the TwoSlash plugin.
 */
export const twoSlashStyleSettings = new PluginStyleSettings({
	defaultValues: {
		twoSlash: {
			// Highlight settings
			highlightHue: "284",
			highlightDefaultLuminance: ["32%", "75%"],
			highlightDefaultChroma: "40",
			highlightBackgroundOpacity: "50%",
			highlightBorderLuminance: "48%",
			highlightBorderOpacity: "81.6%",

			// Main styles
			borderColor: ({ theme }) => theme.colors["panel.border"],
			titleColorDark: ({ theme }) => theme.colors["terminal.ansiBrightMagenta"],
			titleColor: ({ theme }) => theme.colors["terminal.ansiMagenta"],
			tagColorDark: ({ theme }) => theme.colors["terminal.ansiBlue"],
			tagColor: ({ theme }) => theme.colors["terminal.ansiBrightBlue"],

			// Highlight styles
			highlightBackground: (context) => resolveHighlight(context).background,
			highlightBorderColor: (context) => resolveHighlight(context).border,

			// Error Annotation and Custom Tag styles
			errorColor: ({ theme }) => theme.colors["terminal.ansiRed"],
			warnColor: ({ theme }) => theme.colors["terminal.ansiYellow"],
			suggestionColor: ({ theme }) => theme.colors["terminal.ansiGreen"],
			messageColor: ({ theme }) => theme.colors["terminal.ansiBlue"],

			// Completion main styles
			cursorColor: ({ theme }) => theme.colors["editorCursor.foreground"],
			completionBoxBackground: ({ theme }) =>
				theme.colors["editorSuggestWidget.background"],
			completionBoxBorder: ({ theme }) =>
				theme.colors["editorSuggestWidget.border"],
			completionBoxColor: ({ theme }) =>
				theme.colors["editorSuggestWidget.foreground"],
			completionBoxMatchedColor: ({ theme }) =>
				theme.colors["editorSuggestWidget.highlightForeground"],
			completionBoxHoverBackground: ({ theme }) =>
				theme.colors["editorSuggestWidget.selectedBackground"],

			// Completion icon colors
			completionIconClass: "#EE9D28",
			completionIconConstructor: "#b180d7",
			completionIconFunction: "#b180d7",
			completionIconInterface: "#75beff",
			completionIconModule: "#cccccc",
			completionIconMethod: "#b180d7",
			completionIconProperty: "#cccccc",
			completionIconString: "#cccccc",
		},
	},
	cssVarExclusions: [
		"twoSlash.highlightHue",
		"twoSlash.highlightDefaultLuminance",
		"twoSlash.highlightDefaultChroma",
		"twoSlash.highlightBackgroundOpacity",
		"twoSlash.highlightBorderLuminance",
		"twoSlash.highlightBorderOpacity",
	],
});

/**
 * Generates the base styles for the TwoSlash component.
 *
 * This function returns a string containing CSS styles that are applied to the
 * TwoSlash component. The styles include both light and dark theme variations,
 * as well as styles for various elements within the TwoSlash component such as
 * popups, hover effects, and code blocks.
 *
 * @param {ResolverContext} context - The context object containing the `cssVar` function
 * used to resolve CSS variable values.
 * @returns {string} The generated CSS styles as a string.
 */
export function getTwoSlashBaseStyles({ cssVar }: ResolverContext): string {
	const baseCSS = `
    :root[data-theme="dark"] {
        .twoslash-popup-code {
            color: var(--1, inherit);
        }
        
        .twoslash-popup-docs-tag-name {
            color: ${cssVar("twoSlash.tagColor")};
        }
        .twoslash-popup-code-type {
            color: ${cssVar("twoSlash.titleColorDark")} !important;
        }
    }
    :root {
        --twoslash-font: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
		'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
		'Segoe UI Symbol', 'Noto Color Emoji';
        --twoslash-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;

        --twoslash-underline-color: currentColor;
        --twoslash-popup-container-bg: var(--ec-frm-edBg);
        --twoslash-popup-docs-code-brd: var(--ec-brdCol);
        --twoslash-popup-code-light: var(--0);
        --twoslash-font-size: var(--sl-text-code), 0.875rem;
        --twoslash-line-height: var(--sl-line-height), 1.75;

        .main-pane { 
            z-index: 1; 
        }

        .expressive-code:hover .twoslash-hover {
            border-color: ${cssVar("twoSlash.borderColor")};
        }
    }
    `;

	const popupDocsCSS = `
        .twoslash-popup-container:before {
            content: "";
            position: absolute;
            top: -5px;
            left: 3px;
            border-top: 1px solid ${cssVar("twoSlash.borderColor")};
            border-right: 1px solid ${cssVar("twoSlash.borderColor")};
            background: var(--twoslash-popup-container-bg);
            transform: rotate(-45deg);
            width: 8px;
            height: 8px;
            pointer-events: none;
            display: inline-block;
        }

        .twoslash-popup-container {
            position: absolute;
            z-index: 999 !important;
            height: max-content;
            background: var(--twoslash-popup-container-bg);
            border: 1px solid ${cssVar("twoSlash.borderColor")};
            border-radius: 4px;
            font-size: 90%;
            white-space: nowrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            width: max-content !important;
            margin-top: 0.5rem;
        }

        .twoslash-popup-container * {
            white-space: wrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
        }
    `;

	const staticDocsCSS = `
        .twoslash-static-container {
            display: block;
            z-index: 10;
            background: var(--twoslash-popup-container-bg);
            border: 1px solid ${cssVar("twoSlash.borderColor")};
            border-radius: 4px;
            font-size: 90%;
            white-space: nowrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            width: max-content !important;
        }

        .twoslash-static-container:before {
            content: "";
            position: absolute;
            top: -4px;
            left: 2px;
            border-top: 1px solid ${cssVar("twoSlash.borderColor")};
            border-right: 1px solid ${cssVar("twoSlash.borderColor")};
            background: var(--twoslash-popup-container-bg);
            transform: rotate(-45deg);
            width: 10px;
            height: 10px;
            pointer-events: none;
            display: inline-block;
        }

        .twoslash-static-container * {
            white-space: wrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
        }
    `;

	const sharedDocsCSS = `
        .twoslash,
        .twoslash-noline { 
            position: relative; 
        }

        @media (prefers-reduced-motion: reduce) {
            .twoslash *, 
            .twoslash-noline * { 
                transition: none !important; 
            }
        }

        .twoslash .twoslash-hover {
            position: relative;
            border-bottom: 1px dotted transparent;
            transition-timing-function: ease;
            transition: border-color 0.3s;
        }

        .twoslash:hover .twoslash-hover {
            border-color: var(--twoslash-underline-color);
        }

        .twoslash-popup-code {
            display: block;
            width: fit-content;
            max-width: 600px;
            min-width: 100%;
            padding: 6px 12px;
            color: var(--twoslash-popup-code-light);
            font-size: var(--twoslash-font-size);
            font-weight: 400;
            line-height: var(--twoslash-line-height);
            white-space: pre-wrap;
        }

        .twoslash-popup-docs {
            max-width: 600px;
            max-height: 200%;
            padding-left: 12px;
            padding-right: 12px;
            padding-top: 6px;
            padding-bottom: 6px;
            border-top: 1px solid ${cssVar("twoSlash.borderColor")};
            font-size: var(--twoslash-font-size);
            font-weight: 400;
            line-height: var(--twoslash-line-height);
            text-wrap: balance;
        }

        .twoslash-popup-code,
        .twoslash-popup-docs {
            max-height: 200px !important;
            overflow: auto !important;
        }

        .twoslash-popup-docs * {
            overflow-x: unset;
        }

        .twoslash-popup-docs-tag-name {
            color: ${cssVar("twoSlash.tagColorDark")};
            font-style: italic;
            --shiki-dark-font-style: italic;
            font-weight: 500;
        }

        .twoslash-popup-docs code:not(:has(.shiki)) {
            background-color: var(--twoslash-popup-container-bg) !important;
            padding: .15rem;
            border-radius: 4px !important;
            position: relative !important;
            font-family: var(--twoslash-font-mono);
            display: inline-block !important;
            line-height: 1 !important;
            border: 2px solid var(--twoslash-popup-docs-code-brd) !important;
        }

        .twoslash-popup-code-type {
            color: ${cssVar("twoSlash.titleColor")} !important;
            font-family: var(--twoslash-font-mono);
            font-weight: 600;
        }

        .twoslash-popup-docs.twoslash-popup-docs-tags {
            font-size: 14px !important;
            margin: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
        }

        .twoslash-popup-docs > pre > code {
            border: none !important;
            outline: none !important;
            width: 100% !important;
            padding: 0.15rem !important;
        }

        .twoslash-popup-docs code,
        .twoslash-popup-docs code span {
            white-space: preserve !important;
        }

        .twoslash-popup-docs code {
            margin: 0 !important;
            background-color: transparent !important;
            line-height: normal !important;
        }

        .twoslash-popup-docs code span::after {
            content: none !important;
        }    
    `;

	const completionCSS = `
        .twoslash .twoslash-completion {
            position: relative;
            margin-top: 0.1rem;
        }

        .twoslash-completion-container {
            display: flex;
            flex-direction: column;
            z-index: 10;
            background: ${cssVar("twoSlash.completionBoxBackground")};
            border: 1px solid ${cssVar("twoSlash.completionBoxBorder")};
            border-radius: 4px;
            font-size: 90%;
            white-space: nowrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            width: max-content !important;
            padding: 0.15rem;
            padding-left: 0.25rem;
            padding-right: 0.25rem;
        }

        .twoslash-cursor {
            content: " ";
            width: 3px;
            height: 18px;
            background-color: ${cssVar("twoSlash.cursorColor")};
            display: inline-block;
            margin-left: 1px;
            animation: cursor-blink 1.5s steps(2) infinite;
            align-self: center;
        }

        @keyframes cursor-blink {
            0% {
                opacity: 0;
            }
        }

        .twoslash-completion-container * {
            white-space: wrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
        }

        .twoslash-completion-item {
            overflow: hidden;
            display: flex;
            align-items: center;
            gap: 0.25em;
            line-height: 1em;
        }

        .twoslash-completion-item:hover {
            background: ${cssVar("twoSlash.completionBoxHoverBackground")};
        }

        .twoslash-completion-item-separator {
            border-top: 1px solid ${cssVar("twoSlash.completionBoxBorder")};
        }

        .twoslash-completion-item-deprecated {
            text-decoration: line-through;
            opacity: 0.5;
        }

        .twoslash-completion-name {
            font-weight: 400;
        }

        .twoslash-completion-name-unmatched {
            color: ${cssVar("twoSlash.completionBoxColor")};
        }
        
        .twoslash-completion-name-matched {
            color: ${cssVar("twoSlash.completionBoxMatchedColor")};
            font-weight: 600;
        }

        .twoslash-completion-icon {
            color: ${cssVar("twoSlash.completionBoxColor")};
            margin-right: 0.2rem;
            width: 1em;
            flex: none;
        }

        .twoslash-completion-icon.class {
            color: ${cssVar("twoSlash.completionIconClass")};
        }

        .twoslash-completion-icon.constructor {
            color: ${cssVar("twoSlash.completionIconConstructor")};
        }

        .twoslash-completion-icon.function {
            color: ${cssVar("twoSlash.completionIconFunction")};
        }

        .twoslash-completion-icon.interface {
            color: ${cssVar("twoSlash.completionIconInterface")};
        }

        .twoslash-completion-icon.module {
            color: ${cssVar("twoSlash.completionIconModule")};
        }

        .twoslash-completion-icon.method {
            color: ${cssVar("twoSlash.completionIconMethod")};
        }

        .twoslash-completion-icon.property {
            color: ${cssVar("twoSlash.completionIconProperty")};
        }

        .twoslash-completion-icon.string {
            color: ${cssVar("twoSlash.completionIconString")};
        }
    `;

	const errorCSS = `
        .twoslash-noline .twoslash-static {
            position: relative;
        }

        .twoslash.twoerror {
            display: ruby;
        }

        .twoslash-error-underline {
            text-decoration-line: spelling-error;
            position: relative;
        }

        .twoslash-error-box {
            margin-left: 0.5rem;
            display: block;
            z-index: 10;
            padding: 0.1rem 0.3rem;
            border-radius: 0.2rem;
            font-style: italic;
            border: 1px solid ${cssVar("twoSlash.borderColor")};
            border-radius: 4px;
            font-size: 90%;
            white-space: nowrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            width: max-content !important;
        }

        .twoslash-error-box .twoslash-error-box-icon,
        .twoslash-error-box .twoslash-error-box-content {
            display: inline-block;
            vertical-align: middle;
        }

        .twoslash-error-level-error {
            color: ${cssVar("twoSlash.errorColor")} !important;
            border-color: rgba(from ${cssVar("twoSlash.errorColor")} r g b / 0.25) !important;
            background: rgba(from ${cssVar("twoSlash.errorColor")} r g b / 0.1) !important;
        }

        .twoslash-error-level-warning {
            color: ${cssVar("twoSlash.warnColor")} !important;
            border-color: rgba(from ${cssVar("twoSlash.warnColor")} r g b / 0.25) !important;
            background: rgba(from ${cssVar("twoSlash.warnColor")} r g b / 0.1) !important;
        }

        .twoslash-error-level-suggestion {
            color: ${cssVar("twoSlash.suggestionColor")} !important;
            border-color: rgba(from ${cssVar("twoSlash.suggestionColor")} r g b / 0.25) !important;
            background: rgba(from ${cssVar("twoSlash.suggestionColor")} r g b / 0.1) !important;
        }

        .twoslash-error-level-message {
            color: ${cssVar("twoSlash.messageColor")} !important;
            border-color: rgba(from ${cssVar("twoSlash.messageColor")} r g b / 0.25) !important;
            background: rgba(from ${cssVar("twoSlash.messageColor")} r g b / 0.1) !important;
        }
    `;

	const customTagCSS = `
        .twoslash-custom-box {
            margin-left: 0rem;
            margin-right: 0rem;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            display: block;
            z-index: 10;
            padding: 0.1rem 0.3rem;
            border-radius: 0.2rem;
            font-style: italic;
            border: 1px solid ${cssVar("twoSlash.borderColor")};
            border-radius: 4px;
            font-size: 90%;
            white-space: nowrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            width: 100% !important;
        }

        .twoslash-custom-box .twoslash-custom-box-icon,
        .twoslash-custom-box .twoslash-custom-box-content {
            display: inline-block;
            vertical-align: middle;
        }

        .twoslash-custom-box .twoslash-custom-box-icon {
            margin-right: 0.5rem;
            height: 1rem;
            width: 1rem;
        }

        .twoslash-custom-level-error {
            color: ${cssVar("twoSlash.errorColor")} !important;
            border-color: rgba(from ${cssVar("twoSlash.errorColor")} r g b / 0.25) !important;
            background: rgba(from ${cssVar("twoSlash.errorColor")} r g b / 0.1) !important;
        }

        .twoslash-custom-level-warning {
            color: ${cssVar("twoSlash.warnColor")} !important;
            border-color: rgba(from ${cssVar("twoSlash.warnColor")} r g b / 0.25) !important;
            background: rgba(from ${cssVar("twoSlash.warnColor")} r g b / 0.1) !important;
        }

        .twoslash-custom-level-suggestion {
            color: ${cssVar("twoSlash.suggestionColor")} !important;
            border-color: rgba(from ${cssVar("twoSlash.suggestionColor")} r g b / 0.25) !important;
            background: rgba(from ${cssVar("twoSlash.suggestionColor")} r g b / 0.1) !important;
        }

        .twoslash-custom-level-message {
            color: ${cssVar("twoSlash.messageColor")} !important;
            border-color: rgba(from ${cssVar("twoSlash.messageColor")} r g b / 0.25) !important;
            background: rgba(from ${cssVar("twoSlash.messageColor")} r g b / 0.1) !important;
        }
    `;

	const highlightCSS = `
        .twoslash-highlighted {
            background-color: ${cssVar("twoSlash.highlightBackground")};
            border: 1px solid ${cssVar("twoSlash.highlightBorderColor")};
            padding: 1px 2px;
            margin: -1px -3px;
            border-radius: 4px;
        }
    `;

	const styles = [
		// Base styles
		baseCSS,
		// Popup docs styles
		popupDocsCSS,
		// Static docs styles
		staticDocsCSS,
		// Shared docs styles
		sharedDocsCSS,
		// Completion styles
		completionCSS,
		// Error styles
		errorCSS,
		// Highlight styles
		highlightCSS,
		// Custom tag styles
		customTagCSS,
	];

	return styles.join("\n");
}

/**
 * Resolves the highlight styles for the given settings.
 *
 * @param {Object} params - The parameters for the style resolver function.
 * @param {Function} params.resolveSetting - A function to resolve the setting values.
 * @returns {Object} An object containing the resolved background and border styles.
 */
function resolveHighlight({
	resolveSetting: r,
}: Parameters<StyleResolverFn>[0]): { background: string; border: string } {
	return {
		background: toHexColor(
			`lch(${r("twoSlash.highlightDefaultLuminance")} ${r("twoSlash.highlightDefaultChroma")} ${r("twoSlash.highlightHue")} / ${r("twoSlash.highlightBackgroundOpacity")})`,
		),
		border: toHexColor(
			`lch(${r("twoSlash.highlightBorderLuminance")} ${r("twoSlash.highlightDefaultChroma")} ${r("twoSlash.highlightHue")} / ${r("twoSlash.highlightBorderOpacity")})`,
		),
	};
}
