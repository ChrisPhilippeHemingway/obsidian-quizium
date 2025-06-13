import { MonitoredTopic } from '../main';
import QuiziumPlugin from '../main';
import { Flashcard, Quiz, TopicStats, TopicDifficultyStats } from '../FlashcardService';

// Re-export types that views need
export type { TopicStats, TopicDifficultyStats };

export type ViewMode = 'menu' | 'topicSelection' | 'spacedRepetition' | 'flashcards' | 'quiz' | 'quizHistory';

export interface SpacedRepetitionStats {
  topic?: string;
  total: number;
  challenging: number;
  moderate: number;
  easy: number;
  unrated: number;
  topics?: SpacedRepetitionStats[];
}

export interface QuizHistoryEntry {
  timestamp: string;
  topic: string;
  scorePercentage: number;
  formattedDate: string;
}

export interface QuiziumModalViewProps {
  onClose: () => void;
  monitoredTopics: MonitoredTopic[];
  plugin: QuiziumPlugin;
}

export interface ViewProps {
  // Common props that all views might need
  onClose: () => void;
  monitoredTopics: MonitoredTopic[];
  plugin: QuiziumPlugin;
  
  // Navigation functions
  setViewMode: (mode: ViewMode) => void;
  
  // Common state
  loading: boolean;
  error: string | null;
  
  // Stats
  totalFlashcards: number;
  totalQuizzes: number;
  topicStats: TopicStats[];
  quizTopicStats: TopicStats[];
  topicDifficultyStats: TopicDifficultyStats[];
  spacedRepetitionStats: SpacedRepetitionStats;
  
  // Functions that views might need
  startFlashcards: (topic: string | null, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all') => Promise<void>;
  startSpacedRepetition: (topicName: string | null) => Promise<void>;
  handleStartQuiz: (topicName: string | null) => Promise<void>;
  resetAllFlashcards: () => Promise<void>;
  resetAllQuizResults: () => Promise<void>;
  
  // State setters that views might need
  setSelectedTopic: (topic: string | null) => void;
  setSelectedDifficulty: (difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all') => void;
  setShowTopicBreakdown: (show: boolean) => void;
  setQuizHistory: (history: QuizHistoryEntry[]) => void;
  setShowSpacedRepetitionHelp: (show: boolean) => void;
  
  // Additional state that specific views need
  showTopicBreakdown: boolean;
  selectedTopic: string | null;
  selectedDifficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all';
  isResetting: boolean;
  isResettingQuizResults: boolean;
  quizHistory: QuizHistoryEntry[];
  showSpacedRepetitionHelp: boolean;
} 