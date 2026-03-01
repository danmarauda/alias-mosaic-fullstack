// Session state for agent status indicators
export type SessionState =
	| "idle"
	| "busy"
	| "waiting_input"
	| "error"
	| "connecting";

// File change type for version control indicators
export type FileChangeType = "added" | "deleted" | "modified";

// Theme mode types
export type ThemeMode = "light" | "dark" | "vibe";

// Theme color palette - semantic tokens
export interface ThemeColors {
	bgMain: string;
	bgSidebar: string;
	bgCard: string;
	bgInput: string;
	bgButton: string;
	textMain: string;
	textSecondary: string;
	textAccent: string;
	border: string;
	success: string;
	warning: string;
	error: string;
	info: string;
}

// Theme configuration interface
export interface ThemeConfig {
	id: string;
	name: string;
	mode: ThemeMode;
	colors: ThemeColors;
}

// Theme ID union type
export type ThemeId =
	| "light"
	| "dark"
	| "vibe"
	| "ocean"
	| "sunset"
	| "aurora"
	| "cosmic";

// Built-in theme definitions
export const BUILTIN_THEMES: Record<ThemeId, ThemeConfig> = {
	light: {
		id: "light",
		name: "Light",
		mode: "light",
		colors: {
			bgMain: "#ffffff",
			bgSidebar: "#f8f9fa",
			bgCard: "#ffffff",
			bgInput: "#f1f5f9",
			bgButton: "#3b82f6",
			textMain: "#111827",
			textSecondary: "#6b728a",
			textAccent: "#3b82f6",
			border: "#e5e7eb",
			success: "#10b981",
			warning: "#f59e0b",
			error: "#ef4444",
			info: "#3b82f6",
		},
	},
	dark: {
		id: "dark",
		name: "Dark",
		mode: "dark",
		colors: {
			bgMain: "#0f172a",
			bgSidebar: "#111827",
			bgCard: "#1f2937",
			bgInput: "#374151",
			bgButton: "#6366f1",
			textMain: "#f9fafb",
			textSecondary: "#9ca3af",
			textAccent: "#6366f1",
			border: "#374151",
			success: "#34d399",
			warning: "#fbbf24",
			error: "#f87171",
			info: "#60a5fa",
		},
	},
	vibe: {
		id: "vibe",
		name: "Vibe",
		mode: "dark",
		colors: {
			bgMain: "#0a0a0f",
			bgSidebar: "#0f0f1a",
			bgCard: "#111116",
			bgInput: "#1a1a24",
			bgButton: "#6366f1",
			textMain: "#e0e0e0",
			textSecondary: "#71717a",
			textAccent: "#6366f1",
			border: "#27272a",
			success: "#22c55e",
			warning: "#eab308",
			error: "#dc2626",
			info: "#2563eb",
		},
	},
	ocean: {
		id: "ocean",
		name: "Ocean",
		mode: "dark",
		colors: {
			bgMain: "#0c1929",
			bgSidebar: "#0f2744",
			bgCard: "#1e3a5a",
			bgInput: "#164e63",
			bgButton: "#0891b2",
			textMain: "#f0f9ff",
			textSecondary: "#94a3b8",
			textAccent: "#0891b2",
			border: "#1e3a5a",
			success: "#059669",
			warning: "#d97706",
			error: "#dc2626",
			info: "#0284c7",
		},
	},
	sunset: {
		id: "sunset",
		name: "Sunset",
		mode: "light",
		colors: {
			bgMain: "#fef3c7",
			bgSidebar: "#fde68a",
			bgCard: "#fef9c3",
			bgInput: "#fde68a",
			bgButton: "#f97316",
			textMain: "#78350f",
			textSecondary: "#92400e",
			textAccent: "#f97316",
			border: "#fde68a",
			success: "#65a30d",
			warning: "#d97706",
			error: "#dc2626",
			info: "#ea580c",
		},
	},
	aurora: {
		id: "aurora",
		name: "Aurora",
		mode: "dark",
		colors: {
			bgMain: "#0f0c29",
			bgSidebar: "#1e1b4b",
			bgCard: "#2d2a4e",
			bgInput: "#3d3a5e",
			bgButton: "#a855f7",
			textMain: "#f4f4f5",
			textSecondary: "#a1a1aa",
			textAccent: "#a855f7",
			border: "#3d3a5e",
			success: "#86efac",
			warning: "#fcd34d",
			error: "#fca5a5",
			info: "#c4b5fd",
		},
	},
	cosmic: {
		id: "cosmic",
		name: "Cosmic",
		mode: "dark",
		colors: {
			bgMain: "#09090b",
			bgSidebar: "#0c0a10",
			bgCard: "#12101a",
			bgInput: "#1a1820",
			bgButton: "#8b5cf6",
			textMain: "#faf5ff",
			textSecondary: "#a78bfa",
			textAccent: "#8b5cf6",
			border: "#1a1820",
			success: "#4ade80",
			warning: "#facc15",
			error: "#f87171",
			info: "#818cf8",
		},
	},
};

// Theme utility functions
export function getThemeById(id: ThemeId): ThemeConfig | undefined {
	return BUILTIN_THEMES[id];
}

export function getThemesByMode(mode: ThemeMode): ThemeConfig[] {
	return Object.values(BUILTIN_THEMES).filter((theme) => theme.mode === mode);
}

export function isDarkTheme(theme: ThemeConfig): boolean {
	return theme.mode === "dark";
}
