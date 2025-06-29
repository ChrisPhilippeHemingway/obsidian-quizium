import React from 'react';
import { Flashcard } from '../../FlashcardService';
import { flashcardStyles, hoverEffects } from './flashcard-styles';
import { commonStyles } from '../shared-styles';
import { LatexRenderer } from '../components/LatexRenderer';

/**
 * Interface for topic information used in completion messages
 */
interface TopicInfo {
  isSpacedRepetition: boolean;
  topicName: string;
  difficultyText?: string;
}

/**
 * Interface for spaced repetition breakdown statistics
 */
interface SpacedBreakdown {
  challengingCount: number;
  moderateCount: number;
  easyCount: number;
  unratedCount: number;
}

interface FlashcardViewProps {
  loading: boolean;
  showCompletionMessage: boolean;
  selectedTopic: string | null;
  selectedDifficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all';
  isSpacedRepetitionMode: boolean;
  flashcardHistory: Flashcard[];
  totalAvailableForTopic: number;
  handleBackToMenu: () => void;
  currentFlashcard: Flashcard | null;
  hintRevealed: boolean;
  handleRevealHint: () => void;
  answerRevealed: boolean;
  setAnswerRevealed: (revealed: boolean) => void;
  difficultyRated: boolean;
  handleDifficultyRating: (difficulty: 'easy' | 'moderate' | 'challenging') => Promise<void>;
  getFilePath: (flashcard: Flashcard) => string;
}

/**
 * FlashcardView component that displays individual flashcards and handles user interactions.
 * This component manages the display of questions, answers, hints, and difficulty rating functionality.
 * It supports both regular flashcard sessions and spaced repetition mode.
 * 
 * @param props - The component props containing flashcard data and event handlers
 * @returns JSX element representing the flashcard view
 */
export const FlashcardView: React.FC<FlashcardViewProps> = ({
  loading,
  showCompletionMessage,
  selectedTopic,
  selectedDifficulty,
  isSpacedRepetitionMode,
  flashcardHistory,
  totalAvailableForTopic,
  handleBackToMenu,
  currentFlashcard,
  hintRevealed,
  handleRevealHint,
  answerRevealed,
  setAnswerRevealed,
  difficultyRated,
  handleDifficultyRating,
  getFilePath
}) => {
  /**
   * Renders the loading state while flashcards are being loaded.
   * 
   * @returns JSX element for loading state
   */
  const renderLoadingState = () => (
    <div style={commonStyles.loadingState}>
      Loading flashcard...
    </div>
  );

  /**
   * Renders the completion message when all flashcards in a session have been reviewed.
   * This includes different messaging for regular sessions vs spaced repetition.
   * 
   * @returns JSX element for completion message
   */
  const renderCompletionMessage = () => {
    const topicInfo = getTopicInfo();
    const spacedBreakdown = getSpacedRepetitionBreakdown(topicInfo);

    return (
      <div style={flashcardStyles.completionContainer}>
        {renderCelebrationEmojis()}
        {renderCompletionTitle(topicInfo)}
        {renderAchievementSummary(topicInfo, spacedBreakdown)}
        {renderMotivationalMessage(topicInfo)}
        {renderReturnButton(topicInfo)}
      </div>
    );
  };

  /**
   * Renders the main flashcard content including question, hint, and answer sections.
   * 
   * @returns JSX element for flashcard content
   */
  const renderFlashcardContent = () => (
    <div style={flashcardStyles.container}>
      {renderQuestionSection()}
      {renderHintSection()}
      {renderAnswerSection()}
    </div>
  );

  /**
   * Renders the no flashcards available state.
   * 
   * @returns JSX element for no flashcards state
   */
  const renderNoFlashcardsState = () => (
    <div style={commonStyles.emptyState}>
      No flashcards available
    </div>
  );

  /**
   * Gets topic information for display purposes.
   * Determines the topic name, difficulty text, and whether this is spaced repetition.
   * 
   * @returns Object containing topic display information
   */
  const getTopicInfo = () => {
    if (selectedTopic === 'all' || selectedTopic === null) {
      return {
        topicName: 'All Topics',
        difficultyText: '',
        isSpacedRepetition: isSpacedRepetitionMode
      };
    }
    
    const difficultyText = selectedDifficulty === 'all' ? 'All Difficulties' : selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
    
    return {
      topicName: selectedTopic,
      difficultyText: difficultyText,
      isSpacedRepetition: isSpacedRepetitionMode
    };
  };

  /**
   * Calculates spaced repetition breakdown statistics if applicable.
   * 
   * @param topicInfo - The topic information object
   * @returns Breakdown statistics or null if not applicable
   */
  const getSpacedRepetitionBreakdown = (topicInfo: { isSpacedRepetition: boolean }) => {
    if (!topicInfo.isSpacedRepetition) return null;
    
    return {
      challengingCount: flashcardHistory.filter(card => card.difficulty === 'challenging').length,
      moderateCount: flashcardHistory.filter(card => card.difficulty === 'moderate').length,
      easyCount: flashcardHistory.filter(card => card.difficulty === 'easy').length,
      unratedCount: flashcardHistory.filter(card => !card.difficulty || !card.lastRated).length
    };
  };

  /**
   * Renders celebration emojis for the completion message.
   * 
   * @returns JSX element with celebration emojis
   */
  const renderCelebrationEmojis = () => (
    <div style={flashcardStyles.celebrationEmojis}>
      🎉✨🎊
    </div>
  );

  /**
   * Renders the completion title based on the session type.
   * 
   * @param topicInfo - The topic information object
   * @returns JSX element with completion title
   */
  const renderCompletionTitle = (topicInfo: { isSpacedRepetition: boolean }) => (
    <h1 style={flashcardStyles.completionTitle}>
      {topicInfo.isSpacedRepetition ? 'Spaced Repetition Complete! 🧠' : 'Congratulations! 🏆'}
    </h1>
  );

  /**
   * Renders the achievement summary section with completion stats.
   * 
   * @param topicInfo - The topic information object
   * @param spacedBreakdown - The spaced repetition breakdown statistics
   * @returns JSX element with achievement summary
   */
  const renderAchievementSummary = (topicInfo: TopicInfo, spacedBreakdown: SpacedBreakdown | null) => (
    <div style={flashcardStyles.achievementSummary(topicInfo.isSpacedRepetition ? '#3b82f6' : '#22c55e')}>
      {renderSummaryTitle(topicInfo)}
      {renderSummaryStats(topicInfo)}
      {renderSpacedRepetitionDetails(topicInfo, spacedBreakdown)}
    </div>
  );

  /**
   * Renders the motivational message based on session type.
   * 
   * @param topicInfo - The topic information object
   * @returns JSX element with motivational message
   */
  const renderMotivationalMessage = (topicInfo: { isSpacedRepetition: boolean }) => (
    <div style={flashcardStyles.motivationalMessage}>
      {topicInfo.isSpacedRepetition ? 
        'Excellent progress with your spaced repetition! 🚀' : 
        'Keep up the great work! 💪'
      }
    </div>
  );

  /**
   * Renders the return to menu button with appropriate styling.
   * 
   * @param topicInfo - The topic information object
   * @returns JSX element with return button
   */
  const renderReturnButton = (topicInfo: { isSpacedRepetition: boolean }) => (
    <button
      onClick={handleBackToMenu}
      style={flashcardStyles.returnButton}
      className={topicInfo.isSpacedRepetition ? 'quizium-flashcard-return-button-spaced' : 'quizium-flashcard-return-button-regular'}
    >
      🏠 Return to Menu
    </button>
  );

  // Main render logic
  if (loading) {
    return renderLoadingState();
  }

  if (showCompletionMessage) {
    return renderCompletionMessage();
  }

  if (!currentFlashcard) {
    return renderNoFlashcardsState();
  }

  return renderFlashcardContent();

  /**
   * Renders the question section with optional hint button.
   * 
   * @returns JSX element for question section
   */
  function renderQuestionSection() {
    return (
      <div className="quizium-flashcard-question-section">
        {/* Hint button container - positioned above the question */}
        {currentFlashcard?.hint && (
          <div className="quizium-flashcard-hint-button-container">
            <button
              onClick={handleRevealHint}
              className="quizium-flashcard-hint-button"
              title="Show hint"
            >
              💡
            </button>
          </div>
        )}
        
        {/* Question text */}
        <div className="quizium-flashcard-question-text">
          <LatexRenderer>{currentFlashcard?.question || ''}</LatexRenderer>
        </div>
      </div>
    );
  }

  /**
   * Renders the hint section if a hint exists and is revealed.
   * 
   * @returns JSX element for hint section or null
   */
  function renderHintSection() {
    if (!currentFlashcard?.hint || !hintRevealed) return null;

    return (
      <div className="quizium-flashcard-hint-section">
        💡 <strong>Hint:</strong> <LatexRenderer>{currentFlashcard.hint}</LatexRenderer>
      </div>
    );
  }

  /**
   * Renders the answer section with show/hide functionality and difficulty rating.
   * 
   * @returns JSX element for answer section
   */
  function renderAnswerSection() {
    if (!currentFlashcard) return null;

    return (
      <div className="quizium-flashcard-answer-section">
        {!answerRevealed ? (
          <button
            onClick={() => setAnswerRevealed(true)}
            className="quizium-flashcard-show-answer-button"
          >
            Show Answer
          </button>
        ) : (
          <div>
            {renderAnswerContent()}
            {renderDifficultyRating()}
            {renderSourceInfo()}
            {renderTopicTags()}
            {renderNavigationInfo()}
          </div>
        )}
      </div>
    );
  }

  /**
   * Renders the summary title for the completion message.
   * 
   * @param topicInfo - The topic information object
   * @returns JSX element for summary title
   */
  function renderSummaryTitle(topicInfo: { isSpacedRepetition: boolean }) {
    return (
      <div className="quizium-flashcard-summary-title">
        {topicInfo.isSpacedRepetition ? 'Spaced Review Session Complete!' : 'Study Session Complete!'}
      </div>
    );
  }

  /**
   * Renders the summary statistics for the completion message.
   * 
   * @param topicInfo - The topic information object
   * @returns JSX element for summary stats
   */
  function renderSummaryStats(topicInfo: TopicInfo) {
    return (
      <>
        <div className="quizium-flashcard-summary-stat">
          📚 <strong>{totalAvailableForTopic}</strong> questions reviewed
        </div>
        
        <div className="quizium-flashcard-summary-stat">
          🎯 Topic: <strong>{topicInfo.topicName}</strong>
        </div>
      </>
    );
  }

  /**
   * Renders spaced repetition details if applicable.
   * 
   * @param topicInfo - The topic information object
   * @param spacedBreakdown - The spaced repetition breakdown statistics
   * @returns JSX element for spaced repetition details
   */
  function renderSpacedRepetitionDetails(topicInfo: TopicInfo, spacedBreakdown: SpacedBreakdown | null) {
    if (topicInfo.isSpacedRepetition && spacedBreakdown) {
      return (
        <div className="quizium-flashcard-spaced-details">
          <div className="quizium-flashcard-spaced-stat-item">
            🔴 <strong>{spacedBreakdown.challengingCount}</strong> challenging questions
          </div>
          <div className="quizium-flashcard-spaced-stat-item">
            🟡 <strong>{spacedBreakdown.moderateCount}</strong> moderate questions (recent)
          </div>
          <div className="quizium-flashcard-spaced-stat-item">
            🟢 <strong>{spacedBreakdown.easyCount}</strong> easy questions (recent)
          </div>
          {spacedBreakdown.unratedCount > 0 && (
            <div>
              ⚪ <strong>{spacedBreakdown.unratedCount}</strong> unrated questions
            </div>
          )}
        </div>
      );
    } else if (topicInfo.difficultyText) {
      return (
        <div className="quizium-flashcard-difficulty-text">
          ⚡ Difficulty: <strong>{topicInfo.difficultyText}</strong>
        </div>
      );
    }
    return null;
  }

  // Additional helper functions for answer section components
  function renderAnswerContent() {
    return (
      <div className="quizium-flashcard-answer-content">
        <LatexRenderer>{currentFlashcard?.answer || ''}</LatexRenderer>
      </div>
    );
  }

  function renderDifficultyRating() {
    if (difficultyRated) {
      return (
        <div className="quizium-flashcard-rating-saved">
          Rating saved! Moving to next card...
        </div>
      );
    }

    return (
      <div className="quizium-flashcard-rating-container">
        <div className="quizium-flashcard-rating-title">
          Rate difficulty:
        </div>
        <div className="quizium-flashcard-rating-buttons">
          {renderDifficultyButton('easy', 'Easy', '1', '#dcfce7', '#166534', '#bbf7d0')}
          {renderDifficultyButton('moderate', 'Moderate', '2', '#fef9c3', '#854d0e', '#fef08a')}
          {renderDifficultyButton('challenging', 'Challenging', '3', '#fee2e2', '#991b1b', '#fecaca')}
        </div>
        <div className="quizium-flashcard-rating-instructions">
          Press 1, 2, or 3 to quickly rate difficulty
        </div>
      </div>
    );
  }

  function renderDifficultyButton(
    difficulty: 'easy' | 'moderate' | 'challenging',
    label: string,
    shortcut: string,
    bgColor: string,
    textColor: string,
    hoverColor: string
  ) {
    return (
      <button
        onClick={() => handleDifficultyRating(difficulty)}
        className={`quizium-difficulty-rating-button quizium-difficulty-rating-button-${difficulty}`}
      >
        <span>{label}</span>
        <span className={`quizium-difficulty-rating-shortcut quizium-difficulty-rating-shortcut-${difficulty}`}>
          {shortcut}
        </span>
      </button>
    );
  }

  function renderSourceInfo() {
    return (
      <div className="quizium-flashcard-source-info">
        From: {getFilePath(currentFlashcard!)}
      </div>
    );
  }

  function renderTopicTags() {
    if (!currentFlashcard) return null;

    return (
      <div className="quizium-flashcard-topic-tags">
        Topics: {currentFlashcard.topics.map((topic: string, index: number) => (
          <span key={index} className="quizium-flashcard-topic-tag">
            {topic}
          </span>
        ))}
      </div>
    );
  }

  function renderNavigationInfo() {
    return (
      <div className="quizium-flashcard-navigation-info">
        {flashcardHistory.length} viewed • {Math.max(0, totalAvailableForTopic - flashcardHistory.length)} remaining
      </div>
    );
  }
}; 