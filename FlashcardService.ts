import { App, TFile } from 'obsidian';
import { MonitoredTopic } from './main';
import type QuiziumPlugin from './main';

export interface Flashcard {
  question: string;
  answer: string;
  hint?: string; // Optional hint for the flashcard
  file: TFile;
  topics: string[]; // Topics this flashcard belongs to
  difficulty?: 'easy' | 'moderate' | 'challenging'; // Difficulty rating from QZ comments
  lastRated?: Date; // When it was last rated
}

export interface Quiz {
  question: string;
  correctAnswer: string;
  wrongAnswers: string[]; // Exactly 3 wrong answers
  file: TFile;
  topics: string[]; // Topics this quiz belongs to
}

export interface TopicStats {
  topicName: string;
  hashtag: string;
  count: number;
}

export interface TopicDifficultyStats {
  topicName: string;
  hashtag: string;
  easy: number;
  moderate: number;
  challenging: number;
  unrated: number;
  total: number;
}

export class FlashcardService {
  private app: App;
  private monitoredTopics: MonitoredTopic[];
  private shuffledSequences: Map<string, { cards: Flashcard[], currentIndex: number }> = new Map();
  public plugin: QuiziumPlugin | null; // Reference to the Quizium plugin

  constructor(app: App, monitoredTopics: MonitoredTopic[] = [], plugin?: QuiziumPlugin) {
    this.app = app;
    this.monitoredTopics = monitoredTopics;
    this.plugin = plugin || null;
  }

  /**
   * Update the monitored topics and clear any cached shuffled sequences
   */
  updateMonitoredTopics(topics: MonitoredTopic[]) {
    this.monitoredTopics = topics;
    this.shuffledSequences.clear(); // Clear cache when topics change
  }

  /**
   * Fisher-Yates shuffle algorithm for proper randomization
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]; // Create a copy to avoid mutating original
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate a unique key for caching shuffled sequences
   */
  private getSequenceKey(topicName: string | null, difficulty: string): string {
    const topic = topicName || 'all';
    return `${topic}:${difficulty}`;
  }

  /**
   * Get or create a shuffled sequence for a specific topic/difficulty combination
   */
  private async getShuffledSequence(topicName: string | null, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all'): Promise<{ cards: Flashcard[], currentIndex: number }> {
    const key = this.getSequenceKey(topicName, difficulty);
    
    // Check if we have a cached sequence
    let sequence = this.shuffledSequences.get(key);
    
    if (!sequence) {
      // Create new shuffled sequence
      let allCards: Flashcard[];
      
      // Get all cards first
      if (topicName === 'all' || topicName === null) {
        allCards = await this.getAllFlashcards();
      } else {
        allCards = await this.getFlashcardsByTopic(topicName);
      }
      
      // Then apply difficulty filter
      if (difficulty !== 'all') {
        if (difficulty === 'unrated') {
          allCards = allCards.filter(card => !card.difficulty);
        } else {
          allCards = allCards.filter(card => card.difficulty === difficulty);
        }
      }
      
      // Ensure we have a fresh shuffled array
      const shuffledCards = this.shuffleArray(allCards);
      sequence = {
        cards: shuffledCards,
        currentIndex: -1  // Start at -1 so first call to getNext will move to index 0
      };
      
      this.shuffledSequences.set(key, sequence);
    }
    
    return sequence;
  }

  /**
   * Reset all shuffled sequences (useful when flashcards are modified)
   */
  resetShuffledSequences() {
    this.shuffledSequences.clear();
  }

  /**
   * Reset a specific shuffled sequence
   */
  resetSequenceForTopic(topicName: string | null, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all') {
    const key = this.getSequenceKey(topicName, difficulty);
    this.shuffledSequences.delete(key);
  }

  /**
   * Check if we've completed the current sequence for a topic/difficulty
   */
  async hasCompletedSequence(topicName: string | null, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all'): Promise<boolean> {
    const sequence = await this.getShuffledSequence(topicName, difficulty);
    
    if (sequence.cards.length === 0) {
      return true; // No cards means "completed"
    }
    
    // We've completed if we've gone through all cards (currentIndex >= cards.length - 1)
    return sequence.currentIndex >= sequence.cards.length - 1;
  }

  /**
   * Get the current progress in a sequence
   */
  async getSequenceProgress(topicName: string | null, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all'): Promise<{ current: number, total: number }> {
    const sequence = await this.getShuffledSequence(topicName, difficulty);
    
    return {
      current: Math.max(0, sequence.currentIndex + 1), // +1 because index is 0-based, but handle -1 start case
      total: sequence.cards.length
    };
  }

  /**
   * Find all markdown files that contain any of the configured hashtags
   */
  async findFlashcardFiles(): Promise<TFile[]> {
    const files = this.app.vault.getMarkdownFiles();
    const flashcardFiles: TFile[] = [];

    for (const file of files) {
      const content = await this.app.vault.read(file);
      
      // Check if the file contains any of the configured hashtags
      const hasFlashcardTag = this.monitoredTopics.some(topic => 
        content.includes(topic.hashtag)
      );
      
      if (hasFlashcardTag) {
        flashcardFiles.push(file);
      }
    }

    return flashcardFiles;
  }

  /**
   * Get which topics a file belongs to based on hashtags present
   */
  private getFileTopics(content: string): string[] {
    const topics: string[] = [];
    
    for (const topic of this.monitoredTopics) {
      if (content.includes(topic.hashtag)) {
        topics.push(topic.topicName);
      }
    }
    
    return topics;
  }

  /**
   * Extract difficulty rating from content for a specific flashcard
   */
  private extractDifficultyRating(content: string, question: string, answer: string): {
    difficulty?: 'easy' | 'moderate' | 'challenging';
    lastRated?: Date;
  } {
    const lines = content.split('\n');
    
    // Find the block that contains both the question and answer
    let blockStartIndex = -1;
    let blockEndIndex = -1;
    let foundQuestion = false;
    let foundAnswer = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line contains our question or answer in bracket format
      // Use more robust matching to handle whitespace and encoding differences
      const isQuestionLine = line.startsWith('[Q]') && line.substring(3).trim() === question.trim();
      const isAnswerLine = line.startsWith('[A]') && line.substring(3).trim() === answer.trim();
      
      if (isQuestionLine || isAnswerLine) {
        if (blockStartIndex === -1) {
          // Find the start of this block (last empty line before content)
          blockStartIndex = i;
          while (blockStartIndex > 0 && !this.isEmptyLine(lines[blockStartIndex - 1])) {
            blockStartIndex--;
          }
        }
        
        if (isQuestionLine) foundQuestion = true;
        if (isAnswerLine) foundAnswer = true;
        
        // Find the end of this block (next empty line after content)
        blockEndIndex = i;
        while (blockEndIndex < lines.length - 1 && !this.isEmptyLine(lines[blockEndIndex + 1])) {
          blockEndIndex++;
        }
      }
    }
    
    // Only proceed if we found both question and answer in the same block
    if (!foundQuestion || !foundAnswer || blockStartIndex === -1) {
      return {};
    }
    
    // Look for QZ comment within or immediately before this block
    for (let i = Math.max(0, blockStartIndex - 3); i <= blockEndIndex; i++) {
      const line = lines[i].trim();
      const qzMatch = line.match(/<!--QZ:(.*?),(.*?)-->/);
      if (qzMatch) {
        const [, timestamp, difficulty] = qzMatch;
        return {
          difficulty: difficulty as 'easy' | 'moderate' | 'challenging',
          lastRated: new Date(timestamp)
        };
      }
    }
    
