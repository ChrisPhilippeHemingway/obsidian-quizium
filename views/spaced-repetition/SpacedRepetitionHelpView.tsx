import React, { useEffect, useRef } from 'react';
import { spacedRepetitionHelpStyles } from './spaced-repetition-help-styles';

interface SpacedRepetitionHelpViewProps {
  showSpacedRepetitionHelp: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export const SpacedRepetitionHelpView: React.FC<SpacedRepetitionHelpViewProps> = ({
  showSpacedRepetitionHelp,
  onClose,
  buttonRef
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSpacedRepetitionHelp) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showSpacedRepetitionHelp, onClose]);

  if (!showSpacedRepetitionHelp) return null;

  return (
    <div ref={tooltipRef} style={spacedRepetitionHelpStyles.container}>
      <div style={spacedRepetitionHelpStyles.header}>
        <div style={spacedRepetitionHelpStyles.title}>
          🔄 How Spaced Repetition Works
        </div>
        <button
          onClick={onClose}
          style={spacedRepetitionHelpStyles.closeButton}
          className="quizium-close-button-hover"
          title="Close help"
        >
          ✕
        </button>
      </div>
      
      <div style={spacedRepetitionHelpStyles.content}>
        <div style={spacedRepetitionHelpStyles.section}>
          <div style={spacedRepetitionHelpStyles.sectionTitle}>
            📚 Review Based on Difficulty
          </div>
          <div style={spacedRepetitionHelpStyles.explanation}>
            Flashcards are reviewed based on how well you know them. The system automatically 
            schedules reviews to optimize long-term retention.
          </div>
        </div>

        <div style={spacedRepetitionHelpStyles.section}>
          <div style={spacedRepetitionHelpStyles.sectionTitle}>
            🎯 Difficulty Levels
          </div>
          <div style={spacedRepetitionHelpStyles.difficultyList}>
            <div style={spacedRepetitionHelpStyles.difficultyItem}>
              <span style={spacedRepetitionHelpStyles.difficultyIcon}>🔴</span>
              <div style={spacedRepetitionHelpStyles.difficultyDetails}>
                <div style={spacedRepetitionHelpStyles.difficultyName}>Challenging</div>
                <div style={spacedRepetitionHelpStyles.difficultyDescription}>
                  Cards you find difficult - reviewed more frequently
                </div>
              </div>
            </div>
            
            <div style={spacedRepetitionHelpStyles.difficultyItem}>
              <span style={spacedRepetitionHelpStyles.difficultyIcon}>🟡</span>
              <div style={spacedRepetitionHelpStyles.difficultyDetails}>
                <div style={spacedRepetitionHelpStyles.difficultyName}>Moderate</div>
                <div style={spacedRepetitionHelpStyles.difficultyDescription}>
                  Cards you somewhat know - balanced review schedule
                </div>
              </div>
            </div>
            
            <div style={spacedRepetitionHelpStyles.difficultyItem}>
              <span style={spacedRepetitionHelpStyles.difficultyIcon}>🟢</span>
              <div style={spacedRepetitionHelpStyles.difficultyDetails}>
                <div style={spacedRepetitionHelpStyles.difficultyName}>Easy</div>
                <div style={spacedRepetitionHelpStyles.difficultyDescription}>
                  Cards you know well - reviewed less frequently
                </div>
              </div>
            </div>
            
            <div style={spacedRepetitionHelpStyles.difficultyItem}>
              <span style={spacedRepetitionHelpStyles.difficultyIcon}>⚪</span>
              <div style={spacedRepetitionHelpStyles.difficultyDetails}>
                <div style={spacedRepetitionHelpStyles.difficultyName}>Unrated</div>
                <div style={spacedRepetitionHelpStyles.difficultyDescription}>
                  New cards that haven't been rated yet
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={spacedRepetitionHelpStyles.section}>
          <div style={spacedRepetitionHelpStyles.sectionTitle}>
            ⏰ Smart Scheduling
          </div>
          <div style={spacedRepetitionHelpStyles.explanation}>
            The algorithm spaces out reviews over increasing intervals. Cards you rate as "easy" 
            won't appear as often, while "challenging" cards will be shown more frequently until 
            you master them.
          </div>
        </div>
      </div>
    </div>
  );
}; 