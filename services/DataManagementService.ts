import { App } from 'obsidian';
import { FlashcardService } from '../FlashcardService';
import QuiziumPlugin from '../main';
import { QuizHistoryEntry } from '../views/types';

/**
 * Service class that handles data management operations for the Quizium plugin.
 * This service manages operations like resetting flashcard ratings, clearing quiz results,
 * and loading quiz history data.
 */
export class DataManagementService {
  constructor(
    private app: App,
    private flashcardService: FlashcardService,
    private plugin: QuiziumPlugin
  ) {}

  /**
   * Resets all flashcard difficulty ratings by removing QZ comment lines from notes.
   * This operation removes all difficulty ratings while preserving the actual questions and answers.
   * 
   * @returns Promise resolving to operation result with success status and statistics
   */
  async resetAllFlashcards(): Promise<{
    success: boolean;
    error?: string;
    totalFilesModified?: number;
    totalCommentsRemoved?: number;
  }> {
    if (!this.app || !this.flashcardService) {
      return { success: false, error: 'App or FlashcardService not available' };
    }
    
    // Get user confirmation before proceeding
    const confirmed = this.confirmFlashcardReset();
    if (!confirmed) {
      return { success: false, error: 'Operation cancelled by user' };
    }
    
    try {
      const resetResult = await this.performFlashcardReset();
      this.flashcardService.resetShuffledSequences();
      return resetResult;
    } catch (err) {
      return {
        success: false,
        error: 'Error resetting flashcards: ' + (err instanceof Error ? err.message : 'Unknown error')
      };
    }
  }

