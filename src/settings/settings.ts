export interface WhisperPluginSettings {
	modelType: "distil-large-v2" | "large-v3";
	batchSize: number;
	useFlashAttention: boolean;
	pythonPath: string;
	hotkey: string;
	language: string;
}

export const DEFAULT_SETTINGS: WhisperPluginSettings = {
	modelType: "distil-large-v2",
	batchSize: 4,
	useFlashAttention: false,
	pythonPath: "python",
	hotkey: "Ctrl+Shift+R",
	language: "en"
};

export const MODEL_OPTIONS = {
	'distil-large-v2': 'Distil Large V2 (Faster)',
	'large-v3': 'Large V3 (More Accurate)'
} as const;

export const LANGUAGE_OPTIONS = {
	'en': 'English',
	'fr': 'French',
	'de': 'German',
	'es': 'Spanish',
	'it': 'Italian',
	'ja': 'Japanese',
	'zh': 'Chinese',
	'auto': 'Auto Detect'
} as const;
