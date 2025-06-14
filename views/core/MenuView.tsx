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
        Loading...
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
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <h1 style={menuStyles.title}>Quizium</h1>
        </div>
      </div>
      {streakData && (
        <div style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
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
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            Object.assign(e.currentTarget.style, menuHoverEffects.breakdownButton);
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            Object.assign(e.currentTarget.style, menuHoverEffects.breakdownButtonReset);
          }}
          title="Show per-topic breakdown"
        >
          📊 Show breakdown
        </button>
      </div>
      {renderTopicBreakdown(breakdownButtonRef)}
      <div style={menuStyles.actionsContainer}>
        <button
          onClick={showTopicSelection}
          style={combineStyles(menuStyles.actionButton, menuStyles.flashcardsButton)}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            Object.assign(e.currentTarget.style, menuHoverEffects.flashcardsButton);
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            Object.assign(e.currentTarget.style, menuHoverEffects.flashcardsButtonReset);
          }}
        >
          📚 Flashcards
        </button>
        <button
          onClick={showSpacedRepetition}
          style={combineStyles(menuStyles.actionButton, menuStyles.spacedRepetitionButton)}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            Object.assign(e.currentTarget.style, menuHoverEffects.spacedRepetitionButton);
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            Object.assign(e.currentTarget.style, menuHoverEffects.spacedRepetitionButtonReset);
          }}
        >
          🔄 Flashcards - Spaced Repetition
        </button>
        <button
          onClick={showQuizView}
          style={combineStyles(menuStyles.actionButton, menuStyles.quizzesButton)}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            Object.assign(e.currentTarget.style, menuHoverEffects.quizzesButton);
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            Object.assign(e.currentTarget.style, menuHoverEffects.quizzesButtonReset);
          }}
        >
          🧠 Quizzes
        </button>
      </div>
    </div>
  );
}; 