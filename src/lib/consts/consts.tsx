import type { Styles } from "../interfaces/interfaces";

export const defaultStyles: Styles = {
	form: { width: "full", height: "md" },
	output: { position: "bottom", showJson: true, width: "full", height: "md" },
	settings: { width: "md" },
	spacing: "md",
};

export const heightMap = {
	sm: "max-h-[300px]",
	md: "max-h-[500px]",
	lg: "max-h-[800px]",
	full: "max-h-full",
};

export const outputHeightMap = {
	sm: 300,
	md: 500,
	lg: 800,
	full: undefined,
};

export const widthMap = {
	sm: "w-full max-w-[600px]",
	md: "w-full max-w-[800px]",
	lg: "w-full max-w-[1200px]",
	full: "w-full",
};

export const settingsWidthMap = {
	sm: "sm:max-w-[500px]",
	md: "sm:max-w-[700px]",
	lg: "sm:max-w-[1000px]",
	full: "w-full sm:max-w-full",
};

export const layoutMap = {
	top: "flex-col-reverse",
	bottom: "flex-col",
	left: "flex-row-reverse",
	right: "flex-row",
};

export const spacingMap = { sm: "gap-2", md: "gap-4", lg: "gap-6" };

export const types = [
	"string",
	"integer",
	"number",
	"boolean",
	"object",
	"array",
];

export const integerDataTypes = ["int-32", "int-64"];

export const numberDataTypes = ["float", "double", "big-decimal"];

export const stringFormats = [
	"date",
	"date-time",
	"local-date-time",
	"time",
	"duration",
	"email",
	"hostname",
	"ipv4",
	"ipv6",
	"password",
	"html",
	"json",
	"json-path",
	"uri",
	"uri-refrence",
	"uri-template",
	"relative-json-pointer",
	"json-pointer",
	"regex",
	"uuid",
];
