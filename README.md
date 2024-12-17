![image(14)](https://github.com/user-attachments/assets/c3ff0281-0d13-40b0-97ea-68786880bcfd)
# Local Whisper Transcription Plugin for Obsidian

A powerful speech-to-text plugin for Obsidian that uses OpenAI's Whisper model locally on your machine. Leveraging Insanely Fast Whisper optimizations, it provides fast and accurate transcription without sending your audio to the cloud.

## Features

- 🎤 One-click recording from your microphone
- 🚀 Fast transcription using optimized Whisper models
- 🔒 Completely local - no internet required after setup
- 🌍 Support for multiple languages
- ⚡ GPU acceleration with CUDA
- ⚙️ Configurable settings for performance tuning

## Requirements

### Hardware
- NVIDIA GPU with CUDA support
- Minimum 6GB VRAM (8GB+ recommended for large-v3 model)
- Microphone for audio recording

### Software
- Python 3.8 or higher
- NVIDIA CUDA Toolkit 11.8 or higher
- Windows, macOS, or Linux

## Installation

### Method 1: Through Obsidian Community Plugins (Not yet available)
1. Open Obsidian Settings
2. Go to Community Plugins
3. Search for "Local Whisper Transcription"
4. Click Install
5. Enable the plugin
6. Wait for automatic Python environment setup

### Method 2: Manual Installation
1. Download the latest release from GitHub
2. Extract the zip to your vault's `.obsidian/plugins/` folder
3. Enable the plugin in Obsidian settings
4. Set up the Python environment:
   ```bash
   # Create virtual environment
   python -m venv /path/to/vault/.obsidian/plugins/whisper-local-plugin/.venv
   
   # Activate virtual environment
   # Windows:
   .venv\Scripts\activate
   # Unix/MacOS:
   source .venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

## Usage

1. Click the microphone icon in the left ribbon or use the hotkey (default: Ctrl+Shift+R)
2. Start speaking
3. Click the stop button when finished
4. The transcribed text will appear at your cursor position

## Configuration

### Model Options
- **Distil Large V2**: Faster processing, slightly lower accuracy
- **Large V3**: Higher accuracy, slower processing

### Performance Settings
- **Batch Size**: Higher values = faster processing but more VRAM usage
- **Flash Attention**: Enable for faster processing on supported GPUs
- **Language**: Choose specific language or auto-detect

## Troubleshooting

### Common Issues

1. **"Failed to set up Whisper dependencies"**
   - Ensure Python 3.8+ is installed and in your PATH
   - Check console for detailed error message
   - Try manual installation method

2. **"CUDA not available"**
   - Install NVIDIA CUDA Toolkit 11.8+
   - Verify GPU compatibility
   - Check `nvidia-smi` command works in terminal

3. **"Recording failed to start"**
   - Grant microphone permissions to Obsidian
   - Check microphone is properly connected
   - Try selecting different audio input in system settings

### Debug Steps

1. Check Python installation:
   ```bash
   python --version
   ```

2. Verify CUDA installation:
   ```bash
   nvidia-smi
   ```

3. Test virtual environment:
   ```bash
   # Windows
   .venv\Scripts\python -c "import torch; print(torch.cuda.is_available())"
   # Unix/MacOS
   .venv/bin/python -c "import torch; print(torch.cuda.is_available())"
   ```

## Performance Tips

1. **Memory Usage**
   - Start with batch size 4
   - Increase if you have >8GB VRAM
   - Monitor GPU memory usage

2. **Speed Optimization**
   - Enable Flash Attention on supported GPUs
   - Use Distil Large V2 model for faster processing
   - Adjust batch size based on your GPU

3. **Accuracy Optimization**
   - Use Large V3 model
   - Select specific language instead of auto-detect
   - Ensure clear audio input

## Technical Details

The plugin uses:
- Insanely Fast Whisper optimizations
- Flash Attention 2.0 when available
- 16kHz mono audio processing
- CUDA acceleration for GPU processing

## License

MIT License - see LICENSE file for details

## Credits

- OpenAI Whisper model
- Insanely Fast Whisper optimizations by @Vaibhavs10
- Obsidian Plugin Community
