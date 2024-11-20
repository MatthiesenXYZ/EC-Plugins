import type { ResolvedExpressiveCodeEngineConfig } from "@expressive-code/core";
import type { ExpressiveCodeConfig } from "expressive-code";

/**
 * Generates an ExpressiveCodeConfig object based on the provided ResolvedExpressiveCodeEngineConfig.
 *
 * @param config - The resolved configuration object for the Expressive Code Engine.
 * @returns An ExpressiveCodeConfig object with properties derived from the input config.
 */
export const ecConfig = (
	config: ResolvedExpressiveCodeEngineConfig,
): ExpressiveCodeConfig => {
	return {
		cascadeLayer: config.cascadeLayer,
		customizeTheme: config.customizeTheme,
		defaultLocale: config.defaultLocale,
		defaultProps: config.defaultProps,
		logger: config.logger,
		minSyntaxHighlightingColorContrast:
			config.minSyntaxHighlightingColorContrast,
		styleOverrides: config.styleOverrides,
		themeCssRoot: config.themeCssRoot,
		themeCssSelector: config.themeCssSelector,
		themes: config.themes,
		useDarkModeMediaQuery: config.useDarkModeMediaQuery,
		useStyleReset: config.useStyleReset,
		useThemedScrollbars: config.useThemedScrollbars,
		useThemedSelectionColors: config.useThemedSelectionColors,
		frames: {
			showCopyToClipboardButton: false,
			extractFileNameFromCode: false,
		},
	};
};