  /**
   * Resets all quiz results by clearing the quiz history data.
   * This operation removes all quiz scores and timestamps from the progress file.
   * 
   * @returns Promise resolving to operation result with success status
   */
  async resetAllQuizResults(): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!this.plugin) {
      return { success: false, error: 'Plugin not available' };
    }
    
    // Get user confirmation before proceeding
    const confirmed = this.confirmQuizResultsReset();
    if (!confirmed) {
      return { success: false, error: 'Operation cancelled by user' };
    }
    
    try {
      await this.plugin.resetAllQuizResults();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: 'Error resetting quiz results: ' + (err instanceof Error ? err.message : 'Unknown error')
      };
    }
  }

  /**
   * Loads the complete quiz history from the plugin's progress data.
   * This method extracts and formats all quiz results across all topics.
   * 
   * @returns Promise resolving to operation result with quiz history data
   */
  async loadQuizHistory(): Promise<{
    success: boolean;
    error?: string;
    history?: QuizHistoryEntry[];
  }> {
    if (!this.plugin) {
      return { success: false, error: 'Plugin not available' };
    }
    
    try {
      const progressData = await this.plugin.getProgressData();
      const history = this.extractQuizHistoryFromProgressData(progressData);
      return { success: true, history };
    } catch (err) {
      return {
        success: false,
        error: 'Error loading quiz history: ' + (err instanceof Error ? err.message : 'Unknown error')
      };
    }
  }

  /**
   * Shows confirmation dialog for flashcard reset operation.
   * 
   * @returns Boolean indicating whether user confirmed the operation
   */
  private confirmFlashcardReset(): boolean {
    return confirm(
      'Are you sure you want to reset all flashcard difficulty ratings?\n\n' +
      'This will remove all QZ comment lines (like <!--QZ:timestamp,difficulty-->) from your notes.\n' +
      'Questions and answers will remain unchanged.\n\n' +
      'This action cannot be undone.'
    );
  }

  /**
   * Shows confirmation dialog for quiz results reset operation.
   * 
   * @returns Boolean indicating whether user confirmed the operation
   */
  private confirmQuizResultsReset(): boolean {
    return confirm(
      'Are you sure you want to reset all historical quiz results?\n\n' +
      'This will clear all quiz scores and timestamps from the progress file.\n' +
      'The file will be reset as if the plugin was just installed.\n\n' +
      'This action cannot be undone.'
    );
  }

  /**
   * Performs the actual flashcard reset operation by processing all flashcard files.
   * 
   * @returns Promise resolving to reset operation statistics
   */
  private async performFlashcardReset(): Promise<{
    success: boolean;
    totalFilesModified: number;
    totalCommentsRemoved: number;
  }> {
    const files = await this.flashcardService.findFlashcardFiles();
    let totalFilesModified = 0;
    let totalCommentsRemoved = 0;
    
    for (const file of files) {
      const result = await this.processFileForReset(file);
      if (result.modified) {
        totalFilesModified++;
        totalCommentsRemoved += result.commentsRemoved;
      }
    }
    
    return {
      success: true,
      totalFilesModified,
      totalCommentsRemoved
    };
  }

  /**
   * Processes a single file to remove QZ comment lines.
   * 
   * @param file - The file to process
   * @returns Promise resolving to processing result
   */
  private async processFileForReset(file: any): Promise<{
    modified: boolean;
    commentsRemoved: number;
  }> {
    const content = await this.app.vault.read(file);
    const lines = content.split('\n');
    const result = this.removeQZCommentsFromLines(lines);
    
    if (result.commentsRemoved > 0) {
      const updatedContent = result.filteredLines.join('\n');
      await this.app.vault.modify(file, updatedContent);
      return { modified: true, commentsRemoved: result.commentsRemoved };
    }
    
    return { modified: false, commentsRemoved: 0 };
  }

  /**
   * Removes QZ comment lines from an array of text lines.
   * 
   * @param lines - Array of text lines to process
   * @returns Object containing filtered lines and count of removed comments
   */
  private removeQZCommentsFromLines(lines: string[]): {
    filteredLines: string[];
    commentsRemoved: number;
  } {
    const filteredLines: string[] = [];
    let commentsRemoved = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      const isQZComment = trimmedLine.startsWith('<!--QZ:') && trimmedLine.endsWith('-->');
      
      if (isQZComment) {
        if (trimmedLine === line.trim()) {
          // Line contains only QZ comment, remove it entirely
          commentsRemoved++;
          // Don't add this line to filteredLines
        } else {
          // Line contains other content besides QZ comment, keep the line but remove just the QZ comment
          const cleanedLine = line.replace(/<!--QZ:.*?-->/, '').trim();
          filteredLines.push(cleanedLine);
          commentsRemoved++;
        }
      } else {
        // Not a QZ comment line, keep it
        filteredLines.push(line);
      }
    }
    
    return { filteredLines, commentsRemoved };
  }

  /**
   * Extracts quiz history entries from the plugin's progress data.
   * 
   * @param progressData - The progress data from the plugin
   * @returns Array of formatted quiz history entries
   */
  private extractQuizHistoryFromProgressData(progressData: any): QuizHistoryEntry[] {
    const history: QuizHistoryEntry[] = [];
    
    // Check if the expected data structure exists
    if (!this.isValidProgressDataStructure(progressData)) {
      return [];
    }
    
    // Extract quiz results from all topics
    for (const [topicName, topicData] of Object.entries(progressData.quizium.data.topics)) {
      if (this.isValidTopicData(topicData)) {
        const topicEntries = this.extractEntriesFromTopicData(topicName, topicData as any);
        history.push(...topicEntries);
      }
    }
    
    // Sort by timestamp (most recent first)
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Validates that the progress data has the expected structure.
   * 
   * @param progressData - The progress data to validate
   * @returns Boolean indicating whether the structure is valid
   */
  private isValidProgressDataStructure(progressData: any): boolean {
    return progressData && 
           progressData.quizium && 
           progressData.quizium.data && 
           progressData.quizium.data.topics;
  }

  /**
   * Validates that topic data has the expected structure.
   * 
   * @param topicData - The topic data to validate
   * @returns Boolean indicating whether the structure is valid
   */
  private isValidTopicData(topicData: any): boolean {
    return topicData && topicData.results && Array.isArray(topicData.results);
  }

  /**
   * Extracts quiz history entries from a single topic's data.
   * 
   * @param topicName - The name of the topic
   * @param topicData - The topic's quiz data
   * @returns Array of quiz history entries for this topic
   */
  private extractEntriesFromTopicData(topicName: string, topicData: { results: any[] }): QuizHistoryEntry[] {
    return topicData.results.map(result => {
      const date = new Date(result.timestamp);
      const formattedDate = date.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      return {
        timestamp: result.timestamp,
        topic: topicName,
        scorePercentage: result.scorePercentage,
        formattedDate
      };
    });
  }
} 