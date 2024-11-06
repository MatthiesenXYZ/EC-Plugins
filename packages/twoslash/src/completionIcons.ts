import { type Element, h } from "@expressive-code/core/hast";

export const completionIcons: {
	module: Element;
	class: Element;
	method: Element;
	property: Element;
	constructor: Element;
	interface: Element;
	function: Element;
	string: Element;
} = {
	module: h("svg", { viewBox: "0 0 32 32", width: "1rem", height: "auto" }, [
		h("path", { fill: "currentColor", d: "M11 2H2v9h2V4h7V2z" }, []),
		h("path", { fill: "currentColor", d: "M2 21v9h9v-2H4v-7H2z" }, []),
		h("path", { fill: "currentColor", d: "M30 11V2h-9v2h7v7h2z" }, []),
		h("path", { fill: "currentColor", d: "M21 30h9v-9h-2v7h-7v2z" }, []),
		h(
			"path",
			{
				fill: "currentColor",
				d: "M25.49 10.13l-9-5a1 1 0 0 0-1 0l-9 5A1 1 0 0 0 6 11v10a1 1 0 0 0 .51.87l9 5a1 1 0 0 0 1 0l9-5A1 1 0 0 0 26 21V11a1 1 0 0 0-.51-.87zM16 7.14L22.94 11L16 14.86L9.06 11zM8 12.7l7 3.89v7.71l-7-3.89zm9 11.6v-7.71l7-3.89v7.71z",
			},
			[],
		),
	]),
	class: h("svg", { viewBox: "0 0 32 32", width: "1rem", height: "auto" }, [
		h(
			"path",
			{
				fill: "currentColor",
				d: "M26 16a3.961 3.961 0 0 0-2.02.566l-2.859-2.859l2.293-2.293a2 2 0 0 0 0-2.828l-6-6a2 2 0 0 0-2.828 0l-6 6a2 2 0 0 0 0 2.828l2.293 2.293l-2.859 2.859a4.043 4.043 0 1 0 1.414 1.414l2.859-2.859l2.293 2.293a1.977 1.977 0 0 0 .414.31V22h-3v8h8v-8h-3v-4.277a1.977 1.977 0 0 0 .414-.309l2.293-2.293l2.859 2.859A3.989 3.989 0 1 0 26 16M8 20a2 2 0 1 1-2-2a2.002 2.002 0 0 1 2 2m10 4v4h-4v-4zm-2-8l-6-6l6-6l6 6Zm10 6a2 2 0 1 1 2-2a2.002 2.002 0 0 1-2 2",
			},
			[],
		),
	]),
	method: h("svg", { viewBox: "0 0 32 32", width: "1rem", height: "auto" }, [
		h(
			"path",
			{
				fill: "currentColor",
				d: "m19.626 29.526l-.516-1.933a12.004 12.004 0 0 0 6.121-19.26l1.538-1.28a14.003 14.003 0 0 1-7.143 22.473",
			},
			[],
		),
		h(
			"path",
			{
				fill: "currentColor",
				d: "M10 29H8v-3.82l.804-.16C10.262 24.727 12 23.62 12 20v-1.382l-4-2v-2.236l4-2V12c0-5.467 3.925-9 10-9h2v3.82l-.804.16C21.738 7.273 20 8.38 20 12v.382l4 2v2.236l-4 2V20c0 5.467-3.925 9-10 9m0-2c4.935 0 8-2.682 8-7v-2.618l3.764-1.882L18 13.618V12c0-4.578 2.385-6.192 4-6.76V5c-4.935 0-8 2.682-8 7v1.618L10.236 15.5L14 17.382V20c0 4.578-2.385 6.192-4 6.76Z",
			},
			[],
		),
		h(
			"path",
			{
				fill: "currentColor",
				d: "M5.231 24.947a14.003 14.003 0 0 1 7.147-22.474l.516 1.932a12.004 12.004 0 0 0-6.125 19.263Z",
			},
			[],
		),
	]),
	property: h("svg", { viewBox: "0 0 32 32", width: "1rem", height: "auto" }, [
		h(
			"path",
			{
				fill: "currentColor",
				d: "M12.1 2a9.8 9.8 0 0 0-5.4 1.6l6.4 6.4a2.1 2.1 0 0 1 .2 3a2.1 2.1 0 0 1-3-.2L3.7 6.4A9.84 9.84 0 0 0 2 12.1a10.14 10.14 0 0 0 10.1 10.1a10.9 10.9 0 0 0 2.6-.3l6.7 6.7a5 5 0 0 0 7.1-7.1l-6.7-6.7a10.9 10.9 0 0 0 .3-2.6A10 10 0 0 0 12.1 2m8 10.1a7.61 7.61 0 0 1-.3 2.1l-.3 1.1l.8.8l6.7 6.7a2.88 2.88 0 0 1 .9 2.1A2.72 2.72 0 0 1 27 27a2.9 2.9 0 0 1-4.2 0l-6.7-6.7l-.8-.8l-1.1.3a7.61 7.61 0 0 1-2.1.3a8.27 8.27 0 0 1-5.7-2.3A7.63 7.63 0 0 1 4 12.1a8.33 8.33 0 0 1 .3-2.2l4.4 4.4a4.14 4.14 0 0 0 5.9.2a4.14 4.14 0 0 0-.2-5.9L10 4.2a6.45 6.45 0 0 1 2-.3a8.27 8.27 0 0 1 5.7 2.3a8.49 8.49 0 0 1 2.4 5.9",
			},
			[],
		),
	]),
	constructor: h(
		"svg",
		{ viewBox: "0 0 32 32", width: "1rem", height: "auto" },
		[
			h(
				"path",
				{
					fill: "currentColor",
					d: "M21.49 13.115l-9-5a1 1 0 0 0-1 0l-9 5A1.008 1.008 0 0 0 2 14v9.995a1 1 0 0 0 .52.87l9 5A1.004 1.004 0 0 0 12 30a1.056 1.056 0 0 0 .49-.135l9-5A.992.992 0 0 0 22 24V14a1.008 1.008 0 0 0-.51-.885zM11 27.295l-7-3.89v-7.72l7 3.89zm1-9.45L5.06 14L12 10.135l6.94 3.86zm8 5.56l-7 3.89v-7.72l7-3.89z",
				},
				[],
			),
			h(
				"path",
				{ fill: "currentColor", d: "M30 6h-4V2h-2v4h-4v2h4v4h2V8h4V6z" },
				[],
			),
		],
	),
	interface: h("svg", { viewBox: "0 0 32 32", width: "1rem", height: "auto" }, [
		h(
			"path",
			{
				fill: "currentColor",
				d: "M23 16.01a7 7 0 0 0-4.18 1.39l-4.22-4.22A6.86 6.86 0 0 0 16 9.01a7 7 0 1 0-2.81 5.59l4.21 4.22a7 7 0 1 0 5.6-2.81m-19-7a5 5 0 1 1 5 5a5 5 0 0 1-5-5",
			},
			[],
		),
	]),
	function: h("svg", { viewBox: "0 0 32 32", width: "1rem", height: "auto" }, [
		h(
			"path",
			{
				fill: "currentColor",
				d: "m19.626 29.526l-.516-1.933a12.004 12.004 0 0 0 6.121-19.26l1.538-1.28a14.003 14.003 0 0 1-7.143 22.473",
			},
			[],
		),
		h(
			"path",
			{
				fill: "currentColor",
				d: "M10 29H8v-3.82l.804-.16C10.262 24.727 12 23.62 12 20v-1.382l-4-2v-2.236l4-2V12c0-5.467 3.925-9 10-9h2v3.82l-.804.16C21.738 7.273 20 8.38 20 12v.382l4 2v2.236l-4 2V20c0 5.467-3.925 9-10 9m0-2c4.935 0 8-2.682 8-7v-2.618l3.764-1.882L18 13.618V12c0-4.578 2.385-6.192 4-6.76V5c-4.935 0-8 2.682-8 7v1.618L10.236 15.5L14 17.382V20c0 4.578-2.385 6.192-4 6.76Z",
			},
			[],
		),
		h(
			"path",
			{
				fill: "currentColor",
				d: "M5.231 24.947a14.003 14.003 0 0 1 7.147-22.474l.516 1.932a12.004 12.004 0 0 0-6.125 19.263Z",
			},
			[],
		),
	]),
	string: h("svg", { viewBox: "0 0 32 32", width: "1rem", height: "auto" }, [
		h(
			"path",
			{
				fill: "currentColor",
				d: "M29 22h-5a2.003 2.003 0 0 1-2-2v-6a2.002 2.002 0 0 1 2-2h5v2h-5v6h5zM18 12h-4V8h-2v14h6a2.003 2.003 0 0 0 2-2v-6a2.002 2.002 0 0 0-2-2m-4 8v-6h4v6zm-6-8H3v2h5v2H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h6v-8a2.002 2.002 0 0 0-2-2m0 8H4v-2h4z",
			},
			[],
		),
	]),
};

export type CompletionIcon = keyof typeof completionIcons;
