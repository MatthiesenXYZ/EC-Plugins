---
title: My docs
description: Learn more about my project in this docs site built with Starlight.
---

```ts twoslash
// @errors: 2322
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
// ---cut-before---
import ectwoslash from "@matthiesenxyz/ec-twoslash";

const e: string = 1;
//    ^?

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
// ---cut-after---
const hello = "world";
```