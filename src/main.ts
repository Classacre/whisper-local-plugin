/* eslint-disable no-mixed-spaces-and-tabs */
// src/main.ts
import { Plugin, Notice, MarkdownView, setIcon } from "obsidian";
import { PythonDependencyManager } from "./python/installManager";
import { PythonBridge } from "./python/bridge";
import { AudioRecorder } from "./audio/recorder";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { promisify } from "util";
import { WhisperPluginSettings, DEFAULT_SETTINGS } from "./settings/settings";

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

interface RecordingState {
	isRecording: boolean;
	startTime?: number;
	duration: number;
}

export default class WhisperPlugin extends Plugin {
	settings: WhisperPluginSettings;
	private pythonManager: PythonDependencyManager;
	private pythonBridge: PythonBridge;
	private recorder: AudioRecorder;
	private tempDir: string;
	private tempFiles: string[] = [];
	private recordingState: RecordingState = {
		isRecording: false,
		duration: 0,
	};
	private statusBarItem: HTMLElement;
	private recordingTimer: number;
	private ribbonIcon: HTMLElement;

	async onload() {
		// Set up temp directory
		this.tempDir = path.join(os.tmpdir(), "obsidian-whisper");
		await this.ensureTempDirectory();

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
		this.ribbonIcon = this.addRibbonIcon(
			"microphone",
			"Start/Stop Transcription",
			async () => {
				await this.toggleRecording();
			}
		);

		// Initialize status bar
		this.initializeStatusBar();

		// Initialize Python environment
		try {
			await this.pythonManager.checkAndInstallDependencies();
			new Notice("Whisper dependencies installed successfully!");
		} catch (error) {
			new Notice(
				"Failed to set up Whisper dependencies. Check console for details."
			);
			console.error(error);
			this.disableRecording("Dependencies failed to load");
		}

		// Register cleanup on plugin unload
		this.register(() => this.cleanup());

		// Load settings
		await this.loadSettings();
	}

	private initializeStatusBar() {
		this.statusBarItem = this.addStatusBarItem();
		this.updateStatusBar("Ready");
	}

	private updateStatusBar(status: string) {
		if (!this.statusBarItem) return;

		this.statusBarItem.empty();

		if (this.recordingState.isRecording) {
			const duration = Math.floor(
				(Date.now() - (this.recordingState.startTime || 0)) / 1000
			);
			const minutes = Math.floor(duration / 60);
			const seconds = duration % 60;
			const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

			setIcon(this.statusBarItem, "dot");
			this.statusBarItem.createSpan({ text: ` Recording ${timeStr}` });
		} else {
			this.statusBarItem.setText(status);
		}
	}

	private startRecordingTimer() {
		this.recordingTimer = window.setInterval(() => {
			this.updateStatusBar("Recording");
		}, 1000);
	}

	private stopRecordingTimer() {
		if (this.recordingTimer) {
			window.clearInterval(this.recordingTimer);
			this.recordingTimer = 0;
		}
	}

	private disableRecording(reason: string) {
		this.ribbonIcon.setAttribute(
			"aria-label",
			`Recording disabled: ${reason}`
		);
		this.ribbonIcon.addClass("is-disabled");
		this.updateStatusBar(`Disabled: ${reason}`);
	}

	private enableRecording() {
		this.ribbonIcon.setAttribute("aria-label", "Start/Stop Transcription");
		this.ribbonIcon.removeClass("is-disabled");
		this.updateStatusBar("Ready");
	}

	async onunload() {
		this.stopRecordingTimer();
		if (this.recordingState.isRecording) {
			await this.stopRecording();
		}
		await this.cleanup();
	}

	private async ensureTempDirectory(): Promise<void> {
		try {
			await access(this.tempDir);
		} catch {
			try {
				await mkdir(this.tempDir, { recursive: true });
			} catch (error) {
				console.error("Failed to create temp directory:", error);
				throw new Error("Failed to create temporary directory");
			}
		}
	}

