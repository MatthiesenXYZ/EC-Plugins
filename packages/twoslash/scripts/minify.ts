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

// Read the files
const file = await readFile("./src/module-code/popup.js", { encoding: "utf8" });

// Minify the code
const result = UglifyJS.minify(file);

// Add the minified code to the output
output.push(`export default '${result.code}';`);

// Write output to file
writeFileSync("./src/module-code/popup.min.ts", output.join("\n"));
