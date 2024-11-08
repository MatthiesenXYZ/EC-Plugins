# `expressive-code-twoslash`

An Expressive Code plugin to add TwoSlash support

## Features

The following is a list of TwoSlash features and if they are currently supported by this plugin

- [x] JSDocs and Type Hover boxes
- [x] [Error Handling/Messages](https://vocs.dev/docs/guides/twoslash#errors)
- [x] [Overriding TSCompiler Options](https://twoslash.netlify.app/refs/notations#overriding-options)
- [x] [Queries: Extract Type](https://twoslash.netlify.app/refs/notations#extract-type)
- [x] [Queries: Completions](https://twoslash.netlify.app/refs/notations#completions)
- [x] [Queries: Highlights](https://twoslash.netlify.app/refs/notations#highlighting) - Already Supported by [Expressive-Code](https://expressive-code.com/key-features/syntax-highlighting/)
- [x] [Code Sample Cutting](https://twoslash.netlify.app/refs/notations#cutting-a-code-sample)

### Extra Bonus features i would like to implement

- [ ] [Showing Emitted files](https://twoslash.netlify.app/refs/notations#showing-the-emitted-files)

## Usage

### Installation

Install the package with your favorite package manager

```bash
pnpm add expressive-code-twoslash
```

### Add to EC Config

Add ecTwoSlash to your Expressive Code plugin list

```ts
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

```js
ecTwoSlash({
  /**
   * If `true`, requires `twoslash` to be present in the code block meta for
   * this transformer to be applied.
   *
   * If a `RegExp`, requires the `RegExp` to match a directive in the code
   * block meta for this transformer to be applied.
   *
   * If `false`, this transformer will be applied to all code blocks.
   *
   * @default true
   */
  explicitTrigger: true,
  /**
   * If `true`, includes JSDoc comments in the hover popup.
   *
   * @default true
   */
  includeJSDoc: true,
  /**
   * The languages to apply this transformer to.
   *
   * @default ["ts", "tsx"]
   */
  languages: ["ts", "tsx"],
  /**
   * Options to forward to `twoslash`.
   *
   * @default {}
   */
  twoslashOptions: {},
})
```

### Use TwoSlash!

``````md

A quick example using TwoSlash to make advanced CodeBlocks

```ts twoslash
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
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
```

The above codeblock will now have hover popups that will show type information!

``````

## Licensing

[MIT Licensed](https://github.com/MatthiesenXYZ/EC-Plugins/tree/main/packages/twoslash/LICENSE). Made with ❤️ by [Adam Matthiesen](https://github.com/Adammatthiesen).

## Acknowledgements

- [GitHub: @Hippotastic](https://github.com/hippotastic) For providing/maintaining Expressive Code