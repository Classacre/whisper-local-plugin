import { Plugin } from "obsidian";
import { WhisperPluginSettings } from "../settings/settings";

export interface WhisperPlugin extends Plugin {
    settings: WhisperPluginSettings;
    saveSettings(): Promise<void>;
} 