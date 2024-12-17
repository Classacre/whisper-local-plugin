export class AudioRecorder {
	private mediaRecorder: MediaRecorder | null = null;
	private audioChunks: Blob[] = [];

	async startRecording(): Promise<void> {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			this.mediaRecorder = new MediaRecorder(stream);
			this.audioChunks = [];

			this.mediaRecorder.addEventListener("dataavailable", (event) => {
				this.audioChunks.push(event.data);
			});

			this.mediaRecorder.start();
		} catch (error) {
			console.error("Failed to start recording:", error);
			throw error;
		}
	}

	async stopRecording(): Promise<Blob> {
		return new Promise((resolve, reject) => {
			if (!this.mediaRecorder) {
				reject(new Error("No recording in progress"));
				return;
			}

			this.mediaRecorder.addEventListener("stop", () => {
				const audioBlob = new Blob(this.audioChunks, {
					type: "audio/wav",
				});
				resolve(audioBlob);
			});

			this.mediaRecorder.stop();
		});
	}
}
