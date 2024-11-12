import { writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import UglifyJS from "uglify-js";

// Generate markdown output
const output: string[] = [];

output.push(
	// Add release notes frontmatter to output
	"// Warning: This file is generated automatically. Do not edit!",
	"",
);

const file = await readFile("./src/module-code/popup.js", { encoding: "utf8" });

const result = UglifyJS.minify(file);

// Write output to file
output.push(`export default '${result.code}';`);

writeFileSync("./src/module-code/popup.min.ts", output.join("\n"));
