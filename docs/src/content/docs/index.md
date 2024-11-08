---
title: Expressive Code Twoslash
description: Add TypeScript Twoslash code examples with the Expressive Code Twoslash plugin.
template: splash
hero:
  tagline: A plugin to add TypeScript Twoslash code examples
  image: 
    alt: Twoslash Logo
    file: ../../assets/twoslash.svg
  actions:
    - text: Get started
      link: /getting-started/installation
      icon: right-arrow
    - text: Star on GitHub
      link: https://github.com/Matthiesenxyz/ec-plugins
      icon: star
      variant: minimal
---

```ts twoslash title="astro.config.mjs"
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import ecTwoSlash from "expressive-code-twoslash";

// @annotate: Just Hover over items like your would in your Code Editor!
// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: "Example Starlight",
			expressiveCode: {
				plugins: [ecTwoSlash()],
			},
		}),
	],
});
```