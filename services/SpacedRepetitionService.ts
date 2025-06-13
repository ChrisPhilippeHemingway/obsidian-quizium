import { FlashcardService, Flashcard } from '../FlashcardService';
import { MonitoredTopic } from '../main';
import { SpacedRepetitionStats } from '../views/types';

/**
 * Service class that handles spaced repetition functionality for flashcards.
 * This service manages the logic for determining which flashcards should be shown
 * based on their difficulty ratings and the time intervals since they were last reviewed.
 */
export class SpacedRepetitionService {
  constructor(
    private flashcardService: FlashcardService,
    private monitoredTopics: MonitoredTopic[]
  ) {}

  /**
   * Retrieves flashcards that are due for spaced repetition review.
   * This method applies spaced repetition logic based on difficulty ratings and time intervals.
   * 
   * @param topicName - The topic to filter by ('all', null, or specific topic name)
   * @returns Promise resolving to an array of flashcards due for review
   */
  async getSpacedRepetitionFlashcards(topicName: string | null): Promise<Flashcard[]> {
    if (!this.flashcardService) {
      return [];
    }

    const settings = this.getSpacedRepetitionSettings();
    const dateThresholds = this.calculateDateThresholds(settings);
    const allFlashcards = await this.loadFlashcardsForTopic(topicName);
    
    return this.filterFlashcardsBySpacedRepetition(allFlashcards, dateThresholds, settings);
  }

  /**
   * Calculates comprehensive statistics for spaced repetition across all topics.
   * This includes counts by difficulty level and per-topic breakdowns.
   * 
   * @returns Promise resolving to spaced repetition statistics
   */
  async calculateSpacedRepetitionStats(): Promise<SpacedRepetitionStats> {
    if (!this.flashcardService) {
      return this.getEmptyStats();
    }

    // Calculate stats for all topics combined
    const allStats = await this.calculateStatsForAllTopics();
    
    // Calculate stats for each individual topic
    const topicStats = await this.calculateStatsForIndividualTopics();

    return {
      ...allStats,
      topics: topicStats
    };
  }

