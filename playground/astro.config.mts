import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import ectwoslash from "expressive-code-twoslash";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: "Starlight",
			expressiveCode: {
				themes: ['github-dark-dimmed'],
				plugins: [ectwoslash()],
			},
		}),
	],
});
