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
      <div style={spacedRepetitionStyles.topicContainer}>
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
        <button
          onClick={() => startSpacedRepetition('all')}
          disabled={spacedRepetitionStats.total === 0}
          style={spacedRepetitionStyles.startButton(spacedRepetitionStats.total > 0)}
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
          Start Review ({spacedRepetitionStats.total} cards)
        </button>
      </div>

      {/* Individual Topics */}
      {spacedRepetitionStats.topics && spacedRepetitionStats.topics
        .filter(stat => stat.total > 0)
        .map((stat, index) => (
          <div key={index} style={spacedRepetitionStyles.topicContainer}>
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
            <button
              onClick={() => startSpacedRepetition(stat.topic!)}
              disabled={stat.total === 0}
              style={spacedRepetitionStyles.startButton(stat.total > 0)}
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
              Start Review ({stat.total} cards)
            </button>
          </div>
        ))}
    </div>
  );
}; 