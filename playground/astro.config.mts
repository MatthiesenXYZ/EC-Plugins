import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import ectwoslash from "expressive-code-twoslash";
import ts, { type CompilerOptions } from "typescript";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: "Starlight",
			expressiveCode: {
				// themes: ['github-dark-dimmed'],
				plugins: [ectwoslash({
					twoslashOptions: {
						compilerOptions: {
							target: ts.ScriptTarget.ESNext,
							moduleResolution: ts.ModuleResolutionKind.Bundler
						}
					}
				})],
			},
		}),
	],
});
