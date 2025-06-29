import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFolder, TFile } from 'obsidian';
import { StrictMode } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { AppContext } from './AppContext';
import { QuiziumModalView } from './QuiziumModalView';

// Remember to rename these classes and interfaces!

export interface MonitoredTopic {
	hashtag: string;
	topicName: string;
}

export interface QuizResult {
	timestamp: string;
	scorePercentage: number;
}

export interface ProgressData {
	quizium: {
		data: {
			topics: {
				[topicName: string]: {
					results: QuizResult[];
				};
			};
			streak?: {
				daysOfStudy: string[]; // Array of ISO date strings (YYYY-MM-DD)
				highestSoFar: number;
			};
			monitoredTopics?: MonitoredTopic[]; // Monitored topics stored in YAML
		};
	};
}

class ProgressManager {
	private app: App;
	private progressFolderPath: string;
	private progressFileName: string = 'quizium-progress.yaml';

	constructor(app: App, progressFolderPath: string) {
		this.app = app;
		this.progressFolderPath = progressFolderPath;
	}

	async ensureProgressFolder(): Promise<void> {
		const folder = this.app.vault.getAbstractFileByPath(this.progressFolderPath);
		if (!folder || !(folder instanceof TFolder)) {
			try {
				await this.app.vault.createFolder(this.progressFolderPath);
			} catch (error) {
				// Ignore "folder already exists" errors, but re-throw other errors
				if (error.message && !error.message.includes('already exists')) {
					throw error;
				}
			}
		}
	}

	async ensureProgressFile(): Promise<void> {
		await this.ensureProgressFolder();
		const filePath = `${this.progressFolderPath}/${this.progressFileName}`;
		
		// Try to get the file, with retries for Obsidian's cache
		let file = this.app.vault.getAbstractFileByPath(filePath);
		
		if (!file) {
			const defaultContent = `quizium:
  data:
    topics: {}
    streak:
      daysOfStudy: []
      highestSoFar: 0
    monitoredTopics: []
`;
			try {
				await this.app.vault.create(filePath, defaultContent);
				
				// Wait a bit for Obsidian to recognize the file
				await new Promise(resolve => setTimeout(resolve, 100));
				
				// Try to get file reference again
				file = this.app.vault.getAbstractFileByPath(filePath);
			} catch (error) {
				// If file already exists, try to get it
				if (error.message && error.message.includes('already exists')) {
					// Wait a bit and try again
					await new Promise(resolve => setTimeout(resolve, 200));
					file = this.app.vault.getAbstractFileByPath(filePath);
				} else {
					throw error;
				}
			}
		}
	}

	async getProgressData(): Promise<ProgressData> {
		await this.ensureProgressFile();
		const filePath = `${this.progressFolderPath}/${this.progressFileName}`;
		
		try {
			// Try to read the file directly using the adapter
			const content = await this.app.vault.adapter.read(filePath);
			
			// Simple YAML parsing for our specific structure
			const data: ProgressData = {
				quizium: {
					data: {
						topics: {},
						streak: {
							daysOfStudy: [],
							highestSoFar: 0
						},
						monitoredTopics: []
					}
				}
			};

			// Parse the YAML content manually for our specific structure
			const lines = content.split('\n');
			let currentTopic = '';
			let inTopics = false;
			let inStreak = false;
			let inDaysOfStudy = false;
			let inMonitoredTopics = false;
			
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				const trimmedLine = line.trim();
				
				// Look for topics: line (could be "topics:" or "topics: {}")
				if (trimmedLine === 'topics:' || trimmedLine === 'topics: {}') {
					inTopics = true;
					inStreak = false;
					inMonitoredTopics = false;
					continue;
				}
				
				// Look for streak: line
				if (trimmedLine === 'streak:') {
					inStreak = true;
					inTopics = false;
					inMonitoredTopics = false;
					continue;
				}
				
				// Look for monitoredTopics: line
				if (trimmedLine === 'monitoredTopics:' || trimmedLine === 'monitoredTopics: []') {
					inMonitoredTopics = true;
					inTopics = false;
					inStreak = false;
					continue;
				}
				
				// Handle streak data
				if (inStreak) {
					if (trimmedLine === 'daysOfStudy:' || trimmedLine === 'daysOfStudy: []') {
						inDaysOfStudy = true;
						continue;
					}
					
					if (trimmedLine.startsWith('highestSoFar:')) {
						const value = parseInt(trimmedLine.replace('highestSoFar:', '').trim());
						if (!isNaN(value)) {
							data.quizium.data.streak!.highestSoFar = value;
						}
						continue;
					}
					
					// Handle daysOfStudy array items
					if (inDaysOfStudy && line.startsWith('        - ')) {
						const dateStr = line.replace('        - ', '').trim();
						if (dateStr) {
							data.quizium.data.streak!.daysOfStudy.push(dateStr);
						}
						continue;
					}
				}
				
				// Handle monitored topics
				if (inMonitoredTopics && line.startsWith('      - hashtag:')) {
					const hashtag = line.replace('      - hashtag:', '').trim();
					const nextLine = lines[i + 1];
					if (nextLine && nextLine.trim().startsWith('topicName:')) {
						const topicName = nextLine.replace('        topicName:', '').trim();
						if (hashtag && topicName) {
							data.quizium.data.monitoredTopics!.push({
								hashtag,
								topicName
							});
						}
					}
				}
				
				// Look for topic names - they are indented with 6 spaces and end with ':'
				// This handles both properly indented topics and the malformed ones
				if (inTopics && line.startsWith('      ') && line.endsWith(':') && !trimmedLine.startsWith('results:')) {
					currentTopic = trimmedLine.replace(':', '');
					data.quizium.data.topics[currentTopic] = { results: [] };
					inDaysOfStudy = false; // Reset when entering topics
				}
				
				// Look for quiz results - they start with '          - timestamp:'
				if (inTopics && line.startsWith('          - timestamp:')) {
					const timestamp = line.replace('          - timestamp:', '').trim();
					const nextLine = lines[i + 1];
					if (nextLine && nextLine.trim().startsWith('scorePercentage:')) {
						const scorePercentage = parseFloat(nextLine.replace('            scorePercentage:', '').trim());
						if (currentTopic && data.quizium.data.topics[currentTopic]) {
							data.quizium.data.topics[currentTopic].results.push({
								timestamp,
								scorePercentage
							});
						}
					}
				}
			}
			
			return data;
		} catch (error) {
			console.error('Error reading or parsing progress data:', error);
		}
		
