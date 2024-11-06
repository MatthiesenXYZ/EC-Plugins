import {
	PluginStyleSettings,
	type ResolverContext,
} from "@expressive-code/core";

/**
 * Represents the style settings for the TwoSlash plugin.
 *
 * @constant
 * @default
 * @property {Object} defaultValues - The default values for the style settings.
 * @property {Object} defaultValues.twoSlash - The style settings specific to TwoSlash.
 * @property {Function} defaultValues.twoSlash.borderColor - Function to get the border color based on the theme.
 * @property {Function} defaultValues.twoSlash.textColor - Function to get the text color based on the theme.
 * @property {Function} defaultValues.twoSlash.titleColor - Function to get the title color based on the theme.
 * @property {Function} defaultValues.twoSlash.tagColor - Function to get the tag color based on the theme.
 * @property {Function} defaultValues.twoSlash.tagColorDark - Function to get the dark mode tag color based on the theme.
 */
export const twoSlashStyleSettings = new PluginStyleSettings({
	defaultValues: {
		twoSlash: {
			borderColor: ({ theme }) => theme.colors["panel.border"],
			textColor: ({ theme }) => theme.fg,
			titleColorDark: ({ theme }) => theme.colors["terminal.ansiBrightMagenta"],
			titleColor: ({ theme }) => theme.colors["terminal.ansiMagenta"],
			tagColorDark: ({ theme }) => theme.colors["terminal.ansiBlue"],
			tagColor: ({ theme }) => theme.colors["terminal.ansiBrightBlue"],
		},
	},
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
        --twoslash-popup-code-dark: var(--1, inherit);
        --twoslash-docs-tag-dark: ${cssVar("twoSlash.tagColor")};
        --twoslash-title-color-dark: ${cssVar("twoSlash.titleColorDark")};
    }
    :root {
        --twoslash-border: ${cssVar("twoSlash.borderColor")};
        --twoslash-text-color: ${cssVar("twoSlash.textColor")};
        --twoslash-underline-color: currentColor;
        --twoslash-tag-color: ${cssVar("twoSlash.tagColorDark")};
        --twoslash-title-color: ${cssVar("twoSlash.titleColor")};
        --twoslash-popup-container-bg: var(--ec-frm-edBg);
        --twoslash-popup-docs-code-brd: var(--ec-brdCol);
        --twoslash-font: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
		'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
		'Segoe UI Symbol', 'Noto Color Emoji';
        --twoslash-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        --twoslash-popup-code-light: var(--0);
        --twoslash-font-size: var(--sl-text-code), 0.875rem;
        --twoslash-line-height: var(--sl-line-height), 1.75;

        --twoslash-color-error: rgba(237, 0, 0, 1);
        --twoslash-color-error-bg: rgba(237, 0, 0, 0.1);
        --twoslash-color-error-border: rgba(237, 0, 0, 0.25);
        --twoslash-color-warning: rgba(255, 102, 0, 1);
        --twoslash-color-warning-bg: rgba(255, 102, 0, 0.1);
        --twoslash-color-warning-border: rgba(255, 102, 0, 0.25);
        --twoslash-color-suggestion: rgba(0, 170, 0, 1);
        --twoslash-color-suggestion-bg: rgba(0, 170, 0, 0.1);
        --twoslash-color-suggestion-border: rgba(0, 170, 0, 0.25);
        --twoslash-color-message: rgba(0, 0, 255, 1);
        --twoslash-color-message-bg: rgba(0, 0, 255, 0.1);
        --twoslash-color-message-border: rgba(0, 0, 255, 0.25);

        .main-pane { z-index: 1; }

        .twoslash { position: relative; }

        @media (prefers-reduced-motion: reduce) {
            .twoslash * { 
                transition: none !important; 
            }
        }

        .twoslash-noline { position: relative; }

        @media (prefers-reduced-motion: reduce) {
            .twoslash-noline * { 
                transition: none !important; 
            }
        }

        .twoslash-noline .twoslash-static {
            position: relative;
        }

        .twoslash .twoslash-completion {
            position: relative;
            margin-top: 0.1rem;
        }


        .expressive-code .twoslash .twoslash-hover {
            position: relative;
            border-bottom: 1px dotted transparent;
            transition-timing-function: ease;
            transition: border-color 0.3s;
        }

        .expressive-code:hover .twoslash-hover {
            border-color: var(--twoslash-border);
        }

        .twoslash:hover .twoslash-hover {
            border-color: var(--twoslash-underline-color);
        }
    }
    `;

	const popupDocsCSS = `
    :root[data-theme="dark"] {
        .twoslash-popup-code {
            color: var(--twoslash-popup-code-dark);
        }
        
        .twoslash-popup-docs-tag-name {
            color: var(--twoslash-docs-tag-dark);
        }
        .twoslash-popup-code-type {
            color: var(--twoslash-title-color-dark) !important;
        }
    }

    :root {
        .twoslash .twoslash-popup-container {
            display: none;
        }

        .twoslash-popup-container:before {
            content: "";
            position: absolute;
            top: -5px;
            left: 3px;
            border-top: 1px solid var(--twoslash-border);
            border-right: 1px solid var(--twoslash-border);
            background: var(--twoslash-popup-container-bg);
            transform: rotate(-45deg);
            width: 8px;
            height: 8px;
            pointer-events: none;
            display: inline-block;
        }

        .twoslash-popup-container {
            position: absolute;
            z-index: 10;
            height: max-content;
            background: var(--twoslash-popup-container-bg);
            border: 1px solid var(--twoslash-border);
            border-radius: 4px;
            font-size: 90%;
            white-space: nowrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            width: max-content !important;
        }

        .twoslash-popup-container * {
            white-space: wrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
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
            padding: 12px;
            border-top: 1px solid var(--twoslash-border);
            font-size: var(--twoslash-font-size);
            font-weight: 400;
            line-height: var(--twoslash-line-height);
            text-wrap: balance;
        }

        .twoslash-popup-code,
        .twoslash-popup-docs {
            overflow: none !important;
        }

        .twoslash-popup-docs-tag-name {
            color: var(--twoslash-tag-color);
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

        .twoslash-popup-docs pre code {
        }

        .twoslash-popup-code-type {
            color: var(--twoslash-title-color) !important;
            font-family: var(--twoslash-font-mono);
            font-weight: 600;
        }

        .twoslash-popup-docs.twoslash-popup-docs-tags {
            font-size: 14px !important;
            margin: 0 !important;
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
    }
    `;

	const staticDocsCSS = `
    :root {
        .twoslash-static-container {
            display: block;
            z-index: 10;
            background: var(--twoslash-popup-container-bg);
            border: 1px solid var(--twoslash-border);
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
            top: -5px;
            left: 3px;
            border-top: 1px solid var(--twoslash-border);
            border-right: 1px solid var(--twoslash-border);
            background: var(--twoslash-popup-container-bg);
            transform: rotate(-45deg);
            width: 8px;
            height: 8px;
            pointer-events: none;
            display: inline-block;
        }

        .twoslash-static-container * {
            white-space: wrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
        }
    }
    `;

	const completionCSS = `
    :root {
        .twoslash-completion-container {
            display: flex;
            flex-direction: column;
            z-index: 10;
            background: var(--twoslash-popup-container-bg);
            border: 1px solid var(--twoslash-border);
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

        .twoslash-cursor,
        .twoslash-cursor::before {
            content: " ";
            width: 2px;
            height: 1.4em;
            background-color: #8888;
            display: inline-block;
            margin-left: 2px;
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

        .twoslash-completion-item-separator {
            border-top: 1px solid #8888;
        }

        .twoslash-completion-item-deprecated {
            text-decoration: line-through;
            opacity: 0.5;
        }

        .twoslash-completion-item-icon {
            margin-right: 0.8rem;
            width: 1em;
            flex: none;
        }

        .twoslash-completion-name {
            font-weight: 600;
        }

        .twoslash-completion-name-unmatched {
            color: #676767;
        }
        
        .twoslash-completion-name-matched {
            color: #d5a900;
        }

        .twoslash-completion-item:hover {
            background: #8888;
        }
    }

    :root[data-theme="dark"] {
        .twoslash-completion-name-unmatched {
            color: #c6c6c6;
        }

        .twoslash-completion-name-matched {
            color: #e6c030;
        }

        .twoslash-completion-item:hover {
            background: #8888;
        }
    }

    `;

	const errorCSS = `
    :root {
        .twoslash.twoerror {
            display: ruby;
        }

        .twoslash-error-box {
            margin-left: 0.5rem;
            display: block;
            z-index: 10;
            padding: 0.1rem 0.3rem;
            border-radius: 0.2rem;
            font-style: italic;
            border: 1px solid var(--twoslash-border);
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
            color: var(--twoslash-color-error);
            border-color: var(--twoslash-color-error-border);
            background: var(--twoslash-color-error-bg);
        }

        .twoslash-error-level-warning {
            color: var(--twoslash-color-warning);
            border-color: var(--twoslash-color-warning-border);
            background: var(--twoslash-color-warning-bg);
        }

        .twoslash-error-level-suggestion {
            color: var(--twoslash-color-suggestion);
            border-color: var(--twoslash-color-suggestion-border);
            background: var(--twoslash-color-suggestion-bg);
        }

        .twoslash-error-level-message {
            color: var(--twoslash-color-message);
            border-color: var(--twoslash-color-message-border);
            background: var(--twoslash-color-message-bg);
        }
    }
    `;

	const styles = [
		// Base styles
		baseCSS,
		// Popup docs styles
		popupDocsCSS,
		// Static docs styles
		staticDocsCSS,
		// Completion styles
		completionCSS,
		// Error styles
		errorCSS,
	];

	return styles.join("\n");
}
