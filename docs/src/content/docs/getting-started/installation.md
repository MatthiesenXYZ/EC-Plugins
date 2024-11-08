---
title: Installing
sidebar:
  order: 1
---

### Features

| Supported | Feature |
|-----------|---------|
| ✅ | [JSDocs and Type Hover boxes](/getting-started/basic) |
| ✅ | [Error Handling/Messages](/usage/errors) |
| ✅ | [Queries (Type Extraction)](/usage/queries) |
| ✅ | [Code Completions](/usage/completions) |
| ✅ | [Code Highlighting](/usage/highlights) |
| ✅ | [Code Cutting](/usage/cutting) |
| ✅ | [Callouts](/usage/callouts) |
| ✅ | [TSComiler Overrides](/usage/ts-compiler-flags) |
| 🛠️ | [Showing emitted files](https://twoslash.netlify.app/refs/notations#showing-the-emitted-files) |

### Installation

Install the package with your favorite package manager

```bash
pnpm add expressive-code-twoslash
```

### Add to EC Config

Add ecTwoSlash to your Expressive Code plugin list

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

### Config Options

Default config options shown.

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
        plugins: [
// ---cut-before---            
ecTwoSlash({
    explicitTrigger: true,
    includeJsDoc: true,
    languages: ["ts", "tsx"],
    twoslashOptions: {},
})
// ---cut-after---
        ],
      },
    }),
  ],
});
```