		return {
			quizium: {
				data: {
					topics: {},
					streak: {
						daysOfStudy: [],
						highestSoFar: 0
					},
					monitoredTopics: []
				}
			}
		};
	}

	async addTopic(topicName: string): Promise<void> {
		const data = await this.getProgressData();
		const sanitizedTopicName = this.sanitizeTopicName(topicName);
		if (!data.quizium.data.topics[sanitizedTopicName]) {
			data.quizium.data.topics[sanitizedTopicName] = { results: [] };
			await this.saveProgressData(data);
		}
	}

	async addQuizResult(topicName: string, scorePercentage: number): Promise<void> {
		const filePath = `${this.progressFolderPath}/${this.progressFileName}`;
		await this.ensureProgressFile();
		
		// Sanitize topic name for YAML storage (remove leading #)
		const sanitizedTopicName = this.sanitizeTopicName(topicName);
		
		try {
			// Read existing file content
			let existingContent = '';
			try {
				existingContent = await this.app.vault.adapter.read(filePath);
			} catch (error) {
				existingContent = 'quizium:\n  data:\n    topics:\n';
			}
			
			// Create the new result entry
			const timestamp = new Date().toISOString();
			const newResult = `          - timestamp: ${timestamp}\n            scorePercentage: ${scorePercentage}\n`;
			
			// Check if the topic already exists in the file (using sanitized name)
			const topicPattern = new RegExp(`^      ${sanitizedTopicName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:$`, 'm');
			
			let updatedContent;
			if (topicPattern.test(existingContent)) {
				// Topic exists, find the results section and append
				const resultsPattern = new RegExp(`(^      ${sanitizedTopicName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*\\n        results:\\s*\\n)`, 'm');
				updatedContent = existingContent.replace(resultsPattern, `$1${newResult}`);
			} else {
				// Topic doesn't exist, add it
				// First, check if we have the empty topics: {} pattern and replace it
				if (existingContent.includes('topics: {}')) {
					// Replace the empty topics with the first topic
					const newTopic = `topics:\n      ${sanitizedTopicName}:\n        results:\n${newResult}`;
					updatedContent = existingContent.replace('topics: {}', newTopic);
				} else if (existingContent.includes('topics:\n') && !existingContent.includes('      ')) {
					// We have topics: but no actual topics yet
					const newTopic = `      ${sanitizedTopicName}:\n        results:\n${newResult}`;
					updatedContent = existingContent.replace('topics:\n', `topics:\n${newTopic}`);
				} else {
					// We already have topics, just append the new one
					const newTopic = `      ${sanitizedTopicName}:\n        results:\n${newResult}`;
					updatedContent = existingContent + newTopic;
				}
			}
			
			// Write the updated content back to the file
			await this.app.vault.adapter.write(filePath, updatedContent);

			
		} catch (error) {
			console.error('Error saving quiz result:', error);
			throw error;
		}
	}

	async resetAllQuizResults(): Promise<void> {
		try {
			// First, get the current progress data to preserve streak information
			const currentData = await this.getProgressData();
			
			// Create new data with empty topics but preserved streak data
			const resetData: ProgressData = {
				quizium: {
					data: {
						topics: {}, // Clear all quiz results
						streak: currentData.quizium.data.streak || {
							daysOfStudy: [],
							highestSoFar: 0
						}
					}
				}
			};
			
			// Save the reset data (this preserves streak while clearing quiz results)
			await this.saveProgressData(resetData);
		} catch (error) {
			console.error('Error resetting quiz results:', error);
			throw error;
		}
	}

	async updateStreak(): Promise<void> {
		const data = await this.getProgressData();
		const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
		
		// Initialize streak data if it doesn't exist
		if (!data.quizium.data.streak) {
			data.quizium.data.streak = {
				daysOfStudy: [],
				highestSoFar: 0
			};
		}
		
		const streakData = data.quizium.data.streak;
		
		// Check if we already have an entry for today
		if (streakData.daysOfStudy.includes(today)) {
			// Already studied today, no need to update
			return;
		}
		
		// Check if the last entry was yesterday
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayStr = yesterday.toISOString().split('T')[0];
		
		const lastStudyDay = streakData.daysOfStudy[streakData.daysOfStudy.length - 1];
		
		if (lastStudyDay !== yesterdayStr && streakData.daysOfStudy.length > 0) {
			// Streak is broken, reset the array
			streakData.daysOfStudy = [];
		}
		
		// Add today to the streak
		streakData.daysOfStudy.push(today);
		
		// Update highest streak if current streak is higher
		const currentStreak = streakData.daysOfStudy.length;
		if (currentStreak > streakData.highestSoFar) {
			streakData.highestSoFar = currentStreak;
		}
		
		// Save the updated data
		await this.saveProgressData(data);
	}

	async getStreakData(): Promise<{ currentStreak: number; highestStreak: number }> {
		const data = await this.getProgressData();
		
		if (!data.quizium.data.streak) {
			return { currentStreak: 0, highestStreak: 0 };
		}
		
		return {
			currentStreak: data.quizium.data.streak.daysOfStudy.length,
			highestStreak: data.quizium.data.streak.highestSoFar
		};
	}

	async getMonitoredTopics(): Promise<MonitoredTopic[]> {
		const data = await this.getProgressData();
		return data.quizium.data.monitoredTopics || [];
	}

	async addMonitoredTopic(hashtag: string, topicName: string): Promise<void> {
		const data = await this.getProgressData();
		if (!data.quizium.data.monitoredTopics) {
			data.quizium.data.monitoredTopics = [];
		}
		
		// Sanitize topic name for YAML storage (remove leading #)
		const sanitizedTopicName = this.sanitizeTopicName(topicName);
		
		// Check if topic already exists (check both hashtag and sanitized topic name)
		const exists = data.quizium.data.monitoredTopics.some(
			topic => topic.hashtag === hashtag || topic.topicName === sanitizedTopicName
		);
		
		if (!exists) {
			data.quizium.data.monitoredTopics.push({ hashtag, topicName: sanitizedTopicName });
			await this.saveProgressData(data);
			// Also ensure topic exists in the topics section
			await this.addTopic(sanitizedTopicName);
		}
	}

	/**
	 * Sanitizes topic names for use as YAML keys by removing leading # characters
	 * @param topicName - The topic name to sanitize
	 * @returns The sanitized topic name
	 */
	private sanitizeTopicName(topicName: string): string {
		return topicName.startsWith('#') ? topicName.substring(1) : topicName;
	}

	async removeMonitoredTopic(hashtag: string): Promise<void> {
		const data = await this.getProgressData();
		if (data.quizium.data.monitoredTopics) {
			data.quizium.data.monitoredTopics = data.quizium.data.monitoredTopics.filter(
				topic => topic.hashtag !== hashtag
			);
			await this.saveProgressData(data);
		}
	}

	private async saveProgressData(data: ProgressData): Promise<void> {
		const filePath = `${this.progressFolderPath}/${this.progressFileName}`;
		
		// Ensure file exists before trying to modify it
		await this.ensureProgressFile();
		
		// Get file reference again after ensuring it exists
		const file = this.app.vault.getAbstractFileByPath(filePath);
		
		// Convert data to YAML format
		let yamlContent = 'quizium:\n  data:\n    topics:\n';
		
		for (const [topicName, topicData] of Object.entries(data.quizium.data.topics)) {
			yamlContent += `      ${topicName}:\n`;
			yamlContent += `        results:\n`;
			
			for (const result of topicData.results) {
				yamlContent += `          - timestamp: ${result.timestamp}\n`;
				yamlContent += `            scorePercentage: ${result.scorePercentage}\n`;
			}
		}
		
		// Add streak data
		yamlContent += `    streak:\n`;
		yamlContent += `      daysOfStudy:\n`;
		
		if (data.quizium.data.streak && data.quizium.data.streak.daysOfStudy.length > 0) {
			for (const day of data.quizium.data.streak.daysOfStudy) {
				yamlContent += `        - ${day}\n`;
			}
		} else {
			yamlContent += `        []\n`;
		}
		
		yamlContent += `      highestSoFar: ${data.quizium.data.streak?.highestSoFar || 0}\n`;
		
		// Add monitored topics
		yamlContent += `    monitoredTopics:\n`;
		
		if (data.quizium.data.monitoredTopics && data.quizium.data.monitoredTopics.length > 0) {
			for (const topic of data.quizium.data.monitoredTopics) {
				yamlContent += `      - hashtag: ${topic.hashtag}\n`;
				yamlContent += `        topicName: ${topic.topicName}\n`;
			}
		} else {
			yamlContent += `      []\n`;
		}
		
		if (file instanceof TFile) {
			await this.app.vault.modify(file, yamlContent);
		} else {
			// If file still doesn't exist, create it with the data
			try {
				await this.app.vault.create(filePath, yamlContent);
			} catch (error) {
				// If file exists but we can't access it, try to overwrite
				if (error.message && error.message.includes('already exists')) {
					// Wait a bit for vault to recognize the file
					await new Promise(resolve => setTimeout(resolve, 200));
					let existingFile = this.app.vault.getAbstractFileByPath(filePath);
					
					// If still not found, try refreshing the vault
					if (!existingFile) {
						const allFiles = this.app.vault.getFiles();
						existingFile = allFiles.find(f => f.path === filePath) || null;
					}
					
					if (existingFile instanceof TFile) {
						await this.app.vault.modify(existingFile, yamlContent);
					} else {
						// As a last resort, try to delete and recreate
						try {
							await this.app.vault.adapter.remove(filePath);
							await new Promise(resolve => setTimeout(resolve, 100));
							await this.app.vault.create(filePath, yamlContent);
						} catch (finalError) {
							console.error('Failed to save progress data:', finalError);
							throw finalError;
						}
					}
				}
			}
		}
	}

	/**
	 * Fixes existing YAML files that have topics starting with # (which get treated as comments)
	 * by moving the content to properly formatted topic entries.
	 */
	async fixCommentedTopics(): Promise<void> {
		const filePath = `${this.progressFolderPath}/${this.progressFileName}`;
		
		try {
			// Read the raw file content
			const content = await this.app.vault.adapter.read(filePath);
			const lines = content.split('\n');
			
			let hasCommentedTopics = false;
			const fixedLines: string[] = [];
			
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				const trimmedLine = line.trim();
				
				// Check if this line looks like a commented topic (starts with #, ends with :, and has proper indentation)
				if (line.match(/^      #[^:]+:$/)) {
					hasCommentedTopics = true;
					// Remove the # from the topic name
					const sanitizedLine = line.replace(/^(      )#(.+):$/, '$1$2:');
					fixedLines.push(sanitizedLine);
				} else {
					fixedLines.push(line);
				}
			}
			
			// Only write back if we found and fixed commented topics
			if (hasCommentedTopics) {
				const fixedContent = fixedLines.join('\n');
				await this.app.vault.adapter.write(filePath, fixedContent);
			}
		} catch (error) {
			console.error('Error fixing commented topics:', error);
		}
	}

	/**
	 * Scans the vault for existing hashtags to provide autocomplete suggestions
	 */
	async scanVaultForHashtags(): Promise<string[]> {
		const hashtags = new Set<string>();
		const files = this.app.vault.getMarkdownFiles();
		
		for (const file of files) {
			try {
				const content = await this.app.vault.read(file);
				// Match hashtags in the content (improved regex to handle more cases)
				// This matches hashtags that:
				// - Start with #
				// - Can contain letters, numbers, hyphens, underscores, forward slashes
				// - Must have at least one character after #
				// - Stop at whitespace, punctuation, or end of line
				const hashtagMatches = content.match(/#[a-zA-Z0-9_/-]+(?=\s|$|[^\w-/])/g);
				
				if (hashtagMatches) {
					hashtagMatches.forEach(tag => {
						// Only add if it's a valid hashtag format and not too long
						if (tag.length > 1 && tag.length <= 50) {
							hashtags.add(tag);
						}
					});
				}
			} catch (error) {
				// Skip files that can't be read
				continue;
			}
		}
		
		// Convert to array and sort alphabetically
		return Array.from(hashtags).sort();
	}
}

interface QuiziumPluginSettings {
	monitoredTopics: MonitoredTopic[];
	progressFolderPath: string;
	spacedRepetition: {
		easyDays: number;
		moderateDays: number;
		challengingDays: number;
	};
}

const getDefaultSettings = (app: App): QuiziumPluginSettings => ({
	monitoredTopics: [],
	progressFolderPath: `${app.vault.configDir}/plugins/obsidian-quizium`,
	spacedRepetition: {
		easyDays: 4,
		moderateDays: 2,
		challengingDays: 0
	}
})

export default class QuiziumPlugin extends Plugin {
	settings: QuiziumPluginSettings;
	progressManager: ProgressManager;

	async onload() {
		await this.loadSettings();
		
		// Load KaTeX CSS to avoid CSP issues with external CDN
		this.loadKatexCSS();
		
		// Defer progress manager initialization until layout is ready
		this.app.workspace.onLayoutReady(async () => {
			this.progressManager = new ProgressManager(this.app, this.settings.progressFolderPath);
			await this.initializeProgressManager();
		});

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('graduation-cap', 'Quizium', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new QuiziumModal(this.app, this.settings, this).open();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('quizium-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a command to open Quizium from the command palette
		this.addCommand({
			id: 'open-quizium',
			name: 'Open',
			callback: () => {
				new QuiziumModal(this.app, this.settings, this).open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new QuiziumSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	// Add event handling logic here if needed
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// Example: this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		// Clean up KaTeX CSS
		const katexStyle = document.getElementById('quizium-katex-css');
		if (katexStyle) {
			katexStyle.remove();
		}
	}

	loadKatexCSS() {
		// Inject KaTeX CSS directly to avoid CSP issues with external CDN
		const katexCSS = `
		.katex{font:normal 1.21em KaTeX_Main,Times New Roman,serif;line-height:1.2;text-indent:0;text-rendering:auto}.katex *{border-color:currentColor}.katex .katex-mathml{clip:rect(1px,1px,1px,1px);border:0;height:1px;overflow:hidden;padding:0;position:absolute;width:1px}.katex .base{position:relative;white-space:nowrap;width:min-content}.katex .base,.katex .strut{display:inline-block}.katex .textbf{font-weight:700}.katex .textit{font-style:italic}.katex .mathnormal{font-style:italic}.katex .mathit{font-style:italic}.katex .mathrm{font-style:normal}.katex .mathbf{font-weight:700}.katex .mfrac>span>span{text-align:center}.katex .mfrac .frac-line{border-bottom-style:solid;display:inline-block;width:100%;min-height:1px}.katex .sqrt>.root{margin-left:.2777777778em;margin-right:-.5555555556em}.katex .vlist-t{border-collapse:collapse;display:inline-table;table-layout:fixed}.katex .vlist-r{display:table-row}.katex .vlist{display:table-cell;position:relative;vertical-align:bottom}.katex .vlist>span{display:block;height:0;position:relative}.katex .vlist>span>span{display:inline-block}.katex .vlist>span>.pstrut{overflow:hidden;width:0}.katex .mspace{display:inline-block}.katex .rule{border:0 solid;display:inline-block;position:relative;min-height:1px}.katex-display{display:block;margin:1em 0;text-align:center}.katex-display>.katex{display:block;text-align:center;white-space:nowrap}.katex-display>.katex>.katex-html{display:block;position:relative}
		`;
		
		// Check if KaTeX CSS is already loaded
		if (!document.getElementById('quizium-katex-css')) {
			const style = document.createElement('style');
			style.id = 'quizium-katex-css';
			style.textContent = katexCSS;
			document.head.appendChild(style);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, getDefaultSettings(this.app), await this.loadData());
		
		// Migration: Move monitored topics from data.json to YAML if they exist in data.json but not in YAML
		if (this.settings.monitoredTopics && this.settings.monitoredTopics.length > 0) {
			// We'll migrate after progress manager is initialized
		}
	}

	async initializeProgressManager() {
		if (this.progressManager) {
			// Only ensure progress file exists, don't add topics until quiz completion
			await this.progressManager.ensureProgressFile();
			
			// Fix any existing YAML files with commented topics
			await this.progressManager.fixCommentedTopics();
			
			// Migration: Move monitored topics from data.json to YAML if needed
			await this.migrateMonitoredTopics();
			
			// Load monitored topics from YAML into settings
			await this.loadMonitoredTopicsFromYAML();
		}
	}

	async migrateMonitoredTopics() {
		// Check if we have topics in data.json but not in YAML
		const yamlTopics = await this.progressManager.getMonitoredTopics();
		
		if (this.settings.monitoredTopics.length > 0 && yamlTopics.length === 0) {
			// Migrate topics from data.json to YAML
	
			
			for (const topic of this.settings.monitoredTopics) {
				await this.progressManager.addMonitoredTopic(topic.hashtag, topic.topicName);
			}
			
			// Clear topics from data.json settings and save
			this.settings.monitoredTopics = [];
			await this.saveSettings();
			
	
		}
	}

	async loadMonitoredTopicsFromYAML() {
		// Load monitored topics from YAML into settings
		this.settings.monitoredTopics = await this.progressManager.getMonitoredTopics();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async recordQuizResult(topicName: string, scorePercentage: number) {
		// Wait for progress manager to be initialized if needed
		if (!this.progressManager) {
			await this.waitForProgressManager();
		}
		
		if (this.progressManager) {
			await this.progressManager.addQuizResult(topicName, scorePercentage);
			// Update learning streak
			await this.progressManager.updateStreak();
		} else {
			console.error('Progress manager not available for recording quiz result');
		}
	}

	async recordSpacedRepetitionActivity() {
		// Wait for progress manager to be initialized if needed
		if (!this.progressManager) {
			await this.waitForProgressManager();
		}
		
		if (this.progressManager) {
			// Update learning streak for spaced repetition activity
			await this.progressManager.updateStreak();
		} else {
			console.error('Progress manager not available for recording spaced repetition activity');
		}
	}

	async getStreakData(): Promise<{ currentStreak: number; highestStreak: number }> {
		// Wait for progress manager to be initialized if needed
		if (!this.progressManager) {
			await this.waitForProgressManager();
		}
		
		if (this.progressManager) {
			return await this.progressManager.getStreakData();
		} else {
			console.error('Progress manager not available for getting streak data');
			return { currentStreak: 0, highestStreak: 0 };
		}
	}

	async resetAllQuizResults() {
		// Wait for progress manager to be initialized if needed
		if (!this.progressManager) {
			await this.waitForProgressManager();
		}
		
		if (this.progressManager) {
			await this.progressManager.resetAllQuizResults();
		} else {
			console.error('Progress manager not available for resetting quiz results');
		}
	}

	async getProgressData() {
		// Wait for progress manager to be initialized if needed
		if (!this.progressManager) {
			await this.waitForProgressManager();
		}
		
		if (this.progressManager) {
			return await this.progressManager.getProgressData();
		} else {
			console.error('Progress manager not available for getting progress data');
			return {
				quizium: {
					data: {
						topics: {}
					}
				}
			};
		}
	}

	private async waitForProgressManager(): Promise<void> {
		// Wait up to 5 seconds for progress manager to be initialized
		const maxWaitTime = 5000;
		const checkInterval = 100;
		let waitedTime = 0;
		
		while (!this.progressManager && waitedTime < maxWaitTime) {
			await new Promise(resolve => setTimeout(resolve, checkInterval));
			waitedTime += checkInterval;
		}
	}
}

class QuiziumModal extends Modal {
	root: Root | null = null;
	settings: QuiziumPluginSettings;
	plugin: QuiziumPlugin;

	constructor(app: App, settings: QuiziumPluginSettings, plugin: QuiziumPlugin) {
		super(app);
		this.settings = settings;
		this.plugin = plugin;
	}

	onOpen() {
		const {contentEl} = this;
		
		// Clear any existing content
		contentEl.empty();
		
		// Create root for React and render the component
		this.root = createRoot(contentEl);
		this.root.render(
			<StrictMode>
				<AppContext.Provider value={this.app}>
					<QuiziumModalView 
						onClose={() => this.close()} 
						monitoredTopics={this.settings.monitoredTopics}
						plugin={this.plugin}
					/>
				</AppContext.Provider>
			</StrictMode>
		);
	}

	onClose() {
		// Clean up React root
		this.root?.unmount();
		this.root = null;
	}
}

class QuiziumSettingTab extends PluginSettingTab {
	plugin: QuiziumPlugin;

	constructor(app: App, plugin: QuiziumPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		// Header
		containerEl.createEl('h2', {text: 'Quizium Settings'});

		// Monitored Topics Section
		containerEl.createEl('h3', {text: 'Monitored Topics'});
		
		// Create container for topics list
		const topicsContainer = containerEl.createDiv();
		topicsContainer.addClass('quizium-settings-topics-container');
		
		// Function to refresh the topics display
		const refreshTopicsDisplay = async () => {
			topicsContainer.empty();
			
			// Load topics from YAML
			await this.plugin.loadMonitoredTopicsFromYAML();
			
			this.plugin.settings.monitoredTopics.forEach((topic, index) => {
				const topicEl = topicsContainer.createDiv();
				topicEl.addClass('quizium-settings-topic-item');
				
				// Topic display
				const topicInfo = topicEl.createDiv();
				topicInfo.addClass('quizium-settings-topic-info');
				topicInfo.empty();
				topicInfo.createSpan({ text: topic.topicName, cls: 'topic-name-bold' });
				topicInfo.createSpan({ text: ' - ' });
				topicInfo.createEl('code', { text: topic.hashtag });
				
				// Delete button
				const deleteBtn = topicEl.createEl('button');
				deleteBtn.textContent = '×';
				deleteBtn.addClass('quizium-settings-delete-button');
				deleteBtn.onclick = async () => {
					// Remove from YAML using progress manager
					await this.plugin.progressManager.removeMonitoredTopic(topic.hashtag);
					await refreshTopicsDisplay();
				};
			});
		};
		
		// Initial display
		refreshTopicsDisplay();
		
		// Add new monitored tag button
		new Setting(containerEl)
			.setName('Add new monitored tag')
			.setDesc('Add a new hashtag and topic name to monitor for flashcards.')
			.addButton(button => {
				button.setButtonText('+ New monitored tag')
					.onClick(() => {
						// Create a modal for adding new topic
						const modal = new AddTopicModal(this.app, this.plugin, async (hashtag: string, topicName: string) => {
							// Add topic to YAML using progress manager
							await this.plugin.progressManager.addMonitoredTopic(hashtag, topicName);
							await refreshTopicsDisplay();
						});
						modal.open();
					});
			});

		// Progress folder setting
		new Setting(containerEl)
			.setName('Progress folder path')
			.setDesc('Path to folder where Quizium will store progress data (YAML file)')
			.addText(text => text
				.setPlaceholder(`${this.app.vault.configDir}/plugins/obsidian-quizium`)
				.setValue(this.plugin.settings.progressFolderPath)
				.onChange(async (value) => {
					this.plugin.settings.progressFolderPath = value || `${this.app.vault.configDir}/plugins/obsidian-quizium`;
					await this.plugin.saveSettings();
					// Update progress manager with new path
					this.plugin.progressManager = new ProgressManager(this.app, this.plugin.settings.progressFolderPath);
				}));

		// Add a divider
		containerEl.createEl('hr');

		// Spaced Repetition Section
		containerEl.createEl('h3', {text: 'Spaced Repetition'});
		
		// Helper function to validate and update days
		const validateAndUpdateDays = async (
			value: number,
			type: 'easy' | 'moderate' | 'challenging',
			dropdown: HTMLSelectElement
		) => {
			const settings = this.plugin.settings.spacedRepetition;
			
			// Validate based on type
			if (type === 'easy' && value <= settings.moderateDays) {
				new Notice('Easy days must be greater than moderate days');
				dropdown.value = settings.easyDays.toString();
				return false;
			}
			if (type === 'moderate' && (value <= settings.challengingDays || value >= settings.easyDays)) {
				new Notice('Moderate days must be greater than challenging days and less than easy days');
				dropdown.value = settings.moderateDays.toString();
				return false;
			}
			if (type === 'challenging' && value >= settings.moderateDays) {
				new Notice('Challenging days must be less than moderate days');
				dropdown.value = settings.challengingDays.toString();
				return false;
			}

			// Update the setting
			settings[`${type}Days`] = value;
			await this.plugin.saveSettings();
			return true;
		};

		// Create dropdown options
		const dayOptions = [0,1,2,3,4,5,6,7].map(day => ({
			value: day.toString(),
			label: day === 1 ? '1 day' : `${day} days`
		}));

		// Easy days setting
		new Setting(containerEl)
			.setName('Easy Questions Review Interval')
			.setDesc('How many days to wait before showing easy questions again')
			.addDropdown(dropdown => dropdown
				.addOptions(Object.fromEntries(dayOptions.map(opt => [opt.value, opt.label])))
				.setValue(this.plugin.settings.spacedRepetition.easyDays.toString())
				.onChange(async (value) => {
					await validateAndUpdateDays(parseInt(value), 'easy', dropdown.selectEl);
				}));

		// Moderate days setting
		new Setting(containerEl)
			.setName('Moderate Questions Review Interval')
			.setDesc('How many days to wait before showing moderate questions again')
			.addDropdown(dropdown => dropdown
				.addOptions(Object.fromEntries(dayOptions.map(opt => [opt.value, opt.label])))
				.setValue(this.plugin.settings.spacedRepetition.moderateDays.toString())
				.onChange(async (value) => {
					await validateAndUpdateDays(parseInt(value), 'moderate', dropdown.selectEl);
				}));

		// Challenging days setting
		new Setting(containerEl)
			.setName('Challenging Questions Review Interval')
			.setDesc('How many days to wait before showing challenging questions again')
			.addDropdown(dropdown => dropdown
				.addOptions(Object.fromEntries(dayOptions.map(opt => [opt.value, opt.label])))
				.setValue(this.plugin.settings.spacedRepetition.challengingDays.toString())
				.onChange(async (value) => {
					await validateAndUpdateDays(parseInt(value), 'challenging', dropdown.selectEl);
				}));

		// Add example section
		const exampleEl = containerEl.createDiv();
		exampleEl.addClass('quizium-settings-example-container');
		
		exampleEl.createEl('strong', {text: 'Format:'});
		exampleEl.createEl('br');
		exampleEl.appendText('Add one of your monitored tag anywhere in your note, then use this format:');
		
		// Requirements section
		const requirementsEl = exampleEl.createEl('div');
		requirementsEl.addClass('quizium-settings-requirements-section');
		requirementsEl.empty();
		requirementsEl.createSpan({ text: 'Requirements:', cls: 'requirements-bold' });
		requirementsEl.createSpan({ text: ' Each block must be surrounded by empty lines. [Q], [A], [B], and [H] lines can appear in any order within each block.' });
		
		// Flashcard example
		const flashcardTitle = exampleEl.createEl('div');
		flashcardTitle.addClass('quizium-settings-section-title');
		flashcardTitle.textContent = 'Flashcard (question + answer):';
		
		const flashcardCodeEl = exampleEl.createEl('pre');
		flashcardCodeEl.addClass('quizium-settings-code-example');
		flashcardCodeEl.textContent = `[Q]What is the speed of light?
[A]299,792,458 m/s`;

		// Flashcard with hint example
		const flashcardHintTitle = exampleEl.createEl('div');
		flashcardHintTitle.addClass('quizium-settings-section-title');
		flashcardHintTitle.textContent = 'Flashcard with optional hint:';
		
		const flashcardHintCodeEl = exampleEl.createEl('pre');
		flashcardHintCodeEl.addClass('quizium-settings-code-example');
		flashcardHintCodeEl.textContent = `[Q]What is the chemical symbol for gold?
[A]Au (from the Latin word "aurum")
[H]Think about the Latin name for gold`;

		// Quiz example
		const quizTitle = exampleEl.createEl('div');
		quizTitle.addClass('quizium-settings-section-title');
		quizTitle.textContent = 'Quiz (question + 1 correct + 3 wrong answers):';
		
		const quizCodeEl = exampleEl.createEl('pre');
		quizCodeEl.addClass('quizium-settings-code-example');
		quizCodeEl.textContent = `[Q]Which planet is closest to the Sun?
[A]Mercury
[B]Venus
[B]Earth
[B]Mars`;

		// QZ comments explanation
		const qzNote = exampleEl.createEl('div');
		qzNote.addClass('quizium-settings-note-text');
		qzNote.empty();
		qzNote.createSpan({ text: 'Note:', cls: 'note-bold' });
		qzNote.createSpan({ text: ' Lines like ' });
		qzNote.createEl('code', { text: '<!--QZ:timestamp,difficulty-->' });
		qzNote.createSpan({ text: ' are automatically added when you rate flashcard difficulty. Don\'t delete them - they track your spaced repetition progress.' });

		// Important note about quizzes being flashcards too
		const noteEl = exampleEl.createEl('div');
		noteEl.addClass('quizium-settings-note-info');
		noteEl.empty();
		noteEl.createSpan({ text: 'Note:', cls: 'note-bold' });
		noteEl.createSpan({ text: ' Quiz questions are automatically available as flashcards too. You only need to define the question once to get both quiz and flashcard functionality.' });
	}
}

// New modal for adding topics
class AddTopicModal extends Modal {
	onSubmit: (hashtag: string, topicName: string) => void;
	plugin: QuiziumPlugin;
	availableHashtags: string[] = [];

	constructor(app: App, plugin: QuiziumPlugin, onSubmit: (hashtag: string, topicName: string) => void) {
		super(app);
		this.plugin = plugin;
		this.onSubmit = onSubmit;
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h3', { text: 'Add new monitored tag' });

		// Load available hashtags for autocomplete
		try {
			this.availableHashtags = await this.plugin.progressManager.scanVaultForHashtags();
		} catch (error) {
			console.error('Error loading hashtags for autocomplete:', error);
			this.availableHashtags = [];
		}

		let hashtagValue = '';
		let topicNameValue = '';
		let hashtagInput: HTMLInputElement;
		let topicNameInput: HTMLInputElement;
		let datalistEl: HTMLDataListElement;

		// Create hashtag input with autocomplete
		const hashtagSetting = new Setting(contentEl)
			.setName('Hashtag')
			.setDesc('The hashtag to monitor (include the # symbol)')
			.addText(text => {
				hashtagInput = text.inputEl;
				hashtagInput.setAttribute('list', 'hashtag-suggestions');
				text.setPlaceholder('#study')
					.onChange(value => {
						hashtagValue = value;
						// Auto-populate topic name if it's empty or was auto-generated
						if (!topicNameValue || this.isAutoGeneratedTopicName(topicNameValue, this.getLastHashtagValue())) {
							const autoTopicName = this.generateTopicNameFromHashtag(value);
							topicNameValue = autoTopicName;
							if (topicNameInput) {
								topicNameInput.value = autoTopicName;
							}
						}
					});
			});

		// Create datalist for autocomplete suggestions
		datalistEl = contentEl.createEl('datalist');
		datalistEl.id = 'hashtag-suggestions';
		
		// Populate datalist with available hashtags
		this.availableHashtags.forEach(hashtag => {
			const option = datalistEl.createEl('option');
			option.value = hashtag;
		});

		// Create topic name input
		new Setting(contentEl)
			.setName('Topic name')
			.setDesc('A friendly name for this topic (auto-populated from hashtag)')
			.addText(text => {
				topicNameInput = text.inputEl;
				text.setPlaceholder('Study Notes')
					.onChange(value => {
						topicNameValue = value;
					});
			});

		new Setting(contentEl)
			.addButton(button => {
				button.setButtonText('Add')
					.setCta()
					.onClick(() => {
						if (hashtagValue.trim() && topicNameValue.trim()) {
							// Ensure hashtag starts with #
							const hashtag = hashtagValue.startsWith('#') ? hashtagValue : '#' + hashtagValue;
							// Sanitize topic name (remove leading # if present)
							const sanitizedTopicName = topicNameValue.startsWith('#') ? topicNameValue.substring(1) : topicNameValue.trim();
							this.onSubmit(hashtag, sanitizedTopicName);
							this.close();
						}
					});
			})
			.addButton(button => {
				button.setButtonText('Cancel')
					.onClick(() => {
						this.close();
					});
			});
	}

	private lastHashtagValue = '';

	private getLastHashtagValue(): string {
		return this.lastHashtagValue;
	}

	/**
	 * Generates a user-friendly topic name from a hashtag
	 */
	private generateTopicNameFromHashtag(hashtag: string): string {
		this.lastHashtagValue = hashtag;
		
		if (!hashtag) return '';
		
		// Remove # if present
		let topicName = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;
		
		// Replace common separators with spaces and capitalize words
		topicName = topicName
			.replace(/[-_/]/g, ' ')  // Replace hyphens, underscores, and forward slashes with spaces
			.split(' ')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ');
		
		return topicName;
	}

	/**
	 * Checks if the current topic name appears to be auto-generated from the previous hashtag
	 */
	private isAutoGeneratedTopicName(topicName: string, previousHashtag: string): boolean {
		if (!previousHashtag) return true;
		
		const expectedAutoName = this.generateTopicNameFromHashtag(previousHashtag);
		return topicName === expectedAutoName;
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

