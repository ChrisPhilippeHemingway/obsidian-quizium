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
						topics: {}
					}
				}
			};

			// Parse the YAML content manually for our specific structure
			const lines = content.split('\n');
			let currentTopic = '';
			let inTopics = false;
			
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				const trimmedLine = line.trim();
				
				// Look for topics: line (could be "topics:" or "topics: {}")
				if (trimmedLine === 'topics:' || trimmedLine === 'topics: {}') {
					inTopics = true;
					continue;
				}
				
				// Look for topic names - they are indented with 6 spaces and end with ':'
				// This handles both properly indented topics and the malformed ones
				if (inTopics && line.startsWith('      ') && line.endsWith(':') && !trimmedLine.startsWith('results:')) {
					currentTopic = trimmedLine.replace(':', '');
					data.quizium.data.topics[currentTopic] = { results: [] };
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
					topics: {}
				}
			}
		};
	}

	async addTopic(topicName: string): Promise<void> {
		const data = await this.getProgressData();
		if (!data.quizium.data.topics[topicName]) {
			data.quizium.data.topics[topicName] = { results: [] };
			await this.saveProgressData(data);
		}
	}

	async addQuizResult(topicName: string, scorePercentage: number): Promise<void> {
		const filePath = `${this.progressFolderPath}/${this.progressFileName}`;
		await this.ensureProgressFile();
		
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
			
			// Check if the topic already exists in the file
			const topicPattern = new RegExp(`^      ${topicName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:$`, 'm');
			
			let updatedContent;
			if (topicPattern.test(existingContent)) {
				// Topic exists, find the results section and append
				const resultsPattern = new RegExp(`(^      ${topicName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*\\n        results:\\s*\\n)`, 'm');
				updatedContent = existingContent.replace(resultsPattern, `$1${newResult}`);
			} else {
				// Topic doesn't exist, add it
				// First, check if we have the empty topics: {} pattern and replace it
				if (existingContent.includes('topics: {}')) {
					// Replace the empty topics with the first topic
					const newTopic = `topics:\n      ${topicName}:\n        results:\n${newResult}`;
					updatedContent = existingContent.replace('topics: {}', newTopic);
				} else if (existingContent.includes('topics:\n') && !existingContent.includes('      ')) {
					// We have topics: but no actual topics yet
					const newTopic = `      ${topicName}:\n        results:\n${newResult}`;
					updatedContent = existingContent.replace('topics:\n', `topics:\n${newTopic}`);
				} else {
					// We already have topics, just append the new one
					const newTopic = `      ${topicName}:\n        results:\n${newResult}`;
					updatedContent = existingContent + newTopic;
				}
			}
			
			// Write the updated content back to the file
			await this.app.vault.adapter.write(filePath, updatedContent);
			console.log(`Quiz result saved: ${topicName} - ${scorePercentage}%`);
			
		} catch (error) {
			console.error('Error saving quiz result:', error);
			throw error;
		}
	}

	async resetAllQuizResults(): Promise<void> {
		const filePath = `${this.progressFolderPath}/${this.progressFileName}`;
		
		// Reset to default content (empty topics)
		const defaultContent = `quizium:
  data:
    topics: {}
`;
		
		try {
			// Ensure the folder exists
			await this.ensureProgressFolder();
			
			// Write the default content to reset the file
			await this.app.vault.adapter.write(filePath, defaultContent);
		} catch (error) {
			console.error('Error resetting quiz results:', error);
			throw error;
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

const DEFAULT_SETTINGS: QuiziumPluginSettings = {
	monitoredTopics: [],
	progressFolderPath: '.obsidian/plugins/obsidian-quizium',
	spacedRepetition: {
		easyDays: 4,
		moderateDays: 2,
		challengingDays: 0
	}
}

export default class QuiziumPlugin extends Plugin {
	settings: QuiziumPluginSettings;
	progressManager: ProgressManager;

	async onload() {
		await this.loadSettings();
		
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
			name: 'Open Quizium',
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
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async initializeProgressManager() {
		if (this.progressManager) {
			// Only ensure progress file exists, don't add topics until quiz completion
			await this.progressManager.ensureProgressFile();
		}
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
		} else {
			console.error('Progress manager not available for recording quiz result');
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
		topicsContainer.style.marginBottom = '15px';
		
		// Function to refresh the topics display
		const refreshTopicsDisplay = () => {
			topicsContainer.empty();
			
			this.plugin.settings.monitoredTopics.forEach((topic, index) => {
				const topicEl = topicsContainer.createDiv();
				topicEl.style.display = 'flex';
				topicEl.style.alignItems = 'center';
				topicEl.style.gap = '10px';
				topicEl.style.marginBottom = '8px';
				topicEl.style.padding = '8px';
				topicEl.style.backgroundColor = 'var(--background-secondary)';
				topicEl.style.borderRadius = '5px';
				
				// Topic display
				const topicInfo = topicEl.createDiv();
				topicInfo.style.flex = '1';
				topicInfo.innerHTML = `<strong>${topic.topicName}</strong> - <code>${topic.hashtag}</code>`;
				
				// Delete button
				const deleteBtn = topicEl.createEl('button');
				deleteBtn.textContent = '×';
				deleteBtn.style.background = '#ff6b6b';
				deleteBtn.style.color = 'white';
				deleteBtn.style.border = 'none';
				deleteBtn.style.borderRadius = '3px';
				deleteBtn.style.padding = '4px 8px';
				deleteBtn.style.cursor = 'pointer';
				deleteBtn.onclick = async () => {
					this.plugin.settings.monitoredTopics.splice(index, 1);
					await this.plugin.saveSettings();
					refreshTopicsDisplay();
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
						const modal = new AddTopicModal(this.app, async (hashtag: string, topicName: string) => {
							this.plugin.settings.monitoredTopics.push({ hashtag, topicName });
							await this.plugin.saveSettings();
							// Add topic to progress file
							await this.plugin.progressManager.addTopic(topicName);
							refreshTopicsDisplay();
						});
						modal.open();
					});
			});

		// Progress folder setting
		new Setting(containerEl)
			.setName('Progress folder path')
			.setDesc('Path to folder where Quizium will store progress data (YAML file)')
			.addText(text => text
				.setPlaceholder('.obsidian/plugins/obsidian-quizium')
				.setValue(this.plugin.settings.progressFolderPath)
				.onChange(async (value) => {
					this.plugin.settings.progressFolderPath = value || '.obsidian/plugins/obsidian-quizium';
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
		exampleEl.style.marginTop = '20px';
		exampleEl.style.padding = '10px';
		exampleEl.style.backgroundColor = 'var(--background-secondary)';
		exampleEl.style.borderRadius = '5px';
		exampleEl.style.fontSize = '0.9em';
		
		exampleEl.createEl('strong', {text: 'Format:'});
		exampleEl.createEl('br');
		exampleEl.appendText('Add one of your monitored tag anywhere in your note, then use this format:');
		
		// Requirements section
		const requirementsEl = exampleEl.createEl('div');
		requirementsEl.style.marginTop = '8px';
		requirementsEl.style.marginLeft = '-10px'; // Offset the parent container's padding
		requirementsEl.style.marginRight = '-10px'; // Offset the parent container's padding
		requirementsEl.style.padding = '8px 10px'; // Add back the padding we need
		requirementsEl.style.backgroundColor = 'var(--background-modifier-info)';
		requirementsEl.style.borderRadius = '4px';
		requirementsEl.style.fontSize = '0.85em';
		requirementsEl.innerHTML = '<strong>Requirements:</strong> Each block must be surrounded by empty lines. [Q], [A], [B], and [H] lines can appear in any order within each block.';
		
		// Flashcard example
		const flashcardTitle = exampleEl.createEl('div');
		flashcardTitle.style.marginTop = '12px';
		flashcardTitle.style.fontWeight = 'bold';
		flashcardTitle.style.fontSize = '0.9em';
		flashcardTitle.style.color = 'var(--text-accent)';
		flashcardTitle.textContent = 'Flashcard (question + answer):';
		
		const flashcardCodeEl = exampleEl.createEl('pre');
		flashcardCodeEl.style.marginTop = '4px';
		flashcardCodeEl.style.padding = '8px';
		flashcardCodeEl.style.backgroundColor = 'var(--background-primary)';
		flashcardCodeEl.style.borderRadius = '4px';
		flashcardCodeEl.style.fontSize = '0.8em';
		flashcardCodeEl.style.lineHeight = '1.3';
		flashcardCodeEl.textContent = `[Q]What is the speed of light?
[A]299,792,458 m/s`;

		// Flashcard with hint example
		const flashcardHintTitle = exampleEl.createEl('div');
		flashcardHintTitle.style.marginTop = '12px';
		flashcardHintTitle.style.fontWeight = 'bold';
		flashcardHintTitle.style.fontSize = '0.9em';
		flashcardHintTitle.style.color = 'var(--text-accent)';
		flashcardHintTitle.textContent = 'Flashcard with optional hint:';
		
		const flashcardHintCodeEl = exampleEl.createEl('pre');
		flashcardHintCodeEl.style.marginTop = '4px';
		flashcardHintCodeEl.style.padding = '8px';
		flashcardHintCodeEl.style.backgroundColor = 'var(--background-primary)';
		flashcardHintCodeEl.style.borderRadius = '4px';
		flashcardHintCodeEl.style.fontSize = '0.8em';
		flashcardHintCodeEl.style.lineHeight = '1.3';
		flashcardHintCodeEl.textContent = `[Q]What is the chemical symbol for gold?
[A]Au (from the Latin word "aurum")
[H]Think about the Latin name for gold`;

		// Quiz example
		const quizTitle = exampleEl.createEl('div');
		quizTitle.style.marginTop = '12px';
		quizTitle.style.fontWeight = 'bold';
		quizTitle.style.fontSize = '0.9em';
		quizTitle.style.color = 'var(--text-accent)';
		quizTitle.textContent = 'Quiz (question + 1 correct + 3 wrong answers):';
		
		const quizCodeEl = exampleEl.createEl('pre');
		quizCodeEl.style.marginTop = '4px';
		quizCodeEl.style.padding = '8px';
		quizCodeEl.style.backgroundColor = 'var(--background-primary)';
		quizCodeEl.style.borderRadius = '4px';
		quizCodeEl.style.fontSize = '0.8em';
		quizCodeEl.style.lineHeight = '1.3';
		quizCodeEl.textContent = `[Q]Which planet is closest to the Sun?
[A]Mercury
[B]Venus
[B]Earth
[B]Mars`;

		// QZ comments explanation
		const qzNote = exampleEl.createEl('div');
		qzNote.style.marginTop = '12px';
		qzNote.style.marginLeft = '0px'; // Fix indentation
		qzNote.style.fontSize = '0.8em';
		qzNote.style.color = 'var(--text-muted)';
		qzNote.innerHTML = '<strong>Note:</strong> Lines like <code>&lt;!--QZ:timestamp,difficulty--&gt;</code> are automatically added when you rate flashcard difficulty. Don\'t delete them - they track your spaced repetition progress.';

		// Important note about quizzes being flashcards too
		const noteEl = exampleEl.createEl('div');
		noteEl.style.marginTop = '12px';
		noteEl.style.marginLeft = '-10px'; // Offset the parent container's padding
		noteEl.style.marginRight = '-10px'; // Offset the parent container's padding
		noteEl.style.padding = '8px 10px'; // Add back the padding we need
		noteEl.style.backgroundColor = 'var(--background-modifier-info)';
		noteEl.style.borderRadius = '4px';
		noteEl.style.fontSize = '0.9em';
		noteEl.style.fontStyle = 'italic';
		noteEl.innerHTML = '<strong>Note:</strong> Quiz questions are automatically available as flashcards too. You only need to define the question once to get both quiz and flashcard functionality.';
	}
}

// New modal for adding topics
class AddTopicModal extends Modal {
	onSubmit: (hashtag: string, topicName: string) => void;

	constructor(app: App, onSubmit: (hashtag: string, topicName: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h3', { text: 'Add new monitored tag' });

		let hashtagValue = '';
		let topicNameValue = '';

		new Setting(contentEl)
			.setName('Hashtag')
			.setDesc('The hashtag to monitor (include the # symbol)')
			.addText(text => {
				text.setPlaceholder('#study')
					.onChange(value => {
						hashtagValue = value;
					});
			});

		new Setting(contentEl)
			.setName('Topic name')
			.setDesc('A friendly name for this topic')
			.addText(text => {
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
							this.onSubmit(hashtag, topicNameValue.trim());
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

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
