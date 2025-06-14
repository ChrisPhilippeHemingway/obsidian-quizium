import React, { useRef } from 'react';
import { SpacedRepetitionStats } from '../types';
import { spacedRepetitionStyles, spacedRepetitionHoverEffects } from './spaced-repetition-styles';
import { commonStyles } from '../shared-styles';

interface SpacedRepetitionViewProps {
  loading: boolean;
  spacedRepetitionStats: SpacedRepetitionStats | null;
  startSpacedRepetition: (topic: string | null) => void;
  showSpacedRepetitionHelp: boolean;
  setShowSpacedRepetitionHelp: (show: boolean) => void;
  renderSpacedRepetitionHelp: (buttonRef: React.RefObject<HTMLButtonElement | null>) => React.ReactNode;
}

export const SpacedRepetitionView: React.FC<SpacedRepetitionViewProps> = ({
  loading,
  spacedRepetitionStats,
  startSpacedRepetition,
  showSpacedRepetitionHelp,
  setShowSpacedRepetitionHelp,
  renderSpacedRepetitionHelp
}) => {
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  
  /**
   * Gets appropriate button text for a topic based on whether it has questions available
   */
  const getButtonText = (total: number): string => {
    if (total === 0) {
      return 'All reviewed for today ✓';
    }
    return `Start Review (${total} card${total === 1 ? '' : 's'})`;
  };

  /**
   * Gets the appropriate button style for a topic based on whether it has questions available
   */
  const getButtonStyle = (total: number) => {
    if (total === 0) {
      return spacedRepetitionStyles.completedButton;
    }
    return spacedRepetitionStyles.startButton(total > 0);
  };

  /**
   * Gets the appropriate container style for a topic based on whether it has questions available
   */
  const getContainerStyle = (total: number) => {
    if (total === 0) {
      return spacedRepetitionStyles.topicContainerEmpty;
    }
    return spacedRepetitionStyles.topicContainer;
  };

  /**
   * Renders additional information for topics with no questions available
   */
  const renderCompletionMessage = (total: number) => {
    if (total === 0) {
      return (
        <div style={spacedRepetitionStyles.completionMessage}>
          All questions have been reviewed according to your spaced repetition schedule
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={commonStyles.loadingState}>
        Loading spaced repetition data...
      </div>
    );
  }

  if (!spacedRepetitionStats || spacedRepetitionStats.total === 0) {
    return (
      <div style={spacedRepetitionStyles.emptyState}>
        <div style={spacedRepetitionStyles.emptyStateIcon}>
          🔄
        </div>
        <div style={spacedRepetitionStyles.emptyStateTitle}>
          No flashcards available for spaced repetition
        </div>
        <div style={spacedRepetitionStyles.emptyStateText}>
          Complete some flashcard sessions first to build your review queue.
        </div>
      </div>
    );
  }

  return (
    <div style={spacedRepetitionStyles.container}>
      <div style={spacedRepetitionStyles.headerContainer}>
        <h2 style={spacedRepetitionStyles.title}>
          🔄 Spaced Repetition
        </h2>
        <button
          ref={helpButtonRef}
          onClick={() => setShowSpacedRepetitionHelp(!showSpacedRepetitionHelp)}
          style={spacedRepetitionStyles.helpButton}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            Object.assign(e.currentTarget.style, spacedRepetitionHoverEffects.helpButton);
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            Object.assign(e.currentTarget.style, spacedRepetitionHoverEffects.helpButtonReset);
          }}
          title="Learn how spaced repetition works"
        >
          ❓ How it works
        </button>
      </div>
      
      {renderSpacedRepetitionHelp(helpButtonRef)}

      {/* All Topics Section */}
      <div style={getContainerStyle(spacedRepetitionStats.total)}>
        <div style={spacedRepetitionStyles.topicHeader}>
          <div style={spacedRepetitionStyles.topicTitle}>
            All Topics
          </div>
          <div style={spacedRepetitionStyles.topicStats}>
            <span style={spacedRepetitionStyles.challengingStat}>
              🔴 {spacedRepetitionStats.challenging}
            </span>
            <span style={spacedRepetitionStyles.moderateStat}>
              🟡 {spacedRepetitionStats.moderate}
            </span>
            <span style={spacedRepetitionStyles.easyStat}>
              🟢 {spacedRepetitionStats.easy}
            </span>
            {spacedRepetitionStats.unrated > 0 && (
              <span style={spacedRepetitionStyles.unratedStat}>
                ⚪ {spacedRepetitionStats.unrated}
              </span>
            )}
          </div>
        </div>
        {renderCompletionMessage(spacedRepetitionStats.total)}
        <button
          onClick={() => startSpacedRepetition('all')}
          disabled={spacedRepetitionStats.total === 0}
          style={getButtonStyle(spacedRepetitionStats.total)}
          onMouseEnter={(e) => {
            if (spacedRepetitionStats.total > 0) {
              Object.assign(e.currentTarget.style, spacedRepetitionHoverEffects.startButton);
            }
          }}
          onMouseLeave={(e) => {
            if (spacedRepetitionStats.total > 0) {
              Object.assign(e.currentTarget.style, spacedRepetitionHoverEffects.startButtonReset);
            }
          }}
        >
          {getButtonText(spacedRepetitionStats.total)}
        </button>
      </div>

      {/* Individual Topics - Now shows all topics, even those with 0 questions */}
      {spacedRepetitionStats.topics && spacedRepetitionStats.topics
        .map((stat, index) => (
          <div key={index} style={getContainerStyle(stat.total)}>
            <div style={spacedRepetitionStyles.topicHeader}>
              <div style={spacedRepetitionStyles.topicTitle}>
                {stat.topic}
              </div>
              <div style={spacedRepetitionStyles.topicStats}>
                <span style={spacedRepetitionStyles.challengingStat}>
                  🔴 {stat.challenging}
                </span>
                <span style={spacedRepetitionStyles.moderateStat}>
                  🟡 {stat.moderate}
                </span>
                <span style={spacedRepetitionStyles.easyStat}>
                  🟢 {stat.easy}
                </span>
                {stat.unrated > 0 && (
                  <span style={spacedRepetitionStyles.unratedStat}>
                    ⚪ {stat.unrated}
                  </span>
                )}
              </div>
            </div>
            {renderCompletionMessage(stat.total)}
            <button
              onClick={() => startSpacedRepetition(stat.topic!)}
              disabled={stat.total === 0}
              style={getButtonStyle(stat.total)}
              onMouseEnter={(e) => {
                if (stat.total > 0) {
                  Object.assign(e.currentTarget.style, spacedRepetitionHoverEffects.startButton);
                }
              }}
              onMouseLeave={(e) => {
                if (stat.total > 0) {
                  Object.assign(e.currentTarget.style, spacedRepetitionHoverEffects.startButtonReset);
                }
              }}
            >
              {getButtonText(stat.total)}
            </button>
          </div>
        ))}
    </div>
  );
}; 