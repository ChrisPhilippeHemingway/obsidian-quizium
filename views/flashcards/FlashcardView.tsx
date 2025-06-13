import React from 'react';
import { Flashcard } from '../../FlashcardService';
import { flashcardStyles, hoverEffects } from './flashcard-styles';
import { commonStyles } from '../shared-styles';

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
    <div style={{ fontSize: '48px', marginBottom: '20px', lineHeight: '1' }}>
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
    <h1 style={{ 
      color: 'var(--text-normal)', 
      marginBottom: '25px',
      fontSize: '28px',
      fontWeight: 'bold'
    }}>
      {topicInfo.isSpacedRepetition ? 'Spaced Repetition Complete! 🧠' : 'Congratulations! 🏆'}
    </h1>
  );

  /**
   * Renders the achievement summary box with session statistics.
   * 
   * @param topicInfo - The topic information object
   * @param spacedBreakdown - The spaced repetition breakdown statistics
   * @returns JSX element with achievement summary
   */
  const renderAchievementSummary = (topicInfo: any, spacedBreakdown: any) => (
    <div style={{ 
      backgroundColor: 'var(--background-secondary)',
      border: `2px solid ${topicInfo.isSpacedRepetition ? '#3b82f6' : '#22c55e'}`,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '25px',
      display: 'inline-block',
      minWidth: '300px'
    }}>
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
    <div style={{ 
      fontSize: '16px',
      color: 'var(--text-muted)',
      marginBottom: '30px',
      fontStyle: 'italic'
    }}>
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
      style={{
        background: topicInfo.isSpacedRepetition ? '#3b82f6' : '#22c55e',
        border: 'none',
        borderRadius: '10px',
        padding: '14px 28px',
        fontSize: '16px',
        color: 'white',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.2s',
        boxShadow: `0 4px 12px rgba(${topicInfo.isSpacedRepetition ? '59, 130, 246' : '34, 197, 94'}, 0.3)`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = topicInfo.isSpacedRepetition ? '#1d4ed8' : '#16a34a';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = topicInfo.isSpacedRepetition ? '#3b82f6' : '#22c55e';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
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
      <div style={{ 
        fontSize: '18px', 
        fontWeight: '500', 
        marginBottom: '20px',
        lineHeight: '1.5',
        color: 'var(--text-normal)',
        position: 'relative'
      }}>
        {currentFlashcard?.question}
        
        {/* Hint icon - only show if flashcard has a hint */}
        {currentFlashcard?.hint && (
          <button
            onClick={handleRevealHint}
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '4px',
              borderRadius: '50%',
              transition: 'all 0.2s',
              opacity: 0.7
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.backgroundColor = 'var(--background-modifier-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Show hint"
          >
            💡
          </button>
        )}
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
      <div style={{
        fontSize: '14px',
        color: 'var(--text-muted)',
        marginBottom: '20px',
        padding: '12px 16px',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '8px',
        fontStyle: 'italic',
        lineHeight: '1.4'
      }}>
        💡 <strong>Hint:</strong> {currentFlashcard.hint}
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
      <div style={{ marginTop: '20px', marginBottom: '40px' }}>
        {!answerRevealed ? (
          <button
            onClick={() => setAnswerRevealed(true)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              display: 'block',
              margin: '0 auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
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
      <div style={{ 
        fontSize: '18px', 
        fontWeight: '600',
        color: 'var(--text-normal)',
        marginBottom: '12px'
      }}>
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
  function renderSummaryStats(topicInfo: any) {
    return (
      <>
        <div style={{ 
          fontSize: '16px', 
          color: 'var(--text-muted)',
          marginBottom: '8px'
        }}>
          📚 <strong>{totalAvailableForTopic}</strong> questions reviewed
        </div>
        
        <div style={{ 
          fontSize: '16px', 
          color: 'var(--text-muted)',
          marginBottom: '8px'
        }}>
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
  function renderSpacedRepetitionDetails(topicInfo: any, spacedBreakdown: any) {
    if (topicInfo.isSpacedRepetition && spacedBreakdown) {
      return (
        <div style={{ 
          fontSize: '14px', 
          color: 'var(--text-muted)',
          marginTop: '12px',
          paddingTop: '8px',
          borderTop: '1px solid var(--background-modifier-border)'
        }}>
          <div style={{ marginBottom: '4px' }}>
            🔴 <strong>{spacedBreakdown.challengingCount}</strong> challenging questions
          </div>
          <div style={{ marginBottom: '4px' }}>
            🟡 <strong>{spacedBreakdown.moderateCount}</strong> moderate questions (recent)
          </div>
          <div style={{ marginBottom: '4px' }}>
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
        <div style={{ 
          fontSize: '16px', 
          color: 'var(--text-muted)'
        }}>
          ⚡ Difficulty: <strong>{topicInfo.difficultyText}</strong>
        </div>
      );
    }
    return null;
  }

  // Additional helper functions for answer section components
  function renderAnswerContent() {
    return (
      <div style={{ 
        fontSize: '16px', 
        color: 'var(--text-normal)',
        marginBottom: '30px',
        lineHeight: '1.5',
        padding: '20px',
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        border: '2px solid #22c55e',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)',
        transition: 'all 0.3s ease'
      }}>
        {currentFlashcard?.answer}
      </div>
    );
  }

  function renderDifficultyRating() {
    if (difficultyRated) {
      return (
        <div style={{ 
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '12px',
          fontStyle: 'italic',
          marginTop: '20px',
          marginBottom: '30px'
        }}>
          Rating saved! Moving to next card...
        </div>
      );
    }

    return (
      <div style={{ marginTop: '20px', marginBottom: '40px' }}>
        <div style={{ 
          fontSize: '14px', 
          color: 'var(--text-muted)', 
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          Rate difficulty:
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px',
          marginBottom: '8px'
        }}>
          {renderDifficultyButton('easy', 'Easy', '1', '#dcfce7', '#166534', '#bbf7d0')}
          {renderDifficultyButton('moderate', 'Moderate', '2', '#fef9c3', '#854d0e', '#fef08a')}
          {renderDifficultyButton('challenging', 'Challenging', '3', '#fee2e2', '#991b1b', '#fecaca')}
        </div>
        <div style={{ 
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          marginTop: '8px',
          marginBottom: '30px'
        }}>
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
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: bgColor,
          color: textColor,
          fontWeight: '500',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = hoverColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = bgColor;
        }}
      >
        <span>{label}</span>
        <span style={{ 
          fontSize: '12px', 
          opacity: 0.7,
          background: textColor,
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px'
        }}>{shortcut}</span>
      </button>
    );
  }

  function renderSourceInfo() {
    return (
      <div style={{ 
        fontSize: '12px', 
        color: '#666', 
        textAlign: 'center',
        marginBottom: '15px',
        fontFamily: 'monospace',
        marginTop: '20px'
      }}>
        From: {getFilePath(currentFlashcard!)}
      </div>
    );
  }

  function renderTopicTags() {
    if (!currentFlashcard) return null;

    return (
      <div style={{ 
        fontSize: '11px', 
        color: '#888', 
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        Topics: {currentFlashcard.topics.map((topic: string, index: number) => (
          <span key={index} style={{
            background: 'var(--background-secondary)',
            padding: '2px 6px',
            borderRadius: '12px',
            marginRight: '4px',
            fontWeight: '500'
          }}>
            {topic}
          </span>
        ))}
      </div>
    );
  }

  function renderNavigationInfo() {
    return (
      <div style={{ 
        fontSize: '12px', 
        color: 'var(--text-muted)', 
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        {flashcardHistory.length} viewed • {Math.max(0, totalAvailableForTopic - flashcardHistory.length)} remaining
      </div>
    );
  }
}; 