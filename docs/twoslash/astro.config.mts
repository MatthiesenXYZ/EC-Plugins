import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
	site: "https://twoslash.matthiesen.dev",
	integrations: [
		starlight({
			title: "Expressive Code Twoslash",
			description:
				"A plugin for Astro that adds Twoslash support to code blocks.",
			tagline: "Twoslash support for Expressive Code",
			favicon: "/favicon.svg",
			logo: {
				src: "./src/assets/twoslash.png",
				alt: "EC Twoslash Logo",
			},
			credits: true,
			social: {
				github:
					"https://github.com/MatthiesenXYZ/EC-Plugins/tree/main/packages/twoslash",
			},
			editLink: {
				baseUrl:
					"https://github.com/MatthiesenXYZ/EC-Plugins/edit/main/docs/twoslash/",
			},
			sidebar: [
				{
					label: "Getting Started",
					autogenerate: { directory: "getting-started" },
				},
				{
					label: "Usage",
					items: [
						{
							label: "Code Queries",
							autogenerate: { directory: "usage/queries" },
						},
						{
							label: "Banners",
							autogenerate: { directory: "usage/banners" },
						},
						{
							label: "Code Cutting",
							link: "usage/code-cutting",
						},
						{
							label: "Overriding Compiler Options",
							link: "usage/ts-compiler-flags",
						},
						{
							label: "External Types",
							link: "usage/external-types",
						},
						{
							label: "Show Emitted Files",
							link: "usage/show-emitted-files",
						},
					],
				},
			],
		}),
	],
});
