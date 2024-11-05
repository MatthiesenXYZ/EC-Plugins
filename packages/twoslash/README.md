# `@matthiesenxyz/ec-twoslash`

An Expressive Code plugin to add TwoSlash to Expressive code

## Usage

### Installation

Install the package with your favorite package manager

```bash
pnpm add @matthiesenxyz/ec-twoslash
```

### Add to EC Config

Add ecTwoSlash to your Expressive Code plugin list

```ts
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import ecTwoSlash from "@matthiesenxyz/ec-twoslash";

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
```

The above codeblock will now have hover popups that will show type information!

``````

## Licensing

[MIT Licensed](https://github.com/MatthiesenXYZ/EC-Plugins/tree/main/packages/twoslash/LICENSE). Made with ❤️ by [Adam Matthiesen](https://github.com/Adammatthiesen).

## Acknowledgements

- [GitHub: @Hippotastic](https://github.com/hippotastic) For providing/maintaining Expressive Code