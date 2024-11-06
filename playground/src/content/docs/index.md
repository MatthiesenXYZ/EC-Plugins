---
title: My docs
description: Learn more about my project in this docs site built with Starlight.
---

## Basic

```ts twoslash
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({})
```

## Test Cutting

### cut-before and cut-after

```ts twoslash title="astro.config.mjs"
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
// ---cut-before---
import ectwoslash from "expressive-code-twoslash";

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
const removethis = "will be removed";
```

### cut-start and cut-end "Between"

```ts twoslash title"example-between.ts"
// foo and bar is not visible
const hello = "hello";
const world = "world";

// ---cut-start---
const foo = "foo";
const bar = "bar";
// ---cut-end---

const helloWorld = `${hello}${world}`;

```

## Test Errors

```ts twoslash title="example-ts-error.ts"
// @errors: 2322
const willNotError: string = "i am a string";
const willCauseError: string = 1;
```

## Test Queries

### Test Type Extraction

```ts twoslash title="example-type.ts"
const world: string = "world";

const hello = `Hello ${world}`;
//    ^?
```

### Test Completions

```ts twoslash title="example-completion.ts"
// @noErrors

console.c
//       ^|

```