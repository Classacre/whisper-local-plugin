declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

interface RecordingState {
    isRecording: boolean;
    startTime?: number;
    duration: number;
}

export async function convertBlobToWav(blob: Blob): Promise<Blob> {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextClass();
    
    try {
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const numberOfChannels = 1; // Force mono for Whisper
        const length = audioBuffer.length;
        const sampleRate = 16000; // Whisper expects 16kHz
        const wavBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(wavBuffer);
        
        // Write WAV header
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, length * 2, true);

        // Resample and convert to mono if needed
        const resampledData = new Float32Array(length);
        const channelData = audioBuffer.getChannelData(0);
        
        // If stereo, average the channels
        if (audioBuffer.numberOfChannels === 2) {
            const channel2Data = audioBuffer.getChannelData(1);
            for (let i = 0; i < length; i++) {
                resampledData[i] = (channelData[i] + channel2Data[i]) / 2;
            }
        } else {
            resampledData.set(channelData);
        }

        // Write audio data
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, resampledData[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }

        return new Blob([wavBuffer], { type: 'audio/wav' });
    } finally {
        // Clean up AudioContext
        await audioContext.close();
    }
}

function writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
