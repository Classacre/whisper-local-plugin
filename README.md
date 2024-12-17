# Local Whisper Transcription Plugin

## Requirements

-   Python 3.8 or higher
-   NVIDIA GPU with CUDA support (minimum 6GB VRAM)
-   Windows/Linux/MacOS

## Installation

1. Install the plugin through Obsidian Community Plugins
2. The plugin will automatically set up its Python environment on first run
3. If you encounter any issues, ensure Python 3.8+ is installed and accessible from command line

## Manual Installation (if automatic setup fails)

1. Ensure Python 3.8+ is installed
2. Open terminal/command prompt
3. Run: `python -m venv /path/to/vault/.obsidian/plugins/whisper-local-plugin/.venv`
4. Activate virtual environment:
    - Windows: `.venv\Scripts\activate`
    - Unix/MacOS: `source .venv/bin/activate`
5. Install dependencies: `pip install -r requirements.txt`
