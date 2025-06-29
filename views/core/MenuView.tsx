import React, { useRef } from 'react';
import { ViewMode } from '../types';
import { ViewProps } from '../types';
import { menuStyles, menuHoverEffects } from './menu-styles';
import { combineStyles } from '../shared-styles';
import logoImage from '../components/obsidian-quizium.png';

interface MenuViewProps extends Pick<ViewProps, 
  'loading' | 'error' | 'monitoredTopics' | 'totalFlashcards' | 'totalQuizzes' | 
  'showTopicBreakdown' | 'setShowTopicBreakdown' | 'setViewMode'
> {
  showTopicSelection: () => void;
  showSpacedRepetition: () => void;
  showQuizView: () => void;
  renderTopicBreakdown: (buttonRef: React.RefObject<HTMLButtonElement | null>) => React.ReactNode;
  streakData?: { currentStreak: number; highestStreak: number };
}

export const MenuView: React.FC<MenuViewProps> = ({
  loading,
  error,
  monitoredTopics,
  totalFlashcards,
  totalQuizzes,
  showTopicBreakdown,
  setShowTopicBreakdown,
  showTopicSelection,
  showSpacedRepetition,
  showQuizView,
  renderTopicBreakdown,
  streakData
}) => {
  const breakdownButtonRef = useRef<HTMLButtonElement>(null);
  if (loading) {
    return (
      <div style={menuStyles.loadingContainer}>
        <div style={menuStyles.loadingIcon}>
          🔍
        </div>
        <div style={menuStyles.loadingText}>
          Searching for flashcards and quizzes...
        </div>
        <div style={menuStyles.loadingSubtext}>
          Please wait while we scan your vault
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={menuStyles.errorContainer}>
        <div style={menuStyles.errorIcon}>
          ⚠️ Error
        </div>
        <div style={menuStyles.errorText}>
          {error}
        </div>
        <ol style={menuStyles.instructionsList}>
          {monitoredTopics.map((topic) => (
            <li key={topic.hashtag}>
              <code style={menuStyles.topicTag}>{topic.hashtag}</code>
            </li>
          ))}
        </ol>
        <div style={menuStyles.instructionsContainer}>
          <div style={menuStyles.instructionsTitle}>Flashcard format:</div>
          <pre style={menuStyles.codeBlock}>
{`[Q]Your question here
[A]Your answer here
[H]Your hint here (optional)`}
          </pre>
          <div style={menuStyles.instructionsTitle}>Quiz format (1 correct + 3 wrong answers):</div>
          <pre style={menuStyles.codeBlock}>
{`[Q]What is 2+2?
[A]4
[B]3
[B]5
[B]6
[H]Your hint here (optional)`}
          </pre>
          <div style={menuStyles.instructionsNote}>
            Add these to any note with your monitored hashtags.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={menuStyles.container}>
      <div style={menuStyles.headerContainer}>
        <div className="quizium-menu-header-container">
          <h1 style={menuStyles.title}>Quizium</h1>
        </div>
      </div>
      {streakData && (
        <div className="quizium-menu-streak-display">
          <span>💎</span>
          <span>Learning streak: {streakData.currentStreak}. Highest ever: {streakData.highestStreak}.</span>
        </div>
      )}
      <div className="topic-breakdown-container" style={menuStyles.topicBreakdownContainer}>
        <div style={menuStyles.statsText}>
          <div style={menuStyles.statsLine}>
            {totalFlashcards} flashcard{totalFlashcards === 1 ? '' : 's'} available
          </div>
          <div style={menuStyles.statsLineWithMargin}>
            {totalQuizzes} quiz question{totalQuizzes === 1 ? '' : 's'} available
          </div>
        </div>
        <button
          ref={breakdownButtonRef}
          onClick={() => setShowTopicBreakdown(!showTopicBreakdown)}
          style={menuStyles.breakdownButton}
          className="quizium-breakdown-button-hover"
          title="Show per-topic breakdown"
        >
          📊 Show breakdown
        </button>
      </div>
      {renderTopicBreakdown(breakdownButtonRef)}
      <div style={menuStyles.actionsContainer}>
        <button
          onClick={showTopicSelection}
          className="quizium-action-button quizium-flashcards-button"
        >
          📚 Flashcards
        </button>
        <button
          onClick={showSpacedRepetition}
          className="quizium-action-button quizium-spaced-repetition-button"
        >
          🔄 Flashcards - Spaced Repetition
        </button>
        <button
          onClick={showQuizView}
          className="quizium-action-button quizium-quizzes-button"
        >
          🧠 Quizzes
        </button>
      </div>
    </div>
  );
}; 