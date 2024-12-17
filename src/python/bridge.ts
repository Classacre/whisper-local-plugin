import { spawn } from "child_process";
import * as path from "path";

interface TranscriptionOptions {
	modelType: string;
	batchSize: number;
	useFlashAttention: boolean;
}

interface TranscriptionResult {
	success: boolean;
	text?: string;
	error?: string;
}

export class PythonBridge {
	private pythonPath: string;
	private pluginDir: string;

	constructor(pythonPath: string, pluginDir: string) {
		this.pythonPath = pythonPath;
		this.pluginDir = pluginDir;
	}

	async transcribeAudio(
		audioPath: string,
		options: TranscriptionOptions
	): Promise<TranscriptionResult> {
		return new Promise((resolve, reject) => {
			const scriptPath = path.join(
				this.pluginDir,
				"python",
				"whisper_bridge.py"
			);
			const python = spawn(this.pythonPath, [scriptPath]);

			let outputData = "";
			let errorData = "";

			python.stdout.on("data", (data) => {
				outputData += data.toString();
			});

			python.stderr.on("data", (data) => {
				errorData += data.toString();
			});

			python.on("close", (code) => {
				if (code !== 0) {
					reject(
						new Error(
							`Python process exited with code ${code}: ${errorData}`
						)
					);
					return;
				}

				try {
					const result = JSON.parse(outputData);
					resolve(result);
				} catch (error) {
					reject(
						new Error(`Failed to parse Python output: ${error}`)
					);
				}
			});

			// Send input data to Python script
			const inputData = {
				audio_path: audioPath,
				model_type: options.modelType,
				batch_size: options.batchSize,
				use_flash_attention: options.useFlashAttention,
			};

			python.stdin.write(JSON.stringify(inputData));
			python.stdin.end();
		});
	}
}