	private async cleanup(): Promise<void> {
		// Clean up temporary files
		for (const file of this.tempFiles) {
			try {
				await unlink(file);
			} catch (error) {
				console.error(
					`Failed to delete temporary file ${file}:`,
					error
				);
			}
		}
		this.tempFiles = [];

		// Try to remove temp directory if empty
		try {
			const files = fs.readdirSync(this.tempDir);
			if (files.length === 0) {
				fs.rmdirSync(this.tempDir);
			}
		} catch (error) {
			console.error("Failed to remove temp directory:", error);
		}
	}

	private async saveAudioToFile(blob: Blob, filePath: string): Promise<void> {
		try {
			const arrayBuffer = await blob.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const fileDir = path.dirname(filePath);
			await mkdir(fileDir, { recursive: true });
			await writeFile(filePath, buffer);
			this.tempFiles.push(filePath);
		} catch (error) {
			console.error("Failed to save audio file:", error);
			throw new Error("Failed to save audio file");
		}
	}

	async toggleRecording(): Promise<void> {
		if (this.ribbonIcon.hasClass("is-disabled")) {
			new Notice("Recording is currently disabled");
			return;
		}

		try {
			if (!this.recordingState.isRecording) {
				await this.startRecording();
			} else {
				await this.stopRecording();
			}
		} catch (error) {
			console.error("Error toggling recording:", error);
			this.disableRecording("Error occurred");
			new Notice(
				"Failed to toggle recording. Check console for details."
			);
		}
	}

	async startRecording(): Promise<void> {
		try {
			await this.recorder.startRecording();
			this.recordingState = {
				isRecording: true,
				startTime: Date.now(),
				duration: 0,
			};

			this.ribbonIcon.addClass("is-recording");
			setIcon(this.ribbonIcon, "stop");
			this.startRecordingTimer();
			new Notice("Recording started...");
		} catch (error) {
			console.error("Failed to start recording:", error);
			this.disableRecording("Failed to start");
			new Notice("Failed to start recording. Check console for details.");
			throw error;
		}
	}

	async stopRecording(): Promise<void> {
		if (!this.recordingState.isRecording) return;

		try {
			const audioBlob = await this.recorder.stopRecording();
			this.stopRecordingTimer();
			this.recordingState.isRecording = false;

			this.ribbonIcon.removeClass("is-recording");
			setIcon(this.ribbonIcon, "microphone");
			this.updateStatusBar("Processing...");
			new Notice("Processing audio...");

			const tempFile = path.join(
				this.tempDir,
				`recording-${Date.now()}.wav`
			);

			try {
				await this.saveAudioToFile(audioBlob, tempFile);

				const result = await this.pythonBridge.transcribeAudio(
					tempFile,
					{
						modelType: this.settings.modelType,
						batchSize: this.settings.batchSize,
						useFlashAttention: this.settings.useFlashAttention,
						language: this.settings.language
					}
				);

				if (result.success && result.text) {
					const activeView =
						this.app.workspace.getActiveViewOfType(MarkdownView);
					if (activeView) {
						const editor = activeView.editor;
						const cursor = editor.getCursor();
						editor.replaceRange(result.text, cursor);
					}
					new Notice("Transcription completed!");
					this.updateStatusBar("Ready");
				} else {
					throw new Error(result.error || "Transcription failed");
				}
			} finally {
				try {
					await unlink(tempFile);
					const index = this.tempFiles.indexOf(tempFile);
					if (index > -1) {
						this.tempFiles.splice(index, 1);
					}
				} catch (error) {
					console.error("Failed to clean up temporary file:", error);
				}
			}
		} catch (error) {
			console.error("Failed to process audio:", error);
			new Notice("Failed to process audio. Check console for details.");
			this.updateStatusBar("Ready");
			throw error;
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
