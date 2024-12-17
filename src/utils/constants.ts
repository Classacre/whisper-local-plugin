export const MIN_VRAM_GB = 6;
export const DEFAULT_BATCH_SIZE = 4;
export const DEFAULT_MODEL_TYPE = 'distil-large-v2';
export const TEMP_DIR_NAME = 'whisper-temp';
export const RECORDING_MAX_DURATION = 300; // 5 minutes in seconds

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
