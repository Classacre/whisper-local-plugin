import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { MIN_VRAM_GB } from '../utils/constants';

const execAsync = promisify(exec);

export class PythonDependencyManager {
	private pluginDir: string;
	private venvPath: string;

	constructor(pluginDir: string) {
		this.pluginDir = pluginDir;
		this.venvPath = path.join(this.pluginDir, ".venv");
	}

	private async checkPythonVersion(): Promise<string | null> {
		// Try multiple Python commands
		const pythonCommands = ['python', 'python3', 'py'];
		
		for (const cmd of pythonCommands) {
			try {
				const { stdout } = await execAsync(`"${cmd}" --version`);
				const version = stdout.trim();
				const match = version.match(/(\d+\.\d+\.\d+)/);
				if (match && parseFloat(match[1]) >= 3.8) {
					console.log(`Found Python version: ${version}`);
					return cmd; // Return the working command
				}
			} catch (error) {
				console.log(`Failed to check ${cmd}: ${error}`);
				continue;
			}
		}

		// If we get here, no working Python was found
		throw new Error("Python 3.8+ not found. Please ensure Python is installed and in your PATH");
	}

	async checkAndInstallDependencies(): Promise<boolean> {
		try {
			// Get working Python command
			const pythonCmd = await this.checkPythonVersion();
			if (!pythonCmd) {
				throw new Error("Python 3.8+ is required but not found");
			}

			console.log(`Using Python command: ${pythonCmd}`);

			// Create virtual environment if it doesn't exist
			if (!fs.existsSync(this.venvPath)) {
				await this.createVirtualEnv(pythonCmd);
			}

			// Install requirements
			await this.installRequirements();
			return true;
		} catch (error) {
			console.error("Failed to set up Python environment:", error);
			throw error;
		}
	}

	private async createVirtualEnv(pythonCmd: string): Promise<void> {
		try {
			console.log(`Creating virtual environment at ${this.venvPath}`);
			await execAsync(`"${pythonCmd}" -m venv "${this.venvPath}"`);
		} catch (error) {
			console.error("Failed to create virtual environment:", error);
			throw new Error(`Failed to create virtual environment: ${error}`);
		}
	}

	private async installRequirements(): Promise<void> {
		const pythonCmd = process.platform === "win32"
			? path.join(this.venvPath, "Scripts", "python.exe")
			: path.join(this.venvPath, "bin", "python");

		const pipCmd = `"${pythonCmd}" -m pip install -r "${path.join(this.pluginDir, "python", "requirements.txt")}"`;
		
		try {
			console.log("Installing requirements...");
			console.log(`Running command: ${pipCmd}`);
			await execAsync(pipCmd);
			
			// Optional: Install flash-attention on non-MacOS systems
			if (process.platform !== "darwin") {
				try {
					await execAsync(`"${pythonCmd}" -m pip install flash-attn --no-build-isolation`);
				} catch (error) {
					console.warn("Failed to install flash-attention. Flash attention will be disabled:", error);
				}
			}
		} catch (error) {
			console.error("Failed to install requirements:", error);
			throw new Error(`Failed to install requirements: ${error}`);
		}
	}
}
