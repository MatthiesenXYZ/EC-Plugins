import { h } from "@expressive-code/core/hast";
import type { CustomTagsIcons } from "../types";

export const customTagsIcons: CustomTagsIcons = {
	log: h("svg", { viewBox: "0 0 32 32", width: "1rem", height: "auto" }, [
		h(
			"path",
			{
				fill: "currentColor",
				d: "M17 22v-8h-4v2h2v6h-3v2h8v-2zM16 8a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 8",
			},
			[],
		),
		h(
			"path",
			{
				fill: "currentColor",
				d: "M26 28H6a2.002 2.002 0 0 1-2-2V6a2.002 2.002 0 0 1 2-2h20a2.002 2.002 0 0 1 2 2v20a2.002 2.002 0 0 1-2 2M6 6v20h20V6Z",
			},
			[],
		),
	]),
	warn: h("svg", { viewBox: "0 0 32 32", width: "1rem", height: "auto" }, [
		h(
			"path",
			{
				fill: "currentColor",
				d: "M16 23a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 23m-1-11h2v9h-2z",
			},
			[],
		),
		h(
			"path",
			{
				fill: "currentColor",
				d: "M29 30H3a1 1 0 0 1-.887-1.461l13-25a1 1 0 0 1 1.774 0l13 25A1 1 0 0 1 29 30M4.65 28h22.7l.001-.003L16.002 6.17h-.004L4.648 27.997Z",
			},
			[],
		),
	]),
	error: h("svg", { viewBox: "0 0 32 32", width: "1rem", height: "auto" }, [
		h(
			"path",
			{
				fill: "currentColor",
				d: "M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2m0 26a12 12 0 1 1 12-12a12 12 0 0 1-12 12",
			},
			[],
		),
		h(
			"path",
			{
				fill: "currentColor",
				d: "M15 8h2v11h-2zm1 14a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 22",
			},
			[],
		),
	]),
	annotate: h("svg", { viewBox: "0 0 32 32", width: "1rem", height: "auto" }, [
		h(
			"path",
			{
				fill: "currentColor",
				d: "M11 24h10v2H11zm2 4h6v2h-6zm3-26A10 10 0 0 0 6 12a9.19 9.19 0 0 0 3.46 7.62c1 .93 1.54 1.46 1.54 2.38h2c0-1.84-1.11-2.87-2.19-3.86A7.2 7.2 0 0 1 8 12a8 8 0 0 1 16 0a7.2 7.2 0 0 1-2.82 6.14c-1.07 1-2.18 2-2.18 3.86h2c0-.92.53-1.45 1.54-2.39A9.18 9.18 0 0 0 26 12A10 10 0 0 0 16 2",
			},
			[],
		),
	]),
};
