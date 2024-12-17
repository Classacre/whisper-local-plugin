export interface WhisperSettings {
	modelType: "distil-large-v2" | "large-v3";
	batchSize: number;
	useFlashAttention: boolean;
	pythonPath: string;
}

export interface TranscriptionResult {
	success: boolean;
	text?: string;
	error?: string;
}