  /**
   * Starts a spaced repetition session for the specified topic.
   * This method prepares a shuffled sequence of cards due for review.
   * 
   * @param topicName - The topic to start spaced repetition for
   * @returns Promise resolving to session initialization result
   */
  async startSpacedRepetition(topicName: string | null): Promise<{
    success: boolean;
    error?: string;
    firstCard?: Flashcard;
    totalCards?: number;
    shuffledCards?: Flashcard[];
  }> {
    if (!this.flashcardService) {
      return { success: false, error: 'FlashcardService not available' };
    }

    try {
      const spacedCards = await this.getSpacedRepetitionFlashcards(topicName);
      
      if (spacedCards.length === 0) {
        return this.createNoCardsAvailableResult(topicName);
      }

      return this.initializeSpacedRepetitionSession(spacedCards, topicName);
    } catch (error) {
      return {
        success: false,
        error: 'Error starting spaced repetition: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }

  /**
   * Gets spaced repetition settings from the plugin or returns defaults.
   * 
   * @returns Spaced repetition settings object
   */
  private getSpacedRepetitionSettings() {
    const settings = (this.flashcardService as any).plugin?.settings?.spacedRepetition;
    
    if (!settings) {
      // Return default settings if plugin settings are not available
      return {
        challengingDays: 0,
        moderateDays: 2,
        easyDays: 4
      };
    }
    
    return settings;
  }

  /**
   * Calculates date thresholds for each difficulty level based on settings.
   * 
   * @param settings - The spaced repetition settings
   * @returns Object containing date thresholds for each difficulty
   */
  private calculateDateThresholds(settings: { challengingDays: number; moderateDays: number; easyDays: number }) {
    const now = new Date();
    
    return {
      challenging: new Date(now.getTime() - settings.challengingDays * 24 * 60 * 60 * 1000),
      moderate: new Date(now.getTime() - settings.moderateDays * 24 * 60 * 60 * 1000),
      easy: new Date(now.getTime() - settings.easyDays * 24 * 60 * 60 * 1000)
    };
  }

  /**
   * Loads flashcards for the specified topic.
   * 
   * @param topicName - The topic to load flashcards for
   * @returns Promise resolving to array of flashcards
   */
  private async loadFlashcardsForTopic(topicName: string | null): Promise<Flashcard[]> {
    if (topicName === 'all' || topicName === null) {
      return await this.flashcardService.getAllFlashcards();
    } else {
      return await this.flashcardService.getFlashcardsByTopic(topicName);
    }
  }

  /**
   * Filters flashcards based on spaced repetition logic.
   * 
   * @param flashcards - All flashcards to filter
   * @param dateThresholds - Date thresholds for each difficulty
   * @param settings - Spaced repetition settings
   * @returns Filtered array of flashcards due for review
   */
  private filterFlashcardsBySpacedRepetition(
    flashcards: Flashcard[], 
    dateThresholds: { challenging: Date; moderate: Date; easy: Date },
    settings: { challengingDays: number; moderateDays: number; easyDays: number }
  ): Flashcard[] {
    console.log('SpacedRepetition: Filtering flashcards', {
      totalCards: flashcards.length,
      settings,
      dateThresholds: {
        challenging: dateThresholds.challenging.toISOString(),
        moderate: dateThresholds.moderate.toISOString(),
        easy: dateThresholds.easy.toISOString()
      }
    });

    const filteredCards = flashcards.filter(card => {
      // Include unrated cards (no difficulty or lastRated)
      if (!card.difficulty || !card.lastRated) {
        console.log('SpacedRepetition: Including unrated card', { question: card.question.substring(0, 50) });
        return true;
      }
      
      const lastRatedTime = card.lastRated.getTime();
      const now = new Date().getTime();
      
      // Apply spaced repetition logic based on difficulty
      switch (card.difficulty) {
        case 'challenging':
          const challengingResult = settings.challengingDays === 0 || card.lastRated <= dateThresholds.challenging;
          console.log('SpacedRepetition: Challenging card', {
            question: card.question.substring(0, 50),
            lastRated: card.lastRated.toISOString(),
            threshold: dateThresholds.challenging.toISOString(),
            daysSinceRated: (now - lastRatedTime) / (24 * 60 * 60 * 1000),
            included: challengingResult
          });
          return challengingResult;
        case 'moderate':
          const moderateResult = card.lastRated <= dateThresholds.moderate;
          console.log('SpacedRepetition: Moderate card', {
            question: card.question.substring(0, 50),
            lastRated: card.lastRated.toISOString(),
            threshold: dateThresholds.moderate.toISOString(),
            daysSinceRated: (now - lastRatedTime) / (24 * 60 * 60 * 1000),
            included: moderateResult
          });
          return moderateResult;
        case 'easy':
          const easyResult = card.lastRated <= dateThresholds.easy;
          console.log('SpacedRepetition: Easy card', {
            question: card.question.substring(0, 50),
            lastRated: card.lastRated.toISOString(),
            threshold: dateThresholds.easy.toISOString(),
            daysSinceRated: (now - lastRatedTime) / (24 * 60 * 60 * 1000),
            included: easyResult
          });
          return easyResult;
        default:
          return false;
      }
    });

    console.log('SpacedRepetition: Filtering complete', {
      originalCount: flashcards.length,
      filteredCount: filteredCards.length,
      breakdown: {
        challenging: filteredCards.filter(c => c.difficulty === 'challenging').length,
        moderate: filteredCards.filter(c => c.difficulty === 'moderate').length,
        easy: filteredCards.filter(c => c.difficulty === 'easy').length,
        unrated: filteredCards.filter(c => !c.difficulty || !c.lastRated).length
      }
    });

    return filteredCards;
  }

  /**
   * Returns empty statistics structure.
   * 
   * @returns Empty SpacedRepetitionStats object
   */
  private getEmptyStats(): SpacedRepetitionStats {
    return {
      total: 0,
      challenging: 0,
      moderate: 0,
      easy: 0,
      unrated: 0,
      topics: []
    };
  }

  /**
   * Calculates spaced repetition statistics for all topics combined.
   * 
   * @returns Promise resolving to combined statistics
   */
  private async calculateStatsForAllTopics() {
    const allSpacedCards = await this.getSpacedRepetitionFlashcards('all');
    
    return {
      easy: allSpacedCards.filter(c => c.difficulty === 'easy').length,
      moderate: allSpacedCards.filter(c => c.difficulty === 'moderate').length,
      challenging: allSpacedCards.filter(c => c.difficulty === 'challenging').length,
      unrated: allSpacedCards.filter(c => !c.difficulty || !c.lastRated).length,
      total: allSpacedCards.length
    };
  }

  /**
   * Calculates spaced repetition statistics for each individual topic.
   * 
   * @returns Promise resolving to array of per-topic statistics
   */
  private async calculateStatsForIndividualTopics(): Promise<SpacedRepetitionStats[]> {
    const topicStats: SpacedRepetitionStats[] = [];
    
    for (const topic of this.monitoredTopics) {
      const topicSpacedCards = await this.getSpacedRepetitionFlashcards(topic.topicName);
      
      const topicStat = {
        topic: topic.topicName,
        easy: topicSpacedCards.filter(c => c.difficulty === 'easy').length,
        moderate: topicSpacedCards.filter(c => c.difficulty === 'moderate').length,
        challenging: topicSpacedCards.filter(c => c.difficulty === 'challenging').length,
        unrated: topicSpacedCards.filter(c => !c.difficulty || !c.lastRated).length,
        total: topicSpacedCards.length
      };
      
      topicStats.push(topicStat);
    }
    
    return topicStats;
  }

  /**
   * Creates a result object for when no cards are available for spaced repetition.
   * 
   * @param topicName - The topic that was requested
   * @returns Result object with appropriate error message
   */
  private createNoCardsAvailableResult(topicName: string | null) {
    const topicText = topicName === 'all' || topicName === null ? 'all topics' : `topic "${topicName}"`;
    return { 
      success: false, 
      error: `No spaced repetition flashcards available for ${topicText}. Try rating some cards first!` 
    };
  }

  /**
   * Initializes a spaced repetition session with the provided cards.
   * 
   * @param spacedCards - The cards due for spaced repetition
   * @param topicName - The topic name for the session
   * @returns Session initialization result
   */
  private initializeSpacedRepetitionSession(spacedCards: Flashcard[], topicName: string | null) {
    // Create a special sequence key for spaced repetition
    const sequenceKey = `spaced-${topicName || 'all'}`;
    
    // Shuffle the cards for variety
    const shuffledCards = spacedCards.sort(() => Math.random() - 0.5);
    
    // Store the spaced repetition cards as a custom sequence in the service
    (this.flashcardService as any)._spacedRepetitionSequence = {
      [sequenceKey]: {
        cards: shuffledCards,
        currentIndex: 0
      }
    };
    
    return {
      success: true,
      firstCard: shuffledCards[0],
      totalCards: shuffledCards.length,
      shuffledCards
    };
  }
} 