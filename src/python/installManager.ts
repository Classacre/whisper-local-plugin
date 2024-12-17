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

	async checkAndInstallDependencies(): Promise<boolean> {
		try {
			const pythonVersion = await this.checkPythonVersion();
			if (!pythonVersion) {
				throw new Error("Python 3.8+ is required but not found");
			}

			const hasCuda = await this.checkCudaAvailability();
			if (!hasCuda) {
				throw new Error(`NVIDIA GPU with at least ${MIN_VRAM_GB}GB VRAM is required`);
			}

			if (!fs.existsSync(this.venvPath)) {
				await this.createVirtualEnv();
			}

			await this.installRequirements();
			return true;
		} catch (error) {
			console.error("Failed to set up Python environment:", error);
			throw error;
		}
	}

	private async checkPythonVersion(): Promise<string | null> {
		try {
			const { stdout } = await execAsync("python --version");
			const version = stdout.trim();
			const match = version.match(/(\d+\.\d+\.\d+)/);
			if (match && parseFloat(match[1]) >= 3.8) {
				return version;
			}
			return null;
		} catch (error) {
			return null;
		}
	}

	private async checkCudaAvailability(): Promise<boolean> {
		try {
			const pythonScript = `
import torch
import sys
if torch.cuda.is_available():
    props = torch.cuda.get_device_properties(0)
    print(f"{props.total_memory / (1024**3)}")
    sys.exit(0)
sys.exit(1)
			`.trim();

			const { stdout } = await execAsync(`python -c "${pythonScript}"`);
			const vramGB = parseFloat(stdout);
			return vramGB >= MIN_VRAM_GB;
		} catch (error) {
			return false;
		}
	}

	private async createVirtualEnv(): Promise<void> {
		try {
			await execAsync(`python -m venv "${this.venvPath}"`);
		} catch (error) {
			throw new Error(`Failed to create virtual environment: ${error}`);
		}
	}

	private async installRequirements(): Promise<void> {
		const pythonCmd = process.platform === 'win32' ? 
			path.join(this.venvPath, 'Scripts', 'python.exe') : 
			path.join(this.venvPath, 'bin', 'python');

		const pipCmd = `"${pythonCmd}" -m pip install -r "${path.join(this.pluginDir, 'python', 'requirements.txt')}"`;
		
		try {
			await execAsync(pipCmd);
			
			// Install flash-attention if needed
			if (process.platform !== 'darwin') { // Skip on macOS
				try {
					await execAsync(`"${pythonCmd}" -m pip install flash-attn --no-build-isolation`);
				} catch (error) {
					console.warn("Failed to install flash-attention. Flash attention will be disabled:", error);
				}
			}
		} catch (error) {
			throw new Error(`Failed to install requirements: ${error}`);
		}
	}
}
