import React from 'react';
import { ViewMode } from '../types';
import { modalButtonStyles, modalButtonHoverEffects } from './modal-buttons-styles';
import { combineStyles } from '../shared-styles';

interface ModalButtonsViewProps {
  viewMode: ViewMode;
  onClose: () => void;
  handleBackToMenu: () => void;
  handleBackToTopicSelection: () => void;
  handleCancelQuiz: () => void;
  quizInProgress: boolean;
  isSpacedRepetitionMode: boolean;
  // Reset button props for menu view
  isResetting?: boolean;
  isResettingQuizResults?: boolean;
  resetAllFlashcards?: () => void;
  resetAllQuizResults?: () => void;
}

export const ModalButtonsView: React.FC<ModalButtonsViewProps> = ({
  viewMode,
  onClose,
  handleBackToMenu,
  handleBackToTopicSelection,
  handleCancelQuiz,
  quizInProgress,
  isSpacedRepetitionMode,
  isResetting = false,
  isResettingQuizResults = false,
  resetAllFlashcards,
  resetAllQuizResults
}) => {
  if (viewMode === 'menu') {
    return (
      <div 
        className="quizium-modal-buttons"
        style={modalButtonStyles.menuContainer}
      >
        {/* Left reset button */}
        <button
          onClick={resetAllFlashcards}
          disabled={isResetting}
          style={combineStyles(
            modalButtonStyles.resetButton(isResetting),
            modalButtonStyles.leftResetButton
          )}
          onMouseEnter={(e) => {
            if (!isResetting) {
              Object.assign(e.currentTarget.style, modalButtonHoverEffects.resetButton);
            }
          }}
          onMouseLeave={(e) => {
            if (!isResetting) {
              Object.assign(e.currentTarget.style, modalButtonHoverEffects.resetButtonReset);
            }
          }}
          title="Remove all difficulty ratings from flashcards"
        >
          {isResetting ? (
            <>
              <span>⏳</span>
              Resetting...
            </>
          ) : (
            <>
              <span>🔄</span>
              Reset Flashcard Ratings
            </>
          )}
        </button>

        {/* Center Close button */}
        <button 
          className="mod-cta"
          onClick={onClose}
          style={modalButtonStyles.centerButton}
        >
          Close
        </button>

        {/* Right reset button */}
        <button
          onClick={resetAllQuizResults}
          disabled={isResettingQuizResults}
          style={combineStyles(
            modalButtonStyles.resetButton(isResettingQuizResults),
            modalButtonStyles.rightResetButton
          )}
          onMouseEnter={(e) => {
            if (!isResettingQuizResults) {
              Object.assign(e.currentTarget.style, modalButtonHoverEffects.resetButton);
            }
          }}
          onMouseLeave={(e) => {
            if (!isResettingQuizResults) {
              Object.assign(e.currentTarget.style, modalButtonHoverEffects.resetButtonReset);
            }
          }}
          title="Clear all historical quiz results and scores"
        >
          {isResettingQuizResults ? (
            <>
              <span>⏳</span>
              Resetting...
            </>
          ) : (
            <>
              <span>📊</span>
              Reset Quiz Results
            </>
          )}
        </button>
      </div>
    );
  } else if (viewMode === 'topicSelection') {
    return (
      <div 
        className="quizium-modal-buttons"
        style={modalButtonStyles.container}
      >
        <button 
          className="mod-cta"
          onClick={handleBackToMenu}
          style={modalButtonStyles.primaryButton}
        >
          ← Back to Menu
        </button>
      </div>
    );
  } else if (viewMode === 'spacedRepetition') {
    return (
      <div 
        className="quizium-modal-buttons"
        style={modalButtonStyles.container}
      >
        <button 
          className="mod-cta"
          onClick={handleBackToMenu}
          style={modalButtonStyles.primaryButton}
        >
          ← Back to Menu
        </button>
      </div>
    );
  } else if (viewMode === 'quiz') {
    return (
      <div 
        className="quizium-modal-buttons"
        style={modalButtonStyles.container}
      >
        <button 
          className="mod-cta"
          onClick={handleBackToMenu}
          style={modalButtonStyles.primaryButton}
        >
          ← Back to Menu
        </button>
        {quizInProgress && (
          <button 
            onClick={handleCancelQuiz}
            style={modalButtonStyles.secondaryButton}
          >
            Cancel Quiz
          </button>
        )}
      </div>
    );
  } else {
    // Flashcard view - show back button with appropriate text
    return (
      <div 
        className="quizium-modal-buttons"
        style={modalButtonStyles.container}
      >
        <button 
          className="mod-cta"
          onClick={handleBackToTopicSelection}
          style={modalButtonStyles.primaryButton}
        >
          {isSpacedRepetitionMode ? '← Back to Spaced Repetition' : '← Back to Topics'}
        </button>
      </div>
    );
  }
}; 