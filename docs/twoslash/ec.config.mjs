import { defineEcConfig } from "@astrojs/starlight/expressive-code";
import shikiColorizedBrackets from "./plugins/shiki-color-brackets/index.js";
import ectwoslash from "expressive-code-twoslash";

export default defineEcConfig({
	plugins: [ectwoslash()],
	shiki: {
		transformers: [shikiColorizedBrackets()],
	},
});
