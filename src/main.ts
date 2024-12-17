// src/main.ts
import { Plugin, Notice, MarkdownView } from "obsidian";
import { PythonDependencyManager } from "./python/installManager";
import { PythonBridge } from "./python/bridge";
import { AudioRecorder } from "./audio/recorder";
import * as path from "path";
import * as os from "os";

export default class WhisperPlugin extends Plugin {
	private pythonManager: PythonDependencyManager;
	private pythonBridge: PythonBridge;
	private recorder: AudioRecorder;
	private isRecording = false; // Removed explicit type as it's inferred

	async onload() {
		this.pythonManager = new PythonDependencyManager(
			this.app.vault.configDir
		);

		// Initialize Python bridge
		const venvPython =
			process.platform === "win32"
				? path.join(
						this.app.vault.configDir,
						".venv",
						"Scripts",
						"python.exe"
				  )
				: path.join(this.app.vault.configDir, ".venv", "bin", "python");

		this.pythonBridge = new PythonBridge(
			venvPython,
			this.app.vault.configDir
		);
		this.recorder = new AudioRecorder();

		// Add ribbon icon
		this.addRibbonIcon("microphone", "Start/Stop Transcription", () => {
			this.toggleRecording();
		});

		// Initialize Python environment
		try {
			await this.pythonManager.checkAndInstallDependencies();
			new Notice("Whisper dependencies installed successfully!");
		} catch (error) {
			new Notice(
				"Failed to set up Whisper dependencies. Check console for details."
			);
			console.error(error);
		}
	}

	async toggleRecording() {
		if (!this.isRecording) {
			await this.startRecording();
		} else {
			await this.stopRecording();
		}
	}

	async startRecording() {
		try {
			await this.recorder.startRecording();
			this.isRecording = true;
			new Notice("Recording started...");
		} catch (error) {
			new Notice("Failed to start recording");
			console.error(error);
		}
	}

	async stopRecording() {
		try {
			const audioBlob = await this.recorder.stopRecording();
			this.isRecording = false;
			new Notice("Processing audio...");

			// Save audio to temporary file
			const tempDir = path.join(os.tmpdir(), "obsidian-whisper");
			const tempFile = path.join(tempDir, `recording-${Date.now()}.wav`);
			await this.saveAudioToFile(audioBlob, tempFile);

			// Transcribe audio
			const result = await this.pythonBridge.transcribeAudio(tempFile, {
				modelType: "distil-large-v2",
				batchSize: 4,
				useFlashAttention: false,
			});

			if (result.success && result.text) {
				// Insert transcription into current note
				const activeView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					const editor = activeView.editor;
					const cursor = editor.getCursor();
					editor.replaceRange(result.text, cursor);
				}
				new Notice("Transcription completed!");
			} else {
				new Notice("Transcription failed");
				console.error(result.error);
			}
		} catch (error) {
			new Notice("Failed to process audio");
			console.error(error);
		}
	}

	private async saveAudioToFile(blob: Blob, filePath: string): Promise<void> {
		// Implementation coming soon
	}
}
