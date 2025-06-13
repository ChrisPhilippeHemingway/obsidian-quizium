import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { FlashcardService, Flashcard, Quiz, TopicStats, TopicDifficultyStats } from './FlashcardService';
import { MonitoredTopic } from './main';
import QuiziumPlugin from './main';
import { MenuView } from './views/core/MenuView';
import { QuizHistoryView } from './views/quizzes/QuizHistoryView';
import { QuizView } from './views/quizzes/QuizView';
import { TopicSelectionView } from './views/flashcards/TopicSelectionView';
import { SpacedRepetitionView } from './views/spaced-repetition/SpacedRepetitionView';
import { QuizSessionView } from './views/quizzes/QuizSessionView';
import { TopicBreakdownView } from './views/core/TopicBreakdownView';
import { ModalButtonsView } from './views/core/ModalButtonsView';
import { FlashcardView } from './views/flashcards/FlashcardView';
import { ViewMode, SpacedRepetitionStats, QuizHistoryEntry } from './views/types';
import { SpacedRepetitionService } from './services/SpacedRepetitionService';
import { DataManagementService } from './services/DataManagementService';
import { modalStyles } from './modal-styles';

interface QuiziumModalViewProps {
  onClose: () => void;
  monitoredTopics: MonitoredTopic[];
  plugin: QuiziumPlugin;
}

/**
 * Main modal component for the Quizium plugin that handles flashcards, quizzes, and spaced repetition.
 * This component serves as the central hub for all learning activities and manages the overall state
 * and navigation between different views.
 * 
 * @param onClose - Function to close the modal
 * @param monitoredTopics - Array of topics being monitored by the plugin
 * @param plugin - Reference to the main plugin instance
 */
