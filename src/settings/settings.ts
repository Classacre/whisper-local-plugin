export interface WhisperPluginSettings {
	modelType: "distil-large-v2" | "large-v3";
	batchSize: number;
	useFlashAttention: boolean;
	pythonPath: string;
	hotkey: string;
}

export const DEFAULT_SETTINGS: WhisperPluginSettings = {
	modelType: "distil-large-v2",
	batchSize: 4,
	useFlashAttention: false,
	pythonPath: "python",
	hotkey: "Ctrl+Shift+R",
};
