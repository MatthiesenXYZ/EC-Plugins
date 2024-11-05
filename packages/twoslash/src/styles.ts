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
			titleColor: ({ theme }) => theme.colors["terminal.ansiMagenta"],
			tagColor: ({ theme }) => theme.colors["terminal.ansiBrightBlue"],
			tagColorDark: ({ theme }) => theme.colors["terminal.ansiBlue"],
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
	return `
    :root[data-theme="dark"] {
        .twoslash-popup-code {
            color: var(--1, inherit);
        }
        
        .twoslash-popup-docs-tag-name {
            color: ${cssVar("twoSlash.tagColor")};
        }
    }

    :root {
        --twoslash-border: ${cssVar("twoSlash.borderColor")};
        --twoslash-text-color: ${cssVar("twoSlash.textColor")};
        --twoslash-underline-color: currentColor;
        --twoslash-tag-color: ${cssVar("twoSlash.tagColorDark")};
        --twoslash-title-color: ${cssVar("twoSlash.titleColor")};

        .main-pane { z-index: 1; }

        .twoslash-popup-docs-tag-name {
            color: var(--twoslash-tag-color);
            font-style: italic;
            --shiki-dark-font-style: italic;
            font-weight: 500;
        }

        .twoslash { position: relative; }

        @media (prefers-reduced-motion: reduce) {
            .twoslash * { 
                transition: none !important; 
            }
        }

        /* ===== Hover Info ===== */
        .twoslash .twoslash-hover {
            position: relative;
            border-bottom: 1px dotted transparent;
            transition-timing-function: ease;
            transition: border-color 0.3s;
        }

        .twoslash:hover .twoslash-hover {
            border-color: var(--twoslash-underline-color);
        }

        .twoslash .twoslash-popup-container {
            display: none;
        }

        .twoslash-error-box {
            display: block;
            z-index: 10;
            padding: 0.1rem 0.3rem;
            border-radius: 0.2rem;
            font-style: italic;
            background: var(--ec-frm-edBg);
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
            color: #f22 !important;
            border-color: #f22 !important;
        }

        .twoslash-error-level-warning {
            color: #f60 !important;
            border-color: #f60 !important;
        }

        .twoslash-error-level-suggestion {
            color: #0a0 !important;
            border-color: #0a0 !important
        }

        .twoslash-error-level-message {
            color: #00f !important;
            border-color: #00f !important;
        }

        .twoslash-static-container {
            position: absolute;
            left: -4px;
            display: block;
            z-index: 10;
            background: var(--ec-frm-edBg);
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
            background: var(--ec-frm-edBg);
            transform: rotate(-45deg);
            width: 8px;
            height: 8px;
            pointer-events: none;
            display: inline-block;
        }

        .twoslash-popup-container {
            position: absolute;
            z-index: 10;
            background: var(--ec-frm-edBg);
            border: 1px solid var(--twoslash-border);
            border-radius: 4px;
            font-size: 90%;
            overflow-y: auto;
            white-space: nowrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            width: max-content !important;
        }

        .twoslash-popup-container *,
        .twoslash-static-container * {
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
              color: var(--0);
            font-family: var(--__sl-font);
            font-size: var(--sl-text-code);
            font-weight: 400;
            line-height: var(--sl-line-height);
            white-space: pre-wrap;
        }

        .twoslash-popup-docs {
            max-width: 600px;
            max-height: 500px;
            padding: 12px;
            border-top: 1px solid var(--twoslash-border);
            font-size: var(--sl-text-code);
            font-weight: 400;
            line-height: var(--sl-line-height);
            text-wrap: balance;
        }

        .twoslash-popup-code,
        .twoslash-popup-docs {
            overflow: none !important;
        }

        .twoslash-popup-docs code:not(:has(.shiki)) {
            background-color: var(--ec-frm-edBg) !important;
            padding: .15rem !important;
            border-radius: 4px !important;
            position: relative !important;
            display: inline-block !important;
            line-height: 1 !important;
            border: 2px solid var(--ec-brdCol) !important;
        }

        .twoslash-popup-code-type {
            color: var(--twoslash-title-color) !important;
            font-weight: 600;
        }

        .twoslash-popup-docs.twoslash-popup-docs-tags {
            font-size: 14px !important;
            margin: 0 !important;
        }

        .twoslash-popup-docs pre code {
            border: none !important;
            outline: none !important;
            padding: 0 !important;
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

        .twoslash-error {
            font-style: italic;
            padding-inline: 0.4rem;
            padding-top: 0.2rem;
            padding-bottom: 0.1rem;
            border-radius: 0.2rem;
            /* Prevent inline annotations from overriding our styles */
            & span {
            color: inherit;
            font-style: inherit;
            }
        }
    }
    `;
}