export const QuiziumModalView = ({ onClose, monitoredTopics, plugin }: QuiziumModalViewProps) => {

  const app = useApp();
  
  // Service instances
  const [flashcardService, setFlashcardService] = useState<FlashcardService | null>(null);
  const [spacedRepetitionService, setSpacedRepetitionService] = useState<SpacedRepetitionService | null>(null);
  const [dataManagementService, setDataManagementService] = useState<DataManagementService | null>(null);
  
  // Flashcard state
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [flashcardHistory, setFlashcardHistory] = useState<Flashcard[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [difficultyRated, setDifficultyRated] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [showTopicBreakdown, setShowTopicBreakdown] = useState<boolean>(false);
  const [showSpacedRepetitionHelp, setShowSpacedRepetitionHelp] = useState(false);
  
  // Statistics state
  const [totalFlashcards, setTotalFlashcards] = useState<number>(0);
  const [totalQuizzes, setTotalQuizzes] = useState<number>(0);
  const [topicStats, setTopicStats] = useState<TopicStats[]>([]);
  const [quizTopicStats, setQuizTopicStats] = useState<TopicStats[]>([]);
  const [topicDifficultyStats, setTopicDifficultyStats] = useState<TopicDifficultyStats[]>([]);
  const [spacedRepetitionStats, setSpacedRepetitionStats] = useState<SpacedRepetitionStats>({
    total: 0,
    challenging: 0,
    moderate: 0,
    easy: 0,
    unrated: 0,
    topics: []
  });
  
  // Selection state
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'moderate' | 'challenging' | 'unrated' | 'all'>('all');
  const [totalAvailableForTopic, setTotalAvailableForTopic] = useState<number>(0);
  const [isSpacedRepetitionMode, setIsSpacedRepetitionMode] = useState(false);
  
  // Reset state
  const [isResetting, setIsResetting] = useState(false);
  const [isResettingQuizResults, setIsResettingQuizResults] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryEntry[]>([]);
  
  // Quiz state
  const [quizInProgress, setQuizInProgress] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Quiz[]>([]);
  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [quizTopic, setQuizTopic] = useState<string | null>(null);
  const [quizSessionDone, setQuizSessionDone] = useState(false);
  const [quizShuffledAnswers, setQuizShuffledAnswers] = useState<string[]>([]);

  // Component initialization
  useEffect(() => {
    // Component mounted - placeholder for any initialization logic
  }, []);

  /**
   * Handles view mode changes and loads appropriate data for each view.
   * This effect ensures that the correct data is loaded when switching between different views.
   */
  useEffect(() => {
    if (viewMode === 'spacedRepetition') {
      loadSpacedRepetitionStats();
    } else if (viewMode === 'quizHistory') {
      loadQuizHistory();
    }
  }, [viewMode]);

  /**
   * Records quiz results when a quiz session is completed.
   * This effect automatically saves quiz progress to the plugin's data store.
   */
  useEffect(() => {
    recordQuizProgress();
  }, [quizSessionDone, quizResults, quizTopic, plugin]);

  /**
   * Sets up click-outside handlers for modal overlays.
   * Manages closing of topic breakdown and spaced repetition help modals.
   */
  useEffect(() => {
    setupClickOutsideHandlers();
  }, [showTopicBreakdown, showSpacedRepetitionHelp]);

  /**
   * Initializes all services when the app and dependencies are available.
   * Creates instances of FlashcardService, SpacedRepetitionService, and DataManagementService.
   */
  useEffect(() => {
    initializeServices();
  }, [app, monitoredTopics, plugin]);

  /**
   * Updates spaced repetition statistics when the service or view mode changes.
   */
  useEffect(() => {
    if (spacedRepetitionService && viewMode === 'spacedRepetition') {
      calculateSpacedRepetitionStats();
    }
  }, [spacedRepetitionService, topicDifficultyStats, viewMode]);

  /**
   * Additional effect for loading spaced repetition stats when entering that view mode.
   */
  useEffect(() => {
    if (viewMode === 'spacedRepetition') {
      loadSpacedRepetitionStats();
    }
  }, [viewMode]);

  /**
   * Initializes all service instances and loads initial flashcard statistics.
   * This is the main initialization function that sets up the entire application state.
   */
  const initializeServices = async () => {
    if (!app) return;
    
    try {
      const service = new FlashcardService(app, monitoredTopics, plugin);
      setFlashcardService(service);
      
      const spacedService = new SpacedRepetitionService(service, monitoredTopics);
      setSpacedRepetitionService(spacedService);
      
      const dataService = new DataManagementService(app, service, plugin);
      setDataManagementService(dataService);
      
      await loadFlashcardStats(service);
    } catch (error) {
      console.error('Error initializing services:', error);
      setError('Failed to initialize application services');
    }
  };

  /**
   * Loads comprehensive flashcard and quiz statistics from the service.
   * This function fetches all necessary data for displaying statistics across the application.
   * 
   * @param service - The FlashcardService instance to use for loading stats
   */
  const loadFlashcardStats = async (service: FlashcardService) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all statistics in parallel for better performance
      const [stats, difficultyStats, quizStats] = await Promise.all([
        service.getFlashcardStats(),
        service.getTopicDifficultyStats(),
        service.getQuizStats()
      ]);
      
      // Update state with loaded statistics
      setTotalFlashcards(stats.totalUnique);
      setTotalQuizzes(quizStats.totalUnique);
      setTopicStats(stats.topicStats);
      setQuizTopicStats(quizStats.topicStats);
      setTopicDifficultyStats(difficultyStats);
      
      // Check if any content was found and show appropriate error message
      if (stats.totalUnique === 0 && quizStats.totalUnique === 0) {
        const tagsText = monitoredTopics.length > 0 
          ? monitoredTopics.map(t => t.hashtag).join(', ') 
          : 'monitored hashtags';
        setError(`No flashcards or quizzes found in your vault. Create a note with one of these tags: ${tagsText} and add questions with the exact format shown below.`);
      }
    } catch (err) {
      setError('Error loading flashcards: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Records quiz progress when a session is completed.
   * Automatically saves the quiz results to the plugin's progress tracking system.
   */
  const recordQuizProgress = async () => {
    if (!quizSessionDone || quizResults.total === 0 || !plugin) return;
    
    try {
      const scorePercentage = Math.round((quizResults.correct / quizResults.total) * 100);
      const topicForRecord = quizTopic || 'All Topics';
      await plugin.recordQuizResult(topicForRecord, scorePercentage);
    } catch (error) {
      console.error('Error recording quiz result:', error);
    }
  };

  /**
   * Sets up click-outside event handlers for modal overlays.
   * Manages the closing behavior of topic breakdown and spaced repetition help modals.
   */
  const setupClickOutsideHandlers = () => {
    // Handler for topic breakdown modal
    const handleTopicBreakdownClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showTopicBreakdown && !target.closest('.topic-breakdown-container')) {
        setShowTopicBreakdown(false);
      }
    };

    // Handler for spaced repetition help modal
    const handleSpacedRepetitionClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showSpacedRepetitionHelp && target === event.target) {
        setShowSpacedRepetitionHelp(false);
      }
    };

    // Add event listeners based on which modals are open
    if (showTopicBreakdown) {
      document.addEventListener('mousedown', handleTopicBreakdownClickOutside);
    }
    
    if (showSpacedRepetitionHelp) {
      document.addEventListener('mousedown', handleSpacedRepetitionClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleTopicBreakdownClickOutside);
      document.removeEventListener('mousedown', handleSpacedRepetitionClickOutside);
    };
  };

  /**
   * Loads spaced repetition statistics asynchronously.
   * This function is used when entering the spaced repetition view to ensure fresh data.
   */
  const loadSpacedRepetitionStats = async () => {
    try {
      const stats = await calculateSpacedRepetitionStats();
      setSpacedRepetitionStats(stats);
    } catch (error) {
      console.error('Error loading spaced repetition stats:', error);
    }
  };

  /**
   * Refreshes statistics after difficulty rating changes.
   * Updates all relevant statistics without disrupting the current flashcard sequence.
   * This ensures the UI reflects the latest data after a user rates a flashcard.
   */
  const refreshStatsAfterRating = async () => {
    if (!flashcardService) return;
    
    try {
      // Load all statistics in parallel for better performance
      const [stats, difficultyStats, quizStats] = await Promise.all([
        flashcardService.getFlashcardStats(),
        flashcardService.getTopicDifficultyStats(),
        flashcardService.getQuizStats()
      ]);
      
      // Update state with refreshed statistics
      setTotalFlashcards(stats.totalUnique);
      setTotalQuizzes(quizStats.totalUnique);
      setTopicStats(stats.topicStats);
      setQuizTopicStats(quizStats.topicStats);
      setTopicDifficultyStats(difficultyStats);
      
      // Also refresh spaced repetition stats if we're in relevant modes
      if (viewMode === 'spacedRepetition' || viewMode === 'flashcards') {
        const spacedStats = await calculateSpacedRepetitionStats();
        setSpacedRepetitionStats(spacedStats);
      }
    } catch (err) {
      console.error('Error refreshing stats after rating:', err);
      // Don't show error to user as this is a background operation
    }
  };

  /**
   * Navigates to the topic selection view for flashcards.
   * Validates that topics are configured before allowing navigation.
   */
  const showTopicSelection = () => {
    if (monitoredTopics.length === 0) {
      setError('No topics configured. Please add topics in the plugin settings first.');
      return;
    }
    setViewMode('topicSelection');
  };

  /**
   * Navigates to the spaced repetition view.
   * Validates that topics are configured before allowing navigation.
   */
  const showSpacedRepetition = () => {
    if (monitoredTopics.length === 0) {
      setError('No topics configured. Please add topics in the plugin settings first.');
      return;
    }
    setViewMode('spacedRepetition');
  };

  /**
   * Starts a flashcard session with the specified topic and difficulty filters.
   * This function initializes a new flashcard session, resets sequences, and loads the first card.
   * 
   * @param topic - The topic to filter by ('all', null, or specific topic name)
   * @param difficulty - The difficulty level to filter by
   */
  const startFlashcards = async (topic: string | null = null, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all' = 'all') => {
    if (!flashcardService) return;

    try {
      setLoading(true);
      setError(null);
      
      // Reset sequences to ensure fresh randomization
      await resetFlashcardSequences(topic, difficulty);
      
      // Load the first flashcard and session data
      const sessionData = await initializeFlashcardSession(topic, difficulty);
      
      if (sessionData.flashcard) {
        setupFlashcardSession(sessionData, topic, difficulty);
      } else {
        showNoFlashcardsError(topic, difficulty);
      }
    } catch (err) {
      setError('Error loading flashcard: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resets flashcard sequences for the specified topic and difficulty.
   * Ensures fresh randomization when starting a new session.
   * 
   * @param topic - The topic to reset sequences for
   * @param difficulty - The difficulty level to reset sequences for
   */
  const resetFlashcardSequences = async (topic: string | null, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all') => {
    const topicKey = topic || 'all';
    flashcardService!.resetSequenceForTopic(topicKey, difficulty);
    
    // Also reset 'all' sequence if we're working with a specific topic
    if (topic !== 'all') {
      flashcardService!.resetSequenceForTopic('all', difficulty);
    }
  };

  /**
   * Initializes a flashcard session by loading the first card and counting available cards.
   * 
   * @param topic - The topic to load flashcards for
   * @param difficulty - The difficulty level to filter by
   * @returns Session data including the first flashcard and total count
   */
  const initializeFlashcardSession = async (topic: string | null, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all') => {
    const topicKey = topic || 'all';
    
    // Load first flashcard and total count in parallel
    const [flashcard, topicFlashcards] = await Promise.all([
      flashcardService!.getRandomFlashcardByTopicAndDifficulty(topicKey, difficulty),
      flashcardService!.getFlashcardsByTopicAndDifficulty(topicKey, difficulty)
    ]);
    
    return {
      flashcard,
      availableCount: topicFlashcards.length
    };
  };

  /**
   * Sets up the flashcard session state with the loaded data.
   * 
   * @param sessionData - The session data including flashcard and count
   * @param topic - The selected topic
   * @param difficulty - The selected difficulty
   */
  const setupFlashcardSession = (sessionData: { flashcard: Flashcard | null; availableCount: number }, topic: string | null, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all') => {
    if (!sessionData.flashcard) return;
    
    setCurrentFlashcard(sessionData.flashcard);
    setFlashcardHistory([sessionData.flashcard]);
    setCurrentHistoryIndex(0);
    setSelectedTopic(topic);
    setSelectedDifficulty(difficulty);
    setTotalAvailableForTopic(sessionData.availableCount);
    setViewMode('flashcards');
    
    // Reset UI state for new session
    setAnswerRevealed(false);
    setHintRevealed(false);
    setDifficultyRated(false);
    setShowCompletionMessage(false);
  };

  /**
   * Shows an appropriate error message when no flashcards are available.
   * 
   * @param topic - The topic that was searched
   * @param difficulty - The difficulty that was searched
   */
  const showNoFlashcardsError = (topic: string | null, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all') => {
    const topicText = topic === 'all' || topic === null ? 'all topics' : `topic "${topic}"`;
    const difficultyText = difficulty === 'all' ? '' : ` (${difficulty} difficulty)`;
    setError(`No flashcards available for ${topicText}${difficultyText}.`);
  };

  const startSpacedRepetition = async (topicName: string | null) => {
    if (!spacedRepetitionService) return;

    try {
      setLoading(true);
      setError(null);

      const result = await spacedRepetitionService.startSpacedRepetition(topicName);
      
      if (!result.success) {
        setError(result.error || 'Unknown error starting spaced repetition');
        return;
      }

      setCurrentFlashcard(result.firstCard!);
      setFlashcardHistory([result.firstCard!]);
      setCurrentHistoryIndex(0);
      setSelectedTopic(topicName);
      setSelectedDifficulty('all'); // Keep as 'all' since spaced repetition uses mixed difficulties
      setIsSpacedRepetitionMode(true); // Set spaced repetition mode flag
      setTotalAvailableForTopic(result.totalCards!);
      setViewMode('flashcards');
      setAnswerRevealed(false);
      setHintRevealed(false);
      setDifficultyRated(false);
      setShowCompletionMessage(false);
    } catch (err) {
      setError('Error loading spaced repetition: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const calculateSpacedRepetitionStats = async (): Promise<SpacedRepetitionStats> => {
    if (!spacedRepetitionService) return {
      total: 0,
      challenging: 0,
      moderate: 0,
      easy: 0,
      unrated: 0,
      topics: []
    };

    const result = await spacedRepetitionService.calculateSpacedRepetitionStats();
    
    // Update the state with the new format
    setSpacedRepetitionStats(result);
    
    return result;
  };

  const checkForCompletion = async (): Promise<boolean> => {
    if (!flashcardService) return false;
    
    // Use the service's sequence-based completion detection
    return await flashcardService.hasCompletedSequence(selectedTopic, selectedDifficulty);
  };

  const handleNext = async () => {
    if (!flashcardService) return;

    try {
      setLoading(true);
    
      let nextFlashcard: Flashcard | null = null;
      
      if (isSpacedRepetitionMode) {
        // Handle spaced repetition sequence
        const sequenceKey = `spaced-${selectedTopic || 'all'}`;
        const spacedSequence = (flashcardService as any)._spacedRepetitionSequence?.[sequenceKey];
        
        if (spacedSequence && spacedSequence.currentIndex < spacedSequence.cards.length - 1) {
          spacedSequence.currentIndex++;
          nextFlashcard = spacedSequence.cards[spacedSequence.currentIndex];
        }
      } else {
        // Use the same method for both 'all' and specific topics to ensure consistent difficulty filtering
        nextFlashcard = await flashcardService.getNextRandomFlashcardByTopicAndDifficulty(selectedTopic || 'all', selectedDifficulty, currentFlashcard || undefined);
      }
      
      if (nextFlashcard) {
        setCurrentFlashcard(nextFlashcard);
        setAnswerRevealed(false);
        setHintRevealed(false);
        setDifficultyRated(false);
        
        // Add to history and update index
        const newHistory = [...flashcardHistory.slice(0, currentHistoryIndex + 1), nextFlashcard];
        setFlashcardHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
      } else {
        // No more flashcards available - show completion
        if (isSpacedRepetitionMode) {
          // For spaced repetition, we've reached the end of the sequence
          setShowCompletionMessage(true);
        } else {
          // For regular flashcards, check if we've actually completed the sequence
          const completed = await checkForCompletion();
          if (completed) {
            setShowCompletionMessage(true);
          } else {
            setError('No more flashcards available.');
          }
        }
      }
    } catch (err) {
      setError('Error loading next flashcard: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentHistoryIndex > 0) {
      const prevIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(prevIndex);
      setCurrentFlashcard(flashcardHistory[prevIndex]);
      setAnswerRevealed(false); // Hide answer when going to previous card
      setHintRevealed(false); // Hide hint when going to previous card
      setDifficultyRated(false);
    }
  };

  const handleBackToTopicSelection = () => {
    // If we're in spaced repetition mode, go back to spaced repetition view
    if (isSpacedRepetitionMode) {
      setViewMode('spacedRepetition');
    } else {
      setViewMode('topicSelection');
    }
    
    setCurrentFlashcard(null);
    setFlashcardHistory([]);
    setCurrentHistoryIndex(-1);
    setAnswerRevealed(false);
    setHintRevealed(false);
    setSelectedTopic(null);
    setSelectedDifficulty('all');
    setIsSpacedRepetitionMode(false);
    setTotalAvailableForTopic(0);
    setDifficultyRated(false);
    setShowCompletionMessage(false);
  };

  const handleBackToMenu = () => {
    setViewMode('menu');
    setCurrentFlashcard(null);
    setFlashcardHistory([]);
    setCurrentHistoryIndex(-1);
    setAnswerRevealed(false);
    setHintRevealed(false);
    setSelectedTopic(null);
    setSelectedDifficulty('all');
    setIsSpacedRepetitionMode(false);
    setTotalAvailableForTopic(0);
    setDifficultyRated(false);
    setShowCompletionMessage(false);
  };

  const handleRevealAnswer = () => {
    setAnswerRevealed(true);
  };

  const handleRevealHint = () => {
    setHintRevealed(true);
  };

  const handleCopyQuestion = async () => {
    if (!currentFlashcard) return;

    try {
      await navigator.clipboard.writeText(currentFlashcard.question);
      setCopyFeedback('✓');
      setTimeout(() => setCopyFeedback(''), 1500);
    } catch (err) {
      setCopyFeedback('✗');
      setTimeout(() => setCopyFeedback(''), 1500);
    }
  };

  const handleDifficultyRating = async (difficulty: 'easy' | 'moderate' | 'challenging') => {
    if (!currentFlashcard || !flashcardService) return;

    try {
      // Save difficulty rating to the file using FlashcardService
      await flashcardService.saveDifficultyRating(currentFlashcard, difficulty);

      setDifficultyRated(true);
      
      // Refresh stats in background to update difficulty counts
      refreshStatsAfterRating();
      
      // Check if we've completed all available flashcards
      const isComplete = await checkForCompletion();
      if (isComplete) {
        // Show completion message
        setShowCompletionMessage(true);
      } else {
        // Auto-advance to next card after a brief delay
        setTimeout(() => {
          handleNext();
        }, 500);
      }
    } catch (err) {
      setError('Error saving difficulty rating: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const resetAllFlashcards = async () => {
    if (!dataManagementService) return;
    
    try {
      setIsResetting(true);
      setError(null);
      
      const result = await dataManagementService.resetAllFlashcards();
      
      if (!result.success) {
        if (result.error !== 'Operation cancelled by user') {
          setError(result.error || 'Unknown error resetting flashcards');
        }
        return;
      }
      
      // Refresh stats to reflect the changes
      await refreshStatsAfterRating();
      
      // Show success message
      if (result.totalCommentsRemoved! > 0) {
        alert(
          `Reset complete!\n\n` +
          `• ${result.totalCommentsRemoved} difficulty ratings removed\n` +
          `• ${result.totalFilesModified} files modified\n\n` +
          `All flashcards are now unrated and ready for fresh difficulty assessments.`
        );
      } else {
        alert('No difficulty ratings found to reset.\nAll flashcards are already unrated.');
      }
      
    } catch (err) {
      setError('Error resetting flashcards: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsResetting(false);
    }
  };

  const resetAllQuizResults = async () => {
    if (!dataManagementService) return;
    
    try {
      setIsResettingQuizResults(true);
      setError(null);
      
      const result = await dataManagementService.resetAllQuizResults();
      
      if (!result.success) {
        if (result.error !== 'Operation cancelled by user') {
          setError(result.error || 'Unknown error resetting quiz results');
        }
        return;
      }
      
      // Show success message
      alert(
        'Quiz results reset complete!\n\n' +
        'All historical quiz scores and timestamps have been cleared.\n' +
        'The progress file has been reset to its initial state.'
      );
      
    } catch (err) {
      setError('Error resetting quiz results: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsResettingQuizResults(false);
    }
  };

  const loadQuizHistory = async () => {
    if (!dataManagementService) return;
    
    try {
      const result = await dataManagementService.loadQuizHistory();
      
      if (!result.success) {
        setError(result.error || 'Unknown error loading quiz history');
        return;
      }
      
      setQuizHistory(result.history || []);
    } catch (err) {
      console.error('Error loading quiz history:', err);
      setError('Error loading quiz history: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const getFilePath = (flashcard: Flashcard): string => {
    const path = flashcard.file.path;
    const pathParts = path.split('/');
    
    // Remove the .md extension from the last part (filename)
    const filename = pathParts[pathParts.length - 1].replace(/\.md$/, '');
    
    if (pathParts.length === 1) {
      // File is in root directory
      return filename;
    }
    
    // Build path: / folder1 / folder2 / filename
    const folders = pathParts.slice(0, -1);
    return '/ ' + folders.join(' / ') + ' / ' + filename;
  };

  const renderTopicBreakdown = () => {
    return (
      <TopicBreakdownView
        showTopicBreakdown={showTopicBreakdown}
        topicStats={topicStats}
        quizTopicStats={quizTopicStats}
      />
    );
  };

  const showQuizView = () => {
    setViewMode('quiz');
  };

  const handleCancelQuiz = () => {
    // Reset all quiz state
    setQuizInProgress(false);
    setQuizSessionDone(false);
    setQuizQuestions([]);
    setQuizCurrentIndex(0);
    setQuizSelectedAnswer(null);
    setQuizResults({ correct: 0, total: 0 });
    setQuizTopic(null);
    setQuizShuffledAnswers([]);
    // Stay in quiz view to show topic selection
  };

  const renderMenuView = () => {
    return (
      <MenuView
        loading={loading}
        error={error}
        monitoredTopics={monitoredTopics}
        totalFlashcards={totalFlashcards}
        totalQuizzes={totalQuizzes}
        showTopicBreakdown={showTopicBreakdown}
        setShowTopicBreakdown={setShowTopicBreakdown}
        setViewMode={setViewMode}
        showTopicSelection={showTopicSelection}
        showSpacedRepetition={showSpacedRepetition}
        showQuizView={showQuizView}
        renderTopicBreakdown={renderTopicBreakdown}
      />
    );
  };

  const renderQuizHistoryView = () => {
    return (
      <QuizHistoryView
        setViewMode={setViewMode}
        quizHistory={quizHistory}
      />
    );
  };

  const renderQuizView = () => {
    return (
      <QuizView
        setViewMode={setViewMode}
        totalQuizzes={totalQuizzes}
        quizTopicStats={quizTopicStats}
        handleStartQuiz={handleStartQuiz}
      />
    );
  };

  const renderTopicSelectionView = () => {
    return (
      <TopicSelectionView
        loading={loading}
        totalFlashcards={totalFlashcards}
        topicDifficultyStats={topicDifficultyStats}
        startFlashcards={startFlashcards}
      />
    );
  };

    const handleStartRepetition = (topic?: string) => {
    if (topic) {
      startSpacedRepetition(topic);
    } else {
      startSpacedRepetition('all');
    }
  };

  const formatStatsText = (topicStats: SpacedRepetitionStats) => {
    const total = topicStats.total;
    if (total === 0) return "No questions ready for review";
    
    const parts = [];
    if (topicStats.challenging > 0) parts.push(`${topicStats.challenging} challenging`);
    if (topicStats.moderate > 0) parts.push(`${topicStats.moderate} moderate`);
    if (topicStats.easy > 0) parts.push(`${topicStats.easy} easy`);
    if (topicStats.unrated > 0) parts.push(`${topicStats.unrated} unrated`);
    
    const distribution = parts.length > 0 ? parts.join(", ") : "";
    return {
      main: `${total} question${total === 1 ? "" : "s"} ready for review`,
      distribution
    };
  };

  const renderSpacedRepetitionView = () => {
    return (
      <SpacedRepetitionView
        spacedRepetitionStats={spacedRepetitionStats}
        showSpacedRepetitionHelp={showSpacedRepetitionHelp}
        setShowSpacedRepetitionHelp={setShowSpacedRepetitionHelp}
        handleStartRepetition={handleStartRepetition}
        formatStatsText={formatStatsText}
        plugin={plugin}
      />
    );
  };

  // Handler to start a quiz for a topic
  const handleStartQuiz = async (topicName: string | null) => {
    if (!flashcardService) return;
    setQuizTopic(topicName);
    setQuizResults({ correct: 0, total: 0 });
    setQuizCurrentIndex(0);
    setQuizSelectedAnswer(null);
    setQuizSessionDone(false);
    setQuizInProgress(true);
    // Get all quizzes for this topic and shuffle
    let allQuizzes: Quiz[] = [];
    if (topicName === null) {
      allQuizzes = await flashcardService.getAllQuizzes();
    } else {
      allQuizzes = (await flashcardService.getAllQuizzes()).filter(q => q.topics.includes(topicName));
    }
    // Shuffle
    const shuffled = allQuizzes.sort(() => Math.random() - 0.5);
    setQuizQuestions(shuffled);
  };

  // Quiz session UI
  const renderQuizSession = () => {
    return (
      <QuizSessionView
        quizQuestions={quizQuestions}
        quizSessionDone={quizSessionDone}
        quizCurrentIndex={quizCurrentIndex}
        quizResults={quizResults}
        quizSelectedAnswer={quizSelectedAnswer}
        quizShuffledAnswers={quizShuffledAnswers}
        setQuizInProgress={setQuizInProgress}
        setQuizSessionDone={setQuizSessionDone}
        setQuizQuestions={setQuizQuestions}
        setQuizCurrentIndex={setQuizCurrentIndex}
        setQuizSelectedAnswer={setQuizSelectedAnswer}
        setQuizResults={setQuizResults}
        setQuizTopic={setQuizTopic}
        setQuizShuffledAnswers={setQuizShuffledAnswers}
      />
    );
  };

  const renderContent = () => {
    if (viewMode === 'menu') {
      return renderMenuView();
    } else if (viewMode === 'topicSelection') {
      return renderTopicSelectionView();
    } else if (viewMode === 'spacedRepetition') {
      return renderSpacedRepetitionView();
    } else if (viewMode === 'quiz') {
      if (quizInProgress) return renderQuizSession();
      return renderQuizView();
    } else if (viewMode === 'quizHistory') {
      return renderQuizHistoryView();
    } else {
      return (
        <FlashcardView
          loading={loading}
          showCompletionMessage={showCompletionMessage}
          selectedTopic={selectedTopic}
          selectedDifficulty={selectedDifficulty}
          isSpacedRepetitionMode={isSpacedRepetitionMode}
          flashcardHistory={flashcardHistory}
          totalAvailableForTopic={totalAvailableForTopic}
          handleBackToMenu={handleBackToMenu}
          currentFlashcard={currentFlashcard}
          hintRevealed={hintRevealed}
          handleRevealHint={handleRevealHint}
          answerRevealed={answerRevealed}
          setAnswerRevealed={setAnswerRevealed}
          difficultyRated={difficultyRated}
          handleDifficultyRating={handleDifficultyRating}
          getFilePath={getFilePath}
        />
      );
    }
  };

  const renderButtons = () => {
    return (
      <ModalButtonsView
        viewMode={viewMode}
        onClose={onClose}
        handleBackToMenu={handleBackToMenu}
        handleBackToTopicSelection={handleBackToTopicSelection}
        handleCancelQuiz={handleCancelQuiz}
        quizInProgress={quizInProgress}
        isSpacedRepetitionMode={isSpacedRepetitionMode}
        isResetting={isResetting}
        isResettingQuizResults={isResettingQuizResults}
        resetAllFlashcards={resetAllFlashcards}
        resetAllQuizResults={resetAllQuizResults}
      />
    );
  };

  // Add keyboard event handler for difficulty ratings and answer reveal
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Handle Enter key to reveal answer when in flashcard mode and answer not yet revealed
      if ((viewMode === 'flashcards' || viewMode === 'spacedRepetition') && currentFlashcard && !answerRevealed) {
        if (event.key === 'Enter') {
          event.preventDefault();
          handleRevealAnswer();
          return;
        }
      }
      
      // Only handle difficulty rating shortcuts when we're showing a flashcard and the answer is revealed
      if ((viewMode === 'flashcards' || viewMode === 'spacedRepetition') && currentFlashcard && answerRevealed && !difficultyRated) {
        switch (event.key) {
          case '1':
            handleDifficultyRating('easy');
            break;
          case '2':
            handleDifficultyRating('moderate');
            break;
          case '3':
            handleDifficultyRating('challenging');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [viewMode, currentFlashcard, answerRevealed, difficultyRated]);

  // Add logging to the main render function
  
  
  return (
    <div style={modalStyles.container}>
      {/* Content area */}
      <div 
        className="quizium-modal-content"
        style={modalStyles.content}
      >
        {renderContent()}
      </div>
      
      {/* Dynamic buttons based on view mode */}
      {renderButtons()}
    </div>
  );
}; 