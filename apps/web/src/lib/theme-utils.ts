import type { ThemeColors, ThemeConfig, ThemeMode } from "./theme-types";

// Session state colors for agent status indicators
export function getSessionStateColor(
	state: "idle" | "busy" | "waiting_input" | "error" | "connecting",
	colors: ThemeColors
): string {
	switch (state) {
		case "idle":
			return colors.textSecondary;
		case "busy":
			return colors.info;
		case "waiting_input":
			return colors.warning;
		case "error":
			return colors.error;
		case "connecting":
			return colors.textAccent;
		default:
			return colors.textSecondary;
	}
}

// File change type colors for version control indicators
export function getFileChangeColor(
	changeType: "added" | "deleted" | "modified",
	colors: ThemeColors
): string {
	switch (changeType) {
		case "added":
			return colors.success;
		case "deleted":
			return colors.error;
		case "modified":
			return colors.warning;
		default:
			return colors.textSecondary;
	}
}

// Get status color by semantic name
export function getStatusColor(
	status: "success" | "warning" | "error" | "info" | "neutral",
	colors: ThemeColors
): string {
	switch (status) {
		case "success":
			return colors.success;
		case "warning":
			return colors.warning;
		case "error":
			return colors.error;
		case "info":
			return colors.info;
		case "neutral":
			return colors.textSecondary;
		default:
			return colors.textSecondary;
	}
}

// Get a specific color from theme by key name
export function getThemeColor<K extends keyof ThemeColors>(
	colors: ThemeColors,
	key: K
): ThemeColors[K] {
	return colors[key];
}

// Check if a hex color is light or dark
export function isLightColor(hexColor: string): boolean {
	const hex = hexColor.replace("#", "");
	const r = Number.parseInt(hex.slice(0, 2), 16);
	const g = Number.parseInt(hex.slice(2, 4), 16);
	const b = Number.parseInt(hex.slice(4, 6), 16);
	// Calculate relative luminance
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.5;
}

// Get contrasting text color (black or white) for a background
export function getContrastColor(hexBackground: string): string {
	return isLightColor(hexBackground) ? "#000000" : "#ffffff";
}

// Lighten a hex color by percentage (0-100)
export function lightenColor(hexColor: string, percent: number): string {
	const hex = hexColor.replace("#", "");
	const r = Number.parseInt(hex.slice(0, 2), 16);
	const g = Number.parseInt(hex.slice(2, 4), 16);
	const b = Number.parseInt(hex.slice(4, 6), 16);

	const factor = percent / 100;
	const newR = Math.min(255, Math.round(r + (255 - r) * factor));
	const newG = Math.min(255, Math.round(g + (255 - g) * factor));
	const newB = Math.min(255, Math.round(b + (255 - b) * factor));

	return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

// Darken a hex color by percentage (0-100)
export function darkenColor(hexColor: string, percent: number): string {
	const hex = hexColor.replace("#", "");
	const r = Number.parseInt(hex.slice(0, 2), 16);
	const g = Number.parseInt(hex.slice(2, 4), 16);
	const b = Number.parseInt(hex.slice(4, 6), 16);

	const factor = 1 - percent / 100;
	const newR = Math.max(0, Math.round(r * factor));
	const newG = Math.max(0, Math.round(g * factor));
	const newB = Math.max(0, Math.round(b * factor));

	return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

// Convert hex to rgba with alpha
export function hexToRgba(hexColor: string, alpha: number): string {
	const hex = hexColor.replace("#", "");
	const r = Number.parseInt(hex.slice(0, 2), 16);
	const g = Number.parseInt(hex.slice(2, 4), 16);
	const b = Number.parseInt(hex.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Create a CSS gradient from theme colors
export function createGradient(
	colors: ThemeColors,
	direction: "vertical" | "horizontal" | "diagonal" = "vertical"
): string {
	const from = colors.bgMain;
	const to = colors.bgSidebar;
	switch (direction) {
		case "vertical":
			return `linear-gradient(to bottom, ${from}, ${to})`;
		case "horizontal":
			return `linear-gradient(to right, ${from}, ${to})`;
		case "diagonal":
			return `linear-gradient(135deg, ${from}, ${to})`;
		default:
			return `linear-gradient(to bottom, ${from}, ${to})`;
	}
}

// Generate CSS custom properties string from theme colors
export function generateCSSVariables(
	colors: ThemeColors,
	prefix = "--theme"
): string {
	const entries = Object.entries(colors);
	const lines = entries.map(([key, value]) => `\t${prefix}-${key}: ${value};`);
	return `:root {\n${lines.join("\n")}\n}`;
}

// Apply theme colors to an element's inline style
export function applyThemeToElement(
	element: HTMLElement,
	colors: ThemeColors,
	prefix = "--theme"
): void {
	for (const [key, value] of Object.entries(colors)) {
		element.style.setProperty(`${prefix}-${key}`, value);
	}
}

// Check if theme mode is dark
export function isDarkMode(mode: ThemeMode): boolean {
	return mode === "dark";
}

// Check if theme mode is light
export function isLightMode(mode: ThemeMode): boolean {
	return mode === "light";
}

// Get theme mode label for display
export function getThemeModeLabel(mode: ThemeMode): string {
	switch (mode) {
		case "light":
			return "Light";
		case "dark":
			return "Dark";
		case "vibe":
			return "Vibe";
		default:
			return "Unknown";
	}
}

// Validate that an object is a valid ThemeConfig
export function isValidThemeConfig(theme: unknown): theme is ThemeConfig {
	if (typeof theme !== "object" || theme === null) {
		return false;
	}
	const t = theme as Record<string, unknown>;
	return (
		typeof t.id === "string" &&
		typeof t.name === "string" &&
		(t.mode === "light" || t.mode === "dark" || t.mode === "vibe") &&
		typeof t.colors === "object" &&
		t.colors !== null
	);
}

// Merge two theme color objects (for customization)
export function mergeThemeColors(
	base: ThemeColors,
	overrides: Partial<ThemeColors>
): ThemeColors {
	return { ...base, ...overrides };
}

// Create a custom theme from a base theme
export function createCustomTheme(
	baseTheme: ThemeConfig,
	id: string,
	name: string,
	colorOverrides: Partial<ThemeColors>
): ThemeConfig {
	return {
		id,
		name,
		mode: baseTheme.mode,
		colors: mergeThemeColors(baseTheme.colors, colorOverrides),
	};
}

// Get focus ring color with appropriate opacity
export function getFocusRingColor(colors: ThemeColors): string {
	return hexToRgba(colors.textAccent, 0.5);
}

// Get hover overlay color
export function getHoverOverlayColor(colors: ThemeColors): string {
	return hexToRgba(colors.textMain, 0.05);
}

// Get active/pressed overlay color
export function getActiveOverlayColor(colors: ThemeColors): string {
	return hexToRgba(colors.textMain, 0.1);
}

// Generate scrollbar colors for a theme
export function getScrollbarColors(colors: ThemeColors): {
	track: string;
	thumb: string;
	thumbHover: string;
} {
	return {
		track: hexToRgba(colors.bgMain, 0.1),
		thumb: hexToRgba(colors.textSecondary, 0.3),
		thumbHover: hexToRgba(colors.textSecondary, 0.5),
	};
}

// Get selection/highlight colors
export function getSelectionColors(colors: ThemeColors): {
	background: string;
	text: string;
} {
	return {
		background: hexToRgba(colors.textAccent, 0.3),
		text: colors.textMain,
	};
}
