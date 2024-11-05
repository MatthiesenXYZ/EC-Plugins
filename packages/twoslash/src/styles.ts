import {
	PluginStyleSettings,
	type ResolverContext,
} from "@expressive-code/core";

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

export function getTwoSlashBaseStyles({ cssVar }: ResolverContext) {
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
    }
    `;
}
