import {
	PluginStyleSettings,
	type ResolverContext,
	type StyleResolverFn,
	lighten,
	toHexColor,
} from "@expressive-code/core";
import type { TwoSlashStyleSettings } from "./types";

/**
 * Represents the style settings for the TwoSlash plugin.
 */
export const twoSlashStyleSettings = new PluginStyleSettings({
	defaultValues: {
		twoSlash: {
			// Main styles
			borderColor: ({ theme }) =>
				theme.colors["titleBar.border"] ||
				lighten(
					theme.colors["editor.background"],
					theme.type === "dark" ? 0.5 : -0.15,
				) ||
				"transparent",
			background: ({ theme }) => theme.colors["editor.background"] || theme.bg,
			hoverUnderlineColor: ({ theme }) => theme.fg || "#888",
			textColor: ({ theme }) => theme.colors["editor.foreground"] || theme.fg,
			popupDocsMaxHeight: "200px",
			tagColor: ({ theme }) => theme.colors["terminal.ansiBrightBlue"],

			// Link styles
			linkColor: ({ theme }) => theme.colors["terminal.ansiBrightBlue"],
			linkColorVisited: ({ theme }) =>
				theme.colors["terminal.ansiBrightMagenta"],
			linkColorHover: ({ theme }) => theme.colors["terminal.ansiBrightCyan"],
			linkColorActive: ({ theme }) => theme.colors["terminal.ansiBrightGreen"],

			// Highlight settings & styles
			highlightHue: "284",
			highlightDefaultLuminance: ["32%", "75%"],
			highlightDefaultChroma: "40",
			highlightBackgroundOpacity: "50%",
			highlightBorderLuminance: "48%",
			highlightBorderOpacity: "81.6%",
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
				theme.colors["editorSuggestWidget.background"] ||
				theme.colors["editor.background"] ||
				theme.bg,
			completionBoxBorder: ({ theme }) =>
				theme.colors["editorSuggestWidget.border"] ||
				theme.colors["titleBar.border"] ||
				lighten(
					theme.colors["editor.background"],
					theme.type === "dark" ? 0.5 : -0.15,
				) ||
				"transparent",
			completionBoxColor: ({ theme }) =>
				theme.colors["editorSuggestWidget.foreground"] ||
				theme.colors["editor.foreground"] ||
				theme.fg,
			completionBoxMatchedColor: ({ theme }) =>
				theme.colors["editorSuggestWidget.highlightForeground"] ||
				theme.colors["editor.findMatchBackground"] ||
				theme.colors["terminal.ansiBrightCyan"],
			completionBoxHoverBackground: ({ theme }) =>
				theme.colors["editorSuggestWidget.selectedBackground"] ||
				theme.colors["editor.findMatchHighlightBackground"] ||
				"#888",

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
    :root {
        .main-pane { 
            z-index: 1; 
        }

        .expressive-code:hover .twoslash-hover:not(.twoslash-hover:hover) {
            border-color: rgba(from ${cssVar("twoSlash.hoverUnderlineColor")} r g b / 0.4);
        }
    }
    `;

	const popupDocsCSS = `

        @media (min-width: 500px) {
            .twoslash-popup-container:before {
                content: "";
                position: absolute;
                top: -5px;
                left: 3px;
                border-top: 1px solid ${cssVar("twoSlash.borderColor")};
                border-right: 1px solid ${cssVar("twoSlash.borderColor")};
                background: ${cssVar("twoSlash.background")};
                transform: rotate(-45deg);
                width: 8px;
                height: 8px;
                pointer-events: none;
                display: inline-block;
            }
        }

        .twoslash-popup-container {
            position: absolute;
            z-index: 999 !important;
            background: ${cssVar("twoSlash.background")};
            border: 1px solid ${cssVar("twoSlash.borderColor")};
            border-radius: 4px;
            font-size: 90%;
            white-space: nowrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            width: max-content !important;
            margin-top: 0.5rem;
            color: ${cssVar("twoSlash.textColor")};
        }

        .twoslash-popup-container a:link {
            color: ${cssVar("twoSlash.linkColor")};
        }

        .twoslash-popup-container a:hover {
            color: ${cssVar("twoSlash.linkColorHover")};
        }

        .twoslash-popup-container a:visited {
            color: ${cssVar("twoSlash.linkColorVisited")};
        }

        .twoslash-popup-container a:active {
            color: ${cssVar("twoSlash.linkColorActive")};
        }
    `;

	const staticDocsCSS = `
        .twoslash-static-container {
            display: block;
            z-index: 10;
            background: ${cssVar("twoSlash.background")};
            border: 1px solid ${cssVar("twoSlash.borderColor")};
            border-radius: 4px;
            font-size: 90%;
            white-space: nowrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            width: max-content !important;
        }

        .twoslash-static-container a:link {
            color: ${cssVar("twoSlash.linkColor")};
        }

        .twoslash-static-container a:hover {
            color: ${cssVar("twoSlash.linkColorHover")};
        }

        .twoslash-static-container a:visited {
            color: ${cssVar("twoSlash.linkColorVisited")};
        }

        .twoslash-static-container a:active {
            color: ${cssVar("twoSlash.linkColorActive")};
        }

        .twoslash-static-container:before {
            content: "";
            position: absolute;
            top: -4px;
            left: 2px;
            border-top: 1px solid ${cssVar("twoSlash.borderColor")};
            border-right: 1px solid ${cssVar("twoSlash.borderColor")};
            background: ${cssVar("twoSlash.background")};
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
            border-bottom: 1px dashed transparent;
            transition-timing-function: ease;
            transition: border-color 0.3s;
        }

        .twoslash:hover .twoslash-hover {
            border-color: ${cssVar("twoSlash.hoverUnderlineColor")};
        }

        .twoslash-popup-code {
            display: block;
            width: 100%;
            max-width: 600px;
            padding: 6px 12px;
            font-size: ${cssVar("codeFontSize")};
            font-weight: 400;
            line-height: ${cssVar("codeLineHeight")};
            white-space: pre-wrap;
        }

        .twoslash-popup-code,
        .twoslash-popup-code span {
            white-space: preserve !important;
        }

        .twoslash-popup-code-type {
            font-family: ${cssVar("codeFontFamily")};
            font-weight: 600;
        }

        .twoslash-popup-code-type .frame pre {
            display: contents !important;
        }

        .twoslash-popup-code-type .frame .ec-line {
            display: unset !important;
        }

        .twoslash-popup-code-type .frame .ec-line .code {
            padding-inline-start: 0 !important;
            border-inline-start: none !important;
        }

        .twoslash-popup-code-type .frame pre > code {
            padding: 0 !important;
        }

        .twoslash-popup-code-type .frame {
            box-shadow: none !important;
        }

        .twoslash-popup-docs .frame {
            box-shadow: none !important;
        }

        .twoslash-popup-code-type .frame .header::before {
            border: none !important;
        }

        .twoslash-popup-code::-webkit-scrollbar,
        .twoslash-popup-code::-webkit-scrollbar-track,
        .twoslash-popup-docs::-webkit-scrollbar,
        .twoslash-popup-docs::-webkit-scrollbar-track {
			background-color: inherit;
			border-radius: calc(${cssVar("borderRadius")} + ${cssVar("borderWidth")});
			border-top-left-radius: 0;
			border-top-right-radius: 0;
        }

        .twoslash-popup-code::-webkit-scrollbar-thumb,
        .twoslash-popup-docs::-webkit-scrollbar-thumb {
			background-color: ${cssVar("scrollbarThumbColor")};
			border: 4px solid transparent;
			background-clip: content-box;
			border-radius: 10px;
        }

        .twoslash-popup-code::-webkit-scrollbar-thumb:hover,
        .twoslash-popup-docs::-webkit-scrollbar-thumb:hover {
			background-color: ${cssVar("scrollbarThumbHoverColor")};
        }

        .twoslash-popup-code::-webkit-scrollbar-corner,
        .twoslash-popup-docs::-webkit-scrollbar-corner {
            background: transparent;
            width: 0;
            height: 0;
        }

        .twoslash-popup-code,
        .twoslash-popup-docs {
            max-height: ${cssVar("twoSlash.popupDocsMaxHeight")} !important;
            overflow: auto !important;
        }

        .twoslash-popup-docs {
            max-width: 600px;
            padding-left: 12px;
            padding-right: 12px;
            padding-top: 6px;
            padding-bottom: 6px;
            border-top: 1px solid ${cssVar("twoSlash.borderColor")};
            font-size: ${cssVar("codeFontSize")};
            font-weight: 400;
            line-height: ${cssVar("codeLineHeight")};
            text-wrap: balance;
        }

        .twoslash-popup-docs code {
            font-family: ${cssVar("codeFontFamily")};
            font-weight: ${cssVar("codeFontWeight")};
        }

        .twoslash-popup-docs-tagline {
            display: flex;
            text-wrap-style: stable;
        }


        .twoslash-popup-docs-tag-name {
            color: ${cssVar("twoSlash.tagColor")};
            font-style: italic;
            --shiki-dark-font-style: italic;
            font-weight: 500;
            margin-right: 0.25rem;
        }

        .twoslash-popup-docs-tag-value {
            margin-left: 0.25rem;
        }

        .twoslash-popup-docs pre {
            width: 100%;
            background-color: var(--ec-frm-edBg) !important;
            padding: .15rem;
            border-radius: 4px !important;
            position: relative !important;
            font-family: ${cssVar("codeFontFamily")};
            display: inline-block !important;
            line-height: ${cssVar("codeLineHeight")};
            border: var(--ec-brdWd) solid ${cssVar("twoSlash.borderColor")} !important;
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

        .twoslash-popup-docs code {
            background-color: var(--ec-frm-edBg) !important;
            padding: .125rem !important;
            border-radius: 4px !important;
            position: relative !important;
            display: inline-block !important;
            line-height: ${cssVar("codeLineHeight")};
        }

        .twoslash-popup-docs-tag-value code,
        .twoslash-popup-docs > p > code,
        .twoslash-popup-docs > p > a > code,
        .twoslash-popup-docs > ul > li > code {
            border: 1px solid ${cssVar("twoSlash.borderColor")};
            border-radius: 4px;
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
            display: flex;
        }

        .twoslash-error-underline {
            text-decoration-line: spelling-error;
            position: relative;
        }

        .twoslash-error-box {
            display: flex;
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
	    flex: 0 1 100%;
        }

        .twoslash-error-box .twoslash-error-box-icon,
        .twoslash-error-box .twoslash-error-box-content {
            display: inline-block;
            vertical-align: middle;
        }

 	.twoslash-error-box-content {
  	    flex: 0 1 100%;
	}

 	.twoslash-error-box-content-message {
	    white-space: normal;
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
