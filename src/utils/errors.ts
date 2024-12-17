export class WhisperError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'WhisperError';
    }
}

export const ERROR_CODES = {
    NO_PYTHON: 'NO_PYTHON',
    NO_CUDA: 'NO_CUDA',
    INSUFFICIENT_VRAM: 'INSUFFICIENT_VRAM',
    RECORDING_FAILED: 'RECORDING_FAILED',
    TRANSCRIPTION_FAILED: 'TRANSCRIPTION_FAILED'
} as const; 