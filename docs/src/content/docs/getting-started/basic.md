---
title: Basic Usage
sidebar:
  order: 2
---

### Input (Markdown File)

A quick example using TwoSlash to make advanced CodeBlocks

``````md

```ts twoslash
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import ecTwoSlash from "expressive-code-twoslash";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Starlight",
      expressiveCode: {
        plugins: [ecTwoSlash()],
      },
    }),
  ],
});
```

``````

### Output

```ts twoslash
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import ecTwoSlash from "expressive-code-twoslash";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Starlight",
      expressiveCode: {
        plugins: [ecTwoSlash()],
      },
    }),
  ],
});
```