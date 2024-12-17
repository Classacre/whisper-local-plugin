import { App, PluginSettingTab, Setting } from 'obsidian';
import type { WhisperPlugin } from '../types/plugin';
import { MODEL_OPTIONS, LANGUAGE_OPTIONS } from './settings';

export class WhisperSettingTab extends PluginSettingTab {
    plugin: WhisperPlugin;

    constructor(app: App, plugin: WhisperPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Model Type')
            .setDesc('Choose the Whisper model to use')
            .addDropdown(dropdown => dropdown
                .addOptions(MODEL_OPTIONS)
                .setValue(this.plugin.settings.modelType)
                .onChange(async (value: "distil-large-v2" | "large-v3") => {
                    this.plugin.settings.modelType = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Language')
            .setDesc('Choose the primary language for transcription')
            .addDropdown(dropdown => dropdown
                .addOptions(LANGUAGE_OPTIONS)
                .setValue(this.plugin.settings.language)
                .onChange(async (value) => {
                    this.plugin.settings.language = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Batch Size')
            .setDesc('Larger batch size = faster processing but more VRAM usage')
            .addSlider(slider => slider
                .setLimits(1, 32, 1)
                .setValue(this.plugin.settings.batchSize)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.batchSize = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Use Flash Attention')
            .setDesc('Enable for faster processing on supported GPUs')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.useFlashAttention)
                .onChange(async (value) => {
                    this.plugin.settings.useFlashAttention = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Python Path')
            .setDesc('Path to Python executable (leave default if unsure)')
            .addText(text => text
                .setPlaceholder('python')
                .setValue(this.plugin.settings.pythonPath)
                .onChange(async (value) => {
                    this.plugin.settings.pythonPath = value;
                    await this.plugin.saveSettings();
                }));
    }
}