    return {};
  }

  /**
   * Parse flashcards from a file content
   * EXTREMELY STRICT format:
   * 
   * (empty line)
   * Single line question
   * ?
   * Single line answer
   * (empty line)
   */
  parseFlashcardsFromContent(content: string, file: TFile): Flashcard[] {
    const flashcards: Flashcard[] = [];
    
    // Get which topics this file belongs to
    const fileTopics = this.getFileTopics(content);
    
    // If the file doesn't belong to any monitored topics, return empty
    if (fileTopics.length === 0) {
      return flashcards;
    }
    
    // Remove all configured hashtags and QZ comments for cleaner parsing
    let cleanContent = content;
    this.monitoredTopics.forEach(topic => {
      cleanContent = cleanContent.replace(new RegExp(topic.hashtag.replace('#', '\\#'), 'g'), '');
    });
    // Remove QZ difficulty rating comments
    cleanContent = cleanContent.replace(/<!--QZ:.*?-->/g, '');
    cleanContent = cleanContent.trim();
    
    // Split content into lines
    const lines = cleanContent.split('\n');
    
    let i = 0;
    while (i < lines.length - 1) {
      // Skip consecutive empty lines and look for content
      if (this.isEmptyLine(lines[i])) {
        // Skip all consecutive empty lines
        let nextContentIndex = i + 1;
        while (nextContentIndex < lines.length && this.isEmptyLine(lines[nextContentIndex])) {
          nextContentIndex++;
        }
        
        if (nextContentIndex < lines.length) {
          // Parse bracket format starting from the first non-empty line
          const bracketFlashcard = this.parseBracketFlashcard(lines, nextContentIndex);
          if (bracketFlashcard) {
            // Extract difficulty rating from original content
            const difficultyInfo = this.extractDifficultyRating(content, bracketFlashcard.question, bracketFlashcard.answer);
            
            flashcards.push({
              ...bracketFlashcard,
              file: file,
              topics: fileTopics,
              difficulty: difficultyInfo.difficulty,
              lastRated: difficultyInfo.lastRated
            });
            // Move index to after this flashcard
            i = bracketFlashcard.endIndex;
            continue;
          }
        }
      }
      i++;
    }
    
    return flashcards;
  }

  /**
   * Parse a flashcard with STRICT single-line format
   * Expects exactly: question line, ? line, answer line
   * Can be followed by wrong answers (: lines) and QZ comments
   */
  private parseStrictFlashcard(lines: string[], startIndex: number): {
    question: string;
    answer: string;
    endIndex: number;
  } | null {
    // Need at least 3 lines from startIndex: question, ?, answer
    if (startIndex + 2 >= lines.length) return null;

    const questionLine = lines[startIndex].trim();
    const separatorLine = lines[startIndex + 1].trim();
    const answerLine = lines[startIndex + 2].trim();

    // Validate the strict pattern:
    // 1. Question line must not be empty
    // 2. Separator must be exactly "?"
    // 3. Answer line must not be empty
    if (!questionLine || separatorLine !== '?' || !answerLine) {
      return null;
    }

    // Find the end of this flashcard by looking for the next empty line
    // Skip over any wrong answers (: lines) - QZ comments are removed during cleaning
    let endIndex = startIndex + 3;
    
    while (endIndex < lines.length) {
      const currentLine = lines[endIndex].trim();
      
      // If we hit an empty line, this is the end of the flashcard
      if (this.isEmptyLine(currentLine)) {
        break;
      }
      
      // If we hit a line that's not a wrong answer separator (:),
      // then this flashcard ends at the previous line
      if (currentLine !== ':' && currentLine !== '') {
        // Check if this might be a wrong answer line (non-empty line after :)
        if (endIndex > startIndex + 3 && lines[endIndex - 1].trim() === ':') {
          // This is a wrong answer line, continue
          endIndex++;
          continue;
        }
        // This is some other content, so the flashcard ends here
        break;
      }
      
      endIndex++;
    }

    return {
      question: questionLine,
      answer: answerLine,
      endIndex: endIndex
    };
  }

  /**
   * Parse a flashcard with new bracket format: [Q]question and [A]answer
   * Can appear in any order within a block surrounded by empty lines
   */
  private parseBracketFlashcard(lines: string[], startIndex: number): {
    question: string;
    answer: string;
    hint?: string;
    endIndex: number;
  } | null {
    // First line must be [Q]
    const firstLine = lines[startIndex].trim();
    if (!firstLine.startsWith('[Q]')) {
      return null;
    }
    
    const question = firstLine.substring(3).trim();
    if (!question) {
      return null;
    }
    
    let answer = '';
    let hint = '';
    let endIndex = startIndex + 1;
    
    // Find the end of this block and look for [A] and [H]
    while (endIndex < lines.length && !this.isEmptyLine(lines[endIndex])) {
      const line = lines[endIndex].trim();
      
      // Check for answer line [A]
      if (line.startsWith('[A]')) {
        answer = line.substring(3).trim();
      }
      // Check for hint line [H]
      else if (line.startsWith('[H]')) {
        hint = line.substring(3).trim();
      }
      // Skip [B] lines (wrong answers for quizzes) and other content
      
      endIndex++;
    }
    
    // Must have both question and answer to be a valid flashcard
    if (!answer) {
      return null;
    }
    
    const result: {
      question: string;
      answer: string;
      hint?: string;
      endIndex: number;
    } = {
      question,
      answer,
      endIndex
    };
    
    // Only include hint if it's not empty
    if (hint) {
      result.hint = hint;
    }
    
    return result;
  }

  /**
   * Check if a line is empty or contains only whitespace
   */
  private isEmptyLine(line: string): boolean {
    return !line || line.trim().length === 0;
  }

  /**
   * Check if a line is a QZ difficulty rating comment
   */
  private isQZComment(line: string): boolean {
    return line.trim().startsWith('<!--QZ:') && line.trim().endsWith('-->');
  }

  /**
   * Get all flashcards from all flashcard files in the vault
   */
  async getAllFlashcards(): Promise<Flashcard[]> {
    const files = await this.findFlashcardFiles();
    const allFlashcards: Flashcard[] = [];

    for (const file of files) {
      const content = await this.app.vault.read(file);
      const flashcards = this.parseFlashcardsFromContent(content, file);
      allFlashcards.push(...flashcards);
    }

    return allFlashcards;
  }

  /**
   * Get flashcards filtered by a specific topic
   */
  async getFlashcardsByTopic(topicName: string): Promise<Flashcard[]> {
    const allFlashcards = await this.getAllFlashcards();
    return allFlashcards.filter(flashcard => 
      flashcard.topics.includes(topicName)
    );
  }

  /**
   * Get flashcards filtered by topic and difficulty
   */
  async getFlashcardsByTopicAndDifficulty(topicName: string, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all'): Promise<Flashcard[]> {
    let topicFlashcards: Flashcard[];
    
    // Handle 'all' topics case
    if (topicName === 'all') {
      topicFlashcards = await this.getAllFlashcards();
    } else {
      topicFlashcards = await this.getFlashcardsByTopic(topicName);
    }
    
    // Apply difficulty filter
    if (difficulty === 'all') {
      return topicFlashcards;
    } else if (difficulty === 'unrated') {
      return topicFlashcards.filter(flashcard => !flashcard.difficulty);
    } else {
      return topicFlashcards.filter(flashcard => flashcard.difficulty === difficulty);
    }
  }

  /**
   * Get difficulty statistics for all topics
   */
  async getTopicDifficultyStats(): Promise<TopicDifficultyStats[]> {
    const allFlashcards = await this.getAllFlashcards();
    const stats: TopicDifficultyStats[] = [];
    
    for (const topic of this.monitoredTopics) {
      const topicFlashcards = allFlashcards.filter(flashcard => 
        flashcard.topics.includes(topic.topicName)
      );
      
      const easy = topicFlashcards.filter(f => f.difficulty === 'easy').length;
      const moderate = topicFlashcards.filter(f => f.difficulty === 'moderate').length;
      const challenging = topicFlashcards.filter(f => f.difficulty === 'challenging').length;
      const unrated = topicFlashcards.filter(f => !f.difficulty).length;
      
      stats.push({
        topicName: topic.topicName,
        hashtag: topic.hashtag,
        easy,
        moderate,
        challenging,
        unrated,
        total: topicFlashcards.length
      });
    }
    
    return stats;
  }

  /**
   * Get unique flashcard count (deduplicated) and per-topic breakdown
   */
  async getFlashcardStats(): Promise<{
    totalUnique: number;
    topicStats: TopicStats[];
  }> {
    const allFlashcards = await this.getAllFlashcards();
    
    // Create a set to track unique questions (for deduplication)
    const uniqueQuestions = new Set<string>();
    
    // Track per-topic counts
    const topicCounts = new Map<string, number>();
    
    for (const flashcard of allFlashcards) {
      // Add to unique questions set
      uniqueQuestions.add(flashcard.question);
      
      // Count for each topic this flashcard belongs to
      for (const topic of flashcard.topics) {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      }
    }
    
    // Build topic stats
    const topicStats: TopicStats[] = [];
    for (const topic of this.monitoredTopics) {
      const count = topicCounts.get(topic.topicName) || 0;
      topicStats.push({
        topicName: topic.topicName,
        hashtag: topic.hashtag,
        count: count
      });
    }
    
    return {
      totalUnique: uniqueQuestions.size,
      topicStats: topicStats
    };
  }

  /**
   * Get all quizzes from all quiz files in the vault
   */
  async getAllQuizzes(): Promise<Quiz[]> {
    const files = await this.findFlashcardFiles(); // Reuse the same file discovery logic
    const allQuizzes: Quiz[] = [];

    for (const file of files) {
      const content = await this.app.vault.read(file);
      const quizzes = this.parseQuizzesFromContent(content, file);
      allQuizzes.push(...quizzes);
    }

    return allQuizzes;
  }

  /**
   * Get unique quiz count (deduplicated) and per-topic breakdown
   */
  async getQuizStats(): Promise<{
    totalUnique: number;
    topicStats: TopicStats[];
  }> {
    const allQuizzes = await this.getAllQuizzes();
    
    // Create a set to track unique questions (for deduplication)
    const uniqueQuestions = new Set<string>();
    
    // Track per-topic counts
    const topicCounts = new Map<string, number>();
    
    for (const quiz of allQuizzes) {
      // Add to unique questions set
      uniqueQuestions.add(quiz.question);
      
      // Count for each topic this quiz belongs to
      for (const topic of quiz.topics) {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      }
    }
    
    // Build topic stats
    const topicStats: TopicStats[] = [];
    for (const topic of this.monitoredTopics) {
      const count = topicCounts.get(topic.topicName) || 0;
      topicStats.push({
        topicName: topic.topicName,
        hashtag: topic.hashtag,
        count: count
      });
    }
    
    return {
      totalUnique: uniqueQuestions.size,
      topicStats: topicStats
    };
  }

  /**
   * Get the first flashcard from a shuffled sequence (for starting a new session)
   */
  async getRandomFlashcard(): Promise<Flashcard | null> {
    const sequence = await this.getShuffledSequence(null, 'all');
    
    if (sequence.cards.length === 0) {
      return null;
    }

    // Start at index 0 and return first card
    sequence.currentIndex = 0;
    return sequence.cards[0];
  }

  /**
   * Get the next flashcard from the shuffled sequence
   */
  async getNextRandomFlashcard(currentFlashcard?: Flashcard): Promise<Flashcard | null> {
    const sequence = await this.getShuffledSequence(null, 'all');
    
    if (sequence.cards.length === 0) {
      return null;
    }

    if (sequence.cards.length === 1) {
      // Only one card - if we've already seen it, we're done
      if (sequence.currentIndex >= 0) {
        return null; // Already shown the only card
      }
      return sequence.cards[0];
    }

    // Move to next card in sequence
    sequence.currentIndex = sequence.currentIndex + 1;
    
    // If we've gone through all cards, we're done (no more cards available)
    if (sequence.currentIndex >= sequence.cards.length) {
      return null;
    }
    
    return sequence.cards[sequence.currentIndex];
  }

  /**
   * Get the first flashcard from a shuffled topic sequence
   */
  async getRandomFlashcardByTopic(topicName: string): Promise<Flashcard | null> {
    const sequence = await this.getShuffledSequence(topicName, 'all');
    
    if (sequence.cards.length === 0) {
      return null;
    }

    // Start at index 0 and return first card
    sequence.currentIndex = 0;
    return sequence.cards[0];
  }

  /**
   * Get the next flashcard from a shuffled topic sequence
   */
  async getNextRandomFlashcardByTopic(topicName: string, currentFlashcard?: Flashcard): Promise<Flashcard | null> {
    const sequence = await this.getShuffledSequence(topicName, 'all');
    
    if (sequence.cards.length === 0) {
      return null;
    }

    if (sequence.cards.length === 1) {
      // Only one card - if we've already seen it, we're done
      if (sequence.currentIndex >= 0) {
        return null; // Already shown the only card
      }
      return sequence.cards[0];
    }

    // Move to next card in sequence
    sequence.currentIndex = sequence.currentIndex + 1;
    
    // If we've gone through all cards, we're done (no more cards available)
    if (sequence.currentIndex >= sequence.cards.length) {
      return null;
    }
    
    return sequence.cards[sequence.currentIndex];
  }

  /**
   * Get the first flashcard from a shuffled topic/difficulty sequence
   */
  async getRandomFlashcardByTopicAndDifficulty(topicName: string, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all'): Promise<Flashcard | null> {
    const sequence = await this.getShuffledSequence(topicName, difficulty);
    
    if (sequence.cards.length === 0) {
      return null;
    }

    // Start at index 0 and return first card
    sequence.currentIndex = 0;
    return sequence.cards[0];
  }

  /**
   * Get the next flashcard from a shuffled topic/difficulty sequence
   */
  async getNextRandomFlashcardByTopicAndDifficulty(topicName: string, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all', currentFlashcard?: Flashcard): Promise<Flashcard | null> {
    const sequence = await this.getShuffledSequence(topicName, difficulty);
    
    if (sequence.cards.length === 0) {
      return null;
    }

    if (sequence.cards.length === 1) {
      // Only one card - if we've already seen it, we're done
      if (sequence.currentIndex >= 0) {
        return null; // Already shown the only card
      }
      return sequence.cards[0];
    }

    // Move to next card in sequence
    sequence.currentIndex = sequence.currentIndex + 1;
    
    // If we've gone through all cards, we're done (no more cards available)
    if (sequence.currentIndex >= sequence.cards.length) {
      return null;
    }
    
    return sequence.cards[sequence.currentIndex];
  }

  /**
   * Parse quizzes from content using STRICT format:
   * 
   * (empty line)
   * Single line question
   * ?
   * Single line correct answer
   * :
   * Single line wrong answer 1
   * :
   * Single line wrong answer 2
   * :
   * Single line wrong answer 3
   * (empty line)
   */
  parseQuizzesFromContent(content: string, file: TFile): Quiz[] {
    const quizzes: Quiz[] = [];
    
    // Get which topics this file belongs to
    const fileTopics = this.getFileTopics(content);
    
    // If the file doesn't belong to any monitored topics, return empty
    if (fileTopics.length === 0) {
      return quizzes;
    }
    
    // Remove all configured hashtags and QZ comments for cleaner parsing
    let cleanContent = content;
    this.monitoredTopics.forEach(topic => {
      cleanContent = cleanContent.replace(new RegExp(topic.hashtag.replace('#', '\\#'), 'g'), '');
    });
    // Remove QZ difficulty rating comments
    cleanContent = cleanContent.replace(/<!--QZ:.*?-->/g, '');
    cleanContent = cleanContent.trim();
    
    // Split content into lines
    const lines = cleanContent.split('\n');
    
    let i = 0;
    while (i < lines.length - 1) {
      // Skip consecutive empty lines and look for content
      if (this.isEmptyLine(lines[i])) {
        // Skip all consecutive empty lines
        let nextContentIndex = i + 1;
        while (nextContentIndex < lines.length && this.isEmptyLine(lines[nextContentIndex])) {
          nextContentIndex++;
        }
        
        if (nextContentIndex < lines.length) {
          // Parse bracket format starting from the first non-empty line
          const bracketQuiz = this.parseBracketQuiz(lines, nextContentIndex);
          if (bracketQuiz) {
            quizzes.push({
              ...bracketQuiz,
              file: file,
              topics: fileTopics
            });
            // Move index to after this quiz
            i = bracketQuiz.endIndex;
            continue;
          }
        }
      }
      i++;
    }
    
    return quizzes;
  }

  /**
   * Parse a quiz with STRICT format
   * Expects exactly: question line, ? line, correct answer line, : line, wrong1 line, : line, wrong2 line, : line, wrong3 line
   */
  private parseStrictQuiz(lines: string[], startIndex: number): {
    question: string;
    correctAnswer: string;
    wrongAnswers: string[];
    endIndex: number;
  } | null {
    // Need at least 9 lines from startIndex: question, ?, correct, :, wrong1, :, wrong2, :, wrong3
    if (startIndex + 8 >= lines.length) return null;

    const questionLine = lines[startIndex].trim();
    const questionSeparator = lines[startIndex + 1].trim();
    const correctAnswerLine = lines[startIndex + 2].trim();
    const separator1 = lines[startIndex + 3].trim();
    const wrongAnswer1 = lines[startIndex + 4].trim();
    const separator2 = lines[startIndex + 5].trim();
    const wrongAnswer2 = lines[startIndex + 6].trim();
    const separator3 = lines[startIndex + 7].trim();
    const wrongAnswer3 = lines[startIndex + 8].trim();

    // Validate the strict pattern:
    // 1. Question line must not be empty
    // 2. Question separator must be exactly "?"
    // 3. Correct answer line must not be empty
    // 4. All three separators must be exactly ":"
    // 5. All three wrong answers must not be empty
    if (!questionLine || 
        questionSeparator !== '?' || 
        !correctAnswerLine ||
        separator1 !== ':' ||
        !wrongAnswer1 ||
        separator2 !== ':' ||
        !wrongAnswer2 ||
        separator3 !== ':' ||
        !wrongAnswer3) {
      return null;
    }

    // Check that the line after the last wrong answer is empty (or end of file)
    // QZ comments are removed during content cleaning, so we only need to check for empty lines
    const endIndex = startIndex + 9;
    if (endIndex < lines.length && !this.isEmptyLine(lines[endIndex])) {
      return null; // Next line should be empty to complete the pattern
    }

    return {
      question: questionLine,
      correctAnswer: correctAnswerLine,
      wrongAnswers: [wrongAnswer1, wrongAnswer2, wrongAnswer3],
      endIndex: endIndex
    };
  }

  /**
   * Parse a quiz with new bracket format: [Q]question, [A]correct answer, and [B]wrong answers
   * [Q] must be the first line of the block, [A] and [B] can follow in any order
   * Must have exactly 1 [Q], 1 [A], and 3 [B] lines to be a valid quiz
   */
  private parseBracketQuiz(lines: string[], startIndex: number): {
    question: string;
    correctAnswer: string;
    wrongAnswers: string[];
    endIndex: number;
  } | null {
    // First line must be [Q]
    const firstLine = lines[startIndex].trim();
    if (!firstLine.startsWith('[Q]')) {
      return null;
    }
    
    const question = firstLine.substring(3).trim();
    if (!question) {
      return null;
    }
    
    let correctAnswer = '';
    const wrongAnswers: string[] = [];
    let endIndex = startIndex + 1;
    
    // Find the end of this block and look for [A] and [B] lines
    while (endIndex < lines.length && !this.isEmptyLine(lines[endIndex])) {
      const line = lines[endIndex].trim();
      
      // Check for correct answer line [A]
      if (line.startsWith('[A]')) {
        correctAnswer = line.substring(3).trim();
      }
      // Check for wrong answer lines [B]
      else if (line.startsWith('[B]')) {
        wrongAnswers.push(line.substring(3).trim());
      }
      // Skip other content
      
      endIndex++;
    }
    
    // Must have exactly 1 correct answer and 3 wrong answers to be a valid quiz
    if (!correctAnswer || wrongAnswers.length !== 3) {
      return null;
    }
    
    // Ensure all wrong answers are non-empty
    if (wrongAnswers.some(answer => !answer)) {
      return null;
    }
    
    return {
      question,
      correctAnswer,
      wrongAnswers,
      endIndex
    };
  }

  /**
   * Save difficulty rating for a flashcard by adding or updating a QZ comment
   */
  async saveDifficultyRating(flashcard: Flashcard, difficulty: string): Promise<void> {
    const file = flashcard.file;
    const content = await this.app.vault.read(file);
    const lines = content.split('\n');
    
    // Find the question line - look for [Q] prefix in new bracket format
    let questionLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Check for new bracket format: [Q]question
      if (line.startsWith('[Q]') && line.substring(3).trim() === flashcard.question) {
        questionLineIndex = i;
        break;
      }
    }
    
    if (questionLineIndex === -1) return; // Question not found
    
    // Create the rating comment
    const timestamp = new Date().toISOString();
    const ratingComment = `<!--QZ:${timestamp},${difficulty}-->`;
    
    // Look for existing QZ comment before the question line
    let existingCommentIndex = -1;
    for (let i = questionLineIndex - 1; i >= 0; i--) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        continue;
      }
      
      // Check if this line is a QZ comment
      if (line.startsWith('<!--QZ:') && line.endsWith('-->')) {
        existingCommentIndex = i;
        break;
      }
      
      // If we hit any other non-empty line, stop searching
      break;
    }
    
    if (existingCommentIndex !== -1) {
      // Replace existing comment
      lines[existingCommentIndex] = ratingComment;
    } else {
      // Add new comment before the question line
      lines.splice(questionLineIndex, 0, ratingComment);
    }
    
    // Write the updated content back to the file
    const updatedContent = lines.join('\n');
    await this.app.vault.modify(file, updatedContent);
  }
} 