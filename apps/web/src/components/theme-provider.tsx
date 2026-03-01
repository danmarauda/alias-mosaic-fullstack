"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { ThemeColors, ThemeConfig, ThemeMode } from "@/lib/theme-types";
import { BUILTIN_THEMES } from "@/lib/theme-types";

// Re-export types for external use
export type { ThemeColors, ThemeConfig, ThemeMode };

// System preference detection
type DeviceColorScheme = "light" | "dark";

function getDeviceColorScheme(): DeviceColorScheme {
	if (typeof window === "undefined") {
		return "dark";
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

// Built-in additional themes (Maestro-style)
const ADDITIONAL_THEMES: Record<string, ThemeConfig> = {
	dracula: {
		id: "dracula",
		name: "Dracula",
		mode: "dark",
		colors: {
			bgMain: "#282a36",
			bgSidebar: "#21222c",
			bgCard: "#44475a",
			bgInput: "#44475a",
			bgButton: "#bd93f9",
			textMain: "#f8f8f2",
			textSecondary: "#6272a4",
			textAccent: "#bd93f9",
			border: "#44475a",
			success: "#50fa7b",
			warning: "#ffb86c",
			error: "#ff5555",
			info: "#8be9fd",
		},
	},
	"github-light": {
		id: "github-light",
		name: "GitHub Light",
		mode: "light",
		colors: {
			bgMain: "#ffffff",
			bgSidebar: "#f6f8fa",
			bgCard: "#ffffff",
			bgInput: "#f6f8fa",
			bgButton: "#1f883d",
			textMain: "#1f2328",
			textSecondary: "#656d76",
			textAccent: "#0969da",
			border: "#d0d7de",
			success: "#1a7f37",
			warning: "#9a6700",
			error: "#cf222e",
			info: "#0969da",
		},
	},
	nord: {
		id: "nord",
		name: "Nord",
		mode: "dark",
		colors: {
			bgMain: "#2e3440",
			bgSidebar: "#3b4252",
			bgCard: "#434c5e",
			bgInput: "#4c566a",
			bgButton: "#88c0d0",
			textMain: "#eceff4",
			textSecondary: "#d8dee9",
			textAccent: "#88c0d0",
			border: "#4c566a",
			success: "#a3be8c",
			warning: "#ebcb8b",
			error: "#bf616a",
			info: "#81a1c1",
		},
	},
	monokai: {
		id: "monokai",
		name: "Monokai",
		mode: "dark",
		colors: {
			bgMain: "#272822",
			bgSidebar: "#1e1f1c",
			bgCard: "#3e3d32",
			bgInput: "#49483e",
			bgButton: "#a6e22e",
			textMain: "#f8f8f2",
			textSecondary: "#75715e",
			textAccent: "#a6e22e",
			border: "#49483e",
			success: "#a6e22e",
			warning: "#fd971f",
			error: "#f92672",
			info: "#66d9ef",
		},
	},
};

// Combine all themes
const ALL_THEMES: Record<string, ThemeConfig> = {
	...BUILTIN_THEMES,
	...ADDITIONAL_THEMES,
};

// Theme context value interface
interface ThemeContextValue {
	// Current theme
	theme: ThemeConfig;
	themeId: string;
	// Mode helpers
	isLight: boolean;
	isDark: boolean;
	isVibe: boolean;
	isDevicePreference: boolean;
	// Theme operations
	setTheme: (themeId: string) => void;
	setThemeMode: (mode: ThemeMode | "system") => void;
	// Available themes
	availableThemes: ThemeConfig[];
	// Theme colors (for convenience)
	colors: ThemeColors;
}

// Storage keys
const THEME_STORAGE_KEY = "alias-mosaic-theme";
const THEME_MODE_STORAGE_KEY = "alias-mosaic-theme-mode";

// Create context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Inject CSS custom properties from theme colors
function injectCSSProperties(theme: ThemeConfig): void {
	if (typeof document === "undefined") {
		return;
	}

	const root = document.documentElement;

	// Set theme mode attribute
	root.setAttribute("data-theme", theme.id);
	root.setAttribute("data-theme-mode", theme.mode);

	// Inject color variables
	for (const [key, value] of Object.entries(theme.colors)) {
		root.style.setProperty(`--theme-${key}`, value);
	}

	// Also set semantic color variables for common use
	root.style.setProperty("--background", theme.colors.bgMain);
	root.style.setProperty("--foreground", theme.colors.textMain);
	root.style.setProperty("--card", theme.colors.bgCard);
	root.style.setProperty("--card-foreground", theme.colors.textMain);
	root.style.setProperty("--popover", theme.colors.bgCard);
	root.style.setProperty("--popover-foreground", theme.colors.textMain);
	root.style.setProperty("--primary", theme.colors.bgButton);
	root.style.setProperty("--primary-foreground", theme.colors.textMain);
	root.style.setProperty("--secondary", theme.colors.bgInput);
	root.style.setProperty("--secondary-foreground", theme.colors.textMain);
	root.style.setProperty("--muted", theme.colors.bgInput);
	root.style.setProperty("--muted-foreground", theme.colors.textSecondary);
	root.style.setProperty("--accent", theme.colors.textAccent);
	root.style.setProperty("--accent-foreground", theme.colors.textMain);
	root.style.setProperty("--destructive", theme.colors.error);
	root.style.setProperty("--destructive-foreground", theme.colors.textMain);
	root.style.setProperty("--border", theme.colors.border);
	root.style.setProperty("--input", theme.colors.bgInput);
	root.style.setProperty("--ring", theme.colors.textAccent);

	// Status colors
	root.style.setProperty("--success", theme.colors.success);
	root.style.setProperty("--warning", theme.colors.warning);
	root.style.setProperty("--error", theme.colors.error);
	root.style.setProperty("--info", theme.colors.info);
}

// Get initial theme
function getInitialTheme(): { themeId: string; mode: ThemeMode | "system" } {
	if (typeof window === "undefined") {
		return { themeId: "dark", mode: "dark" };
	}

	const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
	const storedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY) as
		| ThemeMode
		| "system"
		| null;

	if (storedMode === "system") {
		const deviceScheme = getDeviceColorScheme();
		return {
			themeId: storedTheme || (deviceScheme === "dark" ? "dark" : "light"),
			mode: "system",
		};
	}

	return {
		themeId: storedTheme || "dark",
		mode: storedMode || "dark",
	};
}

// ThemeProvider props
interface ThemeProviderProps {
	children: ReactNode;
	defaultTheme?: string;
	defaultMode?: ThemeMode | "system";
	storageKey?: string;
}

// ThemeProvider component
export function ThemeProvider({
	children,
	defaultTheme,
	defaultMode,
	storageKey,
}: ThemeProviderProps) {
	// Use custom storage key if provided
	const themeStorageKey = storageKey || THEME_STORAGE_KEY;

	// Initialize state
	const [themeId, setThemeIdState] = useState<string>(() => {
		if (defaultTheme) {
			return defaultTheme;
		}
		if (typeof window !== "undefined") {
			return localStorage.getItem(themeStorageKey) || "dark";
		}
		return "dark";
	});

	const [themeMode, setThemeModeState] = useState<ThemeMode | "system">(() => {
		if (defaultMode) {
			return defaultMode;
		}
		return getInitialTheme().mode;
	});

	// Get current theme config
	const theme = ALL_THEMES[themeId] || ALL_THEMES.dark;

	// Listen for device color scheme changes
	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = () => {
			if (themeMode === "system") {
				// Force re-render with new device preference
				const deviceScheme = getDeviceColorScheme();
				const newThemeId = deviceScheme === "dark" ? "dark" : "light";
				setThemeIdState(newThemeId);
				localStorage.setItem(themeStorageKey, newThemeId);
			}
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [themeMode, themeStorageKey]);

	// Inject CSS properties when theme changes
	useEffect(() => {
		injectCSSProperties(theme);
	}, [theme]);

	// Set theme by ID
	const setTheme = useCallback(
		(newThemeId: string) => {
			if (ALL_THEMES[newThemeId]) {
				setThemeIdState(newThemeId);
				localStorage.setItem(themeStorageKey, newThemeId);
			}
		},
		[themeStorageKey]
	);

	// Set theme mode
	const setThemeMode = useCallback(
		(mode: ThemeMode | "system") => {
			setThemeModeState(mode);
			localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);

			if (mode === "system") {
				const deviceScheme = getDeviceColorScheme();
				const newThemeId = deviceScheme === "dark" ? "dark" : "light";
				setThemeIdState(newThemeId);
				localStorage.setItem(themeStorageKey, newThemeId);
			}
		},
		[themeStorageKey]
	);

	// Context value
	const value: ThemeContextValue = {
		theme,
		themeId,
		isLight: theme.mode === "light",
		isDark: theme.mode === "dark",
		isVibe: themeId === "vibe",
		isDevicePreference: themeMode === "system",
		setTheme,
		setThemeMode,
		availableThemes: Object.values(ALL_THEMES),
		colors: theme.colors,
	};

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

// useTheme hook - returns full context
export function useTheme(): ThemeContextValue {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}

// useThemeColors hook - returns just the colors
export function useThemeColors(): ThemeColors {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useThemeColors must be used within a ThemeProvider");
	}
	return context.colors;
}

// Export types for external use
export type { ThemeContextValue, ThemeConfig, ThemeColors, ThemeMode };
