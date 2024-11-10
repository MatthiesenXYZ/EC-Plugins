import { toMarkdown } from 'mdast-util-to-markdown'
import type { List, Root } from 'mdast'
import { loadChangelog, semverCategories } from './lib/changelogs'
import { writeFileLines } from './lib/utils'

const changelog = loadChangelog('../../packages/twoslash/CHANGELOG.md')

// Generate markdown output
const output: string[] = []

output.push(
	// Add release notes frontmatter to output
	'---',
	'# Warning: This file is generated automatically. Do not edit!',
	'title: Release Notes',
    'sideBar:',
    '  order: 3',
	'---',
	'',
    'This document contains release notes for the `expressive-code-twoslash` package.',
    'For more information, see the [CHANGELOG file](https://github.com/MatthiesenXYZ/EC-Plugins/blob/main/packages/twoslash/CHANGELOG.md)',
	''
)

const ast: Root = {
	type: 'root',
	children: [],
}

changelog.versions.forEach((version) => {
	const versionChanges: List = { type: 'list', children: [] }
	semverCategories.forEach((semverCategory) => {
		version.changes[semverCategory].children.forEach((listItem) => {
			versionChanges.children.push(listItem)
		})
	})
	if (version.includes.size) {
		versionChanges.children.push({
			type: 'listItem',
			children: [
				{
					type: 'paragraph',
					children: [{ type: 'text', value: `Includes: ${[...version.includes].join(', ')} ` }],
				},
			],
		})
	}
	if (!versionChanges.children.length) return

	ast.children.push({ type: 'heading', depth: 2, children: [{ type: 'text', value: version.version }] })
	ast.children.push(versionChanges)
})

output.push(toMarkdown(ast, { bullet: '-' }))

// Write output to file
writeFileLines('./src/content/docs/getting-started/changelog.md', output)