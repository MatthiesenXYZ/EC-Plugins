import { writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import UglifyJS from "uglify-js";

// Generate markdown output
const output: string[] = [];

output.push(
	"/*",
	"	GENERATED FILE - DO NOT EDIT",
	"	----------------------------",
	'	This JS module code was built from the source file "popup.js".',
	"	To change it, modify the source file and then re-run the build script.",
	"*/",
	"",
);

// Read the files
const file = await readFile("./src/module-code/popup.js", { encoding: "utf8" });

// Minify the code
const result = UglifyJS.minify(file);

// Add the minified code to the output
output.push(`export default '${result.code}';`);

// Write output to file
writeFileSync("./src/module-code/popup.min.js", output.join("\n"));
