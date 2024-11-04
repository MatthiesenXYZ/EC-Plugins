import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import ectwoslash from "@matthiesenxyz/ec-twoslash";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: "Starlight",
			expressiveCode: {
				plugins: [ectwoslash()],
			},
		}),
	],
});
