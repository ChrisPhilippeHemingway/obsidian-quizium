import React, { useEffect, useRef } from 'react';
import { TopicStats } from '../../FlashcardService';
import { topicBreakdownStyles } from './topic-breakdown-styles';

interface TopicBreakdownViewProps {
  showTopicBreakdown: boolean;
  topicStats: TopicStats[];
  quizTopicStats: TopicStats[];
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export const TopicBreakdownView: React.FC<TopicBreakdownViewProps> = ({
  showTopicBreakdown,
  topicStats,
  quizTopicStats,
  onClose,
  buttonRef
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTopicBreakdown) return;

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
  }, [showTopicBreakdown, onClose]);

  if (!showTopicBreakdown) return null;

  return (
    <div ref={tooltipRef} style={topicBreakdownStyles.container}>
      <div style={topicBreakdownStyles.header}>
        <div style={topicBreakdownStyles.sectionTitle}>
          📊 Topic Breakdown
        </div>
        <button
          onClick={onClose}
          style={topicBreakdownStyles.closeButton}
          className="quizium-close-button-hover"
          title="Close breakdown"
        >
          ✕
        </button>
      </div>
      
      <div style={topicBreakdownStyles.section}>
        <div style={topicBreakdownStyles.subsectionTitle}>
          📚 Flashcards:
        </div>
        {topicStats.length > 0 ? (
          topicStats.map((stat, index) => (
            <div key={index} style={topicBreakdownStyles.topicItem}>
              <span style={topicBreakdownStyles.topicName}>{stat.topicName}:</span>
              <span style={topicBreakdownStyles.topicCount}>{stat.count}</span>
            </div>
          ))
        ) : (
          <div style={topicBreakdownStyles.noDataText}>No flashcards found</div>
        )}
      </div>

      <div style={topicBreakdownStyles.section}>
        <div style={topicBreakdownStyles.subsectionTitle}>
          🧠 Quiz Questions:
        </div>
        {quizTopicStats.length > 0 ? (
          quizTopicStats.map((stat, index) => (
            <div key={index} style={topicBreakdownStyles.topicItem}>
              <span style={topicBreakdownStyles.topicName}>{stat.topicName}:</span>
              <span style={topicBreakdownStyles.topicCount}>{stat.count}</span>
            </div>
          ))
        ) : (
          <div style={topicBreakdownStyles.noDataText}>No quiz questions found</div>
        )}
      </div>
    </div>
  );
}; 