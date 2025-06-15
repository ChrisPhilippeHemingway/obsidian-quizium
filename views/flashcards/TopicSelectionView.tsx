import React from 'react';
import { TopicDifficultyStats } from '../../FlashcardService';
import { topicSelectionStyles, topicSelectionHoverEffects, getDifficultyButtonStyle, getUnclassifiedButtonStyle, getSecondaryButtonStyle } from './topic-selection-styles';
import { commonStyles } from '../shared-styles';

interface TopicSelectionViewProps {
  loading: boolean;
  totalFlashcards: number;
  topicDifficultyStats: TopicDifficultyStats[];
  startFlashcards: (topic: string | null, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all') => void;
}

export const TopicSelectionView: React.FC<TopicSelectionViewProps> = ({
  loading,
  totalFlashcards,
  topicDifficultyStats,
  startFlashcards
}) => {
  if (loading) {
    return (
      <div style={commonStyles.loadingState}>
        Loading flashcards...
      </div>
    );
  }

  if (totalFlashcards === 0) {
    return (
      <div style={topicSelectionStyles.emptyState}>
        No flashcards available
      </div>
    );
  }

  const totalUnrated = topicDifficultyStats.reduce((sum, stat) => sum + stat.unrated, 0);

  return (
    <div style={topicSelectionStyles.container}>
      <h2 style={topicSelectionStyles.title}>Select Topic & Difficulty</h2>
      
      <p style={topicSelectionStyles.description}>
        Choose a topic and difficulty level to start your flashcard session.
      </p>

      {/* All Topics Section */}
      <div style={topicSelectionStyles.allTopicsContainer}>
        <div style={topicSelectionStyles.topicHeader}>
          <div style={topicSelectionStyles.topicTitle}>
            All Topics
          </div>
          <div style={topicSelectionStyles.topicCount}>
            {totalFlashcards} flashcard{totalFlashcards === 1 ? '' : 's'} available
          </div>
        </div>

        <div style={topicSelectionStyles.difficultySection}>
          <div style={topicSelectionStyles.difficultyButtonsContainer}>
            <button
              onClick={() => startFlashcards('all', 'easy')}
              disabled={topicDifficultyStats.reduce((sum, stat) => sum + stat.easy, 0) === 0}
              style={getDifficultyButtonStyle(topicDifficultyStats.reduce((sum, stat) => sum + stat.easy, 0), '#22c55e', '#16a34a')}
              className="quizium-difficulty-easy-hover"
            >
              Easy ({topicDifficultyStats.reduce((sum, stat) => sum + stat.easy, 0)})
            </button>
            <button
              onClick={() => startFlashcards('all', 'moderate')}
              disabled={topicDifficultyStats.reduce((sum, stat) => sum + stat.moderate, 0) === 0}
              style={getDifficultyButtonStyle(topicDifficultyStats.reduce((sum, stat) => sum + stat.moderate, 0), '#3b82f6', '#1d4ed8')}
              className="quizium-difficulty-moderate-hover"
            >
              Moderate ({topicDifficultyStats.reduce((sum, stat) => sum + stat.moderate, 0)})
            </button>
            <button
              onClick={() => startFlashcards('all', 'challenging')}
              disabled={topicDifficultyStats.reduce((sum, stat) => sum + stat.challenging, 0) === 0}
              style={getDifficultyButtonStyle(topicDifficultyStats.reduce((sum, stat) => sum + stat.challenging, 0), '#ef4444', '#dc2626')}
              className="quizium-difficulty-challenging-hover"
            >
              Challenging ({topicDifficultyStats.reduce((sum, stat) => sum + stat.challenging, 0)})
            </button>
          </div>
        </div>

        <div style={topicSelectionStyles.otherButtonsContainer}>
          <button
            onClick={() => startFlashcards('all', 'unrated')}
            disabled={totalUnrated === 0}
            style={getUnclassifiedButtonStyle(totalUnrated)}
            className={(() => {
              const totalClassified = topicDifficultyStats.reduce((sum, stat) => sum + stat.easy + stat.moderate + stat.challenging, 0);
              const shouldBeBlue = totalClassified === 0;
              return shouldBeBlue ? 'quizium-unrated-button-blue-hover' : 'quizium-unrated-button-gray-hover';
            })()}
          >
            Not reviewed ({totalUnrated})
          </button>
          <button
            onClick={() => startFlashcards('all', 'all')}
            style={getSecondaryButtonStyle(totalFlashcards)}
            className="quizium-secondary-button-hover"
          >
            All ({totalFlashcards})
          </button>
        </div>
      </div>

      {/* Individual Topics */}
      {topicDifficultyStats.map((stat, index) => (
        <div key={index} style={topicSelectionStyles.topicContainer}>
          <div style={topicSelectionStyles.topicHeader}>
            <div style={topicSelectionStyles.topicTitle}>
              {stat.topicName}
            </div>
            <div style={topicSelectionStyles.topicCount}>
              {stat.total} flashcard{stat.total === 1 ? '' : 's'} available
            </div>
          </div>

          <div style={topicSelectionStyles.difficultySection}>
            <div style={topicSelectionStyles.difficultyButtonsContainer}>
              <button
                onClick={() => startFlashcards(stat.topicName, 'easy')}
                disabled={stat.easy === 0}
                style={getDifficultyButtonStyle(stat.easy, '#22c55e', '#16a34a')}
                className="quizium-difficulty-easy-hover"
              >
                Easy ({stat.easy})
              </button>
              <button
                onClick={() => startFlashcards(stat.topicName, 'moderate')}
                disabled={stat.moderate === 0}
                style={getDifficultyButtonStyle(stat.moderate, '#3b82f6', '#1d4ed8')}
                className="quizium-difficulty-moderate-hover"
              >
                Moderate ({stat.moderate})
              </button>
              <button
                onClick={() => startFlashcards(stat.topicName, 'challenging')}
                disabled={stat.challenging === 0}
                style={getDifficultyButtonStyle(stat.challenging, '#ef4444', '#dc2626')}
                className="quizium-difficulty-challenging-hover"
              >
                Challenging ({stat.challenging})
              </button>
            </div>
          </div>

          <div style={topicSelectionStyles.otherButtonsContainer}>
            <button
              onClick={() => startFlashcards(stat.topicName, 'unrated')}
              disabled={stat.unrated === 0}
              style={getUnclassifiedButtonStyle(stat.unrated)}
              className={(() => {
                const totalClassified = stat.easy + stat.moderate + stat.challenging;
                const shouldBeBlue = totalClassified === 0;
                return shouldBeBlue ? 'quizium-unrated-button-blue-hover' : 'quizium-unrated-button-gray-hover';
              })()}
            >
              Not reviewed ({stat.unrated})
            </button>
            <button
              onClick={() => startFlashcards(stat.topicName, 'all')}
              style={getSecondaryButtonStyle(stat.total)}
              className="quizium-secondary-button-hover"
            >
              All ({stat.total})
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